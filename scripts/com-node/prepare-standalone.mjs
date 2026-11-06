#!/usr/bin/env node
/**
 * Isolated, read-only-copy Next.js Node standalone packaging.
 * Resolves pnpm symlinks into the target to avoid borrowing the build host's
 * original node_modules (a previous false-positive deployment acceptance).
 * CI-only command never deploys or touches production DNS.
 */
import {cpSync,existsSync,lstatSync,realpathSync,readdirSync,mkdirSync,readFileSync,writeFileSync,rmSync} from "node:fs";
import {resolve,join,relative,sep,dirname} from "node:path";
import {pathToFileURL} from "node:url";

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
export function prepareNodeBundle({projectRoot,outputRoot,copyPublic=true}){
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
  cpSync(standalone,dest,{recursive:true,dereference:true,force:false,verbatimSymlinks:false});
  mkdirSync(join(dest,".next"),{recursive:true});
  cpSync(assets,join(dest,".next","static"),{recursive:true,dereference:true});
  if(copyPublic)cpSync(pub,join(dest,"public"),{recursive:true,dereference:true});
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
   originalBuildUnchanged:true,productionReady:false,serverEntry:"server.js"};
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
 const report=prepareNodeBundle({projectRoot:project,outputRoot:output});
 console.log(JSON.stringify(report));
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)
 main().catch(e=>{console.error("COM_NODE_PACKAGE_FAILED",e.message);process.exitCode=1});
