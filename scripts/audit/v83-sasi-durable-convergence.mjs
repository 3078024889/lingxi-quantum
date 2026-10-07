import fs from"node:fs";
const read=p=>fs.readFileSync(p,"utf8");
const one=read("components/SasiOneSurface.tsx");
const toolbar=read("components/SasiTaskToolbar.tsx");
const launcher=read("components/SasiUnifiedLauncher.tsx");
const local=read("lib/sasi/browser/local-text.ts");
const user=read("lib/sasi/browser/user-resource-text.ts");
const retry=read("lib/sasi/gateway/retry-policy.ts");
const breaker=read("lib/sasi/gateway/circuit-breaker.ts");
const runStore=read("lib/sasi/durable/run-store.ts");
const stepStore=read("lib/sasi/durable/step-store.ts");
const stepMigration=read("supabase/migrations/20261007122000_sasi_durable_step_fencing_v160.sql");
const jobs=read("lib/sasi/durable/job-queue.ts");
const workerVersion=read("lib/sasi/durable/worker-version.ts");
const invariants=read("lib/sasi/durable/release-invariants.ts");
const page=read("app/page.tsx");
const checks=[
 ["V83_ONE_SASI_FRONT_DOOR",!one.includes("SasiTaskNavigation")&&one.includes("inferUnifiedSasiIntent")],
 ["V83_NO_VISIBLE_TASK_TABS",toolbar.includes("return null")&&!toolbar.includes("data-sasi-task-toolbar")],
 ["V83_SKILLS_PRESERVED_AS_CAPABILITY",launcher.includes("SasiSkillPicker")&&launcher.includes("selectedSkills")&&launcher.includes("skillIds")],
 ["V83_LOCAL_EXPLICIT_OPTIN",local.includes("browserLocalTextEnabled")&&local.includes("LOCAL_ENABLED_KEY")],
 ["V83_USER_RESOURCE_NO_GLOBAL_SIGNOUT",!user.includes(".signOut")&&!user.includes("gpt-")],
 ["V83_GATEWAY_UNSAFE_REPLAY_BLOCKED",retry.includes("UNSAFE_REPLAY")],
 ["V83_CIRCUIT_HALF_OPEN_SINGLE_PROBE",breaker.includes("halfOpenProbe")],
 ["V83_EXISTING_DURABLE_RUN_AUTHORITY",runStore.includes("begin_sasi_durable_run_v110")&&runStore.includes("checkpoint_sasi_durable_run_v110")&&runStore.includes("sasi_durable_run_events")],
 ["V83_DURABLE_STEP_FENCING",stepStore.includes("claim_sasi_durable_step_v160")&&stepStore.includes("renew_sasi_durable_step_lease_v160")&&stepStore.includes("DurableStepFenceLostError")&&stepMigration.includes("fence_token")&&stepMigration.includes("STEP_FENCE_LOST")],
 ["V83_SCHEMA_ROLLOUT_COMPAT",stepStore.includes("PGRST202")&&stepStore.includes("claim_sasi_durable_step_v140")&&invariants.includes("schemaExpandMigrateContractRequired")],
 ["V83_POSTGREST_AWAIT_ONLY",!stepStore.includes("}).catch(")&&invariants.includes("postgrestBuilderAwaitOnly")],
 ["V83_EXISTING_DURABLE_JOB_AUTHORITY",jobs.includes("claim_sasi_durable_job_v150")&&jobs.includes("renew_sasi_durable_job_lease_v150")&&jobs.includes("complete_sasi_durable_job_v150")&&jobs.includes("fail_sasi_durable_job_v150")],
 ["V83_WORKFLOW_VERSION_COMPAT",workerVersion.includes("workerSupports")&&invariants.includes("workflowVersionCompatibilityRequired")],
 ["V83_MATURE_DURABILITY_INVARIANTS",["resumeAfterColdRestartTest","streamReconnectReplayRequired","providerExactlyOnceNotAssumed","detachedWorkerLeaseRequired","durableStepFencingRequired","staleWorkerCompletionRejected","queuePriorityMustAge"].every(x=>invariants.includes(x))],
 ["V83_NO_PARALLEL_PRODUCTION_KERNEL",!fs.existsSync("lib/sasi/core/production-kernel.ts")],
 ["V83_HOME_STRUCTURED_APPLICATION",page.includes('"@type":"SoftwareApplication"')&&page.includes("100+免费在线实用工具")]
];
let failed=false;
for(const [name,pass]of checks){console.log(name+"="+(pass?"PASS":"FAIL"));if(!pass)failed=true}
if(failed)process.exit(1);
