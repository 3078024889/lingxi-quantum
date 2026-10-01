-- Transactional contract tests. No payment provider is called and all rows roll back.
begin;
do $$
declare u uuid; r uuid:=gen_random_uuid(); r2 uuid:=gen_random_uuid(); q uuid:=gen_random_uuid();
 ip text:=encode(sha256(random()::text::bytea),'hex'); meal jsonb:='{"items":[],"total":{"kcal":123},"sources":[]}'; s uuid:=gen_random_uuid();
begin
 select id into u from auth.users limit 1;
 if u is null then raise exception 'test requires an existing FK user'; end if;
 insert into public.food_analysis_requests_v19(id,ip_hash,mode,quantity,free_eligible,input_digest,result) values(r,ip,'custom',3,true,repeat('a',64),meal);
 if public.consume_food_analysis_v19(r,null,ip,null)<>meal then raise exception 'free result mismatch'; end if;
 if public.consume_food_analysis_v19(r,null,ip,null)<>meal then raise exception 'replay mismatch'; end if;
 if (select count(*) from public.food_calorie_daily_free_usage where ip_hash=ip)<>1 then raise exception 'free quota double-consumed'; end if;
 begin perform public.consume_food_analysis_v19(r,null,repeat('b',64),null);raise exception 'owner check missing';exception when others then if sqlerrm<>'REQUEST_NOT_FOUND' then raise;end if;end;
 insert into public.food_analysis_requests_v19(id,ip_hash,mode,quantity,free_eligible,input_digest,result) values(r2,ip,'custom',1,true,repeat('a',64),meal);
 begin perform public.consume_food_analysis_v19(r2,null,ip,null);raise exception 'quota check missing';exception when others then if sqlerrm<>'FREE_ALREADY_USED' then raise;end if;end;
 if (select consumed_at from public.food_analysis_requests_v19 where id=r2) is not null then raise exception 'failure consumed request';end if;
 update public.food_analysis_requests_v19 set account_id=u,quantity=2 where id=r2;
 begin
 insert into public.tool_payment_quotes(id,user_id,tool_id,billing_type,quantity,unit_name,amount_rmb,amount_usd,currency,status,metadata) values(q,u,'food-calorie','per_image',1,'food',2,2,'USD','paid',jsonb_build_object('foodRequestId',r2));
 raise exception 'quote quantity binding missing';exception when others then if sqlerrm<>'FOOD_QUOTE_INVALID' then raise;end if;end;
 insert into public.tool_payment_quotes(id,user_id,tool_id,billing_type,quantity,unit_name,amount_rmb,amount_usd,currency,status,metadata) values(q,u,'food-calorie','per_image',2,'food',4,4,'USD','paid',jsonb_build_object('foodRequestId',r2));
 if public.consume_food_analysis_v19(r2,u,ip,q)<>meal then raise exception 'paid result mismatch';end if;
 if public.consume_food_analysis_v19(r2,u,ip,q)<>meal then raise exception 'paid replay mismatch';end if;
 begin perform public.consume_food_analysis_v19(r2,u,ip,gen_random_uuid());raise exception 'quote replay binding missing';exception when others then if sqlerrm<>'QUOTE_BINDING_MISMATCH' then raise;end if;end;
 if has_table_privilege('anon','public.food_analysis_requests_v19','SELECT') or has_function_privilege('authenticated','public.consume_food_analysis_v19(uuid,uuid,text,uuid)','EXECUTE') then raise exception 'private results exposed'; end if;
 r:=gen_random_uuid();q:=gen_random_uuid();
 insert into public.food_calorie_image_sessions_v18(id,account_id,ip_hash,image_hashes,photo_count) values(s,u,ip,jsonb_build_array(repeat('a',64),repeat('b',64)),2);
 insert into public.food_analysis_requests_v19(id,account_id,ip_hash,mode,quantity,free_eligible,image_session_id,input_digest,result) values(r,u,ip,'image',2,false,s,repeat('a',64),meal);
 begin perform public.consume_food_analysis_v19(r,u,ip,null);raise exception 'batch free bypass';exception when others then if sqlerrm<>'PAYMENT_REQUIRED' then raise;end if;end;
 insert into public.tool_payment_quotes(id,user_id,tool_id,billing_type,quantity,unit_name,amount_rmb,amount_usd,currency,status,metadata) values(q,u,'food-calorie','per_image',2,'image',4,4,'CNY','paid',jsonb_build_object('foodRequestId',r));
 if public.consume_food_analysis_v19(r,u,ip,q)<>meal then raise exception 'CNY batch failed';end if;
 begin
 insert into public.tool_payment_quotes(user_id,tool_id,billing_type,quantity,unit_name,amount_rmb,amount_usd,currency,status,metadata) values(u,'food-calorie','per_image',2,'image',4,4,'CNY','quoted',jsonb_build_object('foodRequestId',r));
 raise exception 'charged delivered request';exception when others then if sqlerrm<>'FOOD_QUOTE_INVALID' then raise;end if;end;
end $$;
rollback;
select 'PASS free quota, replay, ownership, paid quantity binding, CNY batch / USD custom results, failure rollback, private grants; no test rows retained' as result;
