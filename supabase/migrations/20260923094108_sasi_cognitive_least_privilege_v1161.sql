-- SASI cognitive/runtime least-privilege hardening — V11.61
-- Complete chain: includes V10.20 and V10.21 tables omitted by V11.60 manifest.
-- Does not alter legacy sasi_projects or existing tool-table privileges.

begin;

do $$
declare
  t text;
  server_only text[] := array[
    'sasi_learning_strategies',
    'sasi_eval_runs',
    'sasi_model_profiles',
    'sasi_code_proposals',
    'sasi_knowledge_units',
    'sasi_active_learning_queue',
    'sasi_knowledge_conflicts',
    'sasi_knowledge_candidates',
    'sasi_teacher_profiles',
    'sasi_teacher_reviews',
    'sasi_model_observations',
    'sasi_procedural_memory',
    'sasi_failure_attributions_v2',
    'sasi_improvement_hypotheses',
    'sasi_evolution_cycles',
    'sasi_evolution_promotion_records',
    'sasi_code_authoring_runs',
    'sasi_benchmark_suites',
    'sasi_candidate_evaluations',
    'sasi_candidate_competitions',
    'sasi_promotion_snapshots',
    'sasi_post_promotion_observations',
    'sasi_rollback_plans'
  ];
  owner_read text[] := array[
    'sasi_memory_records',
    'sasi_failure_events',
    'sasi_ingestion_sources',
    'sasi_learning_runs',
    'sasi_episodic_memory',
    'sasi_external_work_queue',
    'sasi_runtime_learning_events',
    'sasi_user_learning_feedback'
  ];
begin
  foreach t in array server_only loop
    if to_regclass('public.' || t) is null then
      raise exception 'V1161_MISSING_TABLE:%', t;
    end if;

    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on table public.%I from anon', t);
    execute format('revoke all on table public.%I from authenticated', t);
    execute format('grant select, insert, update, delete on table public.%I to service_role', t);
  end loop;

  foreach t in array owner_read loop
    if to_regclass('public.' || t) is null then
      raise exception 'V1161_MISSING_TABLE:%', t;
    end if;

    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on table public.%I from anon', t);
    execute format('revoke insert, update, delete on table public.%I from authenticated', t);
    execute format('grant select on table public.%I to authenticated', t);
    execute format('grant select, insert, update, delete on table public.%I to service_role', t);
  end loop;
end
$$;

do $$
begin
  if to_regclass('public.sasi_model_observations_id_seq') is not null then
    revoke all on sequence public.sasi_model_observations_id_seq from anon;
    revoke all on sequence public.sasi_model_observations_id_seq from authenticated;
    grant usage, select, update on sequence public.sasi_model_observations_id_seq to service_role;
  end if;

  if to_regclass('public.sasi_post_promotion_observations_id_seq') is not null then
    revoke all on sequence public.sasi_post_promotion_observations_id_seq from anon;
    revoke all on sequence public.sasi_post_promotion_observations_id_seq from authenticated;
    grant usage, select, update on sequence public.sasi_post_promotion_observations_id_seq to service_role;
  end if;

  if to_regclass('public.sasi_user_learning_feedback_id_seq') is not null then
    revoke all on sequence public.sasi_user_learning_feedback_id_seq from anon;
    revoke all on sequence public.sasi_user_learning_feedback_id_seq from authenticated;
    grant usage, select, update on sequence public.sasi_user_learning_feedback_id_seq to service_role;
  end if;
end
$$;

commit;
