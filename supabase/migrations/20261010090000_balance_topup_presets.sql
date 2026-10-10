-- Preserve current accounting, notification and idempotency logic; extend its product validation.
do $migration$
declare definition text;
begin
 select pg_get_functiondef('public.credit_sasi_topup(uuid)'::regprocedure) into definition;
 if position('''sasi-balance-10''::text, 1000::bigint, 10::numeric' in definition)=0 then
   raise exception 'Unexpected CNY topup definition; inspect before changing';
 end if;
 definition := replace(definition,
   '(''sasi-balance-10''::text, 1000::bigint, 10::numeric),',
   '(''sasi-balance-10''::text, 1000::bigint, 10::numeric),
    (''sasi-balance-88''::text, 8800::bigint, 88::numeric),
    (''sasi-balance-666''::text, 66600::bigint, 666::numeric),
    (''sasi-balance-888''::text, 88800::bigint, 888::numeric),
    (''sasi-balance-20''::text, 2000::bigint, 20::numeric),
    (''sasi-balance-100''::text, 10000::bigint, 100::numeric),
    (''sasi-balance-500''::text, 50000::bigint, 500::numeric),');
 definition := replace(definition,'SET search_path TO ''public''','SET search_path TO ''public'', ''pg_temp''');
 execute definition;

 select pg_get_functiondef('public.credit_sasi_usd_topup(uuid)'::regprocedure) into definition;
 if position('^sasi-usd-balance-(10|20|50|100|300|500|1000|2000|10000)$' in definition)=0 then
   raise exception 'Unexpected USD topup definition; inspect before changing';
 end if;
 definition := replace(definition,
   'if o.product_id !~ ''^sasi-usd-balance-(10|20|50|100|300|500|1000|2000|10000)$'' then',
   'if o.product_id !~ ''^sasi-usd-balance-(10|88|666|888|20|50|100|300|500|1000|2000|10000)$'' and o.product_id !~ ''^sasi-usd-balance-custom-[1-9][0-9]{1,4}$'' then');
 definition := replace(definition,
   'amount_cents:=(expected_usd*100)::bigint;',
   'if expected_usd < 10 or expected_usd > 10000 or trunc(expected_usd) <> expected_usd then
     return jsonb_build_object(''ok'',false,''error'',''INVALID_USD_TOPUP'');
   end if;
   if o.status not in (''pending'',''paid'') then
     return jsonb_build_object(''ok'',false,''error'',''ORDER_NOT_PAYABLE'');
   end if;
   amount_cents:=(expected_usd*100)::bigint;');
 definition := replace(definition,
   'if round(o.amount_usd,2)<>round(expected_usd,2)',
   'if o.amount_usd is null or round(o.amount_usd,2)<>round(expected_usd,2)');
 execute definition;
end $migration$;
revoke all on function public.credit_sasi_topup(uuid), public.credit_sasi_usd_topup(uuid) from public,anon,authenticated;
grant execute on function public.credit_sasi_topup(uuid), public.credit_sasi_usd_topup(uuid) to service_role;
