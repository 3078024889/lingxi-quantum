-- Ephemeral CI-only PostgreSQL harness. No production Supabase or wallet calls.
create role anon;
create role authenticated;
create role service_role;
create table public.test_toolpass_charges(reference_id text primary key,user_id uuid not null,currency text not null,minor bigint not null);
create function public.charge_sasi_usage_v49(
 p_user_id uuid,p_currency text,p_amount_minor bigint,p_reference_id text,p_kind text,p_metadata jsonb
) returns jsonb language plpgsql as $$
begin
 if p_user_id is null or p_amount_minor<1 then return jsonb_build_object('ok',false,'error','BAD_AMOUNT');end if;
 insert into public.test_toolpass_charges values(p_reference_id,p_user_id,p_currency,p_amount_minor)
 on conflict do nothing;
 if found then return jsonb_build_object('ok',true,'alreadyCharged',false);
 else return jsonb_build_object('ok',true,'alreadyCharged',true); end if;
end $$;
