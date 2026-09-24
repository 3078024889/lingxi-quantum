begin;

alter table public.tool_pricing drop constraint if exists tool_pricing_billing_type_check;
alter table public.tool_pricing add constraint tool_pricing_billing_type_check
check (billing_type = any (array[
  'free'::text,'per_export'::text,'per_page'::text,'per_file'::text,
  'per_minute'::text,'per_image'::text,'per_email'::text,'ai_credit'::text
]));

delete from public.tool_pricing where tool_id='temp-mail-day-pass';

insert into public.tool_pricing(
  tool_id,billing_type,unit_name,base_price_rmb,unit_price_rmb,
  min_price_rmb,max_price_rmb,pricing_json,enabled,updated_at
)
values(
  'temp-mail-batch','per_email','email',0,0.05,
  0.55,5.00,'{}'::jsonb,true,now()
)
on conflict(tool_id) do update set
  billing_type=excluded.billing_type,
  unit_name=excluded.unit_name,
  base_price_rmb=excluded.base_price_rmb,
  unit_price_rmb=excluded.unit_price_rmb,
  min_price_rmb=excluded.min_price_rmb,
  max_price_rmb=excluded.max_price_rmb,
  pricing_json=excluded.pricing_json,
  enabled=true,
  updated_at=now();

create table if not exists public.temp_mail_batch_uses(
  quote_id uuid primary key references public.tool_payment_quotes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  mailbox_count integer not null check(mailbox_count between 11 and 100),
  created_at timestamptz not null default now()
);

alter table public.temp_mail_batch_uses enable row level security;
revoke all on public.temp_mail_batch_uses from public,anon,authenticated;

create or replace function public.claim_temp_mail_batch_quote(
  p_quote_id uuid,
  p_user_id uuid,
  p_count integer
)
returns boolean
language plpgsql
security definer
set search_path=public,pg_temp
as $$
begin
  if p_count<11 or p_count>100 then return false; end if;

  if not exists(
    select 1 from public.tool_payment_quotes q
    where q.id=p_quote_id
      and q.user_id=p_user_id
      and q.tool_id='temp-mail-batch'
      and q.status='paid'
      and q.quantity=p_count
  ) then return false; end if;

  insert into public.temp_mail_batch_uses(quote_id,user_id,mailbox_count)
  values(p_quote_id,p_user_id,p_count)
  on conflict(quote_id) do nothing;

  return found;
end
$$;

revoke all on function public.claim_temp_mail_batch_quote(uuid,uuid,integer) from public,anon,authenticated;
grant execute on function public.claim_temp_mail_batch_quote(uuid,uuid,integer) to service_role,postgres;

commit;
