import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";
import ts from "typescript";

const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const raw=read("lib/footer-unified-copy.ts");
const source=ts.createSourceFile("footer-unified-copy.ts",raw,ts.ScriptTarget.Latest,true,ts.ScriptKind.TS);
const node=source.statements.filter(ts.isVariableStatement).flatMap(s=>s.declarationList.declarations)
 .find(d=>d.name.getText(source)==="FOOTER_UNIFIED");
assert(node&&ts.isObjectLiteralExpression(node.initializer),"FOOTER_UNIFIED object literal must exist");
const get=(obj,key)=>{
 if(!ts.isObjectLiteralExpression(obj))throw Error("Expected copy object "+key);
 const item=obj.properties.find(p=>ts.isPropertyAssignment(p)&&p.name.getText(source).replaceAll('"',"")===key);
 assert(item,"missing "+key);return item.initializer;
};
const literal=x=>{assert(ts.isStringLiteral(x),"expected literal string");return x.text;};
const langs=["zh","en","ja","ko","fr","de","es","pt","ar"];

test("the user-supplied global footer copy is complete in nine languages",()=>{
 const entries=node.initializer.properties.filter(ts.isPropertyAssignment);
 assert.deepEqual(entries.map(p=>p.name.getText(source)),langs);
 for(const e of entries){
  const lang=e.name.getText(source),v=e.initializer;
  assert(literal(get(v,"headline")).startsWith("🌍 "),lang);
  assert(literal(get(v,"intro")).length>=25,lang);
  const market=get(v,"marketPoints"),tools=get(v,"toolCategories");
  assert(ts.isArrayLiteralExpression(market)&&market.elements.length===7,lang+" market points");
  assert(ts.isArrayLiteralExpression(tools)&&tools.elements.length===6,lang+" utility categories");
  assert(market.elements.every(x=>literal(x).length>=9),lang);
  for(const x of tools.elements){
   assert(literal(get(x,"title")).length>=2,lang);
   assert(literal(get(x,"description")).length>=15,lang);
  }
  for(const [key,emoji] of [["toolsTitle","🧰"],["sasiTitle","✨"],["searchTitle","🔍"],["closingTitle","💎"]])
   assert(literal(get(v,key)).startsWith(emoji),lang+" "+key);
  assert(literal(get(v,"sasiDescription")).length>=20,lang);
  assert(literal(get(v,"closingDescription")).length>=20,lang);
 }
 const zh=get(node.initializer,"zh");
 assert.equal(literal(get(zh,"headline")),"🌍 全球SIAI排行榜｜全球SI AI工具行情平台");
 assert.equal(literal(get(zh,"intro")),"持续收录全球SI、AI公司、模型与工具，支持搜索、分类筛选、横向对比，持续更新官方资料。");
 assert.equal(literal(get(zh,"sasiTitle")),"✨ SASI 智能软件市场与开发者生态");
 assert.equal(literal(get(zh,"closingDescription")),"全球 SIAI 排行榜、模型价格与免费额度比较、SASI 智能软件市场、MT5 EA 源码与成品软件、100+ 在线实用工具，一站式查询与使用。");
 assert.match(raw,/SASI 智能软件市场/);
 assert.doesNotMatch(raw,/SASI智能创作|SASI全球多模型智能创作/);
 for(const word of ["阅后即焚","食物卡路里识别","API Token调用费用估算与模型成本对比","视频、短剧制作成本及积分费用计算"])
  assert(raw.includes(word),word);
});

test("home, market, SASI and tools all render one shared footer with original links intact",()=>{
 const footer=read("components/Footer.tsx");
 for(const page of ["app/page.tsx","app/siai/page.tsx","app/sasi/page.tsx","app/tools/layout.tsx"])
  assert(read(page).includes('import Footer from "@/components/Footer"'),page);
 assert.match(footer,/<section className="lx-footer-unified lx-footer-v3-showcase"/);
 assert.match(footer,/FOOTER_UNIFIED\[lang\]/);
 assert.match(footer,/FOOTER_TOOL_ICONS\[i\]/);
 assert.match(footer,/discovery\.topics\.map\(\(topic,i\)=>/);
 assert.match(footer,/siai-search-ranking-/);
 for(const marker of ["lx11-footer-grid","lx-footer-v3-nav","lx-footer-brand-social","lx-footer-v3-contact","lx-footer-v4-qr-grid","lx-footer-v3-toolstrip","lx11-footer-legal","business@lingxifield.com"])
  assert(footer.includes(marker),marker);
 assert.doesNotMatch(footer,/!isRankingRoute|usePathname|copy\[lang\]\.lead/);
 assert.doesNotMatch(footer,/AI 工具先比清楚，再决定用哪一个/);
 assert.doesNotMatch(footer,/PUBLIC_FEATURE_COPY\[lang\]\.description/);
 assert.equal((footer.match(/className="lx-footer-unified lx-footer-v3-showcase"/g)||[]).length,1);
 assert.doesNotMatch(footer,/lx-footer-unified-secondary|lx-footer-unified-close|lx-footer-social-strip/);
});

test("owner-submitted public social links and two real WeChat QR destinations are present",()=>{
 const footer=read("components/Footer.tsx");
 const route=read("app/api/public-social-qr/route.ts");
 for(const url of [
  "https://v.kuaishou.com/n71hSlT9","https://v.douyin.com/bE0vjWQZ_eY/","https://b23.tv/Bmcx90F",
  "https://xhslink.cn/o/5sPTjCC9kWe","https://x.com/lingxifieldsasi","https://youtube.com/@lingxifield",
  "https://www.facebook.com/share/19SgJhdxtL/","https://www.instagram.com/lingxifield/",
  "https://www.tiktok.com/@lingxifield.com","https://weibo.com/u/4003799090"
 ])assert(footer.includes(url),url);
 assert.equal((footer.match(/kind:"(?:share|profile)"/g)||[]).length,10);
 assert(footer.includes("#小程序://灵犀场/ktKRUjMRoEcPEsE"));
 assert(footer.includes("#小程序://10临时邮箱/p8AACkYNods09Rl"));
 assert(route.includes("http://weixin.qq.com/r/mp/_yAoMCzEYnEdrWhT93Xp"));
 assert(route.includes("http://weixin.qq.com/r/mp/oycQCBfEPUpCrVNr93Kx"));
 for(const asset of ["/images/lingxifield-wechat-service-qr.jpg","/images/miniapp-qrcode.png"])
  assert(footer.includes(asset),asset);
});


test("owner QQ groups and Telegram link are present only under footer brand social area, with nine-language copy",()=>{
 const footer=read("components/Footer.tsx"),css=read("app/siai-home.css");
 for(const group of ["1072178710","1074475201"])assert(footer.includes(group),"missing QQ group "+group);
 assert(footer.includes("https://t.me/globalsiai"));
 assert(footer.includes("FOOTER_GROUP_COPY[lang].title"));
 assert(footer.includes("FOOTER_QQ_GROUPS.map"));
 assert(footer.includes("copyQQGroup(number)"));
 assert.match(footer,/href=\{FOOTER_TELEGRAM\} target="_blank" rel="noopener noreferrer"/);
 const socials=footer.indexOf('className="lx-footer-brand-social"');
 const groups=footer.indexOf('className="lx-footer-v4-groups"');
 const qr=footer.indexOf('className="lx-footer-v4-qr-grid"');
 assert(socials>0&&groups>socials&&qr>groups,"groups must sit below original socials in first footer column");
 const declared=footer.slice(footer.indexOf("const FOOTER_GROUP_COPY:"),footer.indexOf("const FOOTER_QQ_GROUPS="));
 for(const lang of langs)assert(new RegExp("^\\s*"+lang+":\\{", "m").test(declared),"missing group translation: "+lang);
 for(const marker of [".lx-footer-v4-groups",".lx-footer-v4-qq-groups",".lx-footer-v4-telegram","html[data-theme=\"dark\"] .lx-footer-v4 .lx-footer-v4-telegram"])
  assert(css.includes(marker),marker);
 assert.equal((footer.match(/className="lx-footer-v4-qr-grid"/g)||[]).length,1);
 assert.equal((footer.match(/className="lx-footer-v4-miniapp-actions"/g)||[]).length,1);
 assert.equal((footer.match(/className="lx-footer-brand-social"/g)||[]).length,1);
});
