import test from "node:test";
import assert from "node:assert/strict";
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,rmSync,existsSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {createHash} from "node:crypto";
import {stageEmergencyPublic} from "../../scripts/cloudflare/stage-emergency-public.mjs";

const make=(dir,name,content)=>{
 const file=join(dir,name);mkdirSync(file.slice(0,file.lastIndexOf("/")),{recursive:true});
 writeFileSync(file,content);return file;
};
test("backups are byte exact, preview API rejects every method with 503",async()=>{
 const root=mkdtempSync(join(tmpdir(),"com-public-preview-"));
 try {
  const health=make(root,"app/api/health/route.ts","export const GET=()=>Response.json({ok:true});");
  const pay=make(root,"app/api/pay/create/route.ts",'import {charge} from "private-payments"; export const POST=charge;');
  const batch=make(root,"app/api/sasi/video/route.ts",'export const POST=()=>{throw Error("provider");}');
  const original=readFileSync(pay);
  const stage=join(root+"-stage","backup");
  const report=stageEmergencyPublic({repoRoot:root,stagingRoot:stage,minRoutes:3});
  assert.equal(report.disabledRoutes,2);
  assert.equal(report.apiRoutes,3);
  assert.equal(report.productionReady,false);
  assert.equal(report.backendOperational,false);
  assert.match(readFileSync(pay,"utf8"),/PUBLIC_PREVIEW_BACKEND_DISABLED/);
  assert.match(readFileSync(batch,"utf8"),/status:503/);
  assert.match(readFileSync(health,"utf8"),/ok:true/);
  const backup=readFileSync(join(stage,"app/api/pay/create/route.ts"));
  assert.deepEqual(backup,original);
  assert.equal(report.files.find(x=>x.path==="app/api/pay/create/route.ts").sha256,
    createHash("sha256").update(original).digest("hex"));
  rmSync(root+"-stage",{recursive:true,force:true});
 }finally{rmSync(root,{recursive:true,force:true})}
});
test("fails without expected health route, before writing any user source",()=>{
 const root=mkdtempSync(join(tmpdir(),"com-public-invalid-"));
 try{
  const file=make(root,"app/api/pay/route.ts","UNCHANGED");
  assert.throws(()=>stageEmergencyPublic({repoRoot:root,stagingRoot:join(root+"-backup","a"),minRoutes:1}),/PRESERVED_ROUTE_MISSING/);
  assert.equal(readFileSync(file,"utf8"),"UNCHANGED");
 }finally{rmSync(root,{recursive:true,force:true})}
});
