import fs from "node:fs";
const failures=[];
const touched=new Set();
const read=p=>fs.readFileSync(p,"utf8");
const save=(p,s)=>{fs.writeFileSync(p,s,"utf8");touched.add(p)};
function replace(path,before,after,label){
  let s=read(path);
  if(s.includes(after)){console.log(`ALREADY ${label}`);return}
  if(!s.includes(before)){console.error(`MISS ${label} :: ${path}`);failures.push(`${label} :: ${path}`);return}
  s=s.replace(before,after);save(path,s);console.log(`PASS ${label}`);
}
function replaceAll(path,before,after,label){
  let s=read(path);
  if(!s.includes(before)){if(s.includes(after)){console.log(`ALREADY ${label}`);return}console.error(`MISS ${label} :: ${path}`);failures.push(`${label} :: ${path}`);return}
  s=s.replaceAll(before,after);save(path,s);console.log(`PASS ${label}`);
}

// Product center: no first/second-person phrasing.
{
 const p="app/products/ProductCatalogClient.tsx";let s=read(p);
 const a=s.indexOf("const areas=[");const b=s.indexOf("] as const;",a);
 if(a<0||b<0){failures.push("product areas boundary");console.error("MISS product areas boundary")}
 else{
  const block=`const areas=[
  {href:"/sasi",icon:"✦",zh:"从一个想法到可用结果",en:"From idea to usable result",descZh:"短剧、网站、资料智能体与持续创作，从想法直接进入构建。",descEn:"Move ideas into drama, websites, document agents and continued creation."},
  {href:"/tools",icon:"🛠️",zh:"处理一个文件，直接得到结果",en:"Process a file and get the result",descZh:"PDF、图片、视频、字幕、表格、网页与隐私文件，打开即可处理。",descEn:"Handle PDFs, images, video, subtitles, tables, web content and private files."},
  {href:"/ai-knowledge",icon:"📚",zh:"让书本与资料持续可用",en:"Turn books and sources into active knowledge",descZh:"资料可持续追问，答案可回到原文与来源。",descEn:"Keep sources queryable with answers traceable to the original material."},
  {href:"/ai-learning",icon:"🧠",zh:"从看过到真正学懂",en:"From reading to real understanding",descZh:"教材、笔记与复习材料集中整理、追问与回看。",descEn:"Keep study material together for review, questions and source recall."},
  {href:"/ai-research",icon:"🔬",zh:"沿着证据继续研究",en:"Research along the evidence",descZh:"论文、笔记、证据与判断保持在同一条研究脉络中。",descEn:"Keep papers, notes, evidence and conclusions in one research thread."},
] as const;`;
  s=s.slice(0,a)+block+s.slice(b+"] as const;".length);save(p,s);console.log("PASS product areas");
 }
}
replace("app/products/ProductCatalogClient.tsx","不用找功能，先说你想完成什么。","从需求出发，直接进入结果。","product hero");
replace("app/products/ProductCatalogClient.tsx","灵犀场把入口按真实任务重新整理。你只需要从当前最接近的问题开始。","灵犀场按真实任务整理入口，文件处理、知识活化、研究与创作各自直达。","product lead");
replaceAll("app/products/ProductCatalogClient.tsx","余额提现","余额退款","product refund");

// Navigation/search: remove unnecessary first-person and second-person wording in Chinese.
replace("components/Nav.tsx",'zh: { account:"我的账户", orders:"付费任务"','zh: { account:"账户", orders:"订单与使用记录"',"nav account");
replace("lib/lingxi-i18n.ts",'search:"搜索工具、功能或输入你的问题…"','search:"搜索工具、功能或输入问题…"',"search zh");
replace("lib/lingxi-i18n.ts",'myField:"我的账户"','myField:"账户"',"nav my field");
replace("lib/lingxi-i18n.ts",'toolsHero:"少绕一步，事情就更快一点。"','toolsHero:"常用文件与媒体问题，直接处理。"',"tools hero zh");
replace("lib/lingxi-i18n.ts",'toolsLead:"图片、PDF、视频、字幕、隐私与日常文件问题，都从这里开始。能留在浏览器里的，就尽量不上传。"','toolsLead:"PDF、图片、视频、字幕、表格、网页、隐私文件与日常识别，打开即可处理并得到结果。"',"tools lead zh");
replace("lib/lingxi-i18n.ts",'toolCount:"个入口已摆上台面"','toolCount:"项实用工具"',"tool count zh");
replace("lib/lingxi-i18n.ts",'toolSearch:"搜索：PDF 压缩、图片去水印、卡路里、视频转文字…"','toolSearch:"搜索：PDF 压缩、图片去水印、视频转文字、表格转换…"',"tool search zh");

// ToolsHub: full 9-language card UI, remove local/online engineering status and repeated upload wording.
replace("components/tools/ToolsHubV11.tsx",'import { useLingxiLang } from "@/lib/lingxi-i18n";','import { useLingxiLang } from "@/lib/lingxi-i18n";\nimport {toolDescription,toolTitle,toolUi} from "@/lib/tools/card-i18n";',"tools i18n import");
replace("components/tools/ToolsHubV11.tsx",'  const foreign = lang !== "zh";','',"tools foreign flag");
replace("components/tools/ToolsHubV11.tsx",'  const localCount = tools.filter((item) => item.localOnly).length;\n  const onlineCount = tools.length - localCount;\n','',"tools counts");
replace("components/tools/ToolsHubV11.tsx",'<div className="lx-tools-v124-stats">\n            <div><b>{tools.length}</b><span>{t("toolCount")}</span></div>\n            <div><b>{localCount}</b><span>{t("local")}</span></div>\n            <div><b>{onlineCount}</b><span>{t("online")}</span></div>\n          </div>','<div className="lx-tools-v124-stats"><div><b>{tools.length}</b><span>{toolUi(lang,"count")}</span></div></div>',"tools stats");
replace("components/tools/ToolsHubV11.tsx",'            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("toolSearch")} />','            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={toolUi(lang,"search")} />',"tools search");
replace("components/tools/ToolsHubV11.tsx",'              const label = id === "all" ? t("all") : (foreign ? categoryLabels[id].en : categoryLabels[id].zh);','              const label = toolUi(lang,id);',"tools categories");
replace("components/tools/ToolsHubV11.tsx",'<div className="lx11-tool-title-row"><h3>{foreign ? item.titleEn : item.titleZh}</h3></div>\n                  <p className="lx-tools-v124-desc">{foreign ? item.descEn : item.descZh}</p>','<div className="lx11-tool-title-row"><h3>{toolTitle(lang,item.href.replace("/tools/",""),lang==="zh"?item.titleZh:item.titleEn)}</h3></div>\n                  <p className="lx-tools-v124-desc">{toolDescription(lang,toolTitle(lang,item.href.replace("/tools/",""),lang==="zh"?item.titleZh:item.titleEn))}</p>',"tools title desc");
const oldMeta=`                    <span>
                      {item.href==="/tools/temp-mail"
                        ? (foreign ? "10-minute inbox · auto-destroy" : "10分钟收件 · 到期自动销毁")
                        : item.href==="/tools/burn-after-read"
                          ? (foreign ? "One-time link · auto-destroy" : "一次读取 · 自动销毁")
                          : item.localOnly
                            ? (foreign ? "Local · file stays in this browser" : "本地处理 · 文件不上传")
                            : (foreign ? "Online processing" : "在线处理")}
                    </span>
                    <b>{t("open")}</b>`;
replace("components/tools/ToolsHubV11.tsx",oldMeta,'                    <span>{toolUi(lang,"privacyMark")}</span>\n                    <b>{toolUi(lang,"open")}</b>',"tools card meta");

// Exact approved footer intro. This block is protected from later copy rewrites.
{
 const p="components/Footer.tsx";let s=read(p);
 const start=s.indexOf('      <section className="lx11-footer-brand">');
 const end=s.indexOf("\n      </section>",start);
 if(start<0||end<0){console.error("MISS footer brand block");failures.push("footer brand block")}
 else{
  const block=`      <section className="lx11-footer-brand">
        <div className="lx11-footer-logo"><Image src="/images/lingxifield-logo.png" alt="" width={40} height={40}/><div><b>{t("brand")}</b><small>LINGXIFIELD</small></div></div>
        {zh?<>
          <p className="lx11-footer-brand-lead"><b>一键创造，一念即达。</b></p>
          <p>一个让想法被理解、让问题被处理、让结果真正发生的场智能数字空间。</p>
          <p>从一个文件、一张图片、一段视频、一餐饭，到一个还没理清的念头，都可以从灵犀场开始。</p>
          <div className="lx11-footer-capability"><b>免费实用工具</b><p>面向 PDF、图片、视频、字幕、网页、表格、文件隐私与日常识别、AI证件等高频需求，提供一组打开就能用、处理完就能得到结果的实用工具。</p><p>包括 PDF 编辑、签名盖章、骑缝章、图片修复与高清放大、图片与视频去水印、图片压缩与格式转换、视频转文字、字幕翻译、网页内容提取、表格转 Excel、合同与 PDF 对比、卡路里识别、临时邮箱、阅后即焚等。创作无限，工具不上限。</p></div>
          <div className="lx11-footer-capability"><b>SASI 创作与构建</b><p>从 AI 短剧生成、网站构建，到书本 SASI、学习 SASI、科研 SASI、资料整理让知识活化起来的智能创作，SASI 帮你把模糊的想法逐步理解、展开、组织并构建成真正可以使用的结果。可使用，可发布，也可继续迭代。</p></div>
          <p className="lx11-footer-closing">从一个文件、一张图片、一段视频、一餐饭，到一个还没理清的念头，都可以从这里开始。</p>
        </>:<>
          <p className="lx11-footer-brand-lead">LINGXIFIELD turns files, media, knowledge and ideas into usable results.</p>
          <div className="lx11-footer-capability"><b>Practical tools</b><p>PDF, images, video, subtitles, tables, privacy and everyday file tasks.</p></div>
          <div className="lx11-footer-capability"><b>SASI creation & building</b><p>AI drama, website building, Book SASI, Learning SASI, Research SASI and knowledge activation.</p></div>
        </>}
        <span>lingxifield.com · lingxifield.cn</span>
      </section>`;
  s=s.slice(0,start)+block+s.slice(end+"\n      </section>".length);save(p,s);console.log("PASS approved footer intro");
 }
}

if(failures.length){console.error(`V14.69_PATCH_FAILURES=${failures.length}`);failures.forEach((x,i)=>console.error(`${i+1}. ${x}`));process.exit(1)}
console.log(`V14.69_PATCH=PASS files=${touched.size}`);
