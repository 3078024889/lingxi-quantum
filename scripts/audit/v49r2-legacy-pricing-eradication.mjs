import fs from 'node:fs';
import path from 'node:path';

const must=(v,m)=>{if(!v)throw new Error(m)};
const roots=['app','components','lib'];
const exts=new Set(['.ts','.tsx','.js','.jsx','.mjs','.cjs']);
const forbidden=[
  'FREE_LOCAL','PAID_EXTERNAL','HYBRID','ChargingClass',
  '/api/sasi/quote','/api/sasi/jobs','/api/ai/wallet',
  'weekly_quota','extra_week','managed_ai','周额度','额外周'
];
const ignored=[];
function walk(dir,out=[]){
  if(!fs.existsSync(dir))return out;
  for(const e of fs.readdirSync(dir,{withFileTypes:true})){
    const p=path.join(dir,e.name);
    if(e.isDirectory())walk(p,out); else if(exts.has(path.extname(e.name)))out.push(p);
  }
  return out;
}
const files=roots.flatMap(r=>walk(r));
for(const f of files){
  const s=fs.readFileSync(f,'utf8');
  if(/billingClass\s*:\s*["']free-local["']/.test(s))ignored.push(f+':legacy free-local billing class');
  for(const term of forbidden){
    if(s.includes(term))ignored.push(`${f}:${term}`);
  }
}
must(ignored.length===0,`V49R2_ACTIVE_LEGACY_PRICING_RESIDUE:${ignored.join(',')}`);

for(const p of [
  'components/AiWalletPanel.tsx','components/SasiManagedVideoCreate.tsx',
  'app/api/ai/wallet/route.ts','app/api/sasi/quote/route.ts','app/api/sasi/jobs/route.ts',
  'app/api/sasi/jobs/[id]/cancel/route.ts','app/api/sasi/jobs/[id]/delivery/route.ts','app/api/sasi/jobs/[id]/refresh/route.ts'
]) must(!fs.existsSync(p),`V49R2_REMOVED_RUNTIME_PATH_REAPPEARED:${p}`);

const policy=fs.readFileSync('lib/pricing/policy.ts','utf8');
for(const v of ['PAID_TOOL','SASI_BALANCE','SUPPLIER_DIRECT_ONLY','DISABLED'])must(policy.includes(v),`V49R2_BILLING_CLASS_MISSING:${v}`);
must(!policy.includes('executionMode==="byok"'), 'V49R2_BYOK_ZERO_PRICE_BRANCH_REMAINS');

const tools=fs.readFileSync('lib/pricing/tool-policy-data.ts','utf8');
for(const p of ['e-sign-pdf','pdf-editor','cross-page-stamp']){
  const line=tools.split('\n').find(x=>x.includes(`"${p}"`))||'';
  must(line.includes('PAID_TOOL'),`V49R2_PDF_NOT_PAID_TOOL:${p}`);
}
for(const p of ['sasi-deep-reason','sasi-image-generate','sasi-video-generate']){
  const line=tools.split('\n').find(x=>x.includes(`"${p}"`))||'';
  must(line.includes('SASI_BALANCE'),`V49R2_SASI_NOT_UNIFIED_BALANCE:${p}`);
}

console.log('V49R2_ACTIVE_LEGACY_PRICING_RESIDUE=0');
console.log('V49R2_PDF_PAID_TOOL=PASS');
console.log('V49R2_SASI_UNIFIED_BALANCE=PASS');
console.log('V49R2_SUPPLIER_DIRECT_SEPARATION=PASS');
console.log('V49R2_LEGACY_PRICING_ERADICATION=PASS');
