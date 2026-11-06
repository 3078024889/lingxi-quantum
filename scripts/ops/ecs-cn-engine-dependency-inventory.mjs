#!/usr/bin/env node
// LINGXIFIELD .cn ECS staging dependency inventory. READ ONLY.
// No secret values, URL query strings, credentials, or package installation.
import {readFileSync,readlinkSync,existsSync,accessSync,constants,statfsSync} from "node:fs";
import {parseEnv} from "node:util";
import {createRequire} from "node:module";
import {spawnSync} from "node:child_process";
import os from "node:os";
import path from "node:path";

const SERVICE="lingxifield-cn-stage";
const RELEASE="/opt/lingxifield/releases/cn-pr199";
const ENVFILE="/etc/lingxifield/staging.env";
const safe=(label,value)=>console.log(label+"="+value);
function systemctl(prop){
 try{
  const r=spawnSync("systemctl",["show",SERVICE,"--property="+prop,"--value"],{
   encoding:"utf8",timeout:5000,env:{PATH:"/usr/sbin:/usr/bin:/sbin:/bin"}
  });
  return r.status===0?r.stdout.trim():"";
 }catch{return "";}
}
const pid=Number(systemctl("MainPID"))||0;
const svcUser=systemctl("User")||"UNKNOWN";
let cwd="";try{if(pid>1)cwd=readlinkSync("/proc/"+pid+"/cwd")}catch{}
safe("CN_STAGE_MAINPID_PRESENT",pid>1);
safe("CN_STAGE_USER",svcUser.replace(/[^a-zA-Z0-9_-]/g,"").slice(0,40));
safe("CN_STAGE_CWD",cwd&&cwd.startsWith("/opt/lingxifield/")?cwd:"UNVERIFIED");
let senv={};
try{senv=parseEnv(readFileSync(ENVFILE,"utf8"))}catch{safe("CN_STAGING_ENV","UNREADABLE")}
let processPath="";
try{
 if(pid>1){
  const b=readFileSync("/proc/"+pid+"/environ");
  const v=b.toString("utf8").split("\0").find(s=>s.startsWith("PATH="));
  processPath=v?v.slice(5):"";
 }
}catch{}
if(!processPath)processPath="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin";
function isExecutable(x){
 try{accessSync(x,constants.X_OK);return true}catch{return false}
}
function resolvedCommand(cmd){
 if(!cmd||typeof cmd!=="string"||cmd.trim()==="[SENSITIVE]")return false;
 if(cmd.includes("/"))return path.isAbsolute(cmd)&&isExecutable(cmd);
 return processPath.split(":").some(dir=>dir&&isExecutable(path.join(dir,cmd)));
}
const bins=[
 ["FFMPEG","LINGXI_FFMPEG_BIN","ffmpeg"],
 ["QPDF","LINGXI_QPDF_BIN","qpdf"],
 ["PDFCPU","LINGXI_PDFCPU_BIN","pdfcpu"],
 ["EXIFTOOL","LINGXI_EXIFTOOL_BIN","exiftool"],
 ["HEIF_CONVERT","LINGXI_LIBHEIF_BIN","heif-convert"],
 ["WHISPER","LINGXI_WHISPER_BIN","whisper-cli"],
 ["OPENCC","LINGXI_OPENCC_BIN","opencc"],
];
for(const [label,key,fallback] of bins){
 const configured=Boolean(senv[key]?.trim());
 const bin=senv[key]?.trim()||fallback;
 safe("BINARY_"+label, (resolvedCommand(bin)?"EXECUTABLE":"MISSING_OR_INACCESSIBLE")+"_OVERRIDE_"+configured);
}
for(const key of ["LINGXI_GOTENBERG_URL","LINGXI_PYTHON_BIN","SASI_COMPUTE_WORKER_URL","SASI_COMPUTE_WORKER_SECRET"]){
 safe("CONFIG_"+key,Boolean(senv[key]?.trim()));
}
let req;
try{
 const serverPath=path.join(cwd||RELEASE,"server.js");
 req=createRequire(serverPath);
}catch{req=createRequire(import.meta.url)}
for(const [label,mod] of [
 ["SHARP","sharp"],["MAMMOTH","mammoth"],["EXCELJS","exceljs"],
 ["READABILITY","@mozilla/readability"],["DOMPURIFY","dompurify"],["TURNDOWN","turndown"]
]){
 let status="MISSING";
 try{req.resolve(mod);status="RESOLVABLE"}catch{}
 safe("NODE_"+label,status);
}
function findPython(){
 const candidates=[senv.LINGXI_PYTHON_BIN,"python","python3"].filter(Boolean);
 for(const value of [...new Set(candidates)])if(resolvedCommand(value))return value;
 return "";
}
const py=findPython();
safe("PYTHON_INTERPRETER",py?"EXECUTABLE":"MISSING");
const modules=[
 ["PADDLEOCR","paddleocr"],["OPENCV","cv2"],["MEDIAPIPE","mediapipe"],
 ["FASTER_WHISPER","faster_whisper"],["ARGOS","argostranslate"],
 ["KOKORO","kokoro"],["JIEBA","jieba"],["REAL_ESRGAN","realesrgan"],
 ["GFPGAN","gfpgan"]
];
if(py){
 for(const [label,mod] of modules){
  // importlib.find_spec probes metadata without importing weighty ML packages.
  const code="import importlib.util,sys; sys.exit(0 if importlib.util.find_spec("+JSON.stringify(mod)+") else 1)";
  const r=spawnSync(py,["-I","-c",code],{
   encoding:"utf8",timeout:5000,env:{PATH:processPath,HOME:"/nonexistent",PYTHONNOUSERSITE:"1"}
  });
  safe("PYMOD_"+label,r.status===0?"PRESENT":"ABSENT_OR_UNUSABLE");
 }
}
for(const dir of ["/opt/lingxifield","/tmp"]){
 try{
  const s=statfsSync(dir);
  safe("DISK_"+(dir==="/tmp"?"TMP":"OPT")+"_FREE_GIB",Number((BigInt(s.bavail)*BigInt(s.bsize))/BigInt(1024**3)));
 }catch{safe("DISK_INFO","UNKNOWN")}
}
safe("RAM_TOTAL_GIB",Math.floor(os.totalmem()/1024**3));
safe("RAM_FREE_GIB",Math.floor(os.freemem()/1024**3));
safe("CPU_LOGICAL",os.availableParallelism());
safe("CN_INVENTORY_READ_ONLY","PASS");
