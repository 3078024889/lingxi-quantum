import {recommendForQuestion} from './intent-engine.mjs';
const officialLink=u=>{try{const p=new URL(u);return p.protocol==='https:'&&!p.username&&!p.password&&p.hostname.length>3;}catch{return false}};
export function assembleVerifiedTools({entities=[],capabilities=[],evidence=[]}={}){
 const checks=new Map(evidence.filter(e=>e&&e.checked===true&&e.id!=null&&officialLink(e.source_url)).map(e=>[String(e.id),e]));
 const byEntity=new Map();
 for(const c of capabilities){
  if(!c?.entity_id||!c.capability_key||!checks.has(String(c.evidence_id))||!c.verified_by||!c.verified_at)continue;
  const list=byEntity.get(c.entity_id)||[];list.push(c);byEntity.set(c.entity_id,list);
 }
 const results=[];
 for(const e of entities){
  if(e.status!=='verified'||!e.verified_at||!e.verified_by||e.entity_type!=='product'||!officialLink(e.official_website))continue;
  const caps=byEntity.get(e.id)||[];
  if(!caps.length)continue;
  const origins=caps.map(c=>checks.get(String(c.evidence_id))).filter(Boolean);
  results.push({id:e.id,name:e.name,status:'verified',officialUrl:e.official_website,capabilities:caps.map(c=>c.capability_key),
   verifiedCapabilities:caps.map(c=>c.capability_key),evidence:origins.map(x=>({url:x.source_url,verified:true})),pricing:null,access:null});
 }
 return results;
}
export function answerVerifiedQuestion(question,data,options={}){
 const tools=assembleVerifiedTools(data);
 const response=recommendForQuestion(question,tools,options);
 return {query:question,reason:response.reason,needsClarification:response.intent.needsClarification,
  detectedTasks:response.intent.tasks.map(x=>({id:x.id,label:x.label})),
  results:response.results.map(x=>({id:x.tool.id,name:x.tool.name,officialUrl:x.tool.officialUrl,
   matchedTasks:x.matchedTasks,evidenceUrls:x.tool.evidence.map(y=>y.url),
   freeQuota:null,price:null,regionAccess:null,verification:'verified'})),
  limitations:'Verified capability only; cost, free allowance and availability remain unknown without reviewed offer evidence'};
}
