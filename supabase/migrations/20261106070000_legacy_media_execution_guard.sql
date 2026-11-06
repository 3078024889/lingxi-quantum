-- Historical provider-cost quote cannot be replayed to create unlimited work.
-- Apply only after old media pipeline reconciliation and production-schema staging.
begin;
create table if not exists public.lingxi_legacy_media_execution_claims (
 quote_id uuid not null references public.tool_payment_quotes(id) on delete restrict,
 stage text not null check(stage in ('transcribe','translate','tts')),
 user_id uuid not null references auth.users(id),
 digest text not null check(digest ~ '^[a-f0-9]{64}$'),
 claimed_at timestamptz not null default now(),
 primary key(quote_id,stage)
);
alter table public.lingxi_legacy_media_execution_claims enable row level security;
revoke all on public.lingxi_legacy_media_execution_claims from public,anon,authenticated;
grant all on public.lingxi_legacy_media_execution_claims to service_role;
create or replace function public.lingxi_claim_legacy_media_execution(
 p_quote_id uuid,p_user_id uuid,p_stage text,p_digest text
)returns jsonb language plpgsql security definer set search_path='' as $$
declare
 q public.tool_payment_quotes%rowtype;
 allowed boolean:=false;
begin
 if p_quote_id is null or p_user_id is null or p_stage not in ('transcribe','translate','tts')
    or p_digest is null or p_digest !~ '^[a-f0-9]{64}$'
 then return jsonb_build_object('ok',false,'error','MEDIA_EXECUTION_INVALID');end if;
 select * into q from public.tool_payment_quotes where id=p_quote_id for update;
 if not found or q.user_id<>p_user_id or q.status<>'paid'
 then return jsonb_build_object('ok',false,'error','QUOTE_NOT_PAID');end if;
 allowed:=case p_stage
 when 'transcribe' then q.tool_id in ('video-dubbing','video-translate','video-transcription','audio-transcription')
 when 'translate' then q.tool_id in ('video-dubbing','video-translate','image-translator','subtitle-translate')
 when 'tts' then q.tool_id in ('video-dubbing','video-translate')
 else false end;
 if not allowed then return jsonb_build_object('ok',false,'error','QUOTE_TOOL_STAGE_INVALID');end if;
 if not exists (
  select 1 from public.tool_export_grants g
  join public.orders o on o.id=g.order_id
  where g.quote_id=q.id and g.user_id=p_user_id and g.tool_id=q.tool_id
    and o.user_id=p_user_id and o.status='paid'
 )
 then return jsonb_build_object('ok',false,'error','QUOTE_DELIVERY_RIGHT_NOT_FOUND');end if;
 insert into public.lingxi_legacy_media_execution_claims(quote_id,stage,user_id,digest)
 values(p_quote_id,p_stage,p_user_id,p_digest) on conflict do nothing;
 if not found then
  return jsonb_build_object('ok',false,'error','QUOTE_OPERATION_ALREADY_USED');
 end if;
 return jsonb_build_object('ok',true,'stage',p_stage);
end $$;
revoke all on function public.lingxi_claim_legacy_media_execution(uuid,uuid,text,text)
 from public,anon,authenticated;
grant execute on function public.lingxi_claim_legacy_media_execution(uuid,uuid,text,text)
 to service_role;
commit;
