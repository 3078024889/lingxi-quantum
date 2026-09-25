import fs from "node:fs";
const path="app/sasi/SasiWorkspace.tsx";
let s=fs.readFileSync(path,"utf8");

if(!s.includes('import SasiSkillsPanel from "@/components/SasiSkillsPanel";')){
  const marker='import { SasiComposer } from "./SasiComposer";';
  if(!s.includes(marker)){console.error("WORKSPACE_IMPORT_MARKER_NOT_FOUND");process.exit(21)}
  s=s.replace(marker,marker+'\nimport SasiSkillsPanel from "@/components/SasiSkillsPanel";');
}

s=s.replace(/\n\s*SASI_SKILLS,\s*/,"\n");

const start=s.search(/function\s+SkillsMarketplace\s*\(\{/);
const end=s.indexOf("\nexport default function SasiWorkspace",start);
if(start<0||end<0){console.error("WORKSPACE_SKILLS_BOUNDARY_NOT_FOUND");process.exit(22)}

const replacement=`function SkillsMarketplace({
  lang,
  dark,
  setNotice,
}: {
  lang: Lang;
  dark: boolean;
  setNotice: (message: string) => void;
}) {
  return <SasiSkillsPanel lang={lang} dark={dark} setNotice={setNotice} />;
}
`;

s=s.slice(0,start)+replacement+s.slice(end);
s=s.replace(/\n\s*const \[skillTab,\s*setSkillTab\]\s*=\s*useState<"discover"\s*\|\s*"mine"\s*\|\s*"create">\("discover"\);?/,"");
s=s.replace(/<SkillsMarketplace\s+lang=\{lang\}\s+dark=\{dark\}[\s\S]*?setNotice=\{setNotice\}\s*\/>/,'<SkillsMarketplace lang={lang} dark={dark} setNotice={setNotice} />');
s=s.replace(/if\s*\(requestedView\s*===\s*"build"\s*\|\|\s*requestedView\s*===\s*"code"\)\s*setCreationKind\("code"\);?/,"");

const replacements=[
 ["TASK BUDGET","本次预算"],
 ["项目图谱","项目"],
 ["生产节点","制作步骤"],
 ["条依赖","个前后关系"],
 ["尚无云端资产。下一次建立项目时添加文件，SASI 会将其写入隔离区并完成安全分流。","这里还没有素材。下次建立项目时直接添加文件，就可以和故事一起继续。"],
 ["文件会先在本次浏览器任务中暂存；建立项目后才进入私有隔离通道，完成归属校验与安全索引。任何代码都不会被自动执行。","文件会先跟着这次创作留在浏览器里；建立项目后再保存到你的项目中。上传的代码不会自动运行。"],
 ["正在展开项目图谱…","正在打开项目…"],
 ["项目图谱暂时无法读取。","这个项目暂时打不开，请稍后再试。"],
 ["建立项目并生成执行图谱","建立项目"],
 ["Create project & execution graph","Create project"],
 ["代码与审阅","制作与检查"],
 ["Code & review","Create & review"],
 ["提交与上线","发布上线"],
 ["Commit & launch","Publish"],
 ["代码与文件","已有材料"],
 ["Code & files","Your materials"],
 ["部署与域名","发布到你的网址"],
 ["Deploy & domain","Publish to your site"],
 ["上线检查","发布前确认"],
 ["Launch checks","Before publishing"],
 ["GitHub · 连接指引","连接我的内容来源"],
 ["GitHub · Setup","Connect my sources"],
];
for(const [a,b] of replacements)s=s.replaceAll(a,b);

if(s.includes("HOW SASI SKILLS WORK")){console.error("WORKSPACE_OLD_SKILLS_COPY_REMAINS");process.exit(23)}
if(!s.includes("SasiSkillsPanel")){console.error("WORKSPACE_SKILLS_PANEL_MISSING");process.exit(24)}

fs.writeFileSync(path,s,"utf8");
console.log("PATCH_SASI_WORKSPACE_V14656=PASS");
