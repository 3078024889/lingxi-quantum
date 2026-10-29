import{readFile}from'node:fs/promises';
const REQUIRED=['source','license','role','adoption','constraints'];
export function auditOpenSourceCandidates(items){
 const violations=[];
 for(const item of items){
  for(const k of REQUIRED)if(typeof item[k]!=='string'||!item[k].trim())violations.push(item.id+':'+k);
  if(!/^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\/?$/.test(item.source||''))violations.push(item.id+':source');
  if(item.adoption==='copy-source'&&!item.licenseVerified)violations.push(item.id+':license-not-verified');
 }
 return{pass:violations.length===0,violations};
}
export async function readRegistry(path=new URL('../../data/ai-market/open-source-candidates.json',import.meta.url)){
 return JSON.parse(await readFile(path,'utf8'));
}
