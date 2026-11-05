begin;
alter table public.temp_mailboxes add column if not exists pass_use_request_id uuid
 references public.lingxi_tool_use_events(request_id);
create unique index if not exists temp_mailboxes_pass_use_request_id_unique
 on public.temp_mailboxes(pass_use_request_id) where pass_use_request_id is not null;
commit;
