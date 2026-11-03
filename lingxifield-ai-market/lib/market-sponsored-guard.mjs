/** Two independent gates: DB RLS selects paid, reviewed, active rows;
 * public response also rejects expired, invalid or unlisted destinations. */
const validUrl=s=>{try{const u=new URL(s);return u.protocol==='https:'&&!u.username&&!u.password&&!u.port&&!!u.hostname&&u.hostname.length>3}catch{return false}};
export function visibleSponsored(rows,allowedIds,now=new Date()){
 if(!Array.isArray(rows)||!Array.isArray(allowedIds))return [];
 const allow=new Set(allowedIds),seen=new Set(),time=now.getTime();
 if(!Number.isFinite(time))return [];
 return rows.filter(r=>{
  if(!r||typeof r.project_id!=='string'||!allow.has(r.project_id)||seen.has(r.project_id))return false;
  if(r.placement!=='home_feature'||typeof r.label!=='string'||r.label.trim().length<2||r.label.length>100)return false;
  if(!validUrl(r.target_url))return false;
  const expiry=Date.parse(r.ends_at);
  if(!Number.isFinite(expiry)||expiry<=time)return false;
  seen.add(r.project_id);return true;
 }).slice(0,3).map(r=>({projectId:r.project_id,label:r.label,targetUrl:r.target_url,sponsored:true}));
}
