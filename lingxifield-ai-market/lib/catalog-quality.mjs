import {validCatalogEntry} from './catalog-engine.mjs';
/** @param {unknown[]} input */
export function catalogQuality(input){
  const rows=Array.isArray(input)?input:[];
  const valid=rows.filter(validCatalogEntry);
  const ids=new Set();let duplicates=0;
  for(const row of valid){if(ids.has(row.id))duplicates++;ids.add(row.id)}
  const statuses={active:0,discontinued:0,unverified:0};
  const categories={};
  for(const row of valid){statuses[row.status]++;categories[row.category]=(categories[row.category]||0)+1}
  return {total:rows.length,valid:valid.length,invalid:rows.length-valid.length,duplicates,uniqueIds:ids.size,statuses,categories,verifiedMarketMetrics:0,note:'Catalog identities do not imply independently verified market metrics.'};
}
/** @param {unknown[]} input @param {string} id */
export function catalogDetail(input,id){
  if(typeof id!=='string'||!/^[a-z0-9][a-z0-9-]{1,79}$/.test(id)) return null;
  return (Array.isArray(input)?input:[]).find(row=>validCatalogEntry(row)&&row.id===id)??null;
}
