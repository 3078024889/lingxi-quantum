/** Reject bad third-party snapshots before they can enter published datasets. */
export function validateCatalogSnapshot(snapshot,{maxAgeHours=48,minModels=1}={}){
 const errors=[];
 if(!snapshot||typeof snapshot!=="object")return {ok:false,errors:["missing snapshot"]};
 const date=Date.parse(snapshot.observedAt);
 if(!Number.isFinite(date)||date>Date.now()+300000||Date.now()-date>maxAgeHours*3600000)
  errors.push("invalid or stale timestamp");
 if(snapshot.source!=="https://openrouter.ai/api/v1/models")errors.push("unexpected source");
 if(!Array.isArray(snapshot.models)||snapshot.models.length<minModels)errors.push("empty or too small catalog");
 if(snapshot.redistributionStatus!=="review-required")errors.push("missing licensing gate");
 const seen=new Set();
 for(const m of Array.isArray(snapshot.models)?snapshot.models:[]){
  if(!m||typeof m.id!=="string"||!/^[a-z0-9][a-z0-9._:/-]{1,180}$/i.test(m.id)){errors.push("invalid model ID");continue;}
  if(seen.has(m.id))errors.push("duplicate model ID");
  seen.add(m.id);
  if(m.context_length!==null&&(!Number.isSafeInteger(m.context_length)||m.context_length<=0))errors.push("invalid context length");
  for(const key of ["prompt","completion"]){
   const value=m.pricing?.[key];
   if(value!==null&&value!==undefined&&
      (typeof value!=="string"||!value.trim()||!Number.isFinite(Number(value))||Number(value)<0))
    errors.push("invalid "+key+" price");
  }
 }
 if(snapshot.modelCount!==snapshot.models?.length)errors.push("model count mismatch");
 return {ok:errors.length===0,errors:[...new Set(errors)]};
}
