const KINDS=new Set(['company','product','model','version']);
const STATUS=new Set(['candidate','verified','rejected','discontinued']);
const clean=(s,n)=>typeof s==='string'&&s.trim().length>0&&s.trim().length<=n;
export function validateEntity(e){
 if(!e||!KINDS.has(e.kind)||!clean(e.id,120)||!/^[a-z0-9][a-z0-9-]{1,119}$/.test(e.id)||!clean(e.name,250)||!STATUS.has(e.status))return null;
 if(e.website!==null&&e.website!==undefined){
  try{const u=new URL(e.website);if(u.protocol!=='https:'||u.username||u.password)return null;}catch{return null;}
 }
 return {id:e.id,kind:e.kind,name:e.name.trim(),status:e.status,website:e.website||null,sourceUrl:typeof e.sourceUrl==='string'?e.sourceUrl:null};
}
export function validateRelationship(r,entities){
 if(!r||!clean(r.from,120)||!clean(r.to,120)||!entities.has(r.from)||!entities.has(r.to))return null;
 const a=entities.get(r.from),b=entities.get(r.to);
 const allowed={owns:['company','product'],provides:['product','model'],releases:['model','version']};
 const pair=allowed[r.type];
 if(!pair||a.kind!==pair[0]||b.kind!==pair[1]||r.from===r.to)return null;
 return {from:r.from,to:r.to,type:r.type};
}
export function auditGraph(input){
 if(!Array.isArray(input?.entities)||!Array.isArray(input?.relationships))throw new Error('INVALID_GRAPH');
 const errors=[],entities=new Map(),edges=[];
 for(const [i,raw] of input.entities.entries()){
  const e=validateEntity(raw);
  if(!e){errors.push('invalid_entity:'+i);continue;}
  if(entities.has(e.id)){errors.push('duplicate_entity:'+e.id);continue;}
  entities.set(e.id,e);
 }
 const links=new Set();
 for(const [i,r] of input.relationships.entries()){
  const valid=validateRelationship(r,entities);
  if(!valid){errors.push('invalid_relationship:'+i);continue;}
  const key=valid.type+':'+valid.from+':'+valid.to;
  if(links.has(key)){errors.push('duplicate_relationship:'+i);continue;}
  links.add(key);edges.push(valid);
 }
 return {ok:errors.length===0,entities:[...entities.values()],relationships:edges,errors,publishable:false};
}
