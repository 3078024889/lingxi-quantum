begin;
alter table public.sasi_conversation_threads add column if not exists workspace jsonb not null default '{}'::jsonb;
alter table public.sasi_conversation_threads add constraint sasi_workspace_size_v78 check(octet_length(workspace::text)<=524288);
alter table public.sasi_conversation_messages add column if not exists model_info jsonb;
create or replace function public.save_sasi_chat_turn_v78(p_user_id uuid,p_thread_id uuid,p_request_id uuid,p_question text,p_answer text default null,p_model_info jsonb default null)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare thread_owner uuid; question_row public.sasi_conversation_messages%rowtype; answer_row public.sasi_conversation_messages%rowtype;
begin
 if p_user_id is null or p_thread_id is null or p_request_id is null or p_question is null or length(p_question) not between 1 and 12000 or (p_answer is not null and length(p_answer) not between 1 and 32768) then return jsonb_build_object('ok',false,'error','INVALID_HISTORY');end if;
 insert into public.sasi_conversation_threads(id,user_id,title,active_mode) values(p_thread_id,p_user_id,left(p_question,120),'chat') on conflict(id) do nothing;
 select user_id into thread_owner from public.sasi_conversation_threads where id=p_thread_id for update;
 if thread_owner is distinct from p_user_id then return jsonb_build_object('ok',false,'error','HISTORY_NOT_FOUND');end if;
 select * into question_row from public.sasi_conversation_messages where id=p_request_id;
 if question_row.id is not null and (question_row.user_id<>p_user_id or question_row.thread_id<>p_thread_id or question_row.content<>p_question or question_row.role<>'user') then return jsonb_build_object('ok',false,'error','HISTORY_CONFLICT');end if;
 if question_row.id is null then
  insert into public.sasi_conversation_messages(id,thread_id,user_id,role,mode,state,content) values(p_request_id,p_thread_id,p_user_id,'user','chat','complete',p_question);
 end if;
 select * into answer_row from public.sasi_conversation_messages where thread_id=p_thread_id and user_id=p_user_id and parent_id=p_request_id and role='assistant' order by created_at limit 1;
 if p_answer is not null and answer_row.state='complete' and answer_row.content<>p_answer then return jsonb_build_object('ok',false,'error','HISTORY_CONFLICT');end if;
 if answer_row.id is null then
  insert into public.sasi_conversation_messages(thread_id,user_id,parent_id,role,mode,state,content,model_info) values(p_thread_id,p_user_id,p_request_id,'assistant','chat',case when p_answer is null then 'pending' else 'complete' end,coalesce(p_answer,''),p_model_info);
 elsif p_answer is not null and answer_row.state<>'complete' then
  update public.sasi_conversation_messages set content=p_answer,state='complete',model_info=p_model_info,updated_at=now() where id=answer_row.id;
 end if;
 update public.sasi_conversation_threads set updated_at=now() where id=p_thread_id;
 return jsonb_build_object('ok',true,'threadId',p_thread_id,'requestId',p_request_id);
end $$;
revoke all on function public.save_sasi_chat_turn_v78(uuid,uuid,uuid,text,text,jsonb) from public,anon,authenticated;
grant execute on function public.save_sasi_chat_turn_v78(uuid,uuid,uuid,text,text,jsonb) to service_role;
create or replace function public.finish_sasi_chat_turn_state_v78(p_user_id uuid,p_thread_id uuid,p_request_id uuid,p_state text)
returns boolean language plpgsql security definer set search_path=public,pg_temp as $$
begin
 if p_state not in ('failed','needs-connection') then return false;end if;
 update public.sasi_conversation_messages set state=p_state,updated_at=now()
 where user_id=p_user_id and thread_id=p_thread_id and parent_id=p_request_id and role='assistant' and state in ('pending','streaming');
 return found;
end $$;
revoke all on function public.finish_sasi_chat_turn_state_v78(uuid,uuid,uuid,text) from public,anon,authenticated;
grant execute on function public.finish_sasi_chat_turn_state_v78(uuid,uuid,uuid,text) to service_role;
commit;
