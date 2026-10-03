
alter table public.balance_withdrawals add column if not exists submission_confirmed_at timestamptz, add column if not exists provider_call_locked_until timestamptz;
update public.balance_withdrawals set submission_confirmed_at=created_at where submission_confirmed_at is null;
alter table public.balance_withdrawals drop constraint balance_withdrawals_status_check;
alter table public.balance_withdrawals add constraint balance_withdrawals_status_check check(status in ('requested','processing','completed','rejected','failed','cancelled'));
alter table public.ai_refund_requests drop constraint ai_refund_requests_status_check;
alter table public.ai_refund_requests add constraint ai_refund_requests_status_check check(status in ('requested','approved','rejected','completed','cancelled'));
create table public.money_operator_settings(id boolean primary key default true check(id),admin_emails text[] not null,notify_email text not null);
alter table public.money_operator_settings enable row level security;
revoke all on public.money_operator_settings from anon,authenticated;
grant all on public.money_operator_settings to service_role;
insert into public.money_operator_settings(id,admin_emails,notify_email) values(true,array['business@lingxifield.com'],'business@lingxifield.com');
create table public.money_notification_outbox(
 id uuid primary key default gen_random_uuid(),withdrawal_id uuid references public.balance_withdrawals(id),event_key text not null unique,event_type text not null,
 status text not null default 'pending' check(status in ('pending','sending','sent','failed')),attempt_count integer not null default 0,
 available_at timestamptz not null default now(),locked_until timestamptz,message_id text,last_error text,created_at timestamptz not null default now(),sent_at timestamptz
);
alter table public.money_notification_outbox enable row level security;
revoke all on public.money_notification_outbox from anon,authenticated;
grant all on public.money_notification_outbox to service_role;
create index money_notification_due_idx on public.money_notification_outbox(available_at) where status in ('pending','sending','failed');
create function public.money_prepare_request() returns trigger language plpgsql set search_path=public,pg_temp as $$
begin new.submission_confirmed_at:=null;new.next_reconcile_at:='infinity'::timestamptz;return new;end $$;
create trigger money_prepare_request before insert on public.balance_withdrawals for each row execute function public.money_prepare_request();
create function public.money_queue_notice() returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
declare event text;begin
 if TG_OP='INSERT' then event:='requested';
 elsif new.failure_code='USER_CANCELLED' then return new;
 elsif new.status is distinct from old.status then event:=new.status;
 elsif new.failure_code is distinct from old.failure_code and new.failure_code in ('PROVIDER_FUNDS_REQUIRED','PROVIDER_ACTION_REQUIRED','OPERATOR_REVIEW_REQUIRED') then event:=new.failure_code;
 else return new;end if;
 insert into public.money_notification_outbox(withdrawal_id,event_key,event_type) values(new.id,new.id::text||':'||event,event) on conflict(event_key) do nothing;
 return new;end $$;
create trigger money_queue_notice after insert or update on public.balance_withdrawals for each row execute function public.money_queue_notice();
create function public.confirm_balance_withdrawal_submission(p_withdrawal_id uuid,p_user_id uuid) returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare w public.balance_withdrawals%rowtype;begin
 select * into w from public.balance_withdrawals where id=p_withdrawal_id and user_id=p_user_id for update;
 if not found then return jsonb_build_object('ok',false,'error','WITHDRAWAL_NOT_FOUND');end if;
 if w.status<>'requested' then return jsonb_build_object('ok',false,'error','WITHDRAWAL_CLOSED');end if;
 update public.balance_withdrawals set submission_confirmed_at=coalesce(submission_confirmed_at,now()),next_reconcile_at=now(),updated_at=now() where id=w.id;
 return jsonb_build_object('ok',true);end $$;
create function public.money_begin_provider_call(p_withdrawal_id uuid) returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare w public.balance_withdrawals%rowtype;begin
 select * into w from public.balance_withdrawals where id=p_withdrawal_id for update;
 if not found then return jsonb_build_object('ok',false,'status','missing');end if;
 if w.status not in ('requested','processing') then return jsonb_build_object('ok',false,'status',w.status);end if;
 if w.submission_confirmed_at is null then return jsonb_build_object('ok',false,'status','requested');end if;
 if w.provider_call_locked_until>now() then return jsonb_build_object('ok',false,'status','processing');end if;
 update public.balance_withdrawals set status='processing',processing_started_at=coalesce(processing_started_at,now()),provider_call_locked_until=now()+interval '90 seconds',updated_at=now() where id=w.id;
 return jsonb_build_object('ok',true);end $$;
create function public.cancel_balance_withdrawal(p_withdrawal_id uuid,p_user_id uuid) returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare w public.balance_withdrawals%rowtype;result jsonb;held bigint;begin
 select * into w from public.balance_withdrawals where id=p_withdrawal_id and user_id=p_user_id for update;
 if not found then return jsonb_build_object('ok',false,'error','WITHDRAWAL_NOT_FOUND');end if;
 if w.status='cancelled' then return jsonb_build_object('ok',true,'status','cancelled','replayed',true);end if;
 if w.status<>'requested' or w.submission_confirmed_at is not null or w.provider_refund_id is not null or w.provider_attempt_count<>0 or w.processing_started_at is not null or w.provider_call_locked_until>now() then
 return jsonb_build_object('ok',false,'error','CANCELLATION_NOT_AVAILABLE');end if;
 if w.wallet_kind='ai_cny' then select refund_hold_fen into held from public.ai_wallets where user_id=w.user_id for update;
 elsif w.wallet_kind='sasi_cny' then select refund_hold_points into held from public.sasi_wallets where user_id=w.user_id for update;
 elsif w.wallet_kind='ai_usd' then select refund_hold_cents into held from public.ai_usd_wallets where user_id=w.user_id for update;
 elsif w.wallet_kind='sasi_usd' then select refund_hold_cents into held from public.sasi_usd_wallets where user_id=w.user_id for update;end if;
 if held is null or held<w.amount_minor then raise exception 'REFUND_HOLD_MISMATCH';end if;
 result:=public.release_balance_withdrawal(w.id,'USER_CANCELLED','NOT_SUBMITTED');
 if result->>'ok'<>'true' then raise exception 'CANCELLATION_RELEASE_FAILED';end if;
 update public.balance_withdrawals set status='cancelled',failure_code=null,next_reconcile_at=null,updated_at=now() where id=w.id;
 return jsonb_build_object('ok',true,'status','cancelled');end $$;
create function public.cancel_legacy_refund(p_request_id uuid,p_user_id uuid) returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare r public.ai_refund_requests%rowtype;held bigint;result jsonb;begin
 select * into r from public.ai_refund_requests where id=p_request_id and user_id=p_user_id for update;
 if not found then return jsonb_build_object('ok',false,'error','WITHDRAWAL_NOT_FOUND');end if;
 if r.status='cancelled' then return jsonb_build_object('ok',true,'status','cancelled');end if;
 if r.status<>'requested' or r.provider_refund_id is not null or exists(select 1 from public.balance_withdrawals where legacy_refund_id=r.id) then return jsonb_build_object('ok',false,'error','CANCELLATION_NOT_AVAILABLE');end if;
 select refund_hold_fen into held from public.ai_wallets where user_id=r.user_id for update;
 if held is null or held<r.amount_fen then raise exception 'REFUND_HOLD_MISMATCH';end if;
 result:=public.resolve_ai_refund(r.id,'rejected',null,'USER_CANCELLED');
 if result->>'ok'<>'true' then raise exception 'CANCELLATION_RELEASE_FAILED';end if;
 update public.ai_refund_requests set status='cancelled',updated_at=now() where id=r.id;
 return jsonb_build_object('ok',true,'status','cancelled');end $$;
create function public.money_claim_notifications(p_limit integer default 10) returns setof public.money_notification_outbox language sql security definer set search_path=public,pg_temp as $$
 with due as(select id from public.money_notification_outbox where status in ('pending','failed','sending') and available_at<=now() and (locked_until is null or locked_until<now()) and attempt_count<10 order by created_at for update skip locked limit greatest(1,least(p_limit,20)))
 update public.money_notification_outbox o set status='sending',locked_until=now()+interval '2 minutes',attempt_count=attempt_count+1 where o.id in(select id from due) returning o.*
$$;
revoke all on function public.money_prepare_request(),public.money_queue_notice(),public.confirm_balance_withdrawal_submission(uuid,uuid),public.money_begin_provider_call(uuid),public.cancel_balance_withdrawal(uuid,uuid),public.cancel_legacy_refund(uuid,uuid),public.money_claim_notifications(integer) from public,anon,authenticated;
grant execute on function public.confirm_balance_withdrawal_submission(uuid,uuid),public.money_begin_provider_call(uuid),public.cancel_balance_withdrawal(uuid,uuid),public.cancel_legacy_refund(uuid,uuid),public.money_claim_notifications(integer) to service_role;

create function public.money_protect_cancellation() returns trigger language plpgsql set search_path=public,pg_temp as $$ begin if old.status='cancelled' and new.status<>'cancelled' then raise exception 'CANCELLED_REQUEST_FINAL';end if;return new;end $$;
create trigger money_protect_cancellation before update on public.balance_withdrawals for each row execute function public.money_protect_cancellation();
create trigger money_protect_legacy_cancellation before update on public.ai_refund_requests for each row execute function public.money_protect_cancellation();
revoke all on function public.money_protect_cancellation() from public,anon,authenticated;

create function public.money_operator_snapshot() returns jsonb language sql security definer set search_path=public,pg_temp as $$
 select jsonb_build_object('channels',coalesce((select jsonb_agg(x) from (select provider,provider_currency,count(*) filter(where status in ('requested','processing') and submission_confirmed_at is not null) as active_count,coalesce(sum(provider_amount_minor) filter(where status in ('requested','processing') and submission_confirmed_at is not null),0) as pending_minor,coalesce(sum(provider_amount_minor) filter(where status in ('requested','processing') and failure_code='PROVIDER_FUNDS_REQUIRED'),0) as funds_required_minor,count(*) filter(where status='requested' and submission_confirmed_at is null) as awaiting_confirmation from public.balance_withdrawals group by provider,provider_currency) x),'[]'::jsonb),'notices_pending',(select count(*) from public.money_notification_outbox where status<>'sent'))
$$;
revoke all on function public.money_operator_snapshot() from public,anon,authenticated;
grant execute on function public.money_operator_snapshot() to service_role;
