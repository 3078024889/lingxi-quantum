import fs from "node:fs";import os from "node:os";import path from "node:path";

function roots(){
 const configured=(process.env.LINGXI_ENGINE_WORK_ROOT||"").trim();
 const xs=[os.tmpdir(),process.cwd()];
 if(configured)xs.unshift(path.resolve(configured));
 return xs.map(x=>path.resolve(x));
}
export function assertSafeLocalPath(value:string,mode:"read"|"write"){
 const p=path.resolve(value);
 const ok=roots().some(root=>p===root||p.startsWith(root+path.sep));
 if(!ok)throw new Error("ENGINE_PATH_OUTSIDE_WORK_ROOT");
 if(mode==="read"){
  if(!fs.existsSync(p))throw new Error("ENGINE_INPUT_NOT_FOUND");
  const st=fs.statSync(p);if(!st.isFile())throw new Error("ENGINE_INPUT_NOT_FILE");
 }
 if(mode==="write")fs.mkdirSync(path.dirname(p),{recursive:true});
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
  const p=path.resolve(String(args.outputDir));const ok=roots().some(root=>p===root||p.startsWith(root+path.sep));
  if(!ok)throw new Error("ENGINE_PATH_OUTSIDE_WORK_ROOT");fs.mkdirSync(p,{recursive:true});
 }
}
