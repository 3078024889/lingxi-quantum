begin;

alter table public.tool_pricing drop constraint if exists tool_pricing_billing_type_check;
alter table public.tool_pricing add constraint tool_pricing_billing_type_check
check (billing_type = any (array[
  'free'::text,'per_export'::text,'per_page'::text,'per_file'::text,
  'per_minute'::text,'per_image'::text,'per_email'::text,'ai_credit'::text
]));

commit;
