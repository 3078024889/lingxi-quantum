-- Customer deletion must not destroy payment/refund/reconciliation records.
alter table public.orders add column if not exists user_deleted_at timestamptz;
comment on column public.orders.user_deleted_at is 'Customer removed this order from all order/history lists; settlement and refunds remain active.';
create index if not exists orders_visible_customer_created_idx
 on public.orders (user_id, created_at desc) where user_deleted_at is null;
