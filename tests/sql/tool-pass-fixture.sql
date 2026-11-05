-- SQL integration test. Run ONLY in ephemeral PostgreSQL 17 CI database, never production.
create schema if not exists auth;
do $$
begin
 if not exists(select 1 from pg_roles where rolname='anon') then create role anon;end if;
 if not exists(select 1 from pg_roles where rolname='authenticated') then create role authenticated;end if;
 if not exists(select 1 from pg_roles where rolname='service_role') then create role service_role;end if;
end $$;
create table auth.users(id uuid primary key);
create table public.orders(
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id),
 product_id text not null,
 product_type text not null,
 amount_rmb numeric not null,
 amount_usd numeric not null,
 currency text,
 status text,
 provider text,
 submission_name text,
 paid_at timestamptz
);
create table public.test_wallets(user_id uuid primary key references auth.users(id),cny_minor bigint not null default 200000,usd_minor bigint not null default 200000);
create table public.test_charges(reference_id text primary key,user_id uuid not null,currency text not null,amount_minor bigint not null);
create or replace function public.charge_sasi_usage_v49(
 p_user_id uuid,p_currency text,p_amount_minor bigint,p_reference_id text,p_kind text,p_metadata jsonb default '{}'::jsonb
)returns jsonb language plpgsql as $$
declare v_old public.test_charges%rowtype;
begin
 select * into v_old from public.test_charges where reference_id=p_reference_id;
 if found then
  if v_old.user_id<>p_user_id or v_old.currency<>p_currency or v_old.amount_minor<>p_amount_minor then
   return jsonb_build_object('ok',false,'error','CHARGE_REFERENCE_CONFLICT');
  end if;
  return jsonb_build_object('ok',true,'alreadyCharged',true);
 end if;
 if p_currency='CNY' then
  update public.test_wallets set cny_minor=cny_minor-p_amount_minor where user_id=p_user_id and cny_minor>=p_amount_minor;
 elsif p_currency='USD' then
  update public.test_wallets set usd_minor=usd_minor-p_amount_minor where user_id=p_user_id and usd_minor>=p_amount_minor;
 else return jsonb_build_object('ok',false,'error','UNSUPPORTED_CURRENCY');end if;
 if not found then return jsonb_build_object('ok',false,'error','SASI_BALANCE_INSUFFICIENT');end if;
 insert into public.test_charges values(p_reference_id,p_user_id,p_currency,p_amount_minor);
 return jsonb_build_object('ok',true,'alreadyCharged',false);
end $$;
insert into auth.users(id) values('11111111-1111-4111-8111-111111111111'),('22222222-2222-4222-8222-222222222222');
insert into public.test_wallets(user_id) select id from auth.users;
