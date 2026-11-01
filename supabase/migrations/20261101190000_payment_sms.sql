-- One confirmation text per confirmed payment. Orders already paid stay quiet.

alter table public.orders
  add column sms_status text not null default 'pending'
  check (sms_status in ('pending', 'sending', 'sent', 'failed', 'skipped'));

update public.orders
set sms_status = 'skipped'
where payment_status in ('paid', 'reconciled');

create or replace function public.claim_payment_sms(p_order_id text)
returns text
language plpgsql
as $$
declare
  v_status text;
begin
  update public.orders
  set sms_status = 'sending',
      updated_at = now()
  where id = p_order_id
    and payment_status in ('paid', 'reconciled')
    and (
      sms_status in ('pending', 'failed')
      or (sms_status = 'sending' and updated_at < now() - interval '2 minutes')
    )
  returning 'claimed' into v_status;

  if found then
    return v_status;
  end if;

  select sms_status into v_status from public.orders where id = p_order_id;
  if v_status is null then
    return 'missing';
  end if;
  return v_status;
end;
$$;

revoke all on function public.claim_payment_sms(text) from public, anon, authenticated;
grant execute on function public.claim_payment_sms(text) to service_role;
