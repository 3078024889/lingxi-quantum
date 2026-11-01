-- Replace the feedback signature equality check with a fixed-iteration comparison.
-- The input has already been constrained to exactly 64 lowercase hexadecimal bytes.
create or replace function public.ai_market_submit_visitor_feedback(p_document jsonb,p_signature text)
returns jsonb
language plpgsql
security definer
set search_path=''
as $$
declare
 v_secret text;
 v_nonce text := p_document->>'nonce';
 v_issued bigint;
 v_hash text := p_document->>'visitorHash';
 v_body text := pg_catalog.btrim(p_document->>'body');
 v_nick text := pg_catalog.btrim(p_document->>'nickname');
 v_category text := p_document->>'category';
 v_product text := nullif(p_document->>'productId','');
 v_locale text := p_document->>'locale';
 v_expected text;
 v_diff integer := 0;
 v_i integer;
 v_id uuid;
begin
 if p_document is null
 or pg_catalog.jsonb_typeof(p_document) is distinct from 'object'
 or v_nonce is null or v_nonce !~ '^[a-f0-9]{32}$'
 or v_hash is null or v_hash !~ '^[a-f0-9]{64}$'
 or p_signature is null or p_signature !~ '^[a-f0-9]{64}$' then
   raise exception 'INVALID_FEEDBACK' using errcode='22023';
 end if;
 if coalesce(p_document->>'issuedAt','') !~ '^[0-9]{10}$' then
   raise exception 'INVALID_TIMESTAMP' using errcode='22023';
 end if;
 begin v_issued := (p_document->>'issuedAt')::bigint;
 exception when others then raise exception 'INVALID_TIMESTAMP' using errcode='22023'; end;
 if v_issued is null or abs(extract(epoch from pg_catalog.clock_timestamp())::bigint-v_issued)>120 then
   raise exception 'EXPIRED_FEEDBACK' using errcode='22023';
 end if;
 if v_body is null or v_nick is null or v_category is null or v_locale is null
 or pg_catalog.char_length(v_body) not between 15 and 1500
 or pg_catalog.char_length(v_nick) not between 2 and 32
 or v_category not in ('tool_experience','site_experience','bug','suggestion','correction')
 or v_locale not in ('zh','en','ja','ko','fr','de','es','pt','ar')
 or (v_product is not null and v_product !~ '^[a-z0-9][a-z0-9-]{0,79}$')
 or v_body ~* '(https?://[^ ]+){3,}' then
   raise exception 'INVALID_CONTENT' using errcode='22023';
 end if;
 select secret into v_secret from private.ai_market_feedback_signing_key where id=1;
 if v_secret is null then raise exception 'FEEDBACK_UNAVAILABLE' using errcode='P0001'; end if;
 v_expected := pg_catalog.encode(extensions.hmac(
  pg_catalog.convert_to(v_nonce||'.'||v_issued::text||'.'||v_hash,'UTF8'),
  pg_catalog.convert_to(v_secret,'UTF8'),'sha256'),'hex');
 if v_expected is null then raise exception 'FEEDBACK_UNAVAILABLE' using errcode='P0001'; end if;
 -- Fixed 64-character loop; do not exit early on the first mismatching byte.
 for v_i in 1..64 loop
  v_diff := v_diff | (
   pg_catalog.ascii(pg_catalog.substr(v_expected,v_i,1)) #
   pg_catalog.ascii(pg_catalog.substr(p_signature,v_i,1))
  );
 end loop;
 if v_diff<>0 then
   raise exception 'INVALID_FEEDBACK_SIGNATURE' using errcode='42501';
 end if;
 if (select count(*) from public.ai_market_visitor_feedback
     where visitor_hash=v_hash and created_at>now()-interval '1 hour')>=4
 or (select count(*) from public.ai_market_visitor_feedback
     where visitor_hash=v_hash and created_at>now()-interval '1 day')>=12 then
   raise exception 'FEEDBACK_RATE_LIMITED' using errcode='P0001';
 end if;
 insert into public.ai_market_visitor_feedback
  (category,product_id,nickname,body,locale,visitor_hash,request_nonce)
 values(v_category,v_product,v_nick,v_body,v_locale,v_hash,v_nonce)
 returning id into v_id;
 return pg_catalog.jsonb_build_object('accepted',true,'reviewRequired',true,'id',v_id,'nickname',v_nick);
exception when unique_violation then
 raise exception 'DUPLICATE_FEEDBACK' using errcode='23505';
end
$$;
revoke all on function public.ai_market_submit_visitor_feedback(jsonb,text) from public;
grant execute on function public.ai_market_submit_visitor_feedback(jsonb,text) to anon,authenticated;
