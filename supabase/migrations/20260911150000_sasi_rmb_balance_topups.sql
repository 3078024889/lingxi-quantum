-- SASI has one user-facing charging model: RMB balance, quoted per task.
-- Legacy *_points columns store integer fen; they are retained to avoid a
-- destructive production migration while the API exposes only *AmountFen.
begin;

create or replace function public.credit_sasi_topup(p_order_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_order public.orders%rowtype;
  v_wallet public.sasi_wallets%rowtype;
  v_amount_fen bigint;
  v_expected_rmb numeric;
begin
  select * into v_order from public.orders where id = p_order_id for update;
  if not found then return jsonb_build_object('ok', false, 'error', 'order_not_found'); end if;

  select x.amount_fen, x.amount_rmb into v_amount_fen, v_expected_rmb
  from (values
    ('sasi-balance-10'::text, 1000::bigint, 10::numeric),
    ('sasi-credit-entry'::text, 2000::bigint, 20::numeric),
    ('sasi-balance-50'::text, 5000::bigint, 50::numeric),
    ('sasi-credit-studio'::text, 10000::bigint, 100::numeric),
    ('sasi-balance-200'::text, 20000::bigint, 200::numeric),
    ('sasi-credit-reserve'::text, 50000::bigint, 500::numeric),
    ('sasi-balance-1000'::text, 100000::bigint, 1000::numeric),
    ('sasi-balance-2000'::text, 200000::bigint, 2000::numeric),
    ('sasi-balance-10000'::text, 1000000::bigint, 10000::numeric)
  ) as x(product_id, amount_fen, amount_rmb)
  where x.product_id = v_order.product_id;

  if v_amount_fen is null and v_order.product_id ~ '^sasi-balance-custom-[0-9]{1,5}$' then
    v_expected_rmb := substring(v_order.product_id from '([0-9]{1,5})$')::numeric;
    if v_expected_rmb between 10 and 10000 and trunc(v_expected_rmb) = v_expected_rmb then
      v_amount_fen := (v_expected_rmb * 100)::bigint;
    end if;
  end if;

  if v_amount_fen is null then return jsonb_build_object('ok', false, 'error', 'invalid_sasi_product'); end if;
  if v_order.status not in ('pending', 'paid') then return jsonb_build_object('ok', false, 'error', 'order_not_payable'); end if;
  if v_order.amount_rmb is null or round(v_order.amount_rmb, 2) <> round(v_expected_rmb, 2) then
    return jsonb_build_object('ok', false, 'error', 'amount_mismatch');
  end if;

  if exists (select 1 from public.sasi_credit_ledger where kind = 'topup' and reference_id = p_order_id::text) then
    update public.orders set status = 'paid', paid_at = coalesce(paid_at, now()) where id = p_order_id;
    return jsonb_build_object('ok', true, 'alreadyPaid', true, 'amountFen', v_amount_fen);
  end if;

  insert into public.sasi_wallets(user_id) values (v_order.user_id) on conflict do nothing;
  select * into v_wallet from public.sasi_wallets where user_id = v_order.user_id for update;
  update public.sasi_wallets set available_points = available_points + v_amount_fen, updated_at = now()
    where user_id = v_order.user_id returning * into v_wallet;
  insert into public.sasi_credit_ledger(user_id, kind, delta_available, delta_reserved, available_after, reserved_after, reference_id, metadata)
  values (v_order.user_id, 'topup', v_amount_fen, 0, v_wallet.available_points, v_wallet.reserved_points,
    p_order_id::text, jsonb_build_object('productId', v_order.product_id, 'provider', v_order.provider, 'currency', 'CNY'));
  update public.orders set status = 'paid', paid_at = coalesce(paid_at, now()) where id = p_order_id;
  return jsonb_build_object('ok', true, 'alreadyPaid', false, 'amountFen', v_amount_fen,
    'balanceFen', v_wallet.available_points, 'reservedAmountFen', v_wallet.reserved_points);
end $$;

revoke execute on function public.credit_sasi_topup(uuid) from public, anon, authenticated;
grant execute on function public.credit_sasi_topup(uuid) to service_role;

commit;
