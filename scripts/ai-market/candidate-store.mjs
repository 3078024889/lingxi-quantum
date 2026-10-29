import {mkdir,readFile,writeFile,rename,open} from 'node:fs/promises';
import {dirname,resolve} from 'node:path';
const KEY=/^hf:(models|spaces):[\w.-]+\/[\w.-]+$/;
export function mergeCandidates(current,incoming,{now=new Date().toISOString()}={}){
 if(!Array.isArray(current)||!Array.isArray(incoming))throw new Error('INVALID_COLLECTION');
 const items=new Map();
 for(const item of current){
  if(!item||!KEY.test(item.candidateKey))throw new Error('INVALID_EXISTING_CANDIDATE');
  if(items.has(item.candidateKey))throw new Error('DUPLICATE_EXISTING_CANDIDATE');
  items.set(item.candidateKey,item);
 }
 let added=0,updated=0,unchanged=0;
 for(const item of incoming){
  if(!item||!KEY.test(item.candidateKey)||item.status!=='candidate'||typeof item.sourceUrl!=='string'||!item.sourceUrl.startsWith('https://huggingface.co/'))throw new Error('INVALID_INCOMING_CANDIDATE');
  const old=items.get(item.candidateKey);
  if(!old){items.set(item.candidateKey,{...item,firstSeenAt:now,lastSeenAt:now});added++;continue;}
  if(old.status==='verified'){items.set(item.candidateKey,{...old,lastSeenAt:now});unchanged++;continue;}
  const merged={...old,...item,firstSeenAt:old.firstSeenAt||now,lastSeenAt:now,status:'candidate'};
  if(JSON.stringify({...old,lastSeenAt:now})===JSON.stringify(merged))unchanged++;else updated++;
  items.set(item.candidateKey,merged);
 }
 return {records:[...items.values()].sort((a,b)=>a.candidateKey.localeCompare(b.candidateKey)),stats:{added,updated,unchanged,total:items.size},publicationApproved:false};
}
export async function persistCandidates({file,candidates}){
 if(typeof file!=='string'||!file.endsWith('.json'))throw new Error('INVALID_FILE');
 const dest=resolve(file);
 await mkdir(dirname(dest),{recursive:true});
 const lock=dest+'.lock';
 let handle;
 try{
  handle=await open(lock,'wx');
  let current=[];
  try {const raw=JSON.parse(await readFile(dest,'utf8'));if(!Array.isArray(raw))throw new Error('INVALID_STORE');current=raw;}
  catch(err){if(err.code!=='ENOENT')throw err;}
  const next=mergeCandidates(current,candidates);
  const temp=dest+'.'+process.pid+'.tmp';
  try{await writeFile(temp,JSON.stringify(next.records,null,2)+'\n',{flag:'wx'});await rename(temp,dest);}
  finally{const {rm}=await import('node:fs/promises');await rm(temp,{force:true});}
  return next.stats;
 }finally{if(handle){await handle.close();const {rm}=await import('node:fs/promises');await rm(lock,{force:true});}}

}
