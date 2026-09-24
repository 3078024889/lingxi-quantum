-- LINGXIFIELD V14.10.6
-- SASI project creation: remove direct authenticated SECURITY DEFINER execution.
-- Browser -> Next.js authenticated route -> service_role-only RPC.
-- The database function remains independently defensive: identity, payload, idempotency,
-- rate limit, stage validation and ownership are enforced server-side.

begin;

create or replace function public.create_sasi_project_service(
  p_user_id uuid,
  p_request_id uuid,
  p_kind text,
  p_title text,
  p_language text,
  p_input jsonb,
  p_stages text[]
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_project_id uuid;
  v_node_id uuid;
  v_previous_node_id uuid;
  v_stage text;
  v_position integer := 0;
  v_created boolean := false;
  v_existing_kind text;
  v_existing_title text;
  v_existing_language text;
begin
  if p_user_id is null or not exists(select 1 from auth.users where id=p_user_id) then
    return jsonb_build_object('ok',false,'error','invalid_identity');
  end if;
  if p_request_id is null then
    return jsonb_build_object('ok',false,'error','request_id_required');
  end if;
  if p_kind not in ('build','drama') then
    return jsonb_build_object('ok',false,'error','invalid_project_kind');
  end if;
  if p_language not in ('zh','en') then
    return jsonb_build_object('ok',false,'error','invalid_language');
  end if;
  if p_title is null or char_length(trim(p_title)) < 1 or char_length(p_title) > 72 then
    return jsonb_build_object('ok',false,'error','invalid_project_title');
  end if;
  if coalesce(array_length(p_stages,1),0) < 1 or array_length(p_stages,1) > 20 then
    return jsonb_build_object('ok',false,'error','invalid_project_stages');
  end if;
  if pg_column_size(coalesce(p_input,'{}'::jsonb)) > 262144 then
    return jsonb_build_object('ok',false,'error','project_input_too_large');
  end if;
  if exists(select 1 from unnest(p_stages) s where s !~ '^[a-z][a-z0-9-]{1,48}$') then
    return jsonb_build_object('ok',false,'error','invalid_stage');
  end if;
  if (select count(distinct s) from unnest(p_stages) s) <> array_length(p_stages,1) then
    return jsonb_build_object('ok',false,'error','duplicate_stage');
  end if;

  -- Idempotent retries do not consume the abuse-control budget.
  select id,kind,title,language into v_project_id,v_existing_kind,v_existing_title,v_existing_language
  from public.sasi_projects
  where user_id=p_user_id and request_id=p_request_id;

  if found then
    if v_existing_kind<>p_kind or v_existing_title<>trim(p_title) or v_existing_language<>p_language then
      return jsonb_build_object('ok',false,'error','idempotency_conflict');
    end if;
    select count(*)::integer into v_position
    from public.sasi_nodes
    where project_id=v_project_id and user_id=p_user_id;
    return jsonb_build_object(
      'ok',true,
      'id',v_project_id,
      'kind',v_existing_kind,
      'title',v_existing_title,
      'language',v_existing_language,
      'currentVersion',1,
      'nodeCount',v_position,
      'status','prepared',
      'created',false
    );
  end if;

  if not public.rate_limit_check('sasi-project:'||p_user_id::text,20,3600) then
    return jsonb_build_object('ok',false,'error','project_rate_limited');
  end if;

  insert into public.sasi_projects(user_id,request_id,kind,title,language)
  values(p_user_id,p_request_id,p_kind,trim(p_title),p_language)
  returning id into v_project_id;
  v_created:=true;

  foreach v_stage in array p_stages loop
    v_position:=v_position+1;
    insert into public.sasi_nodes(project_id,user_id,node_type,status,input)
    values(
      v_project_id,
      p_user_id,
      v_stage,
      case when v_position=1 then 'ready' else 'draft' end,
      case when v_position=1 then coalesce(p_input,'{}'::jsonb) else jsonb_build_object('position',v_position) end
    )
    returning id into v_node_id;

    if v_previous_node_id is not null then
      insert into public.sasi_node_dependencies(upstream_node_id,downstream_node_id)
      values(v_previous_node_id,v_node_id);
    end if;
    v_previous_node_id:=v_node_id;
  end loop;

  return jsonb_build_object(
    'ok',true,
    'id',v_project_id,
    'kind',p_kind,
    'title',trim(p_title),
    'language',p_language,
    'currentVersion',1,
    'nodeCount',v_position,
    'status','prepared',
    'created',v_created
  );
end
$$;

revoke execute on function public.create_sasi_project_service(uuid,uuid,text,text,text,jsonb,text[])
  from public, anon, authenticated;
grant execute on function public.create_sasi_project_service(uuid,uuid,text,text,text,jsonb,text[])
  to service_role;

-- Retain the legacy function for rollback/history compatibility but close the
-- authenticated direct-RPC path that bypassed the Next.js security boundary.
revoke execute on function public.create_sasi_project(uuid,text,text,text,jsonb,text[])
  from public, anon, authenticated;
grant execute on function public.create_sasi_project(uuid,text,text,text,jsonb,text[])
  to service_role;

comment on function public.create_sasi_project_service(uuid,uuid,text,text,text,jsonb,text[])
is 'Server-only SASI project creation boundary. Called after Next.js authentication/origin validation; enforces DB-side identity, idempotency, rate limit and payload constraints.';

commit;