import {spawn} from "node:child_process";
export type CommandResult={code:number;stdout:string;stderr:string;elapsedMs:number};
export async function runCommand(
 command:string,
 args:string[],
 opts?:{cwd?:string;timeoutMs?:number;env?:NodeJS.ProcessEnv;maxOutputBytes?:number;acceptCodes?:number[];stdin?:string|Buffer}
):Promise<CommandResult>{
 const started=Date.now(),timeoutMs=opts?.timeoutMs??30000,max=opts?.maxOutputBytes??1024*1024,accept=new Set(opts?.acceptCodes??[0]);
 if(!command)throw new Error("ENGINE_COMMAND_NOT_CONFIGURED");
 return new Promise((resolve,reject)=>{
  let out="",err="",killed=false,settled=false;
  const child=spawn(command,args,{cwd:opts?.cwd,env:{...process.env,...opts?.env},windowsHide:true,shell:false,stdio:["pipe","pipe","pipe"]});
  const timer=setTimeout(()=>{killed=true;child.kill("SIGKILL")},timeoutMs);
  const add=(cur:string,b:Buffer)=>{const s=cur+b.toString("utf8");return Buffer.byteLength(s,"utf8")>max?s.slice(-Math.max(1024,Math.floor(max/2))):s};
  const done=(fn:()=>void)=>{if(settled)return;settled=true;clearTimeout(timer);fn()};
  child.stdout?.on("data",(b:Buffer)=>out=add(out,b));
  child.stderr?.on("data",(b:Buffer)=>err=add(err,b));
  child.on("error",e=>done(()=>reject(e)));
  child.on("close",code=>done(()=>{
    const r={code:code??-1,stdout:out,stderr:err,elapsedMs:Date.now()-started};
    if(killed)return reject(new Error(`ENGINE_TIMEOUT:${command}`));
    if(!accept.has(r.code))return reject(new Error(`ENGINE_EXIT_${r.code}:${command}:${(err||out).slice(-4000)}`));
    resolve(r);
  }));
  if(opts?.stdin!==undefined){child.stdin?.end(opts.stdin)}else child.stdin?.end();
 });
}
export function commandFor(envName:string|undefined,defaultCommand:string|undefined){return (envName&&process.env[envName])||defaultCommand||"";}
