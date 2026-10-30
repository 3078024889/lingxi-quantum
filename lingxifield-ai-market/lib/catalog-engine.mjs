// Deterministic, side-effect-free catalog engine. No claims without evidence.
const isText=x=>typeof x==='string'&&x.trim().length>0;
export function validCatalogEntry(x){
 if(!x||typeof x!=='object'||Array.isArray(x))return false;
 if(!/^[a-z0-9][a-z0-9-]{1,79}$/.test(x.id||''))return false;
 if(![x.name,x.company,x.category,x.website,x.description,x.status,x.updatedAt].every(isText))return false;
 if(!['active','discontinued','unverified'].includes(x.status))return false;
 if(!Number.isFinite(Date.parse(x.updatedAt)))return false;
 if(!Array.isArray(x.capabilities)||x.capabilities.some(y=>!isText(y)))return false;
 if(x.websiteKind!==undefined&&!['official','documentation','repository'].includes(x.websiteKind))return false;
 if(x.repositoryUrl!==undefined){
  if(typeof x.repositoryUrl!=='string')return false;
  try{const r=new URL(x.repositoryUrl);if(r.protocol!=='https:'||r.hostname!=='github.com'||r.username||r.password)return false;}catch{return false;}
 }
 if(x.websiteKind==='repository'&&new URL(x.website).hostname!=='github.com')return false;
 if(x.websiteKind==='official'&&new URL(x.website).hostname==='github.com')return false;
 if(x.repositoryUrl===x.website&&x.websiteKind!=='repository')return false;
 try{const url=new URL(x.website);if(url.protocol!=='https:'||url.username||url.password)return false;}catch{return false;}
 return true;
}
export function mergeCatalog(existing,incoming){
 const map=new Map();for(const x of existing){if(!validCatalogEntry(x)||map.has(x.id))throw Error('Invalid or duplicate existing catalog entry');map.set(x.id,x)}
 let inserted=0,updated=0,identical=0;
 for(const x of incoming){if(!validCatalogEntry(x))throw Error('Invalid catalog entry: '+(x?.id??'?'));
  const old=map.get(x.id);
  if(!old){inserted++;map.set(x.id,x);continue}
  if(JSON.stringify(old)===JSON.stringify(x)){identical++;continue}
  if(Date.parse(x.updatedAt)<=Date.parse(old.updatedAt))throw Error('Stale or conflicting catalog update: '+x.id);
  updated++;map.set(x.id,x)
 }
 return {data:[...map.values()].sort((a,b)=>a.id.localeCompare(b.id)),inserted,updated,identical}
}
export function searchCatalog(rows,{q='',category='',status='active',limit=24,cursor=0}={}){
 const s=String(q).trim().toLocaleLowerCase(),c=String(category).trim().toLowerCase();
 const start=Math.min(1000000,Math.max(0,Math.floor(Number(cursor)||0)));
 const cap=Math.min(100,Math.max(1,Math.floor(Number(limit)||24)));
 const filtered=rows.filter(validCatalogEntry).filter(x=>(!status||x.status===status)&&(!c||x.category.toLowerCase()===c)&&(!s||[x.name,x.company,x.category,x.description,...x.capabilities].join(' ').toLocaleLowerCase().includes(s))).sort((a,b)=>a.name.localeCompare(b.name,'en')||a.id.localeCompare(b.id));
 return {total:filtered.length,limit:cap,cursor:start,nextCursor:start+cap<filtered.length?start+cap:null,items:filtered.slice(start,start+cap)};
}
