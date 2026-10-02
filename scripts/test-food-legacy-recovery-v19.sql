begin;
do $$
declare q record;r uuid;s uuid;g numeric;meal jsonb:='{"items":[],"total":{"kcal":123},"sources":[]}';m text;tested integer:=0;
begin
 for q in select p.* from public.tool_payment_quotes p join public.tool_export_grants e on e.quote_id=p.id where p.tool_id='food-calorie' and p.status='paid' and p.created_at<'2026-10-01 23:40:14+00' and e.consumed_quantity=0 and not exists(select 1 from public.food_calorie_paid_consumptions_v16 where quote_id=p.id) and not exists(select 1 from public.food_calorie_paid_consumptions_v18 where quote_id=p.id) loop
  r:=gen_random_uuid();s:=null;m:=case when q.metadata->>'mode' in ('name-weight','manual','custom') then 'custom' else 'image' end;
  if m='image' then
   s:=gen_random_uuid();insert into public.food_calorie_image_sessions_v18(id,account_id,ip_hash,image_hashes,photo_count) values(s,q.user_id,repeat('e',64),jsonb_build_array(repeat('a',64)),1);
  end if;
  insert into public.food_analysis_requests_v19(id,account_id,ip_hash,mode,quantity,free_eligible,image_session_id,input_digest,result) values(r,q.user_id,repeat('e',64),m,1,true,s,repeat('a',64),meal);
  if public.consume_legacy_food_analysis_v19(r,q.user_id,repeat('e',64),q.id)<>meal then raise exception 'legacy result failed';end if;
  if public.consume_legacy_food_analysis_v19(r,q.user_id,repeat('e',64),q.id)<>meal then raise exception 'legacy replay failed';end if;
  select consumed_quantity into g from public.tool_export_grants where quote_id=q.id;
  if g<>q.quantity then raise exception 'legacy grant not consumed exactly once';end if;
  begin perform public.consume_legacy_food_analysis_v19(r,gen_random_uuid(),repeat('e',64),q.id);raise exception 'legacy owner bypass';exception when others then if sqlerrm<>'REQUEST_NOT_FOUND' then raise;end if;end;
  tested:=tested+1;
 end loop;
 if tested<1 then raise exception 'no eligible historical fixture';end if;
end $$;
rollback;
select 'PASS legacy paid custom/image recovery, ownership and replay; all changes rolled back, real grants remain unused' as result;
