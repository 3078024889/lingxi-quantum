begin;

create table if not exists public.privacy_daily_usage(
  identity_hash text not null,
  usage_date date not null default (now() at time zone 'utc')::date,
  temp_mail_count integer not null default 0 check(temp_mail_count>=0),
  updated_at timestamptz not null default now(),
  primary key(identity_hash,usage_date)
);
alter table public.privacy_daily_usage enable row level security;
revoke all on public.privacy_daily_usage from public,anon,authenticated;

create or replace function public.privacy_rate_limit(p_key text,p_limit integer,p_window_seconds integer)
returns boolean language plpgsql security definer set search_path=public,pg_temp as $$
declare v_count integer;
begin
 insert into public.rate_limits(id,window_start,count) values(p_key,now(),1)
 on conflict(id) do update set
  count=case when rate_limits.window_start<now()-(p_window_seconds||' seconds')::interval then 1 else rate_limits.count+1 end,
  window_start=case when rate_limits.window_start<now()-(p_window_seconds||' seconds')::interval then now() else rate_limits.window_start end
 returning count into v_count;
 return v_count<=p_limit;
end $$;
revoke all on function public.privacy_rate_limit(text,integer,integer) from public,anon,authenticated;
grant execute on function public.privacy_rate_limit(text,integer,integer) to service_role,postgres;

create or replace function public.consume_temp_mail_free_quota(p_identity_hash text,p_limit integer default 10)
returns integer language plpgsql security definer set search_path=public,pg_temp as $$
declare v_count integer;
begin
 insert into public.privacy_daily_usage(identity_hash,usage_date,temp_mail_count,updated_at)
 values(p_identity_hash,(now() at time zone 'utc')::date,1,now())
 on conflict(identity_hash,usage_date) do update
 set temp_mail_count=privacy_daily_usage.temp_mail_count+1,updated_at=now()
 where privacy_daily_usage.temp_mail_count<p_limit
 returning temp_mail_count into v_count;
 if v_count is null then return -1; end if;
 return greatest(0,p_limit-v_count);
end $$;
revoke all on function public.consume_temp_mail_free_quota(text,integer) from public,anon,authenticated;
grant execute on function public.consume_temp_mail_free_quota(text,integer) to service_role,postgres;

alter table public.burn_notes add column if not exists owner_user_id uuid references auth.users(id) on delete set null;
alter table public.burn_notes add column if not exists quote_id uuid references public.tool_payment_quotes(id) on delete set null;
alter table public.burn_notes add column if not exists has_files boolean not null default false;
alter table public.burn_notes add column if not exists ready_at timestamptz;
create unique index if not exists burn_notes_quote_uidx on public.burn_notes(quote_id) where quote_id is not null;

create table if not exists public.burn_files(
 id uuid primary key default gen_random_uuid(),
 note_id uuid not null references public.burn_notes(id) on delete cascade,
 object_key text not null unique,
 original_name text not null,
 size_bytes bigint not null check(size_bytes>0 and size_bytes<=2147483648),
 mime_type text not null default 'application/octet-stream',
 created_at timestamptz not null default now()
);
create index if not exists burn_files_note_idx on public.burn_files(note_id);
alter table public.burn_files enable row level security;
revoke all on public.burn_files from public,anon,authenticated;

drop function if exists public.consume_burn_note(uuid);
create function public.consume_burn_note(p_id uuid)
returns table(ciphertext text,iv text,expires_at timestamptz,view_duration_seconds integer,views_used integer,max_views integer,mode text,has_files boolean)
language plpgsql security definer set search_path=public,pg_temp as $$
declare n public.burn_notes%rowtype;
begin
 select * into n from public.burn_notes where id=p_id for update;
 if n.id is null or n.expires_at<=now() or n.views_used>=n.max_views or (n.has_files and n.ready_at is null) then return; end if;
 update public.burn_notes
 set views_used=views_used+1,
     consumed_at=case when views_used+1>=max_views then now() else consumed_at end
 where id=p_id
 returning burn_notes.ciphertext,burn_notes.iv,burn_notes.expires_at,burn_notes.view_duration_seconds,burn_notes.views_used,burn_notes.max_views,burn_notes.mode,burn_notes.has_files
 into ciphertext,iv,expires_at,view_duration_seconds,views_used,max_views,mode,has_files;
 return next;
end $$;
revoke all on function public.consume_burn_note(uuid) from public,anon,authenticated;
grant execute on function public.consume_burn_note(uuid) to service_role,postgres;

delete from public.tool_pricing where tool_id='temp-mail-day-pass';

insert into public.tool_pricing(tool_id,billing_type,unit_name,base_price_rmb,unit_price_rmb,min_price_rmb,max_price_rmb,pricing_json,enabled,updated_at)
values('temp-mail-batch','per_email','email',0,.05,.55,5,'{}'::jsonb,true,now())
on conflict(tool_id) do update set billing_type='per_email',unit_name='email',base_price_rmb=0,unit_price_rmb=.05,min_price_rmb=.55,max_price_rmb=5,enabled=true,updated_at=now();

insert into public.tool_pricing(tool_id,billing_type,unit_name,base_price_rmb,unit_price_rmb,min_price_rmb,max_price_rmb,pricing_json,enabled,updated_at)
values('burn-after-read-file','per_file','mb',0,0,.9,12.9,'{"tiers":[{"max":10,"price":0.9},{"max":50,"price":1.9},{"max":200,"price":3.9},{"max":500,"price":6.9},{"max":2048,"price":12.9}]}'::jsonb,true,now())
on conflict(tool_id) do update set billing_type='per_file',unit_name='mb',base_price_rmb=0,unit_price_rmb=0,min_price_rmb=.9,max_price_rmb=12.9,pricing_json='{"tiers":[{"max":10,"price":0.9},{"max":50,"price":1.9},{"max":200,"price":3.9},{"max":500,"price":6.9},{"max":2048,"price":12.9}]}'::jsonb,enabled=true,updated_at=now();

alter table public.tool_pricing add column if not exists base_price_usd numeric(10,2);
alter table public.tool_pricing add column if not exists unit_price_usd numeric(10,4);
alter table public.tool_pricing add column if not exists min_price_usd numeric(10,2);
alter table public.tool_pricing add column if not exists max_price_usd numeric(10,2);
alter table public.tool_pricing add column if not exists pricing_json_usd jsonb not null default '{}'::jsonb;

update public.tool_pricing set
 base_price_usd=0,unit_price_usd=.05,min_price_usd=.55,max_price_usd=5,pricing_json_usd='{}'::jsonb
where tool_id='temp-mail-batch';

update public.tool_pricing set
 base_price_usd=0,unit_price_usd=0,min_price_usd=.9,max_price_usd=12.9,
 pricing_json_usd='{"tiers":[{"max":10,"price":0.9},{"max":50,"price":1.9},{"max":200,"price":3.9},{"max":500,"price":6.9},{"max":2048,"price":12.9}]}'::jsonb
where tool_id='burn-after-read-file';

commit;
