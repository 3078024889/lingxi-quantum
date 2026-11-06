#!/usr/bin/env node
// Read-only operator audit. Report names/status, NEVER credential values.
const fs=require('node:fs');
const {parseEnv}=require('node:util');
const path=process.argv[2]||'/etc/lingxifield/production.env';
if(!fs.existsSync(path)){console.log('PRODUCTION_ENV_MISSING');process.exit(2)}
let env;
try{env=parseEnv(fs.readFileSync(path,'utf8'))}catch{console.log('PRODUCTION_ENV_PARSE_FAILED');process.exit(3)}
const groups={
  browserAuth:['NEXT_PUBLIC_SUPABASE_URL','NEXT_PUBLIC_SUPABASE_ANON_KEY'],
  databaseAdmin:['SUPABASE_SERVICE_ROLE_KEY'],
  privateR2:['R2_ENDPOINT','R2_ACCOUNT_ID','R2_ACCESS_KEY_ID','R2_SECRET_ACCESS_KEY','R2_BUCKET_PRIVATE_BURN'],
  sasiControl:['SASI_WORKER_SECRET','SASI_QUOTE_SECRET'],
  docGateway:['LINGXIFIELD_DOCUMENT_GATEWAY_PUBLIC_URL','LINGXIFIELD_DOCUMENT_GATEWAY_SECRET']
};
for(const [group,required] of Object.entries(groups)){
 const missing=required.filter(k=>!String(env[k]||'').trim());
 console.log(group+': '+(missing.length?'MISSING '+missing.join(','):'PRESENT_NOT_FUNCTIONALLY_VERIFIED'));
}
const url=String(env.NEXT_PUBLIC_SUPABASE_URL||'');
if(url&&url!=='https://sxsgdpqojepgbbrxrzlq.supabase.co')console.log('WARNING_SUPABASE_PROJECT_URL_DIFFERS');
const site=String(env.NEXT_PUBLIC_SITE_URL||'');
if(site&&site!=='https://lingxifield.cn')console.log('WARNING_SITE_URL_NOT_CN');
console.log('PAYMENT_ENV_MANUALLY_VERIFY_AND_KEEP_CHARGES_DISABLED_UNTIL_SETTLEMENT_TESTS');
console.log('ENVIRONMENT_AUDIT_COMPLETE');
