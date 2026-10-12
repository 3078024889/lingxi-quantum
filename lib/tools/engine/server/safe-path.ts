import fs from "node:fs";import os from "node:os";import path from "node:path";

function roots(){
 const configured=(process.env.LINGXI_ENGINE_WORK_ROOT||"").trim();
 // Engine paths never include the application source tree or the shared temp root.
 const root=path.resolve(configured||path.join(os.tmpdir(),'lingxi-engine-work'));
 fs.mkdirSync(root,{recursive:true,mode:0o700});
 const real=fs.realpathSync(root);
 if(path.relative(root,real)!=='')throw new Error('ENGINE_WORK_ROOT_SYMLINK_DENIED');
 return [real];
}
function assertNoSymlinks(p:string){
 let current=path.parse(p).root;
 for(const part of p.slice(current.length).split(path.sep).filter(Boolean)){
  current=path.join(current,part);
  try{if(fs.lstatSync(current).isSymbolicLink())throw new Error('ENGINE_PATH_SYMLINK_DENIED')}
  catch(error){if((error as NodeJS.ErrnoException).code==='ENOENT')return;throw error}
 }
}
export function assertSafeLocalPath(value:string,mode:"read"|"write"){
 const p=path.resolve(value);
 const ok=roots().some(root=>p===root||p.startsWith(root+path.sep));
 if(!ok)throw new Error("ENGINE_PATH_OUTSIDE_WORK_ROOT");
 assertNoSymlinks(p);
 if(mode==="read"){
  if(!fs.existsSync(p))throw new Error("ENGINE_INPUT_NOT_FOUND");
  const st=fs.statSync(p);if(!st.isFile())throw new Error("ENGINE_INPUT_NOT_FILE");
 }
 if(mode==="write"){
  if(roots().includes(p))throw new Error('ENGINE_OUTPUT_ROOT_DENIED');
  fs.mkdirSync(path.dirname(p),{recursive:true});
  assertNoSymlinks(p);
 }
 return p;
}
export function validatePathArgs(args:Record<string,unknown>){
 for(const k of ["input","mask"]){
  if(typeof args[k]==="string")assertSafeLocalPath(String(args[k]),"read");
 }
 for(const k of ["output","outputBase"]){
  if(typeof args[k]==="string")assertSafeLocalPath(String(args[k]),"write");
 }
 if(Array.isArray(args.inputs))for(const v of args.inputs)if(typeof v==="string")assertSafeLocalPath(v,"read");
 if(typeof args.outputDir==="string"){
  const p=path.resolve(String(args.outputDir));
  assertSafeLocalPath(path.join(p,'.lingxi-write-check'),'write');
  fs.mkdirSync(p,{recursive:true});assertNoSymlinks(p);
 }
}
