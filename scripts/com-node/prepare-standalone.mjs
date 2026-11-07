#!/usr/bin/env node
/**
 * Isolated, read-only-copy Next.js Node standalone packaging.
 * Resolves pnpm symlinks into the target to avoid borrowing the build host's
 * original node_modules (a previous false-positive deployment acceptance).
 * CI-only command never deploys or touches production DNS.
 */
import {copyFileSync,chmodSync,readFileSync,existsSync,lstatSync,realpathSync,readdirSync,mkdirSync,writeFileSync,rmSync} from "node:fs";
import {resolve,join,relative,sep,dirname} from "node:path";
import {pathToFileURL} from "node:url";
import {createRequire} from "node:module";

function under(root,file){return file===root||file.startsWith(root+sep)}
function scanSymlinks(root,repoRoot){
 const visited=new Set();
 function visit(path){
  const st=lstatSync(path);
  if(st.isSymbolicLink()){
   const target=realpathSync(path);
   if(!under(repoRoot,target))throw Error("STANDALONE_SYMLINK_ESCAPE:"+relative(root,path));
   return;
  }
  if(!st.isDirectory())return;
  const real=realpathSync(path);
  if(visited.has(real))return;
  visited.add(real);
  for(const item of readdirSync(path))visit(join(path,item));
 }
 visit(root);
}
// Explicit source-driven copy: unlike fs.cpSync, there is NO platform-dependent
// symlink handling. A source symlink is resolved, verified, then materialized
// into an actual file or directory at the isolated destination.
function copyDereferenced(source,dest,repoRoot,ancestors=new Set()){
 const st=lstatSync(source);
 if(st.isSymbolicLink()){
  const target=realpathSync(source);
  if(!under(repoRoot,target))throw Error("STANDALONE_SYMLINK_ESCAPE");
  if(ancestors.has(target))throw Error("STANDALONE_SYMLINK_CYCLE");
  const next=new Set(ancestors);next.add(target);
  copyDereferenced(target,dest,repoRoot,next);
  return;
 }
 if(st.isDirectory()){
  mkdirSync(dest,{recursive:true});
  for(const name of readdirSync(source))
   copyDereferenced(join(source,name),join(dest,name),repoRoot,ancestors);
 }else if(st.isFile()){
  mkdirSync(dirname(dest),{recursive:true});
  copyFileSync(source,dest);
  chmodSync(dest,st.mode & 0o777);
 }else throw Error("STANDALONE_UNSUPPORTED_ENTRY");
}

/**
 * Next.js loads late-bound packages through require-hook.js. @vercel/nft can
 * miss them in pnpm's isolated store. Resolve the installed Next package
 * dependencies from the frozen source lockfile and materialize any missing
 * packages (and their own dependencies) in the isolated runtime.
 */
function closeNextRuntimeDependencies(projectRoot,dest){
 const nextEntry=join(projectRoot,"node_modules","next","package.json");
 if(!existsSync(nextEntry))throw Error("NEXT_INSTALLED_PACKAGE_NOT_FOUND");
 const realNext=realpathSync(nextEntry);
 if(!under(projectRoot,realNext))throw Error("NEXT_PACKAGE_PATH_ESCAPES_PROJECT");
 const next=JSON.parse(readFileSync(realNext,"utf8"));
 if(next.name!=="next"||!next.dependencies||typeof next.dependencies!=="object")
  throw Error("NEXT_RUNTIME_DEPENDENCIES_INVALID");
 const copied=[],visiting=new Set();
 function ensure(name,issuer){
  if(!/^(?:@[a-z0-9._-]+\/)?[a-z0-9._-]+$/i.test(name)||name==="."||name==="..")
   throw Error("INVALID_RUNTIME_DEPENDENCY_NAME");
  const destPkg=join(dest,"node_modules",...name.split("/"));
  if(existsSync(destPkg))return;
  if(visiting.has(name))throw Error("NEXT_RUNTIME_DEPENDENCY_CYCLE:"+name);
  visiting.add(name);
  try{
   const req=createRequire(issuer);
   let pkgFile;
   try{pkgFile=req.resolve(name+"/package.json");}
   catch{
    let loc=req.resolve(name);
    for(let steps=0;steps<16;steps++){
     const candidate=join(dirname(loc),"package.json");
     if(existsSync(candidate)&&JSON.parse(readFileSync(candidate,"utf8")).name===name){
      pkgFile=candidate;break;
     }
     loc=dirname(loc);
     if(!under(projectRoot,loc))break;
    }
    if(!pkgFile)throw Error("NEXT_RUNTIME_PACKAGE_JSON_NOT_RESOLVABLE:"+name);
   }
   const actual=realpathSync(pkgFile);
   if(!under(projectRoot,actual))throw Error("NEXT_RUNTIME_DEPENDENCY_ESCAPES_PROJECT:"+name);
   const pkg=JSON.parse(readFileSync(actual,"utf8"));
   if(pkg.name!==name)throw Error("NEXT_RUNTIME_RESOLVED_PACKAGE_MISMATCH:"+name);
   copyDereferenced(dirname(actual),destPkg,projectRoot);
   copied.push(name);
   for(const dep of Object.keys(pkg.dependencies||{}))ensure(dep,actual);
  }finally{visiting.delete(name)}
 }
 for(const name of Object.keys(next.dependencies))ensure(name,realNext);
 for(const name of ["react","react-dom"])ensure(name,realNext);
 return copied;
}

export function prepareNodeBundle({projectRoot,outputRoot,copyPublic=true,sourceSha=null}){
 if(sourceSha!==null&&!/^[0-9a-f]{40}$/.test(sourceSha))throw Error("SOURCE_SHA_INVALID");
 const root=realpathSync(resolve(projectRoot)),dest=resolve(outputRoot);
 if(under(root,dest)||under(dest,root))throw Error("STANDALONE_OUTPUT_MUST_BE_ISOLATED");
 const standalone=resolve(root,".next","standalone"),assets=resolve(root,".next","static"),pub=resolve(root,"public");
 if(!existsSync(join(standalone,"server.js"))||!existsSync(assets)||
    (copyPublic&&!existsSync(pub)))throw Error("NEXT_STANDALONE_BUILD_NOT_FOUND");
 if(existsSync(dest))throw Error("STANDALONE_STAGE_ALREADY_EXISTS");
 // Inspect links *before* dereferencing to prevent accidental external file inclusion.
 scanSymlinks(standalone,root);
 scanSymlinks(assets,root);
 if(copyPublic)scanSymlinks(pub,root);
 try{
  mkdirSync(dirname(dest),{recursive:true});
  copyDereferenced(standalone,dest,root);
  mkdirSync(join(dest,".next"),{recursive:true});
  copyDereferenced(assets,join(dest,".next","static"),root);
  if(copyPublic)copyDereferenced(pub,join(dest,"public"),root);
  const runtimeDependenciesMaterialized=closeNextRuntimeDependencies(root,dest);
  // The runtime must contain only genuine files, not pnpm links back to source.
  function ensureNoLinks(dir){
   for(const item of readdirSync(dir,{withFileTypes:true})){
    const full=join(dir,item.name),st=lstatSync(full);
    if(st.isSymbolicLink())throw Error("ISOLATED_RUNTIME_HAS_SYMLINK:"+relative(dest,full));
    if(st.isDirectory())ensureNoLinks(full);
   }
  }
  ensureNoLinks(dest);
  const entry=join(dest,"server.js"),packageDir=join(dest,"node_modules");
  if(!existsSync(entry)||!existsSync(packageDir))throw Error("ISOLATED_RUNTIME_MISSING_SERVER_OR_MODULES");
  const report={mode:"next-standalone-node",isolation:true,publicCopied:copyPublic,
   nodeModulesIncluded:true,hadExternalSymlinks:false,
   runtimeDependenciesMaterialized,
   originalBuildUnchanged:true,productionReady:false,serverEntry:"server.js",sourceSha};
  writeFileSync(join(dest,"lingxi-com-candidate-report.json"),JSON.stringify(report,null,2)+"\n");
  return report;
 }catch(err){rmSync(dest,{recursive:true,force:true});throw err}
}
function opt(args,key){const i=args.indexOf(key);return i<0?null:args[i+1]}
async function main(args=process.argv.slice(2)){
 if(!args.includes("--ci-stage")||process.env.GITHUB_ACTIONS!=="true"||
    process.env.CI!=="true"||!process.env.RUNNER_TEMP)
    throw Error("COM_NODE_CI_ONLY_NO_PRODUCTION_MUTATION");
 const output=opt(args,"--output"),project=opt(args,"--project");
 const tmp=realpathSync(process.env.RUNNER_TEMP);
 if(!output||!project||!under(tmp,resolve(output)))throw Error("COM_NODE_OUTPUT_MUST_BE_RUNNER_TEMP");
 const report=prepareNodeBundle({projectRoot:project,outputRoot:output,sourceSha:process.env.GITHUB_SHA||null});
 console.log(JSON.stringify(report));
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)
 main().catch(e=>{console.error("COM_NODE_PACKAGE_FAILED",e.message);process.exitCode=1});
