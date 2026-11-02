/**
 * Chronology is not a popularity/quality rank.
 * A product's publisher founding date must not be conflated with a GitHub project's first commit.
 * Verified companies lead, followed by companies with undisclosed founding dates,
 * then OSS/software projects (ordered using their separately labelled project-start dates).
 */
const yearOf=v=>typeof v==='string'&&/^(?:18|19|20)\d{2}$/.test(v)?Number(v):null;
const tier=r=>r.kind==='company'?(yearOf(r.year)===null?1:0):(yearOf(r.year)===null?3:2);
export function compareFoundingRecords(a,b,direction='asc'){
 const at=tier(a),bt=tier(b);
 if(at!==bt)return at-bt;
 const ay=yearOf(a.year),by=yearOf(b.year);
 if(ay!==null&&by!==null&&ay!==by)return direction==='desc'?by-ay:ay-by;
 const n=String(a.name||'').localeCompare(String(b.name||''),'en');
 return n||String(a.id||'').localeCompare(String(b.id||''),'en');
}
