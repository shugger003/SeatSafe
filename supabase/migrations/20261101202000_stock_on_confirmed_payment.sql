-- Stock leaves the shelf only when a payment is confirmed.
-- An unpaid order no longer reserves bottles.

create or replace function public.release_expired_reservations()
returns void
language plpgsql
as $$
declare
  v_minutes integer := 30;
  v_order public.orders%rowtype;
  v_held boolean;
begin
  select coalesce((value->>'reservationMinutes')::integer, 30)
  into v_minutes
  from public.settings
  where key = 'store';

  for v_order in
    select *
    from public.orders
    where payment_status = 'pending'
      and created_at <= now() - make_interval(mins => greatest(v_minutes, 1))
    for update
  loop
    v_held := v_order.inventory_held;
    if v_held then
      perform public.restore_order_lines(v_order.line_items);
    end if;
    update public.orders
    set payment_status = 'expired',
        inventory_held = false,
        updated_at = now()
    where id = v_order.id
      and payment_status = 'pending';
    insert into public.order_events (id, order_id, type, message, actor)
    values (
      gen_random_uuid()::text,
      v_order.id,
      'expired',
      case
        when v_held then 'The payment window ended and the reserved stock was returned.'
        else 'The payment window ended. Stock was not taken because payment was not confirmed.'
      end,
      'system'
    );
  end loop;
end;
$$;

create or replace function public.commit_pending_order(p_order jsonb)
returns text
language plpgsql
as $$
declare
  v_id text;
begin
  perform public.release_expired_reservations();

  if coalesce(p_order->>'discount_id', '') <> '' then
    update public.discount_codes
    set used_count = used_count + 1,
        updated_at = now()
    where id = p_order->>'discount_id'
      and active
      and (usage_limit is null or used_count < usage_limit);
    if not found then
      raise exception 'DISCOUNT';
    end if;
  end if;

  v_id := p_order->>'id';
  insert into public.orders (
    id, order_number, access_token, customer_name, customer_email, customer_phone,
    delivery_address, delivery_city, delivery_region, delivery_instructions, delivery_method,
    line_items, subtotal_minor, delivery_fee_minor, discount_minor, discount_code, total_minor,
    currency, payment_status, fulfillment_status, payment_provider, payment_reference,
    provider_reference, notification_status, inventory_held, tracking_carrier, tracking_number, internal_notes
  ) values (
    v_id,
    p_order->>'order_number',
    p_order->>'access_token',
    p_order->>'customer_name',
    p_order->>'customer_email',
    p_order->>'customer_phone',
    p_order->>'delivery_address',
    p_order->>'delivery_city',
    p_order->>'delivery_region',
    coalesce(p_order->>'delivery_instructions', ''),
    coalesce(p_order->>'delivery_method', ''),
    coalesce(p_order->'line_items', '[]'::jsonb),
    (p_order->>'subtotal_minor')::integer,
    (p_order->>'delivery_fee_minor')::integer,
    coalesce((p_order->>'discount_minor')::integer, 0),
    nullif(p_order->>'discount_code', ''),
    (p_order->>'total_minor')::integer,
    p_order->>'currency',
    'pending',
    'unfulfilled',
    p_order->>'payment_provider',
    p_order->>'payment_reference',
    '',
    'pending',
    false,
    '',
    '',
    ''
  );

  insert into public.order_events (id, order_id, type, message, actor)
  values (
    gen_random_uuid()::text,
    v_id,
    'created',
    'Order created. Stock is taken only after payment is confirmed.',
    'system'
  );

  return v_id;
end;
$$;

create or replace function public.apply_payment_result(
  p_reference text,
  p_status text,
  p_amount integer,
  p_currency text,
  p_provider_reference text,
  p_raw_status text
)
returns jsonb
language plpgsql
as $$
declare
  v_order public.orders%rowtype;
  v_next text;
  v_late boolean;
  v_short boolean := false;
  v_already_held boolean;
begin
  select * into v_order
  from public.orders
  where payment_reference = p_reference
  for update;
  if not found then
    return jsonb_build_object('kind', 'missing');
  end if;

  v_late := v_order.payment_status = 'expired';
  if v_late and p_status <> 'success' then
    return jsonb_build_object('kind', case
      when p_status = 'failed' then 'failed'
      when p_status = 'abandoned' then 'cancelled'
      else 'pending'
    end);
  end if;
  if v_order.payment_status <> 'pending' and not v_late then
    return jsonb_build_object('kind', 'already');
  end if;
  if p_status = 'pending' then
    return jsonb_build_object('kind', 'pending');
  end if;

  if p_status = 'success' then
    if p_amount is distinct from v_order.total_minor or p_currency is distinct from v_order.currency then
      update public.orders
      set payment_status = 'review',
          provider_reference = coalesce(p_provider_reference, ''),
          updated_at = now()
      where id = v_order.id;
      insert into public.order_events (id, order_id, type, message, actor)
      values (
        gen_random_uuid()::text,
        v_order.id,
        'review',
        'The payment provider reported a different amount or currency. The order was not marked paid.',
        'system'
      );
      return jsonb_build_object('kind', 'mismatch');
    end if;

    v_already_held := v_order.inventory_held;
    if not v_already_held then
      begin
        perform public.hold_order_lines(v_order.line_items);
      exception
        when raise_exception then
          if sqlerrm <> 'STOCK' then
            raise;
          end if;
          v_short := true;
      end;
    end if;

    update public.orders
    set payment_status = 'paid',
        provider_reference = coalesce(p_provider_reference, ''),
        inventory_held = false,
        updated_at = now()
    where id = v_order.id
      and payment_status in ('pending', 'expired');
    insert into public.order_events (id, order_id, type, message, actor)
    values (
      gen_random_uuid()::text,
      v_order.id,
      'paid',
      case
        when v_short then 'Payment was verified with the provider. There were not enough bottles left, so stock was not reduced.'
        when v_already_held then 'Payment was verified with the provider. Stock had already been taken for this order.'
        else 'Payment was verified with the provider. Stock was taken for this order.'
      end,
      'system'
    );
    return jsonb_build_object('kind', 'paid');
  end if;

  if v_order.inventory_held then
    perform public.restore_order_lines(v_order.line_items);
  end if;
  if v_order.discount_code is not null and v_order.discount_minor > 0 then
    update public.discount_codes
    set used_count = greatest(used_count - 1, 0),
        updated_at = now()
    where code = v_order.discount_code;
  end if;

  v_next := case when p_status = 'abandoned' then 'cancelled' else 'failed' end;
  update public.orders
  set payment_status = v_next,
      inventory_held = false,
      provider_reference = coalesce(p_provider_reference, ''),
      updated_at = now()
  where id = v_order.id
    and payment_status = 'pending';
  insert into public.order_events (id, order_id, type, message, actor)
  values (
    gen_random_uuid()::text,
    v_order.id,
    v_next,
    case
      when v_order.inventory_held then format('Payment ended as %s. Reserved stock was returned.', coalesce(p_raw_status, p_status))
      else format('Payment ended as %s. Stock was not taken because payment was not confirmed.', coalesce(p_raw_status, p_status))
    end,
    'system'
  );
  return jsonb_build_object('kind', v_next);
end;
$$;

create or replace function public.reconcile_order(
  p_order_id text,
  p_reason text,
  p_reference text,
  p_actor text
)
returns jsonb
language plpgsql
as $$
declare
  v_order public.orders%rowtype;
  v_short boolean := false;
  v_message text;
begin
  if length(btrim(coalesce(p_reason, ''))) < 20 then
    return jsonb_build_object('ok', false, 'error', 'Describe the reconciliation in at least 20 characters.');
  end if;

  select * into v_order from public.orders where id = p_order_id for update;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'Order not found.');
  end if;
  if v_order.payment_status = 'paid' then
    return jsonb_build_object('ok', false, 'error', 'This payment is already verified by the provider.');
  end if;
  if v_order.payment_status = 'reconciled' then
    return jsonb_build_object('ok', false, 'error', 'This payment was already recorded.');
  end if;

  if not v_order.inventory_held then
    begin
      perform public.hold_order_lines(v_order.line_items);
    exception
      when raise_exception then
        if sqlerrm <> 'STOCK' then
          raise;
        end if;
        v_short := true;
    end;
  end if;

  update public.orders
  set payment_status = 'reconciled',
      provider_reference = btrim(coalesce(p_reference, '')),
      inventory_held = false,
      updated_at = now()
  where id = v_order.id;

  v_message := 'Manual reconciliation. Not counted as gateway-verified revenue. ';
  if v_short then
    v_message := v_message || 'There were not enough bottles left, so stock was not reduced. ';
  elsif not v_order.inventory_held then
    v_message := v_message || 'Stock was taken for this order. ';
  end if;
  v_message := v_message || btrim(p_reason);

  insert into public.order_events (id, order_id, type, message, actor)
  values (
    gen_random_uuid()::text,
    v_order.id,
    'reconciled',
    v_message,
    coalesce(p_actor, 'admin')
  );

  return jsonb_build_object('ok', true);
end;
$$;

-- Put bottles back for orders that have not been paid.
do $$
declare
  v_order public.orders%rowtype;
begin
  for v_order in
    select *
    from public.orders
    where payment_status = 'pending'
      and inventory_held
    for update
  loop
    perform public.restore_order_lines(v_order.line_items);
    update public.orders
    set inventory_held = false,
        updated_at = now()
    where id = v_order.id
      and payment_status = 'pending'
      and inventory_held;
    if found then
      insert into public.order_events (id, order_id, type, message, actor)
      values (
        gen_random_uuid()::text,
        v_order.id,
        'stock',
        'Unpaid order. The bottles were put back in stock. Stock is taken only after payment is confirmed.',
        'system'
      );
    end if;
  end loop;
end;
$$;
