import fs from "node:fs";

const retired=[
  'components/AiWalletPanel.tsx',
  'components/SasiManagedVideoCreate.tsx',
  'app/api/ai/wallet/route.ts',
  'app/api/sasi/quote',
  'app/api/sasi/jobs',
  'lib/lingxi/monetization.ts',
  'docs/SASI-INVITATION-RESET-RULE.md',
  'docs/SASI-V51-COMPLETION-2026-09-28.md',
  'V1601_IMPLEMENTATION_CONTRACT.md',
  'scripts/accept-v101.mjs',
  'scripts/accept-v14122.mjs',
  'scripts/accept-v14510.mjs',
  'scripts/accept-v1462.mjs',
  'scripts/accept-v1464.mjs',
  'scripts/accept-v1465.mjs',
  'scripts/audit-currency-books-v1569.mjs',
  'scripts/audit-payment-v1600.mjs',
  'scripts/audit-production.mjs',
  'scripts/audit-sasi-v3.mjs',
  'scripts/audit-sasi-v51.mjs',
  'scripts/audit-sasi-v52-ux.mjs',
  'scripts/audit-ui-copy-v1464.mjs',
  'scripts/audit-v1480.mjs',
  'scripts/audit-v1580-closure.mjs',
  'scripts/audit-v162-closure.mjs',
  'scripts/patch-sasi-jobs-v1465.mjs',
  'scripts/patch-v1480.mjs',
  'scripts/selftest-v1480.mjs',
  'scripts/test-byok-browser.cjs',
  'scripts/test-creation-contract-browser.cjs',
  'scripts/test-sasi-v51-managed-and-byok.mjs'
];
const manifests=["LINGXIFIELD_PROTECTED_MANIFEST.json","LINGXIFIELD_SOURCE_INVENTORY.json"];
const normalize=x=>String(x||"").replaceAll("\\","/");
function isRetired(x){
  const n=normalize(x);
  return retired.some(p=>n===p||n.startsWith(p.endsWith("/")?p:p+"/"));
}
function prune(node){
  if(Array.isArray(node))return node.filter(x=>!(x&&typeof x==="object"&&typeof x.path==="string"&&isRetired(x.path))).map(prune);
  if(node&&typeof node==="object"){
    for(const [k,v] of Object.entries(node))node[k]=prune(v);
    if(Array.isArray(node.files)){
      if(typeof node.fileCount==="number")node.fileCount=node.files.length;
      if(typeof node.count==="number")node.count=node.files.length;
    }
  }
  return node;
}
for(const file of manifests){
  if(!fs.existsSync(file))continue;
  const data=JSON.parse(fs.readFileSync(file,"utf8"));
  prune(data);
  fs.writeFileSync(file,JSON.stringify(data,null,2)+"\n");
  console.log(`V49R2_MANIFEST_PRUNED=${file}`);
}
