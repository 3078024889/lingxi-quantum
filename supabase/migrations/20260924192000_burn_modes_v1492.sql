begin;
alter table public.burn_notes add column if not exists max_views integer not null default 1 check(max_views in (1,3,5));
alter table public.burn_notes add column if not exists views_used integer not null default 0 check(views_used>=0);
alter table public.burn_notes add column if not exists mode text not null default 'once' check(mode in ('once','timed','limited','fast'));
alter table public.burn_notes add column if not exists view_duration_seconds integer check(view_duration_seconds is null or view_duration_seconds in (5,10,30,60));
create or replace function public.consume_burn_note(p_id uuid)
returns table(ciphertext text,iv text,expires_at timestamptz,view_duration_seconds integer,views_used integer,max_views integer,mode text)
language plpgsql security definer set search_path=public
as $$
declare n public.burn_notes%rowtype;
begin
 select * into n from public.burn_notes where id=p_id for update;
 if n.id is null or n.expires_at<=now() or n.views_used>=n.max_views then return; end if;
 update public.burn_notes set views_used=views_used+1 where id=p_id
 returning burn_notes.ciphertext,burn_notes.iv,burn_notes.expires_at,burn_notes.view_duration_seconds,burn_notes.views_used,burn_notes.max_views,burn_notes.mode
 into ciphertext,iv,expires_at,view_duration_seconds,views_used,max_views,mode;
 if views_used>=max_views then delete from public.burn_notes where id=p_id; end if;
 return next;
end $$;
revoke all on function public.consume_burn_note(uuid) from public,anon,authenticated;
grant execute on function public.consume_burn_note(uuid) to service_role,postgres;
commit;
