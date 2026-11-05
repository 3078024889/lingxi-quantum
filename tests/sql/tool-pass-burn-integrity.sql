begin;
do $$
declare
 a uuid:='11111111-1111-4111-8111-111111111111';
 u uuid:='c1111111-1111-4111-8111-111111111111';
 note uuid:='c2222222-2222-4222-8222-222222222222';
 new_note uuid:='c3333333-3333-4333-8333-333333333333';
 fingerprint text:=repeat('a',64);
 v jsonb;
begin
 v:=public.lingxi_claim_tool_use(u,a,repeat('d',64),'burn-after-read',1);
 if v->>'ok'<>'true' then raise exception 'CLAIM_FAILED %',v;end if;
 v:=public.lingxi_create_pass_burn_note(note,a,u,fingerprint,repeat('x',40),repeat('z',20),1440,'once',1,null);
 if v->>'state'<>'ready' then raise exception 'CREATE_FAILED %',v;end if;
 v:=public.lingxi_create_pass_burn_note(note,a,u,fingerprint,repeat('x',40),repeat('z',20),1440,'once',1,null);
 if v->>'state'<>'ready' then raise exception 'RETRY_FAILED %',v;end if;
 begin
  perform public.lingxi_create_pass_burn_note(new_note,a,u,fingerprint,repeat('x',40),repeat('z',20),1440,'once',1,null);
  raise exception 'ONE_RECEIPT_CREATED_TWO_NOTES';
 exception when others then
  if sqlerrm='ONE_RECEIPT_CREATED_TWO_NOTES' then raise;end if;
 end;
 begin
  perform public.lingxi_create_pass_burn_note(note,a,u,repeat('b',64),repeat('x',40),repeat('z',20),1440,'once',1,null);
  raise exception 'NOTE_FINGERPRINT_REBIND_ALLOWED';
 exception when others then
  if sqlerrm='NOTE_FINGERPRINT_REBIND_ALLOWED' then raise;end if;
 end;
end $$;
rollback;
