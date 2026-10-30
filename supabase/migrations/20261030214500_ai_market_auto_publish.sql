-- V3.6: conservative automatic publish with server-signed database verification.
-- Only plain text passing the database classifier is publicly readable immediately.
-- Sensitive contact information, spam or uncertain content is kept pending.
-- This is deterministic moderation, NOT an AI safety guarantee.
create or replace function private.ai_market_feedback_auto_safe(p_body text,p_nickname text)
returns boolean language sql immutable set search_path='' as $$
 select char_length(coalesce(p_body,'')) between 15 and 650
  and char_length(coalesce(p_nickname,'')) between 2 and 32
  and p_body !~* '(https?://|www[.]|[<>]|@|[a-z0-9._%+-]+@[a-z0-9.-]+[.][a-z]{2,})'
  and p_body !~* '(telegram|whatsapp|discord[.]gg|加群|扫码|私聊|代开|返利|博彩|赌博|免费领取|广告合作|推广链接|折扣码)'
  and p_body !~ '([0-9][0-9 ()+-]{8,}[0-9])'
  and p_nickname !~* '(https?://|@|[<>]|www[.])'
$$;
revoke all on function private.ai_market_feedback_auto_safe(text,text) from public,anon,authenticated;

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
 v_id uuid;
 v_auto boolean;
begin
 if p_document is null or jsonb_typeof(p_document)<>'object'
 or v_nonce !~ '^[a-f0-9]{32}$' or v_hash !~ '^[a-f0-9]{64}$'
 or p_signature !~ '^[a-f0-9]{64}$' then
   raise exception 'INVALID_FEEDBACK' using errcode='22023';
 end if;
 begin v_issued := (p_document->>'issuedAt')::bigint;
 exception when others then raise exception 'INVALID_TIMESTAMP' using errcode='22023'; end;
 if abs(extract(epoch from pg_catalog.clock_timestamp())::bigint-v_issued)>120 then
   raise exception 'EXPIRED_FEEDBACK' using errcode='22023';
 end if;
 if char_length(v_body) not between 15 and 1500
 or char_length(v_nick) not between 2 and 32
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
 if v_expected<>p_signature then
   raise exception 'INVALID_FEEDBACK_SIGNATURE' using errcode='42501';
 end if;
 -- Counters are bounded by the signed visitor fingerprint; storage is privacy-preserving.
 if (select count(*) from public.ai_market_visitor_feedback
     where visitor_hash=v_hash and created_at>now()-interval '1 hour')>=4
 or (select count(*) from public.ai_market_visitor_feedback
     where visitor_hash=v_hash and created_at>now()-interval '1 day')>=12 then
   raise exception 'FEEDBACK_RATE_LIMITED' using errcode='P0001';
 end if;
 v_auto:=private.ai_market_feedback_auto_safe(v_body,v_nick);
 insert into public.ai_market_visitor_feedback
  (category,product_id,nickname,body,locale,visitor_hash,request_nonce,status,reviewed_at,moderator_note)
 values(v_category,v_product,v_nick,v_body,v_locale,v_hash,v_nonce,
        case when v_auto then 'approved' else 'pending' end,
        case when v_auto then pg_catalog.clock_timestamp() else null end,
        case when v_auto then 'automatic_policy_v1' else null end)
 returning id into v_id;
 return pg_catalog.jsonb_build_object('accepted',true,'reviewRequired',not v_auto,'published',v_auto,'id',v_id,'nickname',v_nick);
exception when unique_violation then
 raise exception 'DUPLICATE_FEEDBACK' using errcode='23505';
end
$$;
revoke all on function public.ai_market_submit_visitor_feedback(jsonb,text) from public;
grant execute on function public.ai_market_submit_visitor_feedback(jsonb,text) to anon,authenticated;

-- A single historical pending user contribution may be safely backfilled by the same
-- classifier. Preserve unrelated older/manual pending content for staff review.
update public.ai_market_visitor_feedback
set status='approved',reviewed_at=pg_catalog.clock_timestamp(),moderator_note='automatic_policy_v1_legacy'
where status='pending'
  and created_at>=pg_catalog.clock_timestamp()-interval '36 hours'
  and private.ai_market_feedback_auto_safe(body,nickname);
