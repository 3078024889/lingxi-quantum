const normalize=s=>String(s||'').normalize('NFKC').toLocaleLowerCase().trim();
export function searchEntities(entities,{q='',kind='all',limit=20}={}){
 if(!Array.isArray(entities)||!Number.isInteger(limit)||limit<1||limit>100)return [];
 const query=normalize(q);
 if(query.length>100)return [];
 return entities.filter(e=>e&&e.status==='verified'&&(kind==='all'||kind===e.kind))
 .map(e=>{
  const name=normalize(e.name),id=normalize(e.id);
  const score=!query?1:name===query?100:name.startsWith(query)?70:name.includes(query)?50:id.includes(query)?20:0;
  return {entity:e,score};
 }).filter(x=>x.score>0).sort((a,b)=>b.score-a.score||a.entity.name.localeCompare(b.entity.name)).slice(0,limit).map(x=>x.entity);
}
