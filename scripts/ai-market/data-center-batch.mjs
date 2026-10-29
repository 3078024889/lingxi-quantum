import {createHash} from 'node:crypto';
import {mkdir,readFile,rename,writeFile,rm,open} from 'node:fs/promises';
import {dirname,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {discoverHuggingFace} from './huggingface-discovery.mjs';
import {hfToIdentity,fetchOpenAlexInstitutions} from './data-center-source-adapters.mjs';
import {reconcileSnapshot} from '../../lib/ai-market-data-center.mjs';

export function createEvidence(candidates){
 if(!Array.isArray(candidates))throw Error('INVALID_CANDIDATES');
 return candidates.map(item=>{
  const payload=JSON.stringify(item);
  return {entityId:item.id,source:item.source,sourceUrl:item.sourceUrl,observedAt:item.observedAt,
   sha256:createHash('sha256').update(payload).digest('hex'),payload,verified:false};
 });
}
export async function createBatch({source='huggingface-models',limit=20,fetcher=fetch,openAlexKey}={}){
 if(!Number.isInteger(limit)||limit<1||limit>100)throw Error('INVALID_LIMIT');
 let records;
 if(source==='huggingface-models'||source==='huggingface-spaces'){
  const collection=source==='huggingface-models'?'models':'spaces';
  const data=await discoverHuggingFace({collection,limit,fetcher});
  records=data.candidates.map(item=>hfToIdentity({id:item.upstreamId,private:item.visibility==='private'},collection==='models'?'model':'product',item.observedAt)).filter(Boolean);
 }else if(source==='openalex-institutions'){
  const data=await fetchOpenAlexInstitutions({apiKey:openAlexKey,limit,fetcher});
  records=data.candidates;
 }else throw Error('UNKNOWN_SOURCE');
 return {source,fetchedAt:new Date().toISOString(),records,evidence:createEvidence(records),publicationApproved:false};
}
export async function saveBatch({file,batch}){
 if(!file||!file.endsWith('.json')||!Array.isArray(batch?.records))throw Error('INVALID_BATCH');
 const path=resolve(file);await mkdir(dirname(path),{recursive:true});
 const temp=path+'.'+process.pid+'.tmp';
 const lock=path+'.lock';
 const handle=await open(lock,'wx');
 try{
  let existing=[];
  try{const parsed=JSON.parse(await readFile(path,'utf8'));existing=parsed.records||[];}
  catch(e){if(e.code!=='ENOENT')throw e;}
  const merged=reconcileSnapshot(existing,batch.records);
  const data={schemaVersion:1,source:batch.source,updatedAt:batch.fetchedAt,publicationApproved:false,
   stats:merged.stats,records:merged.records,evidence:createEvidence(merged.records)};
  await writeFile(temp,JSON.stringify(data,null,2)+'\n',{flag:'wx'});
  await rename(temp,path);
  return {path,stats:merged.stats,publicationApproved:false};
 }finally{await rm(temp,{force:true});await handle.close();await rm(lock,{force:true});}
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const source=process.argv[2]||'huggingface-models';
 const file=process.argv[3]||'data/ai-market/data-center-a.json';
 const limit=Number(process.argv[4]||20);
 try{console.log(JSON.stringify(await saveBatch({file,batch:await createBatch({source,limit,openAlexKey:process.env.OPENALEX_API_KEY})}),null,2));}
 catch(error){console.error(error?.message||String(error));process.exitCode=1;}
}
