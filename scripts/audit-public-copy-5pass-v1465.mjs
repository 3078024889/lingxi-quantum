import fs from "node:fs";
import path from "node:path";

function walk(dir,out=[]){
  if(!fs.existsSync(dir))return out;
  for(const e of fs.readdirSync(dir,{withFileTypes:true})){
    const p=path.join(dir,e.name);
    if(e.isDirectory())walk(p,out);
    else if(/\.(tsx|ts)$/.test(e.name))out.push(p.replace(/\\/g,"/"));
  }
  return out;
}

const files=[...walk("app"),...walk("components")].filter(p=>/page\.tsx$|components\//.test(p));
const passes=[
  ["PASS1_INTERNAL_STATUS",["制作内核已通过三重门控","制作保护仍在生效","生产执行总开关","verified ledger","Production kernel passed"]],
  ["PASS2_INFRA_LANGUAGE",["service_role","迁移状态","server-owned records","供应商成本记录","回传或估算记录"]],
  ["PASS3_DEV_PLACEHOLDER",["尚未开放提交","仍在能力验证阶段","其余能力明确标注为规划中","Coming soon","Unverified"]],
  ["PASS4_ENGINEERING_SURFACE",["安全门控中","完成归属校验与安全索引","隔离运行","生产执行待核验","provider verified"]],
  ["PASS5_RETIRED_PRODUCT",["场域精测","生命图谱","意识显化","潜意识重塑","修炼技术"]],
];

let total=0;
for(const [name,terms] of passes){
  let count=0;
  const examples=[];
  for(const file of files){
    const text=fs.readFileSync(file,"utf8");
    for(const term of terms){
      if(text.toLowerCase().includes(term.toLowerCase())){
        count++;total++;
        if(examples.length<20)examples.push(`${file} :: ${term}`);
      }
    }
  }
  console.log(`${name}=SCANNED matches=${count}`);
  for(const ex of examples)console.log(`  ${ex}`);
}
console.log(`PUBLIC_COPY_RESIDUAL_REPORT=${total}`);
console.log("PUBLIC_COPY_5_PASS=COMPLETE");
