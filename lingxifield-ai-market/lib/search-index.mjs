// Build once per catalog revision. Query responses always have a bounded page.
const normalize=value=>String(value||'').normalize('NFKC').toLowerCase();
// Cross-language discovery aliases; each entry is an OR alternative, not an invented score.
const aliases={video:['视频','文生视频','图生视频'],image:['图片','文生图'],photo:['图片'],coding:['编程','代码'],code:['代码','编程'],search:['搜索','研究'],audio:['语音','音频'],voice:['语音'],free:['免费','额度']};
function terms(value){const text=normalize(value),out=new Set(text.match(/[a-z0-9]+/g)||[]);for(const run of text.match(/[\p{Script=Han}]+/gu)||[]){for(let i=0;i<run.length-1;i++)out.add(run.slice(i,i+2));if(run.length===1)out.add(run);}return [...out];}
export function createSearchIndex(input){
 const rows=[...input].sort((a,b)=>a.name.localeCompare(b.name,'en')||a.id.localeCompare(b.id));
 const byId=new Map(),postings=new Map(),categories=new Map();
 rows.forEach((r,i)=>{if(byId.has(r.id))throw Error('DUPLICATE_SEARCH_ID');byId.set(r.id,r);if(!categories.has(r.category))categories.set(r.category,[]);categories.get(r.category).push(i);for(const t of terms([r.name,r.company,r.category,r.description,...r.capabilities].join(' '))){if(!postings.has(t))postings.set(t,[]);postings.get(t).push(i);}});
 const all=rows.map((_,i)=>i);
 function search({q='',category='',limit=24,cursor=0}={}){
  const query=normalize(q).trim().slice(0,120),cap=Math.max(1,Math.min(50,Math.floor(Number(limit)||24))),start=Math.max(0,Math.min(10000,Math.floor(Number(cursor)||0)));
  const expansions=aliases[query]||[];
  const queryTerms=terms(query);
  const lists=queryTerms.map(t=>postings.get(t)||[]).sort((a,b)=>a.length-b.length);
  let ids=lists.length?lists[0]:category?(categories.get(category)||[]):all;
  const filters=lists.slice(1).map(list=>new Set(list));if(filters.length)ids=ids.filter(i=>filters.every(set=>set.has(i)));
  if(expansions.length){const union=new Set(ids);for(const synonym of expansions){const needle=normalize(synonym);for(const [i,row] of rows.entries())if(normalize([row.name,row.company,row.category,row.description,...row.capabilities].join(' ')).includes(needle))union.add(i);}ids=[...union].sort((a,b)=>a-b);}
  if(category&&queryTerms.length)ids=ids.filter(i=>rows[i].category===category);
  return {total:ids.length,limit:cap,cursor:start,nextCursor:start+cap<ids.length&&start+cap<=10000?start+cap:null,items:ids.slice(start,start+cap).map(i=>rows[i])};
 }
 return {search,get:id=>byId.get(id),size:rows.length};
}
