-- Isolated transaction: no real user/account or paid balance mutation persists.
begin;
do $$
declare
 u uuid:='11111111-1111-4111-8111-111111111111';
 outsider uuid:='22222222-2222-4222-8222-222222222222';
 req uuid:='a3333333-3333-4333-8333-333333333333';
 op uuid:='a4444444-4444-4444-8444-444444444444';
 note uuid:='a5555555-5555-4555-8555-555555555555';
 file_key text:='burn/a5555555-5555-4555-8555-555555555555/a-document.pdf';
 digest text:=repeat('a',64);
 files jsonb;
 got jsonb;
begin
 files:=jsonb_build_array(jsonb_build_object(
  'objectKey',file_key,'name','document.pdf','size',1200,'mime','application/pdf'));
 got:=public.lingxi_claim_tool_use(req,u,repeat('9',64),'burn-after-read',1);
 if got->>'ok'<>'true' then raise exception 'BURN_FILE_QUOTA_CLAIM_FAILED %',got;end if;
 got:=public.lingxi_prepare_pass_burn_file_v1(
  u,req,op,note,repeat('X',40),repeat('I',20),1440,'once',1,null,digest,files
 );
 if got->>'ok'<>'true' or got->>'recovered'<>'false'
 then raise exception 'PASS_BURN_FILE_CREATE_FAILED %',got;end if;
 if (select count(*) from public.burn_notes where access_request_id=req)<>1 or
    (select count(*) from public.burn_files where note_id=note)<>1
 then raise exception 'PASS_BURN_FILE_ROWS_MISSING';end if;
 got:=public.lingxi_prepare_pass_burn_file_v1(
  u,req,op,note,repeat('X',40),repeat('I',20),1440,'once',1,null,digest,files
 );
 if got->>'ok'<>'true' or got->>'recovered'<>'true'
 then raise exception 'PASS_BURN_FILE_RETRY_NOT_IDEMPOTENT %',got;end if;
 if (got->'files'->0->>'objectKey')<>file_key
 then raise exception 'PASS_BURN_FILE_RETRY_CHANGED_R2_OBJECT';end if;
 got:=public.lingxi_prepare_pass_burn_file_v1(
  outsider,req,op,note,repeat('X',40),repeat('I',20),1440,'once',1,null,digest,files
 );
 if got->>'error'<>'PASS_BURN_FILE_REBIND'
 then raise exception 'PASS_BURN_FILE_CROSS_USER_REPLAY %',got;end if;
 got:=public.lingxi_prepare_pass_burn_file_v1(
  u,req,op,note,repeat('X',40),repeat('I',20),1440,'once',1,null,repeat('b',64),files
 );
 if got->>'error'<>'PASS_BURN_FILE_REBIND'
 then raise exception 'PASS_BURN_FILE_CHANGED_CONTENT_ACCEPTED %',got;end if;
 update public.burn_notes set expires_at=now()-interval '1 minute'
 where access_request_id=req;
 got:=public.lingxi_prepare_pass_burn_file_v1(
  u,req,op,note,repeat('X',40),repeat('I',20),1440,'once',1,null,digest,files
 );
 if got->>'error'<>'PASS_BURN_FILE_GONE'
 then raise exception 'EXPIRED_PASS_BURN_FILE_REISSUED %',got;end if;
 got:=public.lingxi_prepare_pass_burn_file_v1(
  u,'a6666666-6666-4666-8666-666666666666',op,
  'a7777777-7777-4777-8777-777777777777',
  repeat('X',40),repeat('I',20),1440,'once',1,null,digest,
  jsonb_build_array(jsonb_build_object(
   'objectKey','burn/a7777777-7777-4777-8777-777777777777/x.pdf',
   'name','x.pdf','size',1200,'mime','application/pdf'))
 );
 if got->>'ok'='true' then raise exception 'PASS_BURN_UNCLAIMED_RECEIPT_ALLOWED';end if;
 got:=public.lingxi_prepare_pass_burn_file_v1(
  u,'a8888888-8888-4888-8888-888888888888',op,
  'a9999999-9999-4999-8999-999999999999',
  repeat('X',40),repeat('I',20),1440,'once',1,null,digest,
  jsonb_build_array(jsonb_build_object(
   'objectKey','burn/not-owned/x.pdf',
   'name','x.pdf','size',1200,'mime','application/pdf'))
 );
 if got->>'error'<>'INVALID_PASS_BURN_FILE_META'
 then raise exception 'UNSCOPED_R2_BUCKET_ACCESS %',got;end if;
end $$;
do $$
begin
 if has_function_privilege('anon',
  'public.lingxi_prepare_pass_burn_file_v1(uuid,uuid,uuid,uuid,text,text,integer,text,integer,integer,text,jsonb)','EXECUTE')
 or has_function_privilege('authenticated',
  'public.lingxi_prepare_pass_burn_file_v1(uuid,uuid,uuid,uuid,text,text,integer,text,integer,integer,text,jsonb)','EXECUTE')
 then raise exception 'UNAUTHORIZED_BURN_FILE_RPC_EXECUTION';end if;
end $$;
rollback;
