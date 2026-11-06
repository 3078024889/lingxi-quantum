-- Disposable PG17: one-task mailbox creation/quantity and refund-revocation boundaries.
begin;
do $$
declare
 a uuid:='11111111-1111-4111-8111-111111111111';
 b uuid:='22222222-2222-4222-8222-222222222222';
 pass_req uuid:='d1111111-1111-4111-8111-111111111111';
 task uuid:='d2222222-2222-4222-8222-222222222222';
 other uuid:='d3333333-3333-4333-8333-333333333333';
 next_req uuid:='d4444444-4444-4444-8444-444444444444';
 purchase uuid:='d5555555-5555-4555-8555-555555555555';
 list jsonb;
 value jsonb;
begin
 insert into public.lingxi_tool_passes(user_id,sku,currency,price_minor,
  purchase_request_id,starts_at,expires_at)
 values(a,'tool_pass_30d','CNY',9900,purchase,now()-interval '1 minute',now()+interval '30 days');
 value:=public.lingxi_claim_tool_use(pass_req,a,repeat('a',64),'temp-mail',11);
 if value->>'ok' is distinct from 'true' or value->>'accessKind' is distinct from 'pass'
 then raise exception 'TEMP_MAIL_PASS_CLAIM_FAILED %',value;end if;
 select jsonb_agg(jsonb_build_object('local_part','mail'||lpad(i::text,5,'0'),
  'token_hash',repeat('a',64))) into list from generate_series(1,11) i;
 value:=public.lingxi_create_pass_mail_batch(pass_req,a,task,11,list);
 if value->>'ok' is distinct from 'true' or value->>'recovered' is distinct from 'false'
 then raise exception 'MAIL_BATCH_CREATE_FAILED %',value;end if;
 if jsonb_array_length(value->'mailboxes')<>11 or
  (select count(*) from public.temp_mailboxes where pass_request_id=pass_req)<>11
 then raise exception 'PASS_MAIL_PARTIAL_INSERT';end if;
 value:=public.lingxi_create_pass_mail_batch(pass_req,a,task,11,list);
 if value->>'recovered' is distinct from 'true' or jsonb_array_length(value->'mailboxes')<>11
 then raise exception 'PASS_MAIL_IDEMPOTENT_RECOVERY_FAILED %',value;end if;
 value:=public.lingxi_create_pass_mail_batch(pass_req,a,other,11,list);
 if value->>'error' is distinct from 'PASS_MAIL_REQUEST_CONFLICT'
 then raise exception 'MAIL_BATCH_OTHER_OPERATION_REPLAY_ACCEPTED %',value;end if;
 value:=public.lingxi_create_pass_mail_batch(pass_req,b,task,11,list);
 if value->>'error' is distinct from 'PASS_MAIL_REQUEST_CONFLICT'
 then raise exception 'MAIL_BATCH_CROSS_ACCOUNT_REPLAY_ACCEPTED %',value;end if;
 value:=public.lingxi_create_pass_mail_batch(pass_req,a,task,12,list);
 if value->>'error' is distinct from 'PASS_MAIL_INPUT_INVALID'
 then raise exception 'MAIL_BATCH_QUANTITY_REPLAY_ACCEPTED %',value;end if;
 value:=public.lingxi_claim_tool_use(next_req,a,repeat('b',64),'temp-mail',90);
 if value->>'ok' is distinct from 'true' then raise exception 'NEXT_PASS_CLAIM_FAILED %',value;end if;
 select jsonb_agg(jsonb_build_object('local_part','next'||lpad(i::text,6,'0'),
  'token_hash',repeat('b',64))) into list from generate_series(1,90) i;
 value:=public.lingxi_create_pass_mail_batch(next_req,a,other,90,list);
 if value->>'error' is distinct from 'PASS_MAIL_DAILY_LIMIT'
 then raise exception 'MAIL_BATCH_100_DAILY_CAP_BYPASS %',value;end if;
 if (select count(*) from public.lingxi_tool_execution_stages
  where request_id=next_req and stage='temp-mail-batch')<>0
 then raise exception 'MAIL_QUOTA_FAILED_AFTER_CONSUMING_STAGE';end if;
 value:=public.lingxi_create_pass_mail_batch(other,a,task,11,list);
 if value->>'error' is distinct from 'PASS_MAIL_INPUT_INVALID'
 then raise exception 'INVALID_MAIL_OPERATION_ACCEPTED %',value;end if;
 update public.lingxi_tool_passes set revoked_at=now() where purchase_request_id=purchase;
 value:=public.lingxi_claim_tool_use('d6666666-6666-4666-8666-666666666666',a,repeat('e',64),'temp-mail',11);
 if value->>'ok' is distinct from 'false'
 then raise exception 'REVOKED_PASS_STILL_ALLOWS_BATCH %',value;end if;
 if (select count(*) from public.lingxi_tool_pass_mail_batches where user_id=a)<>1
 then raise exception 'INVALID_BATCH_JOURNAL_COUNT';end if;
end $$;
do $$
begin
 if has_function_privilege('anon',
   'public.lingxi_create_pass_mail_batch(uuid,uuid,uuid,integer,jsonb)','EXECUTE')
 or has_function_privilege('authenticated',
   'public.lingxi_create_pass_mail_batch(uuid,uuid,uuid,integer,jsonb)','EXECUTE')
 then raise exception 'MAIL_BATCH_RPC_PUBLICLY_EXPOSED';end if;
end $$;
rollback;
