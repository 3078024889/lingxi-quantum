begin;

-- Reapply after the original privacy-tools migration. Its older definition
-- sorts later than the first R2 safety migration and removes retry metadata.
create or replace function public.cleanup_ephemeral_privacy_data()
returns jsonb language plpgsql security definer set search_path=public,pg_temp
as $$
declare mail_count integer; note_count integer; file_count integer;
begin
 delete from public.temp_mailboxes where expires_at < now();
 get diagnostics mail_count=row_count;
 delete from public.burn_notes
 where (expires_at < now() or consumed_at < now()-interval '5 minutes')
   and coalesce(has_files,false)=false;
 get diagnostics note_count=row_count;
 select count(*)::integer into file_count from public.burn_notes
 where (expires_at < now() or consumed_at is not null)
   and coalesce(has_files,false)=true;
 return jsonb_build_object('mailboxes',mail_count,'burn_notes',note_count,'burn_file_notes_deferred',file_count);
end $$;
revoke all on function public.cleanup_ephemeral_privacy_data() from public,anon,authenticated;
grant execute on function public.cleanup_ephemeral_privacy_data() to service_role,postgres;

commit;
