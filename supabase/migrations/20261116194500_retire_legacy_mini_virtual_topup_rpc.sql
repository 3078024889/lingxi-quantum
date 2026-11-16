-- Retire the old service-role-only virtual-goods wallet top-up reservation RPC.
-- Historical orders, provider callbacks, reconciliation and refund records are untouched.
-- The current CNY wallet creates only standard merchant JSAPI orders through
-- reserve_mini_cny_jsapi_topup_order().
DO $$
BEGIN
  IF to_regprocedure('public.reserve_mini_cny_topup_order(uuid,uuid,text,numeric,text,jsonb)') IS NOT NULL THEN
    EXECUTE 'REVOKE ALL ON FUNCTION public.reserve_mini_cny_topup_order(uuid,uuid,text,numeric,text,jsonb) FROM PUBLIC, anon, authenticated, service_role';
    EXECUTE 'DROP FUNCTION public.reserve_mini_cny_topup_order(uuid,uuid,text,numeric,text,jsonb)';
  END IF;
END
$$;
