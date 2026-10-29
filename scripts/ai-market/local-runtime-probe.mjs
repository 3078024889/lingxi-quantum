// Read-only HTTP probe for local Next.js only. A system-level 2GB memory cap
// MUST be applied externally (Docker/Job Object); this script does not impose one.
import{writeFile,mkdir}from'node:fs/promises';
const base=new URL(process.env.AI_MARKET_BASE_URL||'http://127.0.0.1:3000');
if(!['localhost','127.0.0.1','[::1]'].includes(base.hostname))throw Error('LOCAL_STAGING_ONLY');
const paths=['/ai-market','/ai-market/lang/en','/ai-market/lang/zh','/ai-market/lang/ar'];
const checks=[];
for(const path of paths){
 const url=new URL(path,base);const t=performance.now();
 try{const r=await fetch(url,{signal:AbortSignal.timeout(20000),cache:'no-store'});checks.push({path,status:r.status,ok:r.ok,latencyMs:Math.round(performance.now()-t)});}
 catch(e){checks.push({path,status:0,ok:false,error:String(e.message||e)})}
}
const output={at:new Date().toISOString(),base:base.origin,checks,ok:checks.every(x=>x.ok),memoryLimitVerified:false,note:'Does not demonstrate 2GiB memory cap; verify externally and attach process/container peak RSS evidence.'};
const dir=process.env.AI_MARKET_REPORT_DIR||'reports/ai-market-local';
await mkdir(dir,{recursive:true});await writeFile(dir+'/runtime-probe.json',JSON.stringify(output,null,2));
console.log(JSON.stringify(output,null,2));if(!output.ok)process.exitCode=1;
