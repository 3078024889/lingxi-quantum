#!/usr/bin/env node
/** Source snapshots only. Explicit --live, no modification of product facts. */
import {readFileSync,writeFileSync} from 'node:fs';
import {snapshotOfficialPage} from '../lib/market-safe-source-harvest.mjs';
const packs=['001','002','003'].map(n=>JSON.parse(readFileSync(new URL('../data/company-intake/batch-'+n+'-official-observations.json',import.meta.url))));
const rows=packs.flatMap(p=>p.products.filter(x=>Object.values(x.facts).some(f=>f.status==='missing')));
const limit=Math.max(1,Math.min(10,Number(process.argv.find(a=>a.startsWith('--max='))?.slice(6)||3)));
const live=process.argv.includes('--live'),results=[];
for(const p of rows.slice(0,limit)){
 const f=Object.entries(p.facts).find(([k,v])=>v.status==='observed'&&v.source);
 if(!f)continue;
 if(!live){results.push({product:p.id,url:f[1].source,status:'dry_run'});continue}
 try{
  const result=await snapshotOfficialPage({url:f[1].source,officialHosts:p.officialHosts,terms:Object.keys(p.facts).filter(k=>p.facts[k].status==='missing')});
  results.push({product:p.id,...result});
 }catch(err){results.push({product:p.id,status:'blocked',reason:String(err.message).slice(0,80)})}
}
const output={schema:'siai_official_snapshot_v1',live,pages:results.length,results,autoApproval:false};
const dest=process.argv.find(a=>a.startsWith('--out='))?.slice(6);
if(dest)writeFileSync(dest,JSON.stringify(output,null,2)+'\n','utf8');
console.log(JSON.stringify({pages:output.pages,live,autoApproval:false},null,2));
