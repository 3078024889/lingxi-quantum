const validUrl=s=>{try{const u=new URL(s);return u.protocol==='https:'&&!u.username&&!u.password;}catch{return false;}};
export function assembleProductResponse(entity,claims=[]){
 if(!entity||entity.entity_type!=='product'||entity.status!=='verified'||!entity.verified_at)return null;
 const values=new Map();
 for(const c of claims){
  if(!c||c.reviewed_at==null||c.reviewed_by==null||typeof c.field!=='string'||typeof c.field_value!=='string'||!validUrl(c.source_url))continue;
  const group=values.get(c.field)||[];group.push(c);values.set(c.field,group);
 }
 const fields={},conflictingFields=[];
 for(const [field,group] of values){
  const unique=new Set(group.map(c=>c.field_value.trim()));
  if(unique.size!==1){conflictingFields.push(field);continue;}
  const latest=group.slice().sort((a,b)=>String(b.checked_at).localeCompare(String(a.checked_at)))[0];
  fields[field]={value:latest.field_value,sourceUrl:latest.source_url,sourceName:latest.source_name,checkedAt:latest.checked_at};
 }
 return {id:entity.id,name:entity.name,officialUrl:validUrl(entity.official_website)?entity.official_website:null,
  sourceUrl:validUrl(entity.source_url)?entity.source_url:null,verifiedAt:entity.verified_at,
  fields,conflictingFields,feedback:[],metrics:[],hasUnverifiedFields:true};
}
