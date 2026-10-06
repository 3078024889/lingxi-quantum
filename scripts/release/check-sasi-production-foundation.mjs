// Metadata-only checks: limit=0 returns no user records or stored credentials.
const origin=process.env.NEXT_PUBLIC_SUPABASE_URL;
const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
if(!origin||!key)throw new Error('Production database configuration is required; no checks were run.');
const base=new URL(origin);
if(base.protocol!=='https:'||base.username||base.password)throw new Error('Invalid database origin.');
const tables={
 sasi_provider_connections:'id,provider,base_url,model_id,enabled,capabilities,discovered_models',
 sasi_byok_text_tasks:'id,state,request,profile_version,estimated_fen,output',
 sasi_experience_daily:'user_id,usage_day,used_units,reserved_units',
 sasi_experience_reservations:'reference_id,user_id,units,state',
 sasi_experience_provider_daily:'provider_id,usage_day,request_count,cooldown_until',
 sasi_experience_session_affinity:'user_id,session_key,provider_id,expires_at',
 sasi_durable_runs:'id,user_id,state,output_json,error_code',
 sasi_durable_run_events:'id,run_id,kind,metadata',
 sasi_ai_trace_spans:'trace_id,span_id,status,attributes',
 sasi_durable_step_results:'run_id,step_id,input_hash,state,lease_until',
 sasi_durable_jobs:'id,run_id,user_id,state,lease_owner,lease_until,payload_json',
 sasi_conversation_threads:'id,user_id,active_mode',
 sasi_conversation_messages:'id,thread_id,user_id,content,state',
 sasi_versioned_artifacts:'id,user_id,kind,title,updated_at',
 sasi_artifact_versions:'id,artifact_id,content_ref,checksum',
 sasi_run_controls:'id,run_id,user_id,action',
};
const failures=[];
for(const [table,columns] of Object.entries(tables)){
 const url=new URL(`/rest/v1/${table}`,base);url.searchParams.set('select',columns);url.searchParams.set('limit','0');
 try{const response=await fetch(url,{method:'HEAD',headers:{apikey:key,Authorization:`Bearer ${key}`},signal:AbortSignal.timeout(10000)});if(!response.ok)failures.push(`${table}: HTTP ${response.status}`);else console.log(`FOUNDATION_TABLE=PASS:${table}`)}
 catch{failures.push(`${table}: unavailable`)}
}
if(failures.length)throw new Error('Production foundation is incomplete: '+failures.join('; '));
console.log('SASI_PRODUCTION_TABLE_FOUNDATION=PASS');
