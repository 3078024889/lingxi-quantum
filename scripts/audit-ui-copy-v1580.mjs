import fs from "node:fs";
import path from "node:path";
const root=process.cwd();
const roots=["app","components","lib/tools"];
const files=[];
function walk(d){
 if(!fs.existsSync(d))return;
 for(const e of fs.readdirSync(d,{withFileTypes:true})){
  const p=path.join(d,e.name);
  if(e.isDirectory()){if(!["node_modules",".next"].includes(e.name))walk(p)}
  else if(/\.(tsx|jsx|ts|js)$/.test(e.name))files.push(p);
 }
}
for(const r of roots)walk(path.join(root,r));

const visibleBanned=[
 "生成式 AI","确定性计算","确定性算法","启动 OCR Pipeline","异步任务处理中",
 "对象存储上传失败","任务节点执行失败","Image Enhancement Model",
 "AI余额","余额退款"
];
const hits=[];
for(const f of files){
 const rel=path.relative(root,f).replaceAll("\\","/");
 if(rel.includes("/api/"))continue;
 const t=fs.readFileSync(f,"utf8");
 for(const term of visibleBanned)if(t.includes(term))hits.push(`${rel} :: ${term}`);
}
if(hits.length){
 console.error("UI_COPY_AUDIT=FAIL");
 console.error(hits.join("\n"));
 process.exit(1);
}
console.log("UI_COPY_AUDIT=PASS");
