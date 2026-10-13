begin;
create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;
create function public.kick_sasi_worker_v78()
returns integer language plpgsql security definer set search_path=public,pg_temp as $$
declare secret text; active_count integer; dispatch_count integer; i integer;
begin
 if not exists(select 1 from public.sasi_durable_jobs where (state in('queued','waiting') and available_at<=now()) or (state='running' and lease_until<=now())) then return 0;end if;
 select count(*) into active_count from public.sasi_durable_jobs where state='running' and lease_until>now();
 dispatch_count:=least(2,greatest(0,8-active_count));if dispatch_count=0 then return 0;end if;
 select decrypted_secret into secret from vault.decrypted_secrets where name='sasi_worker_v78' limit 1;
 if secret is null or length(secret)<24 then return 0;end if;
 for i in 1..dispatch_count loop
  perform net.http_post(url:='https://lingxifield.com/api/internal/sasi/worker/tick',headers:=jsonb_build_object('Content-Type','application/json','Authorization','Bearer '||secret),body:='{}'::jsonb,timeout_milliseconds:=180000);
 end loop;
 return dispatch_count;
end $$;
revoke all on function public.kick_sasi_worker_v78() from public,anon,authenticated,service_role;
create function public.configure_sasi_worker_v78(p_secret text)
returns boolean language plpgsql security definer set search_path=public,pg_temp as $$
declare secret_id uuid;
begin
 if p_secret is null or length(p_secret)<24 or length(p_secret)>4096 then return false;end if;
 select id into secret_id from vault.secrets where name='sasi_worker_v78';
 if secret_id is null then perform vault.create_secret(p_secret,'sasi_worker_v78','SASI background worker authentication');else perform vault.update_secret(secret_id,p_secret);end if;
 perform cron.schedule('sasi-worker-v78','10 seconds','select public.kick_sasi_worker_v78();');
 return true;
end $$;
revoke all on function public.configure_sasi_worker_v78(text) from public,anon,authenticated;
grant execute on function public.configure_sasi_worker_v78(text) to service_role;
commit;
