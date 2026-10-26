/** Runtime-neutral data quality gates for sourced repository observations. */
const repoPattern=/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;
export function validateSnapshot(rows){
 if(!Array.isArray(rows)||rows.length===0||rows.length>500)throw Error("Invalid snapshot size");
 const seen=new Set();
 for(const r of rows){
  if(!r||typeof r!=="object"||!repoPattern.test(r.repository||""))throw Error("Invalid repository");
  if(seen.has(r.repository.toLowerCase()))throw Error("Duplicate repository");
  seen.add(r.repository.toLowerCase());
  if(r.sourceUrl!=="https://api.github.com/repos/"+r.repository)throw Error("Untrusted source URL");
  if(!Number.isSafeInteger(r.stars)||r.stars<0||!Number.isSafeInteger(r.forks)||r.forks<0)throw Error("Invalid counts");
  if(typeof r.archived!=="boolean"||!Number.isFinite(Date.parse(r.observedAt)))throw Error("Invalid metadata");
  if(r.reviewStatus!=="raw_api_observation")throw Error("Unsupported evidence state");
 }
 return rows;
}
export function detectAnomalies(previous,next){
 validateSnapshot(previous);validateSnapshot(next);
 const known=new Map(previous.map(r=>[r.repository.toLowerCase(),r]));
 const warnings=[];
 for(const r of next){
  const old=known.get(r.repository.toLowerCase());
  if(!old){warnings.push({repository:r.repository,reason:"New repository requires review"});continue;}
  if(Date.parse(r.observedAt)<=Date.parse(old.observedAt))warnings.push({repository:r.repository,reason:"Timestamp did not advance"});
  if(old.stars>100&&r.stars<old.stars*.75)warnings.push({repository:r.repository,reason:"Stars decreased by more than 25%"});
  if(old.forks>100&&r.forks<old.forks*.75)warnings.push({repository:r.repository,reason:"Forks decreased by more than 25%"});
  if(r.archived!==old.archived)warnings.push({repository:r.repository,reason:"Archive status changed"});
 }
 return warnings;
}
