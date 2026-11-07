#!/usr/bin/env node
/**
 * Non-credentialed read-only origin diagnosis for LINGXIFIELD main domains.
 * Public-only requests; no state changes, login, cookies, API tokens, or DNS edits.
 */
import { promises as dns } from "node:dns";
import { writeFile, mkdir } from "node:fs/promises";
const targets = [
  {id:"international", origin:"https://lingxifield.com"},
  {id:"domestic", origin:"https://lingxifield.cn"},
  {id:"cf-public-preview", origin:"https://com-public-recovery-lingxifield-public-preview-only.3078024889.workers.dev"}
];
const paths=["/","/siai","/api/health","/api/sasi/account","/api/tools/jobs"];
const headers=["server","cf-ray","cf-cache-status","content-type","x-vercel-id","x-powered-by","retry-after","location"];
const output={timestamp:new Date().toISOString(),type:"PUBLIC_READONLY_NO_COOKIES",origins:[]};
for(const site of targets) {
  const host=new URL(site.origin).hostname;
  const item={id:site.id,host,ips:[],probes:[]};
  try{item.ips=(await dns.resolve4(host)).slice(0,8)}catch(e){item.dnsError=String(e?.code||"DNS_FAILED")}
  try{item.authoritativeNs=(await dns.resolveNs(host)).slice(0,8)}catch(e){item.nsError=String(e?.code||"NS_FAILED")}
  try{item.wwwCname=(await dns.resolveCname("www."+host)).slice(0,8)}catch(e){item.wwwCnameError=String(e?.code||"CNAME_FAILED")}
  for(const path of paths){
    try{
      const response=await fetch(site.origin+path,{
        redirect:"manual",cache:"no-store",signal:AbortSignal.timeout(18000),
        headers:{"Accept":"application/json, text/html;q=0.8","User-Agent":"Lingxifield-ReadOnly-Production-Gate/1.0"}
      });
      const kept={};
      for(const k of headers){
        const value=response.headers.get(k);
        if(value){
          // Don't emit arbitrary external URLs from redirects.
          if(k==="location"){
            try{const loc=new URL(value,site.origin);kept.location=loc.hostname===host?loc.pathname:"EXTERNAL_REDIRECT"}catch{kept.location="UNPARSEABLE"}
          }else{
            kept[k]=value.slice(0,160);
          }
        }
      }
      const probe={path,status:response.status,headers:kept};
      if(response.status===402||response.status===520||response.status===525||response.status===503){
        const small=await response.text().then(s=>s.slice(0,2500)).catch(()=>"");
        const match=small.match(/(payment required|worker exceeded|billing|cloudflare|plan limit|error code|access denied|upstream|gateway|backend disabled|supabase_public_config_missing)/ig)||[];
        probe.problemMarkers=[...new Set(match.map(v=>v.toLowerCase()))].slice(0,12);
      }
      item.probes.push(probe);
    }catch(e){item.probes.push({path,error:String(e?.cause?.code||e?.name||"FETCH_FAILED")})}
  }
  output.origins.push(item);
}
const checked=output.origins.filter(x=>x.id!=="cf-public-preview");
output.externalMainSitesReady=checked.every(site=>{
 const status=Object.fromEntries(site.probes.map(x=>[x.path,x.status]));
 return status["/"]===200&&status["/siai"]===200&&status["/api/health"]===200&&
 status["/api/sasi/account"]===401&&status["/api/tools/jobs"]===401;
});
await mkdir("release-evidence",{recursive:true});
await writeFile("release-evidence/public-main-probe.json",JSON.stringify(output,null,2)+"\n");
console.log(JSON.stringify(output,null,2));
if(!output.externalMainSitesReady)process.exitCode=1;
