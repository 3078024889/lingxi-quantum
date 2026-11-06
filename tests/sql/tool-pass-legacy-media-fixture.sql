-- Additional only-in-CI columns matching the real historic tables.
alter table public.tool_payment_quotes add column if not exists user_id uuid references auth.users(id);
create table if not exists public.tool_export_grants(
 quote_id uuid unique references public.tool_payment_quotes(id),
 user_id uuid not null references auth.users(id),
 order_id uuid not null references public.orders(id),
 tool_id text not null
);
