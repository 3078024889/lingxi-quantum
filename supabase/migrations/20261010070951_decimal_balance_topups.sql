-- Extend custom amount validation only; CREATE OR REPLACE preserves existing ACLs.
-- No new functions, grants, triggers, tables, or changes to ledger behavior.
do $migration$
declare definition text;
begin
 select pg_get_functiondef('public.credit_sasi_topup(uuid)'::regprocedure) into definition;
 if position('^sasi-balance-custom-[0-9]{1,5}$' in definition)=0 or
    position('v_expected_rmb between 10 and 10000 and trunc(v_expected_rmb) = v_expected_rmb' in definition)=0 then
   raise exception 'Unexpected CNY custom validation';
 end if;
 definition := replace(definition, '^sasi-balance-custom-[0-9]{1,5}$', '^sasi-balance-custom-(0|[1-9][0-9]{0,4})([.][0-9]{1,2})?$');
 definition := replace(definition, 'substring(v_order.product_id from ''([0-9]{1,5})$'')', 'substring(v_order.product_id from ''custom-(.*)$'')');
 definition := replace(definition, 'v_expected_rmb between 10 and 10000 and trunc(v_expected_rmb) = v_expected_rmb', 'v_expected_rmb between 0.01 and 10000 and trunc(v_expected_rmb * 100) = v_expected_rmb * 100');
 execute definition;
 select pg_get_functiondef('public.credit_sasi_usd_topup(uuid)'::regprocedure) into definition;
 if position('^sasi-usd-balance-custom-[1-9][0-9]{1,4}$' in definition)=0 or
    position('expected_usd < 10 or expected_usd > 10000 or trunc(expected_usd) <> expected_usd' in definition)=0 then
   raise exception 'Unexpected USD custom validation';
 end if;
 definition := replace(definition, '^sasi-usd-balance-custom-[1-9][0-9]{1,4}$', '^sasi-usd-balance-custom-(0|[1-9][0-9]{0,4})([.][0-9]{1,2})?$');
 definition := replace(definition, 'substring(o.product_id from ''([0-9]+)$'')', 'substring(o.product_id from ''balance-(?:custom-)?([0-9]+(?:[.][0-9]{1,2})?)$'')');
 definition := replace(definition, 'expected_usd < 10 or expected_usd > 10000 or trunc(expected_usd) <> expected_usd', 'expected_usd < 0.01 or expected_usd > 10000 or trunc(expected_usd * 100) <> expected_usd * 100');
 execute definition;
end $migration$;
