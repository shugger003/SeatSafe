-- A confirmed provider payment can arrive after the reservation expired.
-- Record the sale and take the stock that expiry returned.

create or replace function public.hold_order_lines(p_lines jsonb)
returns void
language plpgsql
as $$
declare
  v_line jsonb;
  v_row record;
begin
  for v_row in select value as item from jsonb_array_elements(coalesce(p_lines, '[]'::jsonb))
  loop
    v_line := v_row.item;
    perform public.adjust_stock(
      v_line->>'productId',
      nullif(v_line->>'variantId', ''),
      -coalesce((v_line->>'quantity')::integer, 0)
    );
  end loop;
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

    if v_late and not v_order.inventory_held then
      perform public.hold_order_lines(v_order.line_items);
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
        when v_late then 'Payment was verified with the provider after the reservation expired. Stock was taken for the sale.'
        else 'Payment was verified with the provider. Inventory reservation is now a completed sale.'
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
    format('Payment ended as %s. Reserved stock was returned.', coalesce(p_raw_status, p_status)),
    'system'
  );
  return jsonb_build_object('kind', v_next);
end;
$$;

revoke all on function public.hold_order_lines(jsonb) from public, anon, authenticated;
grant execute on function public.hold_order_lines(jsonb) to service_role;
