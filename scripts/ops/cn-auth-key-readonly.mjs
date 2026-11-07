#!/usr/bin/env node
/**
 * Read-only diagnosis of the production vs staging Supabase PUBLIC key mismatch
 * on Lingxifield CN ECS. Never prints keys, JWT payloads, or private env values.
 * Never restarts services, alters files, changes DNS, or calls mutating endpoints.
 *
 * Run: /opt/lingxifield/runtime/node-24.19.0/bin/node \
 *      scripts/ops/cn-auth-key-readonly.mjs --read-only
 */
import { readFileSync, lstatSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { parseEnv } from "node:util";
import { pathToFileURL } from "node:url";

const EXPECTED_URL="https://sxsgdpqojepgbbrxrzlq.supabase.co";
const FILES=Object.freeze({
  production:"/etc/lingxifield/production.env",
  staging:"/etc/lingxifield/staging.env",
});
const PUBLIC_NAMES=["NEXT_PUBLIC_SUPABASE_URL","NEXT_PUBLIC_SUPABASE_ANON_KEY"];

export function classifyPublicKey(value) {
  if(typeof value!=="string"||value.length<20||value.length>4096)return "MISSING_OR_MALFORMED";
  if(value.startsWith("sb_secret_")||value.startsWith("sb_service_"))
    return "PRIVILEGED_KEY_MUST_NOT_BE_PUBLIC";
  if(/^sb_publishable_[A-Za-z0-9_-]+$/.test(value))
    return "PUBLISHABLE";
  const parts=value.split(".");
  if(parts.length!==3||parts.some(p=>!p))return "UNRECOGNIZED_KEY";
  try{
    const claims=JSON.parse(Buffer.from(parts[1],"base64url").toString("utf8"));
    if(claims?.role!=="anon")return "JWT_NOT_ANON_REJECT";
    if(typeof claims.exp==="number"&&claims.exp*1000<Date.now())
      return "JWT_ANON_EXPIRED";
    return "LEGACY_ANON_JWT";
  }catch{return "UNRECOGNIZED_KEY";}
}

export function comparePublicConfig(production,staging) {
  const pu=production?.NEXT_PUBLIC_SUPABASE_URL;
  const su=staging?.NEXT_PUBLIC_SUPABASE_URL;
  const pk=production?.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const sk=staging?.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return {
    productionUrlMatchesProject:pu===EXPECTED_URL,
    stagingUrlMatchesProject:su===EXPECTED_URL,
    productionKeyKind:classifyPublicKey(pk),
    stagingKeyKind:classifyPublicKey(sk),
    keysEqual:typeof pk==="string"&&pk.length>0&&pk===sk,
  };
}

export async function probePublicKey(key,url,fetcher=fetch) {
  const kind=classifyPublicKey(key);
  if(!["PUBLISHABLE","LEGACY_ANON_JWT"].includes(kind) || url!==EXPECTED_URL)
    return "NOT_PROBED_INVALID_TYPE_OR_PROJECT";
  try {
    // A GET to the PostgREST API's root tests its API gateway. Do not
    // request private user rows or pass the key in the URL.
    const res=await fetcher(url+"/rest/v1/",{
      method:"GET",
      redirect:"manual",
      headers:{"apikey":key,"accept":"application/openapi+json"},
      signal:AbortSignal.timeout(16000),
    });
    try{await res.body?.cancel();}catch{}
    if(res.status===200)return "HTTP_200_API_GATEWAY_ACCEPTS_KEY";
    if(res.status===401||res.status===403)return "HTTP_"+res.status+"_KEY_OR_PERMISSION_REJECTED";
    return "HTTP_"+res.status+"_INCONCLUSIVE";
  }catch{return "NETWORK_OR_TLS_UNREACHABLE";}
}

function readConfig(path) {
  const stat=lstatSync(path);
  if(!stat.isFile()||stat.isSymbolicLink()||stat.uid!==0||(stat.mode&0o077)!==0)
    throw Error("ENV_FILE_NOT_ROOT_PRIVATE");
  return parseEnv(readFileSync(path,"utf8"));
}

function mainPid(service) {
  try {
    const raw=execFileSync("systemctl",["show","--property=MainPID","--value",service],
      {encoding:"utf8",timeout:6000}).trim();
    return /^\d+$/.test(raw)&&Number(raw)>0?Number(raw):null;
  }catch{return null;}
}

export function processKeyDiagnostics(envFile,envFromProcess) {
  const result={};
  for(const name of PUBLIC_NAMES){
    const present=typeof envFromProcess?.[name]==="string";
    result[name]={present, matchesEnvFile:present&&envFromProcess[name]===envFile[name]};
  }
  return result;
}

function readProcessPublicEnv(pid) {
  const map={};
  try{
    const values=readFileSync("/proc/"+pid+"/environ");
    for(const v of values.toString("utf8").split("\0")) {
      const sep=v.indexOf("=");
      if(sep===-1)continue;
      const name=v.slice(0,sep);
      if(PUBLIC_NAMES.includes(name))map[name]=v.slice(sep+1);
    }
  }catch{return null;}
  return map;
}

function processTree(service) {
  const root=mainPid(service);
  if(!root)return [];
  const q=[root],seen=new Set(),out=[];
  while(q.length&&out.length<15){
    const pid=q.shift();
    if(seen.has(pid))continue;
    seen.add(pid);
    const env=readProcessPublicEnv(pid);
    if(env)out.push({pid,env});
    try{
      const children=readFileSync("/proc/"+pid+"/task/"+pid+"/children","utf8").trim();
      for(const s of children.split(/\s+/))if(/^\d+$/.test(s))q.push(Number(s));
    }catch{}
  }
  return out;
}

async function routeStatus(port,path) {
  try{
    const res=await fetch("http://127.0.0.1:"+port+path,{
      method:"GET",redirect:"manual",
      headers:{
        "host":"lingxifield.cn",
        "x-forwarded-host":"lingxifield.cn",
        "x-forwarded-proto":"https"
      },signal:AbortSignal.timeout(13000)
    });
    try{await res.body?.cancel();}catch{}
    return res.status;
  }catch{return "UNREACHABLE";}
}

export function interpretDiagnosis(summary,productionGate,stagingGate) {
  if(!summary.productionUrlMatchesProject || !summary.stagingUrlMatchesProject)
    return "PROJECT_URL_MISMATCH_STOP";
  if(!["PUBLISHABLE","LEGACY_ANON_JWT"].includes(summary.productionKeyKind)){
    return stagingGate==="HTTP_200_API_GATEWAY_ACCEPTS_KEY"
      ? "PRODUCTION_KEY_NOT_VALIDATED_STAGING_KEY_REQUIRES_REVIEW"
      : "NO_VERIFIED_REPLACEMENT_KEY_STOP";
  }
  if(summary.keysEqual)return "KEYS_EQUAL_INVESTIGATE_PROCESS_AND_NEXT_BUILD";
  if(productionGate==="HTTP_200_API_GATEWAY_ACCEPTS_KEY")
    return "KEEP_PRODUCTION_KEY_CHECK_PROCESS_AND_BUILD";
  if(stagingGate==="HTTP_200_API_GATEWAY_ACCEPTS_KEY" &&
      /^HTTP_(401|403)_/.test(productionGate))
    return "PRODUCTION_KEY_REJECTED_REQUIRE_REVIEW_AND_REBUILD";
  return "KEY_DIFFERENCE_INCONCLUSIVE_NO_CHANGES";
}

export async function main(args=process.argv.slice(2)){
  if(args.length!==1||args[0]!=="--read-only") {
    console.error("USAGE: cn-auth-key-readonly.mjs --read-only");
    return 2;
  }
  if(process.getuid?.()!==0) {console.error("ROOT_REQUIRED");return 2;}
  let production,staging;
  try {
    production=readConfig(FILES.production);
    staging=readConfig(FILES.staging);
  }catch(e){console.error("ENV_READ_FAILED:"+e.message);return 3;}
  const summary=comparePublicConfig(production,staging);
  const output={schemaVersion:1,mode:"READ_ONLY",summary};
  const [pg,sg]=await Promise.all([
    probePublicKey(production.NEXT_PUBLIC_SUPABASE_ANON_KEY,production.NEXT_PUBLIC_SUPABASE_URL),
    probePublicKey(staging.NEXT_PUBLIC_SUPABASE_ANON_KEY,staging.NEXT_PUBLIC_SUPABASE_URL),
  ]);
  output.keyGateway={production:pg,staging:sg};
  output.processes={};
  for(const [service,env] of [
    ["lingxifield-ecs",production],["lingxifield-cn-stage",staging]
  ]){
    output.processes[service]=processTree(service).map(({pid,env:processEnv})=>({
      pid,publicKeyPresence:processKeyDiagnostics(env,processEnv)
    }));
  }
  output.routes={};
  for(const [tag,port] of [["production",3188],["staging",3189]]){
    output.routes[tag]={
      health:await routeStatus(port,"/api/health"),
      anonymousSasi:await routeStatus(port,"/api/sasi/account"),
      anonymousTools:await routeStatus(port,"/api/tools/jobs"),
    };
  }
  output.diagnosis=interpretDiagnosis(summary,pg,sg);
  output.modifiedProduction=false;
  output.restartPerformed=false;
  output.finalReleaseReady=false;
  console.log(JSON.stringify(output,null,2));
  console.log("CN_AUTH_KEY_DIAGNOSTIC_READ_ONLY_COMPLETE");
  return 0;
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href) {
  main().then(code=>{process.exitCode=code;})
    .catch(()=>{console.error("CN_AUTH_DIAGNOSTIC_FAILED");process.exitCode=1;});
}
