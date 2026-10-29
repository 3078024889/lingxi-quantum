// Optional provider catalog. Requires user's authorized OpenRouter API key.
// Never writes a secret to logs, snapshots, or a hosted database.
import {mkdir,writeFile,rename} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
const token=process.env.OPENROUTER_API_KEY;
if(!token){console.log(JSON.stringify({source:'openrouter',status:'skipped_no_credentials'}));process.exit(0)}
const out=resolve(process.env.AI_MARKET_SNAPSHOT_DIR||'./reports/model-bulk');
const endpoint='https://openrouter.ai/api/v1/models';
const r=await fetch(endpoint,{signal:AbortSignal.timeout(25000),headers:{Authorization:'Bearer '+token,Accept:'application/json'}});
if(!r.ok)throw Error('OPENROUTER_HTTP_'+r.status);
const data=await r.json();
if(!Array.isArray(data?.data))throw Error('INVALID_OPENROUTER_CATALOG');
const collectedAt=new Date().toISOString();
const records=data.data.filter(x=>x&&typeof x.id==='string').map(x=>{
 const n=v=>{if(v===null||v===undefined||v==='')return null;const value=Number(v);return Number.isFinite(value)&&value>=0?value:null};
 const convert=v=>{const v2=n(v);return v2===null?null:Math.round(v2*1_000_000*1e6)/1e6};
 return {id:x.id,name:String(x.name||x.id),contextLength:n(x.context_length),
   inputUsdPerMillion:convert(x.pricing?.prompt),outputUsdPerMillion:convert(x.pricing?.completion),
   sourceUrl:endpoint,collectedAt,verification:'openrouter_self_reported_prices_not_original_model_publisher'};
});
await mkdir(out,{recursive:true});
const content=JSON.stringify({source:'openrouter',sourceUrl:endpoint,collectedAt,modelCount:records.length,records},null,2)+'\n';
const dest=resolve(out,'openrouter-bulk.json');
await writeFile(dest+'.tmp',content);await rename(dest+'.tmp',dest);
const sha256=createHash('sha256').update(content).digest('hex');
await writeFile(dest+'.sha256',sha256+'  openrouter-bulk.json\n');
console.log(JSON.stringify({source:'openrouter',modelCount:records.length,file:dest,sha256,sourceVerifiedAs:'openrouter_catalog_only'}));
