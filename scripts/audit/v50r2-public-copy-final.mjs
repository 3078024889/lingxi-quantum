import fs from "node:fs";
const roots=["app","components","lib/sasi"];
const forbidden=[
 "创作余额","AI余额","连接创作服务",
 "模型费用由对应服务商直接收取",
 "费用由对应服务商直接结算",
 "供应商预估","供应商任务"
];
const exts=new Set([".ts",".tsx",".js",".jsx",".mjs",".cjs"]);
const bad=[];

function walk(dir){
 if(!fs.existsSync(dir))return;
 for(const ent of fs.readdirSync(dir,{withFileTypes:true})){
  const p=`${dir}/${ent.name}`;
  if(ent.isDirectory())walk(p);
  else if(exts.has(p.slice(p.lastIndexOf(".")))){
   const s=fs.readFileSync(p,"utf8");
   for(const f of forbidden)if(s.includes(f))bad.push(`${p}: ${f}`);
  }
 }
}
for(const r of roots)walk(r);

const account=fs.readFileSync("app/account/page.tsx","utf8");
if(/\bhh=/.test(account))bad.push("app/account/page.tsx: hh= typo");
for(const x of ["hurück","Repreneh","empehaste"," hu müssen"])
 if(account.includes(x))bad.push(`app/account/page.tsx: ${x}`);

const sasi=fs.readFileSync("components/SasiOneSurface.tsx","utf8");
const modeNames=["drama","website","book","learning","research"];
const oldShape=modeNames.every(x=>sasi.includes(`id:"${x}"`));
const newShape=/const MODES:Mode\[\]=\["drama","website","book","learning","research"\]/.test(sasi);
if(!oldShape&&!newShape)bad.push("SasiOneSurface five modes not found in a supported representation");
if(!sasi.includes("fixed bottom-2")&&!sasi.includes("fixed bottom-5"))
 bad.push("SasiOneSurface mode control missing");
if(newShape&&sasi.includes("LingxiMiniIcon"))
 bad.push("SasiOneSurface current text-mode UI unexpectedly includes icon dock");

const conn=fs.readFileSync("app/sasi/ConnectionCenter.tsx","utf8");
for(const x of[
 "连接一个 API Key，使用你账号下已开通的多智能生态模型",
 "连接一个 API Key，使用你有权访问的多智能生态模型。",
 "连接一次，SASI 会在短剧、网站、书本、学习和科研中自动选择适配的能力"
])if(!conn.includes(x))bad.push(`ConnectionCenter missing: ${x}`);

if(bad.length){
 console.error(bad.join("\n"));
 process.exit(1);
}
console.log("V50R2_PUBLIC_COPY_RESIDUE=0");
console.log("V50R2_ONE_SURFACE=PASS");
console.log("V50R2_MULTIMODEL_COPY=PASS");
console.log("V50R2_AUDIT_CURRENT_UI_COMPAT=PASS");
