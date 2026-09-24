import fs from "node:fs";
import path from "node:path";

const root=process.cwd();
const assert=(ok,label)=>{if(!ok)throw new Error(`FAIL ${label}`);console.log(`PASS ${label}`)};
const migrations=fs.readdirSync(path.join(root,"supabase","migrations"));

const one=(suffix)=>{
  const hits=migrations.filter(name=>name.endsWith(suffix));
  assert(hits.length===1,`${suffix} exactly one`);
  return hits[0];
};

const rpc=one("_sasi_project_rpc_least_privilege_v14106.sql");
const core=one("_core_wallet_payment_rls_hardening_v14111.sql");
const perf=one("_db_performance_closure_v14113.sql");

assert(rpc<core && core<perf,"migration timestamp order");

const r=fs.readFileSync(path.join(root,"supabase","migrations",rpc),"utf8");
assert(r.includes("create_sasi_project_service"),"service RPC exists");
assert(r.includes("revoke execute on function public.create_sasi_project("),"legacy RPC revoked");
assert(r.includes("grant execute on function public.create_sasi_project_service"),"service RPC service grant");
assert(r.includes("rate_limit_check('sasi-project:'"),"DB project rate guard");

const c=fs.readFileSync(path.join(root,"supabase","migrations",core),"utf8");
for(const table of [
  "orders","tool_payment_quotes","tool_export_grants","tool_paid_jobs",
  "ai_wallets","ai_wallet_ledger","ai_requests","sasi_wallets"
]){
  assert(c.includes(`revoke all on table public.${table} from anon, authenticated;`),`${table} browser grants revoked`);
  assert(c.includes(`grant select on table public.${table} to authenticated;`),`${table} authenticated SELECT restored`);
}
assert(!c.includes("revoke insert, update, delete on table public.orders from authenticated"),"old partial revoke removed");

const p=fs.readFileSync(path.join(root,"supabase","migrations",perf),"utf8");
const expectedIndexes=[
"ai_referral_rewards_inviter_user_id_idx",
"ai_referral_rewards_referred_user_id_idx",
"ai_refund_requests_order_id_idx",
"ai_topup_reversals_user_id_idx",
"cangxuan_characters_project_id_idx",
"cangxuan_continuity_events_user_id_idx",
"cangxuan_knowledge_items_source_id_idx",
"field_questions_user_id_idx",
"practice_journal_entries_user_id_idx",
"reality_entries_user_id_idx",
"sasi_assets_user_id_idx",
"sasi_byok_video_tasks_project_id_idx",
"sasi_deliveries_project_id_idx",
"sasi_jobs_node_id_idx",
"sasi_jobs_project_id_idx",
"sasi_node_dependencies_downstream_node_id_idx",
"sasi_nodes_user_id_idx",
"tool_events_user_id_idx",
"tool_export_grants_user_id_idx",
"tool_payment_quotes_tool_id_idx",
"tool_usage_ledger_order_id_idx",
"tool_usage_ledger_user_id_idx",
"wechat_mini_payment_events_order_id_idx",
"wechat_mini_sessions_openid_idx",
];
for(const name of expectedIndexes)assert(p.includes(name),`${name} present`);
assert(p.includes("replace(p.qual, 'auth.uid()', '(select auth.uid())')"),"RLS initplan rewrite");
assert(p.includes("replace(p.with_check, 'auth.uid()', '(select auth.uid())')"),"RLS with-check rewrite");

const forbidden=["一次能量交换","能量交换完成","每一次能量交换"];
const scanRoots=["app","components","lib"];
for(const dir of scanRoots){
  const walk=(d)=>{
    for(const entry of fs.readdirSync(d,{withFileTypes:true})){
      const p=path.join(d,entry.name);
      if(entry.isDirectory())walk(p);
      else if(/\.(ts|tsx|js|jsx|mjs|cjs|md)$/.test(entry.name)){
        const body=fs.readFileSync(p,"utf8");
        for(const word of forbidden)assert(!body.includes(word),`banned copy absent ${word} @ ${p}`);
      }
    }
  };
  if(fs.existsSync(dir))walk(dir);
}

const secrets=[
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----[\r\n]+(?:[A-Za-z0-9+/=]{20,}[\r\n]+){2,}[\s\S]*?-----END (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /\bghp_[A-Za-z0-9]{30,}\b/,
  /\bsk-[A-Za-z0-9_-]{24,}\b/,
  /\bsb_secret_[A-Za-z0-9_-]{20,}\b/,
];
for(const dir of scanRoots){
  const walk=(d)=>{
    for(const entry of fs.readdirSync(d,{withFileTypes:true})){
      const p=path.join(d,entry.name);
      if(entry.isDirectory())walk(p);
      else if(/\.(ts|tsx|js|jsx|mjs|cjs|json|md)$/.test(entry.name)){
        const body=fs.readFileSync(p,"utf8");
        for(const re of secrets)assert(!re.test(body),`no embedded secret pattern @ ${p}`);
      }
    }
  };
  if(fs.existsSync(dir))walk(dir);
}

console.log("V14.10.82 RELEASE PREFLIGHT ACCEPTANCE=PASS");
