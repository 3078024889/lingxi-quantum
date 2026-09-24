begin;

create or replace function public.cleanup_ephemeral_privacy_data()
returns jsonb
language plpgsql
security definer
set search_path=public,pg_temp
as $$
declare
  a integer;
  b integer;
  deferred integer;
begin
  delete from public.temp_mailboxes
  where expires_at < now();
  get diagnostics a=row_count;

  delete from public.burn_notes
  where (expires_at < now() or consumed_at is not null)
    and coalesce(has_files,false)=false;
  get diagnostics b=row_count;

  select count(*)::integer into deferred
  from public.burn_notes
  where (expires_at < now() or consumed_at is not null)
    and coalesce(has_files,false)=true;

  return jsonb_build_object(
    'mailboxes',a,
    'burn_notes',b,
    'burn_file_notes_deferred',deferred
  );
end
$$;

revoke all on function public.cleanup_ephemeral_privacy_data() from public,anon,authenticated;
grant execute on function public.cleanup_ephemeral_privacy_data() to service_role,postgres;

create index if not exists burn_notes_owner_user_id_idx
  on public.burn_notes(owner_user_id)
  where owner_user_id is not null;

create index if not exists temp_mail_batch_uses_user_id_idx
  on public.temp_mail_batch_uses(user_id);

create index if not exists ai_usd_wallet_ledger_user_id_idx
  on public.ai_usd_wallet_ledger(user_id);

create index if not exists sasi_usd_wallet_ledger_user_id_idx
  on public.sasi_usd_wallet_ledger(user_id);

commit;
