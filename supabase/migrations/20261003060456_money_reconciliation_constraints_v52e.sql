do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid='public.balance_withdrawals'::regclass
      and conname='balance_withdrawals_provider_attempt_count_nonnegative'
  ) then
    alter table public.balance_withdrawals
      add constraint balance_withdrawals_provider_attempt_count_nonnegative
      check (provider_attempt_count >= 0);
  end if;
end
$$;
