import fs from "node:fs";
import path from "node:path";

const root=process.cwd();
const read=(p)=>fs.readFileSync(path.join(root,p),"utf8");
const exists=(p)=>fs.existsSync(path.join(root,p));

const migrations=fs.readdirSync(path.join(root,"supabase","migrations"));
const one=(suffix)=>{
  const hits=migrations.filter((name)=>name.endsWith(suffix));
  if(hits.length!==1)throw new Error(`Expected exactly one ${suffix}, found ${hits.length}`);
  return path.join("supabase","migrations",hits[0]).replaceAll("\\","/");
};

const rpc=one("_sasi_project_rpc_least_privilege_v14106.sql");
const core=one("_core_wallet_payment_rls_hardening_v14111.sql");
const perf=one("_db_performance_closure_v14113.sql");

const assertions=[
  [rpc,"revoke execute on function public.create_sasi_project","legacy SASI direct RPC revoke"],
  [rpc,"create_sasi_project_service","server-only SASI creation RPC"],
  [core,"revoke all on table public.ai_wallets from anon","AI wallet least privilege"],
  [core,"using ((select auth.uid()) = user_id)","core RLS initplan optimization"],
  [perf,"ai_referral_rewards_inviter_user_id_idx","FK index set"],
  [perf,"wechat_mini_sessions_openid_idx","FK index set completion"],
  [perf,"alter policy","remaining RLS policy optimization"],
  ["lib/ai/billed-text.ts","AI_SETTLEMENT_FAILED","AI settlement fail closed"],
  ["components/KnowledgeWorkspace.tsx",'copyAll:c("复制全部"',"copy-all UX"],
  ["components/KnowledgeWorkspace.tsx",'document.execCommand("copy")',"clipboard fallback"],
  ["app/account/orders/page.tsx","付费任务中心","paid task center"],
  ["components/WechatPayModal.tsx",'zh="支付完成" en="Payment complete"',"plain payment language"],
  ["components/tools/ToolsHubV11.tsx","本地处理 · 文件不上传","tool local processing disclosure"],
  ["components/tools/ToolsHubV11.tsx","云端处理 · 文件/数据需发送处理","tool cloud processing disclosure"],
  ["lib/ai/provider-router.ts","providerCapabilities","provider capability matrix"],
];

for(const [file,needle,label] of assertions){
  if(!exists(file))throw new Error(`Missing ${file}`);
  if(!read(file).includes(needle))throw new Error(`FAIL ${label}: ${file}`);
  console.log(`PASS ${label}`);
}

const forbidden=["一次能量交换","能量交换完成","每一次能量交换"];
for(const base of ["app","components"]){
  const walk=(dir)=>{
    for(const entry of fs.readdirSync(path.join(root,dir),{withFileTypes:true})){
      const rel=path.join(dir,entry.name);
      if(entry.isDirectory())walk(rel);
      else if(/\.(tsx?|jsx?)$/.test(entry.name)){
        const body=read(rel);
        for(const term of forbidden){
          if(body.includes(term))throw new Error(`FORBIDDEN_COPY ${term} in ${rel}`);
        }
      }
    }
  };
  walk(base);
}

console.log("FORBIDDEN_COPY=PASS");
console.log("V14.10.16 ACCEPTANCE=PASS");
console.log(`MIGRATION ${rpc}`);
console.log(`MIGRATION ${core}`);
console.log(`MIGRATION ${perf}`);