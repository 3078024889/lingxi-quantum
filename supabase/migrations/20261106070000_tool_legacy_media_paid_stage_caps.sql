-- Limit historical paid media quotes by purchased media minutes and route
-- stage. This keeps existing legitimately purchased quotes deliverable without
-- allowing unlimited fresh provider requests from a single old quote.
begin;
create table if not exists public.lingxi_legacy_media_stage_usage(
 quote_id uuid not null references public.tool_payment_quotes(id) on delete restrict,
 user_id uuid not null references auth.users(id),
 stage text not null check(stage in ('media-transcribe','media-translate','media-tts')),
 operation_id uuid not null,
 characters integer not null default 0 check(characters>=0 and characters<=30000),
 created_at timestamptz not null default now(),
 primary key(quote_id,stage,operation_id)
);
alter table public.lingxi_legacy_media_stage_usage enable row level security;
revoke all on public.lingxi_legacy_media_stage_usage from public,anon,authenticated;
grant all on public.lingxi_legacy_media_stage_usage to service_role;

create or replace function public.lingxi_claim_legacy_media_stage(
 p_quote_id uuid,p_user_id uuid,p_stage text,p_operation_id uuid,p_characters integer
) returns jsonb language plpgsql security definer set search_path='' as $$
declare
 q public.tool_payment_quotes%rowtype;
 old public.lingxi_legacy_media_stage_usage%rowtype;
 max_units integer;
 max_calls integer;
 max_chars integer;
 used_calls integer;
 used_chars bigint;
begin
 if p_quote_id is null or p_user_id is null or p_operation_id is null
   or p_characters is null or p_characters<0 or p_characters>30000
   or p_stage not in ('media-transcribe','media-translate','media-tts')
 then return jsonb_build_object('ok',false,'error','LEGACY_MEDIA_REQUEST_INVALID');end if;
 -- The quote row is also the capacity lock: simultaneous requests across all
 -- workers cannot exceed the already-paid minutes.
 select * into q from public.tool_payment_quotes where id=p_quote_id for update;
 if not found or q.user_id<>p_user_id or q.status<>'paid'
 then return jsonb_build_object('ok',false,'error','LEGACY_MEDIA_QUOTE_NOT_PAID');end if;
 if (p_stage='media-transcribe' and q.tool_id not in ('video-dubbing','video-translate','video-transcription','audio-transcription'))
 or (p_stage='media-translate' and q.tool_id not in ('video-dubbing','video-translate','image-translator','subtitle-translate'))
 or (p_stage='media-tts' and q.tool_id not in ('video-dubbing','video-translate'))
 then return jsonb_build_object('ok',false,'error','LEGACY_MEDIA_STAGE_TOOL_MISMATCH');end if;
 max_units:=ceil(q.quantity)::integer;
 if max_units is null or max_units<1 or max_units>10000 then
  return jsonb_build_object('ok',false,'error','LEGACY_MEDIA_QUOTE_QUANTITY_INVALID');end if;
 select * into old from public.lingxi_legacy_media_stage_usage
  where quote_id=p_quote_id and stage=p_stage and operation_id=p_operation_id;
 if found then
  if old.user_id<>p_user_id or old.characters<>p_characters then
   return jsonb_build_object('ok',false,'error','LEGACY_MEDIA_OPERATION_CONFLICT');end if;
  return jsonb_build_object('ok',true,'alreadyStarted',true);
 end if;
 max_calls:=case when p_stage='media-transcribe' then least(100,max_units)
   else least(500,max_units*12) end;
 max_chars:=case when p_stage='media-transcribe' then 0
   else least(10000000,max_units*6000) end;
 select count(*),coalesce(sum(characters),0) into used_calls,used_chars
 from public.lingxi_legacy_media_stage_usage where quote_id=p_quote_id and stage=p_stage;
 if used_calls>=max_calls or used_chars+p_characters>max_chars then
  return jsonb_build_object('ok',false,'error','LEGACY_MEDIA_PAID_ALLOWANCE_EXHAUSTED');end if;
 insert into public.lingxi_legacy_media_stage_usage(quote_id,user_id,stage,operation_id,characters)
 values(p_quote_id,p_user_id,p_stage,p_operation_id,p_characters);
 return jsonb_build_object('ok',true,'alreadyStarted',false,
   'remainingCalls',max_calls-used_calls-1,'remainingCharacters',max_chars-used_chars-p_characters);
end $$;
revoke all on function public.lingxi_claim_legacy_media_stage(uuid,uuid,text,uuid,integer)
 from public,anon,authenticated;
grant execute on function public.lingxi_claim_legacy_media_stage(uuid,uuid,text,uuid,integer)
 to service_role;
commit;
