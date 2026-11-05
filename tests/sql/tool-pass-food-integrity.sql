begin;
do $$
declare
 a uuid:='11111111-1111-4111-8111-111111111111';
 b uuid:='22222222-2222-4222-8222-222222222222';
 use_id uuid:='e1111111-1111-4111-8111-111111111111';
 task_id uuid:='e2222222-2222-4222-8222-222222222222';
 other_task uuid:='e3333333-3333-4333-8333-333333333333';
 v jsonb;
begin
 v:=public.lingxi_claim_tool_use(use_id,a,repeat('b',64),'food-calorie',1);
 if v->>'ok'<>'true' then raise exception 'CLAIM_FAILED %',v;end if;
 insert into public.food_analysis_requests_v19(id,account_id,ip_hash,quantity,mode,free_eligible,input_digest,result)
 values(task_id,a,repeat('b',64),3,'custom',false,'digest','{"kcal":100}'::jsonb);
 v:=public.lingxi_consume_food_pass_v1(task_id,a,use_id);
 if v->>'kcal'<>'100' then raise exception 'CONSUME_FAILED %',v;end if;
 v:=public.lingxi_consume_food_pass_v1(task_id,a,use_id);
 if v->>'kcal'<>'100' then raise exception 'CONSUME_RETRY_FAILED %',v;end if;
 begin
  perform public.lingxi_consume_food_pass_v1(task_id,b,use_id);
  raise exception 'CROSS_ACCOUNT_ALLOWED';
 exception when others then
  if sqlerrm='CROSS_ACCOUNT_ALLOWED' then raise;end if;
 end;
 insert into public.food_analysis_requests_v19(id,account_id,ip_hash,quantity,mode,free_eligible,input_digest,result)
 values(other_task,a,repeat('b',64),1,'custom',true,'other','{"kcal":200}'::jsonb);
 begin
  perform public.lingxi_consume_food_pass_v1(other_task,a,use_id);
  raise exception 'REPLAY_OTHER_TASK_ALLOWED';
 exception when others then
  if sqlerrm='REPLAY_OTHER_TASK_ALLOWED' then raise;end if;
 end;
end $$;
rollback;
