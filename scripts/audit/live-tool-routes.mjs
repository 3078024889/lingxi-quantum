// R29 production route census. Read-only requests; never upload files or pay for a task.
// Reports accessibility and page health ONLY, not tool correctness.
import fs from "node:fs/promises";
import {mkdir} from "node:fs/promises";
const seo=await fs.readFile("lib/seo/global-seo.ts","utf8");
const slugs=[...seo.matchAll(/\{slug:"([^"]+)",zh:/g)].map(x=>x[1]);
const matrix=JSON.parse(await fs.readFile("lib/tools/platform/fixture-matrix.json","utf8"));
if(slugs.length!==118||new Set(slugs).size!==slugs.length)throw new Error("CATALOG_DRIFT");
if(Object.keys(matrix.toolClassifications).length!==slugs.length)throw new Error("FIXTURE_MATRIX_DRIFT");
const sites=["lingxifield.com","lingxifield.cn"];
const jobs=sites.flatMap(domain=>slugs.map(slug=>({domain,slug,kind:matrix.toolClassifications[slug]?.kind||"unclassified"})));
const output=[];
let next=0;
const workers=Array.from({length:5},async()=>{
 while(next<jobs.length){
  const job=jobs[next++];
  const href="https://"+job.domain+"/tools/"+encodeURIComponent(job.slug);
  const started=Date.now();let entry={...job,url:href,ok:false,status:0,ms:0,title:"",error:"",redirect:""};
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),12000);
  try{
   const response=await fetch(href,{signal:controller.signal,redirect:"follow",headers:{"user-agent":"LINGXIFIELD-Authorized-Public-Tool-Audit/1.0","accept":"text/html"}});
   const html=(await response.text()).slice(0,100000);
   const title=html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]||"";
   entry={...entry,ok:response.ok&&html.includes("LINGXIFIELD")&&!/404|not found/i.test(title),status:response.status,ms:Date.now()-started,title:title.slice(0,140),redirect:response.url!==href?response.url:""};
   if(!entry.ok)entry.error=response.ok?"UNEXPECTED_PAGE_OR_TITLE":"HTTP_"+response.status;
  }catch(error){entry.error=error?.name==="AbortError"?"TIMEOUT":String(error?.message||"NETWORK_ERROR").slice(0,200)}
  finally{clearTimeout(timer);output.push(entry)}
 }
});
await Promise.all(workers);
output.sort((a,b)=>a.domain.localeCompare(b.domain)||a.slug.localeCompare(b.slug));
const summary={date:new Date().toISOString(),toolCount:slugs.length,requests:output.length,passed:output.filter(x=>x.ok).length,failed:output.filter(x=>!x.ok).length,note:"HTTP/HTML smoke ONLY. A passing route is not evidence that input processing, payment, download or mobile UI works."};
await mkdir("audit-results",{recursive:true});
await fs.writeFile("audit-results/R29_PUBLIC_TOOL_ROUTE_AUDIT.json",JSON.stringify({summary,results:output},null,2));
await fs.writeFile("audit-results/R29_FAILED_ROUTES.md","# Public tool route issues\n\n"+output.filter(x=>!x.ok).map(x=>"- "+x.domain+"/tools/"+x.slug+" — "+x.error+" (status "+x.status+")").join("\n")+"\n");
console.log(JSON.stringify(summary,null,2));
if(summary.failed)process.exitCode=1;
