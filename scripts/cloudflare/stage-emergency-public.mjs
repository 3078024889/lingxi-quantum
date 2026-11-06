#!/usr/bin/env node
/**
 * CI-only emergency public website build: isolate unverified backend routes.
 * All original route handlers are SHA256-copied to RUNNER_TEMP before isolation.
 * Do not use this output for paid, authenticated or full-feature site traffic.
 */
import {readdirSync,lstatSync,existsSync,mkdirSync,copyFileSync,readFileSync,writeFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {join,resolve,relative,dirname,sep} from "node:path";
import {pathToFileURL} from "node:url";

export const SAFE_PUBLIC_GET_ROUTES=Object.freeze([
  "app/api/health/route.ts",
  "app/api/public/qr-code/route.ts",
  "app/api/public/siai-widget/route.ts",
  "app/api/sasi/capabilities/route.ts",
]);
const SAFE_ROUTE_SET=new Set(SAFE_PUBLIC_GET_ROUTES);
const FALLBACK_CODE = `// CLOUD_PREVIEW_ONLY. Fail closed: NO wallet, charge, storage mutation or provider request.
export const runtime="edge";
export const dynamic="force-dynamic";
function unavailable(){
 return new Response(JSON.stringify({error:"PUBLIC_PREVIEW_BACKEND_DISABLED",status:"unavailable"}),{
  status:503,headers:{"content-type":"application/json; charset=utf-8",
    "cache-control":"private, no-store","x-lingxi-preview":"no-backend"}
 });
}
export const GET=unavailable;
export const POST=unavailable;
export const PUT=unavailable;
export const PATCH=unavailable;
export const DELETE=unavailable;
export const HEAD=unavailable;
export const OPTIONS=unavailable;
`;
function inside(root,file){return file.startsWith(root+sep);}
function listRoutes(path,results=[]){
 if(!existsSync(path))return results;
 for(const entry of readdirSync(path,{withFileTypes:true})){
  const full=join(path,entry.name),stat=lstatSync(full);
  if(stat.isSymbolicLink())throw Error("SYMLINK_IN_API_TREE");
  if(stat.isDirectory())listRoutes(full,results);
  else if(stat.isFile()&&/^route\.(?:js|ts)$/.test(entry.name))results.push(full);
 }
 return results;
}
const digest=data=>createHash("sha256").update(data).digest("hex");
export function stageEmergencyPublic({repoRoot,stagingRoot,minRoutes=150,
  preserve=SAFE_PUBLIC_GET_ROUTES}){
 const root=resolve(repoRoot),stage=resolve(stagingRoot),api=join(root,"app","api");
 if(!existsSync(api)||!lstatSync(api).isDirectory())throw Error("API_TREE_NOT_FOUND");
 if(stage===root||inside(root,stage)||inside(stage,root))throw Error("STAGING_ROOT_OVERLAP");
 const routes=listRoutes(api).sort();
 if(routes.length<minRoutes)throw Error("ROUTE_COUNT_UNDER_MINIMUM");
 if(!Array.isArray(preserve)||!preserve.length||preserve.some(p=>!SAFE_ROUTE_SET.has(p)))
   throw Error("NON_ALLOWLISTED_LIVE_ROUTE");
 const keep=new Set(preserve);
 for(const name of preserve){
  if(!routes.some(x=>relative(root,x).split(sep).join("/")===name))throw Error("PRESERVED_ROUTE_MISSING");
 }
 // Fail closed if a reviewed read-only endpoint begins to accept mutations.
 for(const path of keep){
  const entry=routes.find(x=>relative(root,x).split(sep).join("/")===path);
  const source=readFileSync(entry,"utf8");
  if(/\bexport\s+(?:(?:async|const)\s+)?(?:function\s+)?(?:POST|PUT|PATCH|DELETE)\b/.test(source))
    throw Error("ALLOWED_PUBLIC_ROUTE_BECAME_MUTATING:"+path);
 }
 if(existsSync(stage))throw Error("STAGING_ALREADY_EXISTS");
 const manifest=[];
 const masked=routes.filter(file=>!keep.has(relative(root,file).split(sep).join("/")));
 const original=masked.map(file=>({file,content:readFileSync(file)}));
 // Back up all original bytes before touching any route; preserve SHA256 and path.
 mkdirSync(stage,{recursive:true});
 try{
  for(const row of original){
   const path=relative(root,row.file).split(sep).join("/");
   const backup=join(stage,path);
   if(!inside(stage,resolve(backup)))throw Error("BACKUP_PATH_INVALID");
   mkdirSync(dirname(backup),{recursive:true});
   copyFileSync(row.file,backup);
   if(digest(readFileSync(backup))!==digest(row.content))throw Error("BACKUP_HASH_MISMATCH");
   manifest.push({path,sha256:digest(row.content),bytes:row.content.length});
  }
  for(const row of original)writeFileSync(row.file,FALLBACK_CODE);
  return {mode:"emergency-public-only",apiRoutes:routes.length,
   disabledRoutes:masked.length,preserved:[...keep],files:manifest,
   productionReady:false,backendOperational:false,cloudflareDeployed:false,
   warning:"Public-only preview: authenticated, billing, generation and upload APIs intentionally return HTTP 503"};
 }catch(err){
  for(const row of original)writeFileSync(row.file,row.content);
  throw err;
 }
}
function arg(args,name){const n=args.indexOf(name);return n<0?null:args[n+1]}
async function main(args=process.argv.slice(2)){
 if(!args.includes("--ci-stage")||process.env.GITHUB_ACTIONS!=="true"||
   process.env.CI!=="true"||!process.env.RUNNER_TEMP)
   throw Error("CI_ONLY_NO_PRODUCTION_MUTATION");
 const root=arg(args,"--root"),stage=arg(args,"--stage"),file=arg(args,"--json");
 if(!root||!stage||!file)throw Error("ROOT_STAGE_REPORT_REQUIRED");
 const runner=resolve(process.env.RUNNER_TEMP),dest=resolve(stage);
 if(!inside(runner,dest))throw Error("STAGING_MUST_BE_WITHIN_RUNNER_TEMP");
 const report=stageEmergencyPublic({repoRoot:root,stagingRoot:dest});
 writeFileSync(resolve(file),JSON.stringify(report,null,2)+"\n",{mode:0o600});
 console.log(JSON.stringify({apiRoutes:report.apiRoutes,disabledRoutes:report.disabledRoutes,
  preserved:report.preserved,productionReady:report.productionReady,cloudflareDeployed:false}));
 return 0;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 main().then(code=>{process.exitCode=code}).catch(e=>{console.error("EMERGENCY_BUILD_FAILED",e.message);process.exitCode=1});
}
