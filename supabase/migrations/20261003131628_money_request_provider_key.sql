-- Keep the original request identity stable for all payment providers.
create or replace function public.money_prepare_request() returns trigger language plpgsql set search_path=public,pg_temp as $$
begin
 new.provider_request_key:=coalesce(nullif(new.provider_request_key,''),'lf-refund-'||new.id::text);
 new.submission_confirmed_at:=null;
 new.next_reconcile_at:='infinity'::timestamptz;
 return new;
end $$;
