const KEY=/^hf:(models|spaces):[\w.-]+\/[\w.-]+$/;
export function normalizeCandidateRows(candidates,now=new Date().toISOString()){
 if(!Array.isArray(candidates)||candidates.length>100)throw new Error('INVALID_BATCH');
 const seen=new Set();
 return candidates.map(x=>{
  if(!x||!KEY.test(x.candidateKey)||x.status!=='candidate')throw new Error('INVALID_CANDIDATE');
  if(seen.has(x.candidateKey))throw new Error('DUPLICATE_CANDIDATE');
  seen.add(x.candidateKey);
  const kind=x.candidateKey.startsWith('hf:models:')?'model_repository':'space_repository';
  if(x.kind!==kind||x.source!=='huggingface_hub')throw new Error('SOURCE_MISMATCH');
  const id=x.candidateKey.substring(x.candidateKey.indexOf(':',3)+1);
  const expected='https://huggingface.co/'+(kind==='space_repository'?'spaces/':'')+id.split('/').map(encodeURIComponent).join('/');
  if(x.sourceUrl!==expected)throw new Error('SOURCE_URL_MISMATCH');
  if(typeof x.name!=='string'||x.name.length>200||typeof x.publisher!=='string'||x.publisher.length>150)throw new Error('INVALID_METADATA');
  return {candidate_key:x.candidateKey,source:'huggingface_hub',source_url:expected,kind,
    display_name:x.name,publisher:x.publisher,last_seen_at:now,
    source_updated_at:typeof x.upstreamUpdatedAt==='string'&&!Number.isNaN(Date.parse(x.upstreamUpdatedAt))?x.upstreamUpdatedAt:null,
    raw_evidence:{upstreamId:x.upstreamId,tags:Array.isArray(x.tags)?x.tags.slice(0,30):[],license:x.license||null}};
 });
}
export function partitionInsertUpdate(existing,rows){
 if(!Array.isArray(existing))throw new Error('INVALID_EXISTING');
 const lookup=new Map(existing.map(x=>[x.candidate_key,x]));
 const insert=[],update=[],skipped=[];
 for(const row of rows){
  const old=lookup.get(row.candidate_key);
  if(!old)insert.push({...row,verification_status:'candidate'});
  else if(old.verification_status==='candidate')update.push(row);
  else skipped.push(row.candidate_key);
 }
 return {insert,update,skipped};
}
