begin;

alter table public.balance_withdrawals
  add column if not exists provider_currency text,
  add column if not exists provider_amount_minor bigint;

update public.balance_withdrawals
set provider_currency=coalesce(provider_currency,currency),
    provider_amount_minor=coalesce(provider_amount_minor,amount_minor)
where provider_currency is null or provider_amount_minor is null;

alter table public.balance_withdrawals
  alter column provider_currency set not null,
  alter column provider_amount_minor set not null;

do $$
begin
  if not exists(select 1 from pg_constraint where conname='balance_withdrawals_provider_currency_check') then
    alter table public.balance_withdrawals add constraint balance_withdrawals_provider_currency_check check(provider_currency in ('CNY','USD'));
  end if;
  if not exists(select 1 from pg_constraint where conname='balance_withdrawals_provider_amount_minor_check') then
    alter table public.balance_withdrawals add constraint balance_withdrawals_provider_amount_minor_check check(provider_amount_minor>0);
  end if;
end $$;

-- Production source of truth also replaces request_balance_withdrawal so a CNY wallet
-- funded through PayPal keeps CNY wallet units separate from the USD provider refund amount.
-- Production migration version: paypal_usd_funded_cny_withdrawal_v1462.

commit;
