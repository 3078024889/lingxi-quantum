#!/usr/bin/env node
// Lingxifield CN 3188 Supabase public runtime recovery.
// --plan never mutates. --apply backs up env, restarts only 3188, validates, and rolls back.
// Approved 2026-11-07 SHA256 fingerprints are PUBLIC keys of one connected Supabase project.
// No DNS, Cloudflare, Vercel, Nginx, SQL, privileged keys, payments or 3189 modification.
import fs from "node:fs";
import crypto from "node:crypto";
import {parseEnv} from "node:util";
import {spawnSync} from "node:child_process";
import {pathToFileURL} from "node:url";

const PROJECT="https://sxsgdpqojepgbbrxrzlq.supabase.co";
const APPROVED=Object.freeze({
  "7e64ae3262e81afe7c4a8d7df70e957a43d0bbb22c9186a15230dae5dd118860":"legacy-anon",
  "aa6d20b65cd31ee198592c7e957238f6e672baa88fd782be0da876e3b0f63dbf":"publishable",
});
const ENV="/etc/lingxifield/production.env", STAGE="/etc/lingxifield/staging.env";
const PRODUCTION="lingxifield-ecs", TEST="lingxifield-cn-stage";
const LOCK="/run/lock/lingxifield-cn-auth-recovery.lock";
const FIELDS=["NEXT_PUBLIC_SUPABASE_URL","NEXT_PUBLIC_SUPABASE_ANON_KEY"];

export function activePublicType(key) {
  if(typeof key!=="string"||key.length<20||key.length>4096 ||
     key.startsWith("sb_secret_")||key.startsWith("sb_service_"))return null;
  return APPROVED[crypto.createHash("sha256").update(key).digest("hex")]||null;
}
export function selectPublicPair(prod,stage,verifyKey=activePublicType) {
  if(prod.NEXT_PUBLIC_SUPABASE_URL && prod.NEXT_PUBLIC_SUPABASE_URL!==PROJECT)
    throw Error("PRODUCTION_PROJECT_URL_MISMATCH");
  if(stage.NEXT_PUBLIC_SUPABASE_URL!==PROJECT)throw Error("STAGING_PROJECT_URL_MISMATCH");
  const p=verifyKey(prod.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const s=verifyKey(stage.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  if(!p&&!s)throw Error("NO_CURRENT_ENABLED_PUBLIC_KEY_FOUND");
  return p
    ? {source:"production",kind:p,key:prod.NEXT_PUBLIC_SUPABASE_ANON_KEY,url:PROJECT}
    : {source:"staging",kind:s,key:stage.NEXT_PUBLIC_SUPABASE_ANON_KEY,url:PROJECT};
}
export function publicOnlyPatch(raw,selected) {
  let next=raw.replace(/\r\n/g,"\n"), before=parseEnv(raw);
  const desired={
    NEXT_PUBLIC_SUPABASE_URL:selected.url,
    NEXT_PUBLIC_SUPABASE_ANON_KEY:selected.key,
  };
  for(const name of FIELDS){
    const pattern=new RegExp("^(?:export\\s+)?"+name+"\\s*=.*$","gm");
    const matches=next.match(pattern)||[];
    if(matches.length>1)throw Error("DUPLICATE_PUBLIC_ENV_FIELD:"+name);
    if(before[name]===desired[name])continue;
    if(matches.length)next=next.replace(pattern,name+"="+desired[name]);
    else next=next.replace(/\s*$/,"")+"\n"+name+"="+desired[name]+"\n";
  }
  const after=parseEnv(next);
  for(const name of FIELDS)if(after[name]!==desired[name])throw Error("PUBLIC_ENV_PATCH_FAILED");
  for(const [k,v] of Object.entries(before))
    if(!FIELDS.includes(k) && after[k]!==v)throw Error("PRIVATE_ENV_CHANGED_STOP");
  return next;
}
function cmd(file,args,timeout=12000){
  const v=spawnSync(file,args,{encoding:"utf8",timeout,maxBuffer:65536});
  if(v.error||v.status!==0)throw Error("COMMAND_FAILED:"+args[0]);
  return v.stdout.trim();
}
function validPrivateFile(file) {
  const x=fs.lstatSync(file);
  if(!x.isFile()||x.isSymbolicLink()||x.uid!==0||(x.mode&0o077)!==0)
    throw Error("ENV_FILE_PERMISSIONS_NOT_SAFE");
  return x;
}
function status(port,route,form) {
  const args=["--noproxy","*","-sS","--max-time","12","-D","-","-o","/dev/null",
    "-H","Host: lingxifield.cn","-H","X-Forwarded-Host: lingxifield.cn",
    "-H","X-Forwarded-Proto: https"];
  if(form){
    args.push("-X","POST","-H","Origin: https://lingxifield.cn",
      "-H","Sec-Fetch-Site: same-origin","--data",form);
  }
  args.push("http://127.0.0.1:"+port+route);
  const v=spawnSync("curl",args,{encoding:"utf8",timeout:16000,maxBuffer:16000});
  if(v.error||v.status!==0)return {code:0,redirect:""};
  const lines=v.stdout.split(/\r?\n/);
  const http=lines.find(s=>/^HTTP\//.test(s))||"";
  const redirect=lines.find(s=>/^location:/i.test(s))||"";
  return {code:Number((http.match(/\s(\d{3})\s?/)||[])[1]||0),
    redirect:redirect.slice(redirect.indexOf(":")+1).trim()};
}
function processMatches(key) {
  let main;
  try{main=Number(cmd("systemctl",["show","-p","MainPID","--value",PRODUCTION]));}
  catch{return {readable:0,matches:0};}
  const q=[main],seen=new Set();let readable=0,matches=0;
  while(q.length&&seen.size<25){
    const pid=q.shift();if(!pid||seen.has(pid))continue;seen.add(pid);
    try{
      const env={};
      for(const pair of fs.readFileSync("/proc/"+pid+"/environ","utf8").split("\0")){
        const pos=pair.indexOf("="),name=pair.slice(0,pos);
        if(pos>0&&FIELDS.includes(name))env[name]=pair.slice(pos+1);
      }
      readable++;
      if(env.NEXT_PUBLIC_SUPABASE_URL===PROJECT &&
         env.NEXT_PUBLIC_SUPABASE_ANON_KEY===key)matches++;
    }catch{}
    try{
      const kids=fs.readFileSync("/proc/"+pid+"/task/"+pid+"/children","utf8");
      for(const x of kids.split(/\s+/))if(/^\d+$/.test(x))q.push(Number(x));
    }catch{}
  }
  return {readable,matches};
}
function guards(){
  for(const [service,file] of [[PRODUCTION,ENV],[TEST,STAGE]]){
    if(cmd("systemctl",["is-active",service])!=="active")throw Error("INACTIVE_SERVICE:"+service);
    if(!cmd("systemctl",["show","-p","EnvironmentFiles","--value",service]).includes(file))
      throw Error("ENV_NOT_REFERENCED:"+service);
  }
  if(FIELDS.some(name=>cmd("systemctl",["show","-p","Environment","--value",PRODUCTION]).includes(name+"=")))
    throw Error("ENV_OVERRIDE_CONFLICT_STOP");
  const p=cmd("systemctl",["show","-p","WorkingDirectory","--value",PRODUCTION]);
  const s=cmd("systemctl",["show","-p","WorkingDirectory","--value",TEST]);
  if(!p||!s||p===s)throw Error("PRODUCTION_STAGING_COLLISION");
}
function atomicWrite(value,stat){
  const temp=ENV+".tmp-auth-"+process.pid;
  try{
    fs.writeFileSync(temp,value,{flag:"wx",mode:0o600});
    fs.chownSync(temp,stat.uid,stat.gid);
    fs.renameSync(temp,ENV);
  }finally{try{fs.unlinkSync(temp)}catch{}}
}
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function verifyRecovery(key){
  for(let i=0;i<25;i++){
    if(status(3188,"/api/health").code===200 &&
       status(3188,"/api/sasi/account").code===401 &&
       status(3188,"/api/tools/jobs").code===401 &&
       processMatches(key).matches>0){
      const form=new URLSearchParams({
        mode:"signin",email:"auth-check-20261107@invalid.example",
        password:"DeliberatelyInvalidPassword2026",
      }).toString();
      const login=status(3188,"/account/auth",form);
      if(login.code===303&&login.redirect.includes("auth_error=credentials"))
        return true;
    }
    await wait(1400);
  }
  return false;
}
export async function main(argv=process.argv.slice(2)){
  const mode=argv[0];
  if(argv.length!==1||!["--plan","--apply"].includes(mode)){console.error("USAGE: --plan|--apply");return 2;}
  if(process.getuid?.()!==0){console.error("ROOT_REQUIRED");return 2;}
  let lock;
  try{lock=fs.openSync(LOCK,"wx",0o600);}catch{console.error("LOCK_BUSY_OR_STALE");return 2;}
  let old=null,changed=false,backup=null,stat=null,transaction=false;
  try{
    stat=validPrivateFile(ENV);validPrivateFile(STAGE);guards();
    const p=parseEnv(old=fs.readFileSync(ENV,"utf8")),s=parseEnv(fs.readFileSync(STAGE,"utf8"));
    const chosen=selectPublicPair(p,s),next=publicOnlyPatch(old,chosen);
    if(status(3189,"/api/health").code!==200 ||
       status(3189,"/api/sasi/account").code!==401 ||
       status(3189,"/api/tools/jobs").code!==401)throw Error("STAGING_AUTH_GATE_FAILED");
    const before={health:status(3188,"/api/health").code,
      account:status(3188,"/api/sasi/account").code,
      tools:status(3188,"/api/tools/jobs").code,process:processMatches(chosen.key)};
    if(before.health!==200)throw Error("PRODUCTION_HEALTH_FAIL_STOP");
    const needsRestart=next!==old||before.process.matches===0||
      before.account!==401||before.tools!==401;
    console.log(JSON.stringify({mode,selectedSource:chosen.source,
      selectedPublicKeyType:chosen.kind,stagingAuthGate:"PASS",
      productionBefore:before,envFileEditNeeded:next!==old,
      serviceRestartNeeded:needsRestart,changesToPayments:false,
      changesToDNS:false,changesToVercel:false},null,2));
    if(mode==="--plan"){console.log("CN_AUTH_PLAN_READ_ONLY");return 0;}
    if(!needsRestart){console.log("CN_AUTH_ALREADY_PRESENT_NO_CHANGE");return 0;}
    backup=ENV+".auth-"+new Date().toISOString().replace(/[:.]/g,"-")+"-"+process.pid+".bak";
    fs.copyFileSync(ENV,backup,fs.constants.COPYFILE_EXCL);
    fs.chmodSync(backup,0o600);fs.chownSync(backup,stat.uid,stat.gid);
    transaction=true;
    if(next!==old){atomicWrite(next,stat);changed=true;}
    cmd("systemctl",["restart",PRODUCTION],90000);
    if(!(await verifyRecovery(chosen.key)))throw Error("AUTH_RUNTIME_VALIDATION_FAILED");
    transaction=false;
    console.log(JSON.stringify({result:"CN_3188_ANONYMOUS_AUTH_RECOVERED",
      backupFile:backup,realUserLoginTested:false,
      allToolDeliveryVerified:false,releaseReady:false},null,2));
    return 0;
  }catch(e){
    console.error("CN_AUTH_RECOVERY_ABORT:"+e.message);
    if(transaction){
      try{
        if(changed)atomicWrite(old,stat);
        cmd("systemctl",["restart",PRODUCTION],90000);
        console.error("CN_AUTH_ROLLBACK_HEALTH="+status(3188,"/api/health").code);
      }catch{console.error("CN_AUTH_ROLLBACK_MANUAL_REVIEW_REQUIRED");}
    }
    return 1;
  }finally{
    try{fs.closeSync(lock);}catch{}
    try{fs.unlinkSync(LOCK);}catch{}
  }
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)
  main().then(c=>{process.exitCode=c;}).catch(()=>{console.error("AUTH_RECOVERY_UNHANDLED");process.exitCode=1;});
