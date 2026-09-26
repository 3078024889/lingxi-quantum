import fs from "node:fs";
import path from "node:path";

const root=process.cwd();
const roots=["app","components"];
const files=[];

function walk(d){
  if(!fs.existsSync(d))return;
  for(const e of fs.readdirSync(d,{withFileTypes:true})){
    if(e.name==="node_modules"||e.name===".next"||e.name.startsWith(".lingxi-backup-"))continue;
    const p=path.join(d,e.name);
    if(e.isDirectory())walk(p);
    else if(/\.(tsx|jsx|ts|js)$/.test(e.name))files.push(p);
  }
}
for(const r of roots)walk(path.join(root,r));

const engineering=[
  "生成式 AI","确定性算法","确定性计算","浏览器本地","本地 FFmpeg",
  "RPC","Pipeline","Worker","Queue","Inference","Endpoint","Webhook",
  "Object Storage","Parser","Runtime","Job Failed","Task Executor",
  "任务节点","推理节点","模型调用","provider","Provider error","内部状态",
  "服务端结果","服务器结果","unit(s)","AI余额","余额退款"
];

const retiredProduct=[
  "意识显化","潜意识重塑","桃花磁场","修炼技术","场域精测"
];

const skip=[
  "/api/","/legal/","scripts/","__tests__",".test.",".spec."
];

const hits=[];
for(const f of files){
  const rel=path.relative(root,f).replaceAll("\\","/");
  if(skip.some(x=>rel.includes(x)))continue;
  const t=fs.readFileSync(f,"utf8");
  for(const term of [...engineering,...retiredProduct]){
    if(t.includes(term))hits.push(`${rel} :: ${term}`);
  }
}

if(hits.length){
  console.error("FULL_UI_COPY_AUDIT=FAIL");
  console.error(hits.join("\n"));
  process.exit(1);
}
console.log("FULL_UI_COPY_AUDIT=PASS");
