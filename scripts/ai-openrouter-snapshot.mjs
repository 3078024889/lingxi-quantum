/** Run manually: node scripts/ai-openrouter-snapshot.mjs
 * Produces a local artifact for review, not automatic public redistribution. */
import {mkdir,writeFile} from "node:fs/promises";
const endpoint="https://openrouter.ai/api/v1/models";
const ctrl=new AbortController();
const timeout=setTimeout(()=>ctrl.abort(),15000);
try{
 const headers={Accept:"application/json"};
 if(process.env.OPENROUTER_API_KEY)headers.Authorization="Bearer "+process.env.OPENROUTER_API_KEY;
 const res=await fetch(endpoint,{headers,signal:ctrl.signal});
 if(!res.ok)throw new Error("OpenRouter HTTP "+res.status);
 const json=await res.json();
 if(!json||!Array.isArray(json.data))throw new Error("Unexpected model payload");
 const rows=json.data.filter(x=>x&&typeof x.id==="string").map(x=>({
  id:x.id,name:typeof x.name==="string"?x.name:null,
  context_length:Number.isFinite(x.context_length)?x.context_length:null,
  pricing:x.pricing&&typeof x.pricing==="object"?{
   prompt:typeof x.pricing.prompt==="string"?x.pricing.prompt:null,
   completion:typeof x.pricing.completion==="string"?x.pricing.completion:null
  }:null
 }));
 const snapshot={source:endpoint,observedAt:new Date().toISOString(),
  redistributionStatus:"review-required",modelCount:rows.length,models:rows};
 await mkdir("reports/ai-market",{recursive:true});
 const name="reports/ai-market/openrouter-"+snapshot.observedAt.slice(0,10)+".json";
 await writeFile(name,JSON.stringify(snapshot,null,2)+"\n");
 console.log(JSON.stringify({path:name,modelCount:rows.length,source:endpoint}));
}catch(e){console.error("Snapshot failed:",e.message);process.exitCode=1;}
finally{clearTimeout(timeout);}
