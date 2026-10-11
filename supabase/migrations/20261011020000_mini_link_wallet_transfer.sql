-- Preserve the existing identity/session/order migration, adding an atomic guest
-- wallet transfer. Never merge two independently registered customer accounts.
do $migration$
declare definition text; marker text := 'update public.orders set user_id = p_target_user_id where user_id = p_source_user_id;';
begin
  select pg_get_functiondef('public.link_mini_identity_to_account(text,uuid,uuid)'::regprocedure) into definition;
  if position(marker in definition)=0 then raise exception 'Unexpected mini link definition'; end if;
  definition := replace(definition, marker, $transfer$
  if not exists(select 1 from auth.users where id=p_source_user_id and email like '%@mini.lingxifield.invalid') then
    raise exception 'An existing customer account cannot be merged into another account';
  end if;
  -- Stable row lock order; concurrent credits/usage are serialized by the wallet.
  insert into public.sasi_wallets(user_id) select p_target_user_id
    where exists(select 1 from public.sasi_wallets where user_id=p_source_user_id) on conflict do nothing;
  perform 1 from public.sasi_wallets where user_id in (p_source_user_id,p_target_user_id) order by user_id for update;
  if exists(select 1 from public.sasi_wallets where user_id=p_source_user_id and
    (reserved_points<>0 or coalesce(refund_hold_points,0)<>0)) then
    raise exception 'Finish pending usage or refunds before connecting this account';
  end if;
  update public.sasi_wallets target set
    available_points=target.available_points+source.available_points,
    refundable_points=coalesce(target.refundable_points,0)+coalesce(source.refundable_points,0),updated_at=now()
    from public.sasi_wallets source where target.user_id=p_target_user_id and source.user_id=p_source_user_id;
  update public.sasi_wallets set available_points=0,refundable_points=0,updated_at=now() where user_id=p_source_user_id;
  update public.sasi_credit_ledger set user_id=p_target_user_id where user_id=p_source_user_id;
  update public.orders set user_id = p_target_user_id where user_id = p_source_user_id;
  $transfer$);
  execute definition;
end $migration$;
