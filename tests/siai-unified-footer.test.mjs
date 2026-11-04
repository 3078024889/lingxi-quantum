import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const component=read("components/UnifiedFooterOverview.tsx");
const footer=read("components/Footer.tsx");
test("shared marketing footer preserves exact Chinese copy and all emoji",()=>{
 for(const str of ["🌍 全球SIAI排行榜｜全球SI AI工具行情平台","🧰 100+在线实用工具","📄 PDF","🖼️ 图片","🎬 视频音频","📊 文件表格","🔐 隐私工具","🍎 日常工具","✨ SASI全球多模型智能创作","🔍 大家还会搜：","💎 灵犀场 LINGXIFIELD","API Token调用费用估算与模型成本对比","按领域、任务、免费方案及付款方式筛选","一站式使用。"])assert(component.includes(str),str);
 assert.match(component,/SIAI_DISCOVERY\[lang\]\.topics/);
 assert.match(component,/padStart\(2,"0"\)/);
 assert.match(component,/siai-search-ranking-/);
});
test("site footer unified across home, ranking, tools and SASI and old promo removed",()=>{
 assert.equal((footer.match(/<UnifiedFooterOverview\/>/g)||[]).length,1);
 assert.doesNotMatch(footer,/copy\[lang\]\.lead|PUBLIC_FEATURE_COPY\[lang\]\.description|isRankingRoute/);
 for(const p of ["app/page.tsx","app/siai/page.tsx","app/tools/layout.tsx","app/sasi/page.tsx"])assert.match(read(p),/<Footer\/>/,p);
 for(const term of ['href="/siai"','href="/tools"','href="/sasi"','href="/account"','href="/terms"','href="/privacy"','href="/refunds"','business@lingxifield.com','/images/lingxifield-wechat-service-qr.jpg','/images/miniapp-qrcode.png'])assert(footer.includes(term),term);
});
test("nine languages, seven benefit points, six tool groups, and readable responsive CSS",()=>{
 const languageNames=["en","ja","ko","fr","de","es","pt","ar"];
 for(const lang of languageNames)assert(component.includes(lang+':{market:'),lang);
 assert.match(component,/const TOOL_URLS=\[/);
 assert.match(component,/FOOTER_CATALOG\[lang\]\.slice\(0,4\)/);
 const css=read("app/unified-shell.css");
 for(const selector of [".lx-footer-showcase",".lx-footer-benefits",".lx-footer-tool-cards",".lx-footer-search",".lx-footer-end"])assert(css.includes(selector),selector);
 assert.match(css,/@media\(max-width:640px\)/);
});
