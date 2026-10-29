import{readFile}from'node:fs/promises';
import{pathToFileURL}from'node:url';
const migrationFiles=['20261029_ai_market_data_center_a.sql','20261029_ai_market_metrics_b.sql','20261029_ai_market_h_integration_missing_tables.sql','20261029_ai_market_vendor_f.sql','20261029_ai_market_payment_ledger_h.sql'];
const safeName=s=>/^20261029_ai_market_[a-z0-9_]+\.sql$/.test(s);
export async function checkPackage({root=new URL('../../',import.meta.url)}={}){
 const issues=[],checked=[];
 for(const name of migrationFiles){
  if(!safeName(name)){issues.push('unsafe migration name');continue}
  const sql=await readFile(new URL('supabase/migrations/'+name,root),'utf8');
  checked.push(name);
  if(!sql.includes('enable row level security'))issues.push(name+': RLS missing');
  if(!sql.includes('revoke all'))issues.push(name+': grants not restricted');
  if(/\bdrop\s+(table|schema)\b|\btruncate\b|\bdelete\s+from\b/i.test(sql))issues.push(name+': destructive SQL requires separate review');
 }
 const ci=await readFile(new URL('.github/workflows/ai-market-review-gate.yml',root),'utf8');
 if(!ci.includes('pnpm exec tsc --noEmit'))issues.push('TypeScript CI missing');
 const paySql=await readFile(new URL('supabase/migrations/20261029_ai_market_payment_ledger_h.sql',root),'utf8');
 if(!paySql.includes('unique(provider,provider_event_id)')||!paySql.includes('unique(provider,provider_transaction_id)'))issues.push('Database payment idempotency missing');
 const copy=await import(new URL('lib/ai-market/market-ui-copy.mjs',root));
 const locales=['en','ja','ko','fr','de','es','pt','ar','zh'];
 const expected=Object.keys(copy.MARKET_UI_COPY.zh).sort().join(',');
 for(const locale of locales){
  if(!copy.MARKET_UI_COPY[locale]||Object.keys(copy.MARKET_UI_COPY[locale]).sort().join(',')!==expected)issues.push('i18n missing keys: '+locale);
 }
 return{status:issues.length?'blocked':'source_preflight_pass',issues,checked,locales,
  warning:'Source preflight is not a database migration, browser test, provider payment test, or production approval.'};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 try{const r=await checkPackage();console.log(JSON.stringify(r,null,2));if(r.issues.length)process.exitCode=1;}catch(e){console.error(e.message);process.exitCode=1}
}
