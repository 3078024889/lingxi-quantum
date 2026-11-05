begin;
do $$
declare
 a uuid:='11111111-1111-4111-8111-111111111111';
 r uuid:='d1111111-1111-4111-8111-111111111111';
 v jsonb;
begin
 v:=public.lingxi_claim_tool_use(r,a,repeat('c',64),'temp-mail',1);
 if v->>'ok'<>'true' then raise exception 'CLAIM_FAILED';end if;
 v:=public.lingxi_redeem_tool_use(r,a,'temp-mail',r);
 if v->>'ok'<>'true' then raise exception 'REDEEM_FAILED';end if;
 insert into public.temp_mailboxes(local_part,expires_at,owner_user_id,pass_use_request_id)
 values('first',now()+interval '1 hour',a,r);
 begin
  insert into public.temp_mailboxes(local_part,expires_at,owner_user_id,pass_use_request_id)
  values('second',now()+interval '1 hour',a,r);
  raise exception 'MAIL_REPLAY_CREATED_SECOND_BOX';
 exception when unique_violation then null;end;
 if (select count(*) from public.temp_mailboxes where pass_use_request_id=r)<>1
 then raise exception 'MAIL_REPLAY_UNCONSTRAINED';end if;
end $$;
rollback;
