-- These worker RPCs are called only with the server service role.
-- Keep their internal service_role checks as a second boundary.
revoke execute on function public.money_claim_reconciliation_v52e(integer,integer) from PUBLIC, anon, authenticated;
grant execute on function public.money_claim_reconciliation_v52e(integer,integer) to service_role;
revoke execute on function public.money_claim_webhook_events_v53(integer,integer) from PUBLIC, anon, authenticated;
grant execute on function public.money_claim_webhook_events_v53(integer,integer) to service_role;
revoke execute on function public.money_enqueue_webhook_event_v53(text,text,text,text,jsonb,text) from PUBLIC, anon, authenticated;
grant execute on function public.money_enqueue_webhook_event_v53(text,text,text,text,jsonb,text) to service_role;
revoke execute on function public.money_finish_webhook_event_v53(uuid,text,text,integer) from PUBLIC, anon, authenticated;
grant execute on function public.money_finish_webhook_event_v53(uuid,text,text,integer) to service_role;
