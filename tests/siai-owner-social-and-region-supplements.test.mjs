import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";
import ts from "typescript";

const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
const footer=read("components/Footer.tsx");
const overlay=read("app/siai/official-region-supplements.ts");
const preview=read("app/siai/candidate-public.ts");
const ranking=read("components/SiaiRankingHome.tsx");
const qr=read("app/api/public-social-qr/route.ts");
const languages=["zh","en","ja","ko","fr","de","es","pt","ar"];
const profiles={
 "快手":"https://v.kuaishou.com/n71hSlT9",
 "抖音":"https://v.douyin.com/bE0vjWQZ_eY/",
 "哔哩哔哩":"https://b23.tv/Bmcx90F",
 "小红书":"https://xhslink.cn/o/5sPTjCC9kWe",
 "X":"https://x.com/lingxifieldsasi",
 "YouTube":"https://youtube.com/@lingxifield",
 "Facebook":"https://www.facebook.com/share/19SgJhdxtL/",
 "Instagram":"https://www.instagram.com/lingxifield/",
 "TikTok":"https://www.tiktok.com/@lingxifield.com",
 "微博":"https://weibo.com/u/4003799090"
};
test("all owner-provided public social links replace stale accounts without password/access tokens",()=>{
 for(const [label,url] of Object.entries(profiles)){
  assert(footer.includes('label:"'+label+'"'),label);
  assert(footer.includes('href:"'+url+'"'),url);
  assert(new URL(url).protocol==="https:",url);
 }
 assert.equal((footer.match(/kind:"(?:share|profile)"/g)||[]).length,10);
 assert.match(footer,/channel\.kind==="share"/);
 for(const old of ["https://x.com/lingxifield?s=11","https://xhslink.cn/m/8rig9AtdDvK","https://b23.tv/VhatqCq","https://v.douyin.com/WG4QmhbliNk"])assert(!footer.includes(old),old);
});
test("two QR images preserve original scan targets and existing miniapp QR images",()=>{
 assert(qr.includes("http://weixin.qq.com/r/mp/_yAoMCzEYnEdrWhT93Xp"));
 assert(qr.includes("http://weixin.qq.com/r/mp/oycQCBfEPUpCrVNr93Kx"));
 assert(qr.includes('key!=="search"&&key!=="ranking"'));
 assert(qr.includes('"X-Content-Type-Options":"nosniff"'));
 for(const keep of ["/images/lingxifield-wechat-service-qr.jpg","/images/miniapp-qrcode.png"])assert(footer.includes(keep));
 for(const cmd of ["#小程序://灵犀场/ktKRUjMRoEcPEsE","#小程序://10临时邮箱/p8AACkYNods09Rl"])assert(footer.includes(cmd));
 for(const kind of ["search","ranking"])assert(footer.includes("/api/public-social-qr?kind="+kind));
});
test("five official region evidence records are localized but not converted to false unrestricted-region claims",()=>{
 for(const id of ["notion-ai","devin-desktop","freepik-ai","synthesia","scite"])assert(overlay.includes('"'+id+'":{'),id);
 assert.equal((overlay.match(/,checkedAt:"2026-11-04",scope:/g)||[]).length,5);
 assert.equal((overlay.match(/scope:"(?:official_policy_no_full_country_list|contract_worldwide_not_checkout)"/g)||[]).length,5);
 for(const code of languages){
  const regex=new RegExp("(^|\\s)"+code+":", "gm");
  assert.equal([...overlay.matchAll(regex)].length,5,code+" translations");
 }
 assert(preview.includes("region:regionSupplement?.localized.zh||text(region)"));
 assert(preview.includes("regionSource:regionSupplement?.source||source(region)"));
 assert(ranking.includes("supplementalRegionFor(p.id,lang)"));
 for(const u of ["https://www.notion.com/help/notion-ai-faqs","https://cognition.com/legal/platform-terms-of-service",
  "https://www.magnific.com/legal/ai-products","https://www.synthesia.io/legal/acceptable-use-policy",
  "https://www.researchsolutions.com/scite-terms-and-conditions"])
  assert(overlay.includes(u),u);
 assert(!overlay.includes('zh:"不限地区"'));
 assert(preview.includes("snapshot.totals.observed!==205||snapshot.totals.missing!==5"));
});
