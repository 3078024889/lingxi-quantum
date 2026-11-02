-- One-time, server-only provisioning for the visitor-feedback HMAC key.
-- The application secret and database secret must be the same 32-byte lowercase hex value.
-- Never return the configured key, and never grant this RPC to public visitors.
create or replace function public.ai_market_configure_feedback_signing_key(p_secret text)
returns jsonb
language plpgsql
security definer
set search_path=''
as $$
begin
 if coalesce(current_setting('request.jwt.claim.role',true),'') <> 'service_role' then
  raise exception 'SERVICE_ROLE_REQUIRED' using errcode='42501';
 end if;
 if p_secret is null or p_secret !~ '^[a-f0-9]{64}$' then
  raise exception 'FEEDBACK_SIGNING_KEY_INVALID' using errcode='22023';
 end if;
 insert into private.ai_market_feedback_signing_key(id,secret)
 values(1,p_secret)
 on conflict(id) do update
  set secret=excluded.secret,created_at=clock_timestamp();
 return jsonb_build_object('configured',true);
end
$$;
revoke all on function public.ai_market_configure_feedback_signing_key(text) from public,anon,authenticated;
grant execute on function public.ai_market_configure_feedback_signing_key(text) to service_role;
