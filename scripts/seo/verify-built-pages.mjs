#!/usr/bin/env node
// Read-only verification against the freshly built local Next.js server.
import assert from "node:assert/strict";
import {spawn} from "node:child_process";
import http from "node:http";

const port=31579;
const origin="http://127.0.0.1:"+port;
// This read-only local server must simulate the production index gate.
// Product routes still guard private and unverified vendor data independently.
const child=spawn("pnpm",["exec","next","start","-H","127.0.0.1","-p",String(port)],{
 cwd:process.cwd(),env:{...process.env,NEXT_TELEMETRY_DISABLED:"1",VERCEL_ENV:"production"},stdio:["ignore","pipe","pipe"]
});
let output="";
for(const stream of [child.stdout,child.stderr])stream.on("data",b=>{output=(output+b.toString()).slice(-8000)});
const request=(path,hostname="lingxifield.com")=>new Promise((resolve,reject)=>{
 const req=http.get({hostname:"127.0.0.1",port,path,headers:{Host:hostname,Accept:"text/html,application/xml,text/plain"}},res=>{
  let data="";res.setEncoding("utf8");res.on("data",part=>data+=part);
  res.on("end",()=>resolve({status:res.statusCode,headers:res.headers,body:data}));
 });
 req.setTimeout(30000,()=>req.destroy(new Error("TIMEOUT:"+path)));
 req.on("error",reject);
});
const elements=(html)=>Array.from(html.matchAll(/<link\b[^>]*>/gi),m=>m[0]);
const value=(el,key)=>el.match(new RegExp("(?:^|\\s)"+key+'="([^"]+)"',"i"))?.[1]??null;
function canonical(page){
 const tags=elements(page.body).filter(t=>value(t,"rel")==="canonical");
 assert.equal(tags.length,1,"Expected exactly one HTML canonical");
 return value(tags[0],"href");
}
function alternate(page,lang,url){
 assert(elements(page.body).some(t=>value(t,"rel")==="alternate"&&value(t,"href")==url&&value(t,"hreflang")==lang),
  "Missing reciprocal hreflang "+lang+" "+url);
}
function titleOf(page){
 const raw=page.body.match(/<title>([^<]*)<\/title>/i)?.[1]??"";
 assert(raw,"Missing HTML title");
 return raw.replace(/&amp;/g,"&").replace(/&#x27;/g,"'");
}
function assert200(page,path){assert.equal(page.status,200,path+" returned "+page.status)}
async function run(){
 let ready=false;
 for(let i=0;i<90;i++){
  if(child.exitCode!==null)throw Error("Next.js exited before ready: "+output);
  try{const r=await request("/siai");if(r.status===200){ready=true;break}}catch{}
  await new Promise(r=>setTimeout(r,1000));
 }
 assert(ready,"Next.js server failed to start: "+output);
 let globalLocs=[];
 for(const host of ["lingxifield.com","lingxifield.cn"]){
  const site="https://"+host;
  const [robots,map,page]=await Promise.all([
   request("/robots.txt",host),request("/sitemap.xml",host),request("/siai",host)
  ]);
  for(const [item,path] of [[robots,"robots.txt"],[map,"sitemap.xml"],[page,"siai"]])assert200(item,host+"/"+path);
  assert(robots.body.includes("Sitemap: "+site+"/sitemap.xml"),host+" robots sitemap");
  const urls=Array.from(map.body.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/g),m=>m[1]);
  assert(urls.includes(site+"/siai"),host+" sitemap missing SIAI");
  if(host==="lingxifield.com")globalLocs=urls;
  assert(urls.every(url=>new URL(url).origin===site),host+" sitemap cross-origin loc");
  assert.equal(canonical(page),site+"/siai",host+" HTML canonical");
  alternate(page,"zh-CN","https://lingxifield.cn/siai");
  alternate(page,"en","https://lingxifield.com/en/siai");
  assert(!/noindex/i.test(String(page.headers["x-robots-tag"]??"")),host+" noindex header");
  assert(!/rel=["']?canonical/i.test(String(page.headers["link"]??"")),host+" conflicting HTTP canonical");
  if(host==="lingxifield.cn")assert.deepEqual(urls,[site+"/siai"],"CN sitemap contains mirrored duplicate paths");
  console.log("SSR SEO PASS",host,"sitemap URLs",urls.length);
 }
 const cases=[
  ["/tools/pdf-rasterize","PDF 栅格化","https://lingxifield.com/tools/pdf-rasterize"],
  ["/tools/pdf-editor","PDF","https://lingxifield.com/tools/pdf-editor"],
  ["/en/tools/pdf-editor","PDF","https://lingxifield.com/en/tools/pdf-editor"],
  ["/en/siai","SIAI","https://lingxifield.com/en/siai"]
 ];
 for(const [path,term,url] of cases){
  const page=await request(path);assert200(page,path);
  assert.equal(canonical(page),url,path+" canonical");
  const title=titleOf(page);
  assert(title.includes(term),path+" title missing task");
  assert((title.match(/LINGXIFIELD/g)||[]).length<=1,path+" repeated LINGXIFIELD");
  assert((title.match(/灵犀场/g)||[]).length<=1,path+" repeated Chinese brand");
  assert(!/noindex/i.test(String(page.headers["x-robots-tag"]??"")),path+" noindex");
  console.log("SSR TITLE PASS",path,title);
 }

 // Exhaustive Chinese tool route check: avoid misleading 200-only sitemap audits.
 const publishedTools=globalLocs.map(url=>new URL(url).pathname).filter(path=>/^\/tools\/[^/]+$/.test(path));
 assert.equal(publishedTools.length,123,"Expected all 123 canonical nonalias tool URLs");
 assert.equal(new Set(publishedTools).size,publishedTools.length,"Duplicate tool URL in XML sitemap");
 let checked=0;
 for(let i=0;i<publishedTools.length;i+=6){
  const paths=publishedTools.slice(i,i+6);
  const responses=await Promise.all(paths.map(path=>request(path)));
  for(let k=0;k<paths.length;k++){
   const path=paths[k],res=responses[k];
   assert200(res,path);
   assert.equal(canonical(res),"https://lingxifield.com"+path,"Canonical points away from published tool");
   assert(!/noindex/i.test(String(res.headers["x-robots-tag"]||"")),"Tool accidentally noindexed: "+path);
   const title=titleOf(res);
   assert((title.match(/LINGXIFIELD/g)||[]).length<=1,"Duplicate brand in "+path);
   assert((title.match(/灵犀场/g)||[]).length<=1,"Duplicate Chinese brand in "+path);
   checked++;
  }
 }
 assert.equal(checked,123);
 console.log("SSR FULL CHINESE TOOL COVERAGE PASS",checked);
 // Representative localized directories and rankings, not just English.
 for(const lang of ["en","ja","ko","fr","de","es","pt","ar"]){
  for(const path of ["/"+lang+"/tools","/"+lang+"/siai"]){
   const res=await request(path);
   assert200(res,path);
   assert.equal(canonical(res),"https://lingxifield.com"+path,"Localized canonical mismatch");
   assert(!/noindex/i.test(String(res.headers["x-robots-tag"]||"")),"Localized page noindex "+path);
   titleOf(res);
  }
 }
 console.log("SSR ALL 8 LOCALIZED TOOLS AND SIAI ROUTES PASS",16);
 const moved=await request("/tools/image-to-pdf-pro");
 assert([301,307,308].includes(moved.status),"Deprecated tool alias must redirect permanently");
 const location=String(moved.headers.location||"");
 assert(location.includes("/tools/image-to-pdf"),"Alias must point to real image to PDF tool");
 const privateMeta=await request("/sasi/pricing");
 assert(![301,302,307,308,404,500].includes(privateMeta.status),"Unexpected pricing response");
 assert(/noindex/.test(String(privateMeta.headers["x-robots-tag"]||"")+privateMeta.body),"SASI balance must not be indexable");
 console.log("PRODUCTION_SSR_SEO_GATE=PASS");
}
try{await run()}catch(err){
 console.error(err);console.error(output);process.exitCode=1
}finally{child.kill("SIGTERM")}
