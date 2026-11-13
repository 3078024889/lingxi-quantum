#!/usr/bin/env node
/**
 * Dependency-path inventory for the .com Cloudflare migration.
 * Scans literal imports only; a green result is NOT proof of Worker compatibility.
 * It never changes production data, network routes or files except --json output.
 */
import {existsSync,readdirSync,readFileSync,lstatSync,writeFileSync} from "node:fs";
import {join,dirname,relative,resolve,sep} from "node:path";
import {pathToFileURL} from "node:url";

const CODE_EXTS=[".ts",".tsx",".js",".jsx",".mjs",".cjs"];
const FILE_IMPORT=/\b(?:import|export)\s+(?!type\s+)(?:[^;'"]{0,150}?\s+from\s*)?["']([^"']+)["']/g;
const FUNCTION_IMPORT=/\b(?:import|require)\s*\(\s*["']([^"']+)["']\s*\)/g;
const NATIVE_IMPORTS=[
  {pattern:/^(?:node:)?(?:fs|fs\/promises|child_process|worker_threads|net|tls)$/,kind:"native_node_io"},
  {pattern:/^sharp(?:\/|$)/,kind:"native_sharp"},
  {pattern:/^onnxruntime-node(?:\/|$)/,kind:"native_onnx"},
  {pattern:/^(?:@ffmpeg\/|fluent-ffmpeg$)/,kind:"heavy_media_dependency"},
  {pattern:/^(?:qpdf-run)(?:\/|$)/,kind:"heavy_pdf_dependency"},
];
function walk(dir,output=[]){
  if(!existsSync(dir))return output;
  for(const ent of readdirSync(dir,{withFileTypes:true})){
    const file=join(dir,ent.name);
    const stat=lstatSync(file);if(stat.isSymbolicLink())continue;
    if(stat.isDirectory())walk(file,output);
    else if(stat.isFile()&&/(?:^|\/)route\.[cm]?[jt]sx?$/.test(file.replaceAll("\\","/")))output.push(file);
  }
  return output;
}
function importsOf(source){
  const found=new Set();
  for(const pattern of [FILE_IMPORT,FUNCTION_IMPORT]){
    pattern.lastIndex=0;let m;
    while((m=pattern.exec(source))!==null)found.add(m[1]);
  }
  return [...found];
}
function resolveModule(root,from,spec){
  let target;
  if(spec.startsWith("@/"))target=resolve(root,spec.slice(2));
  else if(spec.startsWith("."))target=resolve(dirname(from),spec);
  else return null;
  if(!target.startsWith(root+sep))return null;
  const candidates=[target,...CODE_EXTS.map(ext=>target+ext),...CODE_EXTS.map(ext=>join(target,"index"+ext))];
  for(const c of candidates){
    if(!existsSync(c))continue;
    const s=lstatSync(c);
    if(s.isFile()&&!s.isSymbolicLink())return c;
  }
  return null;
}
export function scanApiRoutes(repoRoot){
  const root=resolve(repoRoot);const routes=walk(join(root,"app","api")).sort();
  const cache=new Map();let unknown=0;
  function deps(file){
    if(cache.has(file))return cache.get(file);
    const result=importsOf(readFileSync(file,"utf8"));cache.set(file,result);return result;
  }
  const reports=[];
  for(const route of routes){
    const pending=[route],seen=new Set(),signals=[],unresolved=[];
    while(pending.length){
      const file=pending.pop();
      if(seen.has(file))continue;seen.add(file);
      if(seen.size>12000){unresolved.push("GRAPH_BOUND_EXCEEDED");break;}
      let imports;try{imports=deps(file)}catch{unresolved.push("SOURCE_READ_FAILED");continue;}
      for(const spec of imports){
        for(const check of NATIVE_IMPORTS)if(check.pattern.test(spec))
          signals.push({kind:check.kind,at:relative(root,file).replaceAll("\\","/"),import:spec});
        const local=resolveModule(root,file,spec);
        if(local&&!seen.has(local))pending.push(local);
        if((spec.startsWith("@/")||spec.startsWith("."))&&!local)
          unresolved.push(spec);
      }
    }
    reports.push({route:relative(root,route).replaceAll("\\","/"),
      dependenciesScanned:seen.size,signals,unresolvedImports:[...new Set(unresolved)].slice(0,50)});
    unknown+=unresolved.length;
  }
  const signaled=reports.filter(r=>r.signals.length>0);
  const counts=Object.fromEntries(NATIVE_IMPORTS.map(c=>[c.kind,signaled.filter(r=>r.signals.some(s=>s.kind===c.kind)).length]));
  return{schemaVersion:1,sourceOnly:true,releaseReady:false,apiRoutes:routes.length,
    signaledRoutes:signaled.length,counts,unresolvedImportCount:unknown,
    routes:reports,note:"Literal import tracing cannot certify runtime compatibility or dynamic code paths."};
}
export function main(args=process.argv.slice(2)){
  const i=args.indexOf("--root");const root=i<0?process.cwd():args[i+1];
  if(!root||root.startsWith("--"))throw Error("ROOT_REQUIRED");
  const report=scanApiRoutes(root);
  const j=args.indexOf("--json");if(j>=0){
    if(!args[j+1]||args[j+1].startsWith("--"))throw Error("REPORT_PATH_REQUIRED");
    writeFileSync(resolve(args[j+1]),JSON.stringify(report,null,2)+"\n");
  }
  const flagged=report.routes.filter(r=>r.signals.length);
  console.log(JSON.stringify({apiRoutes:report.apiRoutes,signaledRoutes:report.signaledRoutes,
    counts:report.counts,unresolvedImportCount:report.unresolvedImportCount,
    nativeSharpRoutes:flagged.filter(r=>r.signals.some(s=>s.kind==='native_sharp')).map(r=>r.route),
    examples:flagged.slice(0,12).map(r=>({route:r.route,kinds:[...new Set(r.signals.map(s=>s.kind))]})),
    releaseReady:report.releaseReady},null,2));
  return args.includes("--require-no-native")&&report.signaledRoutes>0?1:0;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  try{process.exitCode=main();}catch(e){console.error("API_GRAPH_AUDIT_FAILED",e.message);process.exitCode=1;}
}
