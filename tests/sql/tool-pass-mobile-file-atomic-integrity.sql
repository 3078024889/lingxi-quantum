-- Transactionally verifies mobile R2 handoff with exactly one charged tool start.
-- Every fixture write is rolled back; production DB must NOT run this test.
begin;
do $$
declare
 a uuid:='11111111-1111-4111-8111-111111111111';
 b uuid:='22222222-2222-4222-8222-222222222222';
 req uuid:='33333333-3333-4333-8333-333333333333';
 op uuid:='44444444-4444-4444-8444-444444444444';
 mobile_op uuid:='55555555-5555-4555-8555-555555555555';
 key text:='burn/tool-11111111-1111-4111-8111-111111111111/a-file.pdf';
 result jsonb;
begin
 result:=public.lingxi_claim_tool_use(req,a,repeat('a',64),'pdf-editor',1);
 if result->>'accessKind'<>'daily_free' then raise exception 'MOBILE_CLAIM_FAILED %',result;end if;
 -- Original processing stage may have already bound a different task ID.
 result:=public.lingxi_redeem_tool_stage(req,a,'pdf-editor',op,'document-normalize');
 if result->>'ok'<>'true' then raise exception 'ORIGINAL_STAGE_FAILED %',result;end if;
 result:=public.lingxi_prepare_pass_mobile_file_v1(
  a,req,mobile_op,'pdf-editor','receipt.pdf','application/pdf',1024,key
 );
 if result->>'ok'<>'true' or result->>'recovered'<>'false'
 then raise exception 'MOBILE_FIRST_PREPARE_FAILED %',result;end if;
 if result->>'objectKey'<>key then raise exception 'MOBILE_KEY_MISMATCH';end if;
 -- Retry must recover the same object rather than create a second row or charge.
 result:=public.lingxi_prepare_pass_mobile_file_v1(
  a,req,mobile_op,'pdf-editor','receipt.pdf','application/pdf',1024,
  'burn/tool-11111111-1111-4111-8111-111111111111/other-file.pdf'
 );
 if result->>'ok'<>'true' or result->>'recovered'<>'true' or result->>'objectKey'<>key
 then raise exception 'MOBILE_RETRY_NOT_IDEMPOTENT %',result;end if;
 if (select count(*) from public.tool_temp_files where access_request_id=req)<>1
 then raise exception 'MOBILE_FILE_DUPLICATED';end if;
 if (select count(*) from public.lingxi_tool_execution_stages
    where request_id=req and stage='mobile-file')<>1
 then raise exception 'MOBILE_STAGE_DUPLICATED';end if;
 result:=public.lingxi_prepare_pass_mobile_file_v1(
  b,req,mobile_op,'pdf-editor','receipt.pdf','application/pdf',1024,
  'burn/tool-22222222-2222-4222-8222-222222222222/other-file.pdf'
 );
 if result->>'error'<>'MOBILE_FILE_IDEMPOTENCY_CONFLICT'
 then raise exception 'MOBILE_CROSS_USER_RETRY_LEAK %',result;end if;
 result:=public.lingxi_prepare_pass_mobile_file_v1(
  a,req,'66666666-6666-4666-8666-666666666666','pdf-editor',
  'receipt.pdf','application/pdf',1024,key
 );
 if result->>'error'<>'MOBILE_FILE_IDEMPOTENCY_CONFLICT'
 then raise exception 'MOBILE_OP_REBIND_ALLOWED %',result;end if;
 result:=public.lingxi_prepare_pass_mobile_file_v1(
  a,req,mobile_op,'document-translate','receipt.pdf','application/pdf',1024,key
 );
 if result->>'error'<>'MOBILE_FILE_IDEMPOTENCY_CONFLICT'
 then raise exception 'MOBILE_TOOL_REBIND_ALLOWED %',result;end if;
 update public.tool_temp_files set expires_at=now()-interval '1 minute'
  where access_request_id=req;
 result:=public.lingxi_prepare_pass_mobile_file_v1(
  a,req,mobile_op,'pdf-editor','receipt.pdf','application/pdf',1024,key
 );
 if result->>'error'<>'MOBILE_FILE_EXPIRED'
 then raise exception 'EXPIRED_FILE_REISSUED %',result;end if;
 -- A nonexistent receipt cannot mint a signed private upload.
 result:=public.lingxi_prepare_pass_mobile_file_v1(
  a,'77777777-7777-4777-8777-777777777777',mobile_op,'pdf-editor',
  'receipt.pdf','application/pdf',1024,key
 );
 if result->>'ok'='true' then raise exception 'UNCREDITED_R2_SESSION_CREATED';end if;
 result:=public.lingxi_prepare_pass_mobile_file_v1(
  a,'88888888-8888-4888-8888-888888888888',mobile_op,'pdf-editor',
  'receipt.pdf','application/pdf',1024,'burn/tool-22222222-2222-4222-8222-222222222222/evil'
 );
 if result->>'error'<>'INVALID_MOBILE_FILE_INPUT'
 then raise exception 'CROSS_PREFIX_KEY_ALLOWED';end if;
end $$;
do $$
begin
 if has_function_privilege('anon',
   'public.lingxi_prepare_pass_mobile_file_v1(uuid,uuid,uuid,text,text,text,bigint,text)','EXECUTE')
 or has_function_privilege('authenticated',
   'public.lingxi_prepare_pass_mobile_file_v1(uuid,uuid,uuid,text,text,text,bigint,text)','EXECUTE')
 then raise exception 'PUBLIC_MOBILE_RPC_EXECUTE_ALLOWED';end if;
 if has_table_privilege('authenticated','public.tool_temp_files','INSERT')
 then raise exception 'CLIENT_CAN_MINT_R2_ROWS';end if;
end $$;
rollback;
