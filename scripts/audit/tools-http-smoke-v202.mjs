import fs from "node:fs";
import path from "node:path";
import {spawn,spawnSync} from "node:child_process";

const root=process.cwd();
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const must=(v,m)=>{if(!v)throw new Error(m)};
must(fs.existsSync(path.join(root,".next","BUILD_ID")),"NEXT_BUILD_REQUIRED");

const registry=read("lib/tools/registry.ts");
const hub=read("components/tools/ToolsHubV11.tsx");
const registrySlugs=[...registry.matchAll(/slug:\s*"([^"]+)"/g)].map(x=>x[1]);
const dedicated=[...hub.matchAll(/href:"\/tools\/([^"]+)"/g)].map(x=>x[1]);
const routes=[...new Set([...registrySlugs,...dedicated])].sort().map(slug=>`/tools/${slug}`);
routes.unshift("/tools");

const port=Number(process.env.LINGXI_TOOLS_SMOKE_PORT||"3197");
const nextBin=path.join(root,"node_modules","next","dist","bin","next");
const child=spawn(process.execPath,[nextBin,"start","-H","127.0.0.1","-p",String(port)],{
 cwd:root,stdio:["ignore","pipe","pipe"],env:{...process.env,NODE_ENV:"production"}
});
let logs="";
child.stdout.on("data",d=>logs+=d.toString());
child.stderr.on("data",d=>logs+=d.toString());

const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function waitReady(){
 const deadline=Date.now()+30000;
 while(Date.now()<deadline){
  if(child.exitCode!==null)throw new Error(`NEXT_START_EXITED:${child.exitCode}\n${logs.slice(-2500)}`);
  try{const r=await fetch(`http://127.0.0.1:${port}/tools`,{redirect:"manual"});if(r.status>=200&&r.status<500)return}catch{}
  await sleep(500);
 }
 throw new Error(`NEXT_START_TIMEOUT\n${logs.slice(-2500)}`);
}
function stop(){
 if(child.exitCode!==null)return;
 if(process.platform==="win32")spawnSync("taskkill",["/pid",String(child.pid),"/T","/F"],{stdio:"ignore"});
 else child.kill("SIGTERM");
}

try{
 await waitReady();
 const failed=[];
 const results=[];
 for(const route of routes){
  let status=0,body="";
  try{
   const r=await fetch(`http://127.0.0.1:${port}${route}`,{redirect:"manual",headers:{"user-agent":"LINGXIFIELD-v202-production-smoke"}});
   status=r.status;body=(await r.text()).slice(0,20000);
  }catch(e){failed.push(`${route}:NETWORK`);continue}
  const bad=status===404||status>=500||/Internal Server Error|Application error: a client-side exception/i.test(body);
  if(bad)failed.push(`${route}:${status}`);
  results.push({route,status});
 }
 console.log(`TOOLS_HTTP_ROUTES_TESTED=${results.length}`);
 if(failed.length)throw new Error(`TOOLS_HTTP_SMOKE_FAILED:${failed.join(",")}`);
 console.log("TOOLS_HTTP_PRODUCTION_RENDER=PASS");
 console.log("AUDIT_TOOLS_HTTP_SMOKE_V202=PASS");
}finally{stop()}
