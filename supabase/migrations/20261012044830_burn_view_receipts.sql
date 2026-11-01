begin;

create table public.burn_view_receipts (
 note_id uuid not null references public.burn_notes(id) on delete cascade,
 view_id uuid not null,
 views_used integer not null,
 max_views integer not null,
 consumed boolean not null,
 access_until timestamptz not null,
 primary key(note_id,view_id)
);
alter table public.burn_view_receipts enable row level security;
revoke all on public.burn_view_receipts from public,anon,authenticated;

-- The old single-argument RPC cannot provide retry-safe viewing.
drop function if exists public.consume_burn_note(uuid);
drop function public.commit_burn_note_view(uuid);
create function public.commit_burn_note_view(p_id uuid,p_view_id uuid)
returns table(views_used integer,max_views integer,consumed boolean,has_files boolean,access_until timestamptz)
language plpgsql security definer set search_path=public,pg_temp as $$
declare n public.burn_notes%rowtype; receipt public.burn_view_receipts%rowtype;
begin
 if p_view_id is null then return; end if;
 select * into n from public.burn_notes where id=p_id for update;
 if n.id is null or n.expires_at<=now() then return; end if;
 select * into receipt from public.burn_view_receipts where note_id=p_id and view_id=p_view_id;
 if receipt.note_id is not null then
  if receipt.access_until<=now() then return; end if;
  views_used:=receipt.views_used; max_views:=receipt.max_views; consumed:=receipt.consumed;
  has_files:=n.has_files; access_until:=receipt.access_until; return next; return;
 end if;
 if n.consumed_at is not null or n.views_used>=n.max_views or (n.has_files and n.ready_at is null) then return; end if;
 update public.burn_notes set views_used=burn_notes.views_used+1,
  consumed_at=case when burn_notes.views_used+1>=burn_notes.max_views then now() else burn_notes.consumed_at end
 where id=p_id returning burn_notes.views_used,burn_notes.max_views,burn_notes.consumed_at is not null into views_used,max_views,consumed;
 has_files:=n.has_files;
 access_until:=least(n.expires_at,now()+make_interval(secs=>coalesce(n.view_duration_seconds,300)));
 insert into public.burn_view_receipts values(p_id,p_view_id,views_used,max_views,consumed,access_until);
 return next;
end $$;
revoke all on function public.commit_burn_note_view(uuid,uuid) from public,anon,authenticated;
grant execute on function public.commit_burn_note_view(uuid,uuid) to service_role,postgres;

commit;
