begin;
-- Restore the existing mobile-file contract without replaying unrelated historical SQL.
create table if not exists public.tool_temp_files(
 id uuid primary key default gen_random_uuid(),
 user_id uuid references auth.users(id) on delete set null,
 object_key text not null unique,
 file_name text not null,
 mime_type text not null,
 byte_size bigint not null check(byte_size>0 and byte_size<=104857600),
 expires_at timestamptz not null,
 deleted_at timestamptz,
 created_at timestamptz not null default now()
);
-- Retain object references for cleanup even if the uploading account is deleted.
alter table public.tool_temp_files alter column user_id drop not null;
alter table public.tool_temp_files drop constraint if exists tool_temp_files_user_id_fkey;
alter table public.tool_temp_files add constraint tool_temp_files_user_id_fkey
 foreign key(user_id) references auth.users(id) on delete set null;
create index if not exists tool_temp_files_expiry_idx on public.tool_temp_files(expires_at) where deleted_at is null;
alter table public.tool_temp_files enable row level security;
revoke all on public.tool_temp_files from public,anon,authenticated;
grant select,insert,update,delete on public.tool_temp_files to service_role;
notify pgrst,'reload schema';
commit;
