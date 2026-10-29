// Fetch public Hugging Face model metadata to a D-drive-friendly offline JSON file.
// This does NOT mark products as verified or write to any DB.
import{writeFile,mkdir,readFile}from'node:fs/promises';import{resolve,dirname}from'node:path';import{pathToFileURL}from'node:url';
const VALID_ID=/^[A-Za-z0-9][\w.-]*\/[A-Za-z0-9][\w.-]*$/;
export function candidateFromModel(m){
 if(!m||typeof m.id!=='string'||!VALID_ID.test(m.id)||m.private===true)return null;
 return {source_id:'huggingface',upstream_id:m.id,entity_type:'model',name:m.id.split('/')[1],
 source_url:'https://huggingface.co/'+m.id,official_website:null,status:'candidate',
 metadata:{downloads:Number.isSafeInteger(m.downloads)&&m.downloads>=0?m.downloads:null,
 likes:Number.isSafeInteger(m.likes)&&m.likes>=0?m.likes:null,
 lastModified:typeof m.lastModified==='string'?m.lastModified:null},
 verification:'public_metadata_unreviewed'};
}
export async function collect({fetcher=fetch,limit=20,offlineJson=null}={}){
 if(!Number.isInteger(limit)||limit<1||limit>100)throw Error('INVALID_LIMIT');
 const url=new URL('https://huggingface.co/api/models');url.searchParams.set('limit',String(limit));
 url.searchParams.set('sort','lastModified');url.searchParams.set('direction','-1');
 let data;
 if(offlineJson!==null){data=JSON.parse(await readFile(offlineJson,'utf8'));}
 else {
  let error;
  for(let attempt=0;attempt<3;attempt++){
   try{const r=await fetcher(url,{headers:{accept:'application/json'},signal:AbortSignal.timeout(12000)});
    if(!r.ok)throw Error('UPSTREAM_'+r.status);
    data=await r.json();error=null;break;
   }catch(e){error=e;if(attempt<2)await new Promise(resolve=>setTimeout(resolve,600*(attempt+1)));}
  }
  if(error)throw Error('HF_NETWORK_UNAVAILABLE: '+String(error.cause?.code||error.message)+'. Use AI_MARKET_HF_JSON on a D: drive official JSON download or configure NODE_USE_ENV_PROXY=1.');
 }
 if(!Array.isArray(data))throw Error('INVALID_UPSTREAM_PAYLOAD');
 return {retrievedAt:new Date().toISOString(),source:'Hugging Face Hub public API',
 sourceUrl:'https://huggingface.co/docs/hub/api',candidates:data.map(candidateFromModel).filter(Boolean),
 notes:'Candidate evidence only; never inferred users, verified capabilities, market rank, prices or usage.'};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const out=resolve(process.env.AI_MARKET_CANDIDATE_OUTPUT||'reports/ai-market-local/hf-model-candidates.json');
 if(/^[a-z]:\\/i.test(out)&&!/^d:\\/i.test(out))throw Error('OUTPUT_MUST_BE_ON_D_DRIVE');
 const offline=process.env.AI_MARKET_HF_JSON||null;
 if(offline&&(!/^[dD]:\\\\/.test(offline)||!offline.toLowerCase().endsWith('.json')))throw Error('OFFLINE_INPUT_MUST_BE_D_DRIVE_JSON');
 const report=await collect({offlineJson:offline});await mkdir(dirname(out),{recursive:true});
 await writeFile(out,JSON.stringify(report,null,2));console.log('Candidate-only source file: '+out+' ('+report.candidates.length+' records)');
}
