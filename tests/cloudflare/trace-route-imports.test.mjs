import test from "node:test";
import assert from "node:assert/strict";
import {mkdtempSync,mkdirSync,writeFileSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {scanApiRoutes} from "../../scripts/cloudflare/trace-route-imports.mjs";
const put=(root,path,content)=>{
 const file=join(root,path),dir=file.substring(0,file.lastIndexOf("/"));
 mkdirSync(dir,{recursive:true});writeFileSync(file,content);
};
test("traces native sharp and child_process through aliased re-export and cycles",()=>{
 const root=mkdtempSync(join(tmpdir(),"cf-routes-"));
 try{
  put(root,"app/api/sasi/archive/route.ts",'import {archive} from "@/lib/bridge"; export const POST=archive;');
  put(root,"lib/bridge.ts",'export {archive} from "./archive";');
  put(root,"lib/archive.ts",'import sharp from "sharp"; import {spawn} from "node:child_process"; import "./bridge"; export const archive=()=>0;');
  put(root,"app/api/public/route.ts",'import type {Foo} from "@/lib/archive"; import "server-only"; export const GET=()=>0;');
  const report=scanApiRoutes(root);
  assert.equal(report.apiRoutes,2);
  assert.equal(report.signaledRoutes,1);
  assert.equal(report.counts.native_sharp,1);
  assert.equal(report.counts.native_node_io,1);
  const heavy=report.routes.find(r=>r.route.includes("/sasi/"));
  assert(heavy.dependenciesScanned>=3);
  assert.equal(heavy.signals.find(s=>s.kind==="native_sharp").at,"lib/archive.ts");
  assert.equal(report.releaseReady,false);
 }finally{rmSync(root,{recursive:true,force:true});}
});
test("does not infer safety from missing route directory",()=>{
 const root=mkdtempSync(join(tmpdir(),"cf-routes-empty-"));
 try{const report=scanApiRoutes(root);assert.equal(report.apiRoutes,0);assert.equal(report.releaseReady,false);}
 finally{rmSync(root,{recursive:true,force:true});}
});
