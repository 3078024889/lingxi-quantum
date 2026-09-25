begin;

-- V15.05: do not destroy a burn note before the browser has successfully decrypted it.
-- preview_burn_note returns encrypted payload only and DOES NOT increment views.
-- commit_burn_note_view is the only RPC that advances views after successful client decrypt.

drop function if exists public.preview_burn_note(uuid);
create function public.preview_burn_note(p_id uuid)
returns table(
  ciphertext text,
  iv text,
  expires_at timestamptz,
  view_duration_seconds integer,
  views_used integer,
  max_views integer,
  mode text,
  has_files boolean
)
language plpgsql
security definer
set search_path=public,pg_temp
as $$
declare n public.burn_notes%rowtype;
begin
  select * into n
  from public.burn_notes
  where id=p_id;

  if n.id is null
     or n.expires_at<=now()
     or n.views_used>=n.max_views
     or n.consumed_at is not null
     or (n.has_files and n.ready_at is null)
  then
    return;
  end if;

  ciphertext:=n.ciphertext;
  iv:=n.iv;
  expires_at:=n.expires_at;
  view_duration_seconds:=n.view_duration_seconds;
  views_used:=n.views_used;
  max_views:=n.max_views;
  mode:=n.mode;
  has_files:=n.has_files;
  return next;
end $$;

revoke all on function public.preview_burn_note(uuid) from public,anon,authenticated;
grant execute on function public.preview_burn_note(uuid) to service_role,postgres;

drop function if exists public.commit_burn_note_view(uuid);
create function public.commit_burn_note_view(p_id uuid)
returns table(
  views_used integer,
  max_views integer,
  consumed boolean
)
language plpgsql
security definer
set search_path=public,pg_temp
as $$
declare n public.burn_notes%rowtype;
begin
  select * into n
  from public.burn_notes
  where id=p_id
  for update;

  if n.id is null
     or n.expires_at<=now()
     or n.views_used>=n.max_views
     or n.consumed_at is not null
     or (n.has_files and n.ready_at is null)
  then
    return;
  end if;

  update public.burn_notes
  set views_used=burn_notes.views_used+1,
      consumed_at=case
        when burn_notes.views_used+1>=burn_notes.max_views then now()
        else burn_notes.consumed_at
      end
  where id=p_id
  returning
    burn_notes.views_used,
    burn_notes.max_views,
    burn_notes.consumed_at is not null
  into views_used,max_views,consumed;

  return next;
end $$;

revoke all on function public.commit_burn_note_view(uuid) from public,anon,authenticated;
grant execute on function public.commit_burn_note_view(uuid) to service_role,postgres;

-- Keep old RPC for rollback compatibility only; application V15.05 no longer calls it.
-- Existing grants remain service-role only.

commit;
