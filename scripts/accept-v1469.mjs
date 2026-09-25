import fs from "node:fs";
const r=p=>fs.readFileSync(p,"utf8");
const failures=[];
const check=(ok,name)=>{console.log(`${ok?"PASS":"FAIL"} ${name}`);if(!ok)failures.push(name)};

const products=r("app/products/ProductCatalogClient.tsx");
const tools=r("components/tools/ToolsHubV11.tsx");
const nav=r("components/Nav.tsx");
const i18n=r("lib/lingxi-i18n.ts");
const footer=r("components/Footer.tsx");
const card=r("lib/tools/card-i18n.ts");

check(products.includes("从一个想法到可用结果"),"product copy is factual");
check(!products.includes("我有一个想法"),"product first-person copy removed");
check(!products.includes("你想完成什么"),"product second-person copy removed");
check(tools.includes('toolTitle(lang'),"tools use multilingual titles");
check(tools.includes('toolDescription(lang'),"tools use multilingual descriptions");
check(tools.includes('toolUi(lang,"privacyMark")'),"tool cards use privacy-focused label");
check(!tools.includes("本地处理 · 文件不上传"),"repeated local-processing engineering copy removed");
check(!tools.includes("Online processing"),"online-processing engineering copy removed");
for(const lang of ["zh","en","ja","ko","fr","de","es","pt","ar"]) check(card.includes(`${lang}:`),`tool i18n contains ${lang}`);
check(nav.includes('account:"账户"'),"Chinese nav account removes first-person wording");
check(i18n.includes('search:"搜索工具、功能或输入问题…"'),"search removes second-person wording");
check(footer.includes("一键创造，一念即达。"),"approved footer line preserved");
check(footer.includes("一个让想法被理解、让问题被处理、让结果真正发生的场智能数字空间。"),"approved footer identity preserved");
check(footer.includes("创作无限，工具不上限。"),"approved footer tools line preserved");
check((footer.match(/<section className="lx11-footer-brand">/g)||[]).length===1,"footer brand section opens once");
check(footer.includes('<span>lingxifield.com · lingxifield.cn</span>\n      </section>'),"footer brand section closes after approved copy");
check(footer.includes("从一个文件、一张图片、一段视频、一餐饭，到一个还没理清的念头，都可以从这里开始。"),"approved footer closing preserved");

if(failures.length){console.error(`V14.69_ACCEPT_FAILURES=${failures.length}`);failures.forEach((x,i)=>console.error(`${i+1}. ${x}`));process.exit(1)}
console.log("V14.69.1_COPY_TOOLS_I18N=PASS");
