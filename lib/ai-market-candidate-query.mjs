const STATUSES=new Set(['all','candidate','verified','rejected']);
export function parseCandidateQuery(input){
 const status=input?.status??'all';
 if(!STATUSES.has(status))return null;
 const search=typeof input?.search==='string'?input.search.trim():'';
 if(search.length>80)return null;
 const limit=Number(input?.limit??25);
 if(!Number.isInteger(limit)||limit<1||limit>100)return null;
 const page=Number(input?.page??1);
 if(!Number.isSafeInteger(page)||page<1||page>10000)return null;
 return {status,search,limit,page,offset:(page-1)*limit};
}
export function escapePostgrestSearch(search){
 return search.replace(/[\\%,().*]/g,' ').replace(/\s+/g,' ').trim();
}
