-- AI Market V3.3: guest feedback, staged moderation, zero-login, no public write access to raw table.
-- Isolated additive schema; no changes to existing business or vendor tables.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists private.ai_market_feedback_signing_key (
 id smallint primary key check (id=1),
 secret text not null check(length(secret)>=48),
 created_at timestamptz not null default now()
);
revoke all on private.ai_market_feedback_signing_key from public, anon, authenticated;
insert into private.ai_market_feedback_signing_key(id,secret)
select 1,pg_catalog.encode(extensions.gen_random_bytes(32),'hex')
where not exists(select 1 from private.ai_market_feedback_signing_key where id=1);

create table if not exists public.ai_market_visitor_feedback (
 id uuid primary key default gen_random_uuid(),
 category text not null check(category in ('tool_experience','site_experience','bug','suggestion','correction')),
 product_id text null check (product_id is null or product_id ~ '^[a-z0-9][a-z0-9-]{0,79}$'),
 nickname text not null check(char_length(nickname) between 2 and 32),
 body text not null check(char_length(body) between 15 and 1500),
 locale text not null check(locale in ('zh','en','ja','ko','fr','de','es','pt','ar')),
 status text not null default 'pending' check(status in ('pending','approved','rejected')),
 visitor_hash text not null check(visitor_hash ~ '^[a-f0-9]{64}$'),
 request_nonce text not null unique check(request_nonce ~ '^[a-f0-9]{32}$'),
 created_at timestamptz not null default now(),
 reviewed_at timestamptz null,
 -- Moderator must not copy private data into published display.
 moderator_note text null
);
create index if not exists ai_market_visitor_feedback_public_idx
 on public.ai_market_visitor_feedback(product_id,created_at desc) where status='approved';
create index if not exists ai_market_visitor_feedback_rate_idx
 on public.ai_market_visitor_feedback(visitor_hash,created_at desc);
alter table public.ai_market_visitor_feedback enable row level security;
revoke all on public.ai_market_visitor_feedback from public, anon, authenticated;
grant select(id,category,product_id,nickname,body,locale,status,created_at)
 on public.ai_market_visitor_feedback to anon,authenticated;
drop policy if exists ai_market_read_approved_feedback on public.ai_market_visitor_feedback;
create policy ai_market_read_approved_feedback on public.ai_market_visitor_feedback
 for select to anon,authenticated using (status='approved');

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
comment on table public.ai_market_visitor_feedback is 'Visitor-authored feedback; only independently moderated approved content is publicly readable. Not a ranking score.';
