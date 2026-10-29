-- LOCAL DISPOSABLE DATABASE ONLY. Bootstrap minimal Supabase-compatible
-- roles/auth.users for testing isolated AI-market DDL without production credentials.
-- This is not a replacement for Supabase Auth or a claim of full platform compatibility.
begin;
do $$ begin
 if not exists(select 1 from pg_roles where rolname='anon') then create role anon nologin; end if;
 if not exists(select 1 from pg_roles where rolname='authenticated') then create role authenticated nologin; end if;
end $$;
create extension if not exists pgcrypto;
create schema if not exists auth;
create table if not exists auth.users (id uuid primary key);
commit;
