const fs=require("fs"),path=require("path");
const root=process.argv[2]||process.cwd();
const outFile=path.join(root,"docs","TOOLS-REALITY-AUDIT-2026-09-23.md");

function exists(rel){return fs.existsSync(path.join(root,rel))}
function read(rel){try{return fs.readFileSync(path.join(root,rel),"utf8")}catch{return ""}}
function walk(dir){
  const abs=path.join(root,dir); if(!fs.existsSync(abs))return [];
  const out=[];
  for(const ent of fs.readdirSync(abs,{withFileTypes:true})){
    const rel=path.join(dir,ent.name).replace(/\\/g,"/");
    if(ent.isDirectory())out.push(...walk(rel)); else out.push(rel);
  }
  return out;
}
function quotedArray(text,name){
  const m=text.match(new RegExp(`(?:export\\s+)?const\\s+${name}[\\s\\S]*?=\\s*\\[([\\s\\S]*?)\\n\\];`));
  return m?m[1]:"";
}

const appFiles=walk("app/tools");
const componentFiles=walk("components/tools");
const apiFiles=walk("app/api");
const allSource=[...appFiles,...componentFiles].filter(x=>/\.(ts|tsx|js|jsx)$/.test(x));
const source=new Map(allSource.map(f=>[f,read(f)]));

const advanced=read("lib/tools/advanced-catalog.ts");
const adv=[...advanced.matchAll(/\{\s*href:"(\/tools\/[^"]+)"\s*,\s*title:"([^"]+)"\s*,\s*description:"([^"]+)"/g)]
 .map(m=>({href:m[1],slug:m[1].replace(/^\/tools\//,""),title:m[2],description:m[3]}));

const registry=read("lib/tools/registry.ts");
const liveSlugs=[...registry.matchAll(/slug:\s*"([^"]+)"[\s\S]{0,260}?status:\s*"live"/g)].map(m=>m[1]);
const plannedSlugs=[...registry.matchAll(/slug:\s*"([^"]+)"[\s\S]{0,260}?status:\s*"planned"/g)].map(m=>m[1]);

function gatherRoute(slug){
  const prefix=`app/tools/${slug}/`;
  const page=appFiles.find(f=>f===`${prefix}page.tsx`)||"";
  const pageSrc=page?read(page):"";
  const imports=[...pageSrc.matchAll(/from\s+"@\/components\/tools\/([^"]+)"/g)].map(m=>`components/tools/${m[1]}.tsx`);
  const related=[page,...imports].filter(Boolean);
  // Follow one additional layer of local tool-component imports.
  for(const f of [...imports]){
    const s=read(f);
    for(const m of s.matchAll(/from\s+"@\/components\/tools\/([^"]+)"/g)){
      const rel=`components/tools/${m[1]}.tsx`;
      if(!related.includes(rel))related.push(rel);
    }
  }
  const combined=related.map(read).join("\n");
  const apiRefs=[...combined.matchAll(/["'`](\/api\/[A-Za-z0-9_./-]+)/g)].map(m=>m[1].replace(/[),;]+$/,""));
  const apiUnique=[...new Set(apiRefs)];
  const apiMissing=apiUnique.filter(u=>{
    const rel=("app"+u+"/route.ts").replace(/\/+/g,"/");
    return !exists(rel);
  });

  const evidence=[];
  const rules=[
    ["PDF","PDFDocument|pdf-lib"],
    ["Canvas","createElement\\([\"']canvas|CanvasRenderingContext2D|getContext\\([\"']2d"],
    ["FFmpeg","@ffmpeg/ffmpeg|new FFmpeg"],
    ["OCR","tesseract|Tesseract"],
    ["ZIP","jszip|JSZip"],
    ["Crypto","crypto\\.subtle|SubtleCrypto|AES-GCM"],
    ["Download","URL\\.createObjectURL|\\.download\\s*=|downloadBlob"],
    ["Server API","fetch\\([\"'`]\\/api\\/"],
    ["Paid export","PaidExportButton"],
    ["Image bitmap","createImageBitmap"],
    ["File bytes","arrayBuffer\\(\\)|FileReader"],
  ];
  for(const [name,rx] of rules) if(new RegExp(rx,"i").test(combined)) evidence.push(name);

  const caveats=[];
  const caveatRules=[
    ["planned marker",/待上线|coming soon|planned|尚未实现|未实现真实|占位|placeholder/i],
    ["partial marker",/下一步|after verification|only marked complete|暂不|暂未|currently supports|当前版本/i],
    ["mock/demo marker",/mock|demo data|演示数据|假按钮/i],
  ];
  for(const [name,rx] of caveatRules)if(rx.test(combined))caveats.push(name);

  let status="SHELL / NEEDS REVIEW";
  if(!page)status="MISSING ROUTE";
  else if(apiMissing.length)status="BROKEN WIRING";
  else if(caveats.includes("planned marker"))status="PLANNED / SHELL";
  else if(evidence.includes("Paid export")&&(evidence.includes("Server API")||apiUnique.length))status="REAL CODE · PAID PATH NEEDS LIVE TEST";
  else if(evidence.some(x=>["PDF","Canvas","FFmpeg","OCR","ZIP","Crypto","Image bitmap","File bytes"].includes(x))&&evidence.includes("Download"))status=caveats.length?"PARTIAL BUT FUNCTIONAL":"REAL LOCAL CODE";
  else if(evidence.includes("Server API")&&apiUnique.length)status=caveats.length?"PARTIAL SERVER FLOW":"REAL SERVER FLOW";
  else if(evidence.length>=2)status=caveats.length?"PARTIAL BUT FUNCTIONAL":"LIKELY FUNCTIONAL";

  return {slug,page,imports,apiUnique,apiMissing,evidence,caveats,status};
}

const slugs=[...new Set([
  ...adv.map(x=>x.slug),
  ...liveSlugs,
  ...plannedSlugs,
  ...appFiles.filter(f=>/^app\/tools\/[^/]+\/page\.tsx$/.test(f)).map(f=>f.split("/")[2]).filter(x=>!["pay","admin"].includes(x))
])].sort();

const rows=slugs.map(gatherRoute);
const counts={};
for(const r of rows)counts[r.status]=(counts[r.status]||0)+1;

const dup=[...new Set(adv.map(x=>x.slug).filter(s=>liveSlugs.includes(s)))].sort();
const advMissing=adv.filter(x=>!exists(`app/tools/${x.slug}/page.tsx`));

const lines=[];
lines.push("# 灵犀场 Tools 真实能力审计");
lines.push("");
lines.push("生成时间：2026-09-23");
lines.push("");
lines.push("> 这是源码结构审计，不等于真实浏览器/第三方支付/AI供应商的端到端验收。凡涉及微信、支付宝、PayPal、外部AI、浏览器编解码器或大文件内存压力，仍需实际运行测试。");
lines.push("");
lines.push("## 结论摘要");
lines.push("");
for(const [k,v] of Object.entries(counts).sort((a,b)=>b[1]-a[1]))lines.push(`- **${k}**：${v}`);
lines.push(`- Advanced catalog 卡片：${adv.length}`);
lines.push(`- registry live：${liveSlugs.length}`);
lines.push(`- registry planned：${plannedSlugs.length}`);
lines.push(`- advanced / registry 重复 slug：${dup.length}${dup.length?`（${dup.join("、")}）`:""}`);
lines.push(`- advanced 卡片缺独立 route：${advMissing.length}${advMissing.length?`（${advMissing.map(x=>x.slug).join("、")}）`:""}`);
lines.push("");
lines.push("## 每个工具");
lines.push("");
lines.push("| Tool | 结构判断 | 代码证据 | Caveat | API |");
lines.push("|---|---|---|---|---|");
for(const r of rows){
  lines.push(`| \`${r.slug}\` | **${r.status}** | ${r.evidence.join(", ")||"—"} | ${r.caveats.join(", ")||"—"} | ${r.apiUnique.length?r.apiUnique.join("<br>"):"—"} |`);
}
lines.push("");
lines.push("## 必须优先处理");
lines.push("");
for(const r of rows.filter(x=>/MISSING|BROKEN|SHELL|PLANNED/.test(x.status))){
  lines.push(`- \`${r.slug}\` — **${r.status}**${r.apiMissing.length?`；缺 API：${r.apiMissing.join(", ")}`:""}`);
}
lines.push("");
lines.push("## 不能仅凭源码宣称“已验收”的工具");
lines.push("");
lines.push("- 所有付费导出：必须真实完成至少一笔支付 → 回跳 → status → consume → export。");
lines.push("- AI OCR / 转写 / 翻译 / 卡路里 / 去水印：必须实际调用当前生产 provider，并验证失败、限额与计费。");
lines.push("- FFmpeg/WASM：必须在 Chrome / Edge 和移动端测试实际加载、大文件、取消与内存边界。");
lines.push("- PDF 编辑/脱敏/盖章：必须用真实多页 PDF 验证导出后内容确实写入文件，而不是只覆盖视觉层。");
lines.push("");
lines.push("## 下一阶段构建原则");
lines.push("");
lines.push("1. **不复制页面壳**：同类工具共用 PDF / Image / Video / OCR / Web Fetch / Billing 基础层。");
lines.push("2. **目录卡片只展示真实能力**：shell/planned 不进入“可执行”搜索结果。");
lines.push("3. **免费工具优先形成搜索入口**：一个真实问题，一个清晰 URL，一个能完成的结果。");
lines.push("4. **新工具优先级**：阅后即焚 → 临时邮箱 → 网页正文/Markdown/PDF/截图 → 表格转 Excel → 合同/PDF 对比 → 卡路里记录化。");
lines.push("");
lines.push("## 新工具技术基线：阅后即焚");
lines.push("");
lines.push("- 浏览器端 AES-256-GCM 加密；服务器只存密文。");
lines.push("- 解密 key 只放 URL fragment `#...`，正常 HTTP 请求不会把 fragment 发给服务器。");
lines.push("- 默认读取一次即删除；同时提供短期自动过期。");
lines.push("- 服务器保存密文、IV、过期时间、读取次数，不保存明文或解密 key。");
lines.push("- 创建/读取 API 限流；密文大小硬限制；禁止渲染未净化 HTML。");
lines.push("- 第一版先做文本，文件版在存储与 abuse-control 完整后再开放。");
lines.push("");
lines.push("### 开源架构参考（只借鉴架构，不复制 UI）");
lines.push("");
lines.push("- **1time.io — MIT**：浏览器 AES-GCM、URL fragment 持有 key、服务器零知识、默认一次读取。");
lines.push("- **PrivateBin — zlib license**：成熟的 zero-knowledge paste 模型，支持 AES-GCM、密码、过期与 burn-after-reading。");
lines.push("- **Password Pusher — Apache-2.0**：自动过期、阅读次数限制和审计思路成熟。");
lines.push("- **largerio/secret — MIT**：文本/文件、read limit、过期、QR、多语言与大文件分块设计可参考。");
lines.push("");
lines.push("> 使用任何开源代码前仍需逐项核 LICENSE、依赖与模型/权重条款。本阶段仅采用公开架构思想，不直接复制第三方源码。");

fs.mkdirSync(path.dirname(outFile),{recursive:true});
fs.writeFileSync(outFile,lines.join("\n"),"utf8");
console.log("WROTE",outFile);
console.log("");
console.log("TOOLS REALITY AUDIT SUMMARY");
for(const [k,v] of Object.entries(counts).sort((a,b)=>b[1]-a[1]))console.log(String(v).padStart(3),k);
console.log("");
console.log("Advanced cards:",adv.length," Registry live:",liveSlugs.length," Registry planned:",plannedSlugs.length);
console.log("Report:",outFile);
