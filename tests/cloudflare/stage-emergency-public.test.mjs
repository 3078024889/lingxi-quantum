import test from "node:test";
import assert from "node:assert/strict";
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,rmSync,existsSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {createHash} from "node:crypto";
import {stageEmergencyPublic,SAFE_PUBLIC_GET_ROUTES} from "../../scripts/cloudflare/stage-emergency-public.mjs";

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
  const report=stageEmergencyPublic({repoRoot:root,stagingRoot:stage,minRoutes:3,preserve:["app/api/health/route.ts"]});
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

test("only source-audited public GET routes survive isolation",()=>{
 const root=mkdtempSync(join(tmpdir(),"com-keep-")),stage=join(root+"-stage","api");
 try{
  for(const path of SAFE_PUBLIC_GET_ROUTES)make(root,path,'export const GET=()=>Response.json({ok:true});');
  const pay=make(root,"app/api/pay/create/route.ts",'export const POST=()=>Response.json({charged:true});');
  const report=stageEmergencyPublic({repoRoot:root,stagingRoot:stage,minRoutes:5});
  assert.deepEqual(report.preserved,SAFE_PUBLIC_GET_ROUTES);
  assert.equal(report.disabledRoutes,1);
  assert.match(readFileSync(pay,"utf8"),/PUBLIC_PREVIEW_BACKEND_DISABLED/);
  assert.match(readFileSync(join(root,"app/api/public/siai-widget/route.ts"),"utf8"),/ok:true/);
 }finally{rmSync(root,{recursive:true,force:true});rmSync(root+"-stage",{recursive:true,force:true})}
});
test("rejects a formerly safe endpoint that adds POST",()=>{
 const root=mkdtempSync(join(tmpdir(),"com-keep-unsafe-")),stage=join(root+"-stage","api");
 try{
  for(const path of SAFE_PUBLIC_GET_ROUTES)make(root,path,'export const GET=()=>Response.json({ok:true});');
  make(root,"app/api/public/qr-code/route.ts","export async function POST(){return Response.json({mutated:true})}");
  assert.throws(()=>stageEmergencyPublic({repoRoot:root,stagingRoot:stage,minRoutes:4}),/ALLOWED_PUBLIC_ROUTE_BECAME_MUTATING/);
  assert.equal(existsSync(stage),false);
 }finally{rmSync(root,{recursive:true,force:true});rmSync(root+"-stage",{recursive:true,force:true})}
});
test("never lets the caller preserve a payment endpoint",()=>{
 const root=mkdtempSync(join(tmpdir(),"com-keep-payment-")),stage=join(root+"-stage","api");
 try{
  make(root,"app/api/health/route.ts",'export const GET=()=>Response.json({ok:true});');
  make(root,"app/api/pay/create/route.ts",'export const POST=()=>Response.json({charged:true});');
  assert.throws(()=>stageEmergencyPublic({repoRoot:root,stagingRoot:stage,minRoutes:2,
   preserve:["app/api/health/route.ts","app/api/pay/create/route.ts"]}),/NON_ALLOWLISTED_LIVE_ROUTE/);
  assert.equal(existsSync(stage),false);
 }finally{rmSync(root,{recursive:true,force:true});rmSync(root+"-stage",{recursive:true,force:true})}
});
