import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=(p)=>readFileSync(p,"utf8");
test("all nine locales are wired into the premium original SASI marketplace and real product detail",()=>{
 const home=read("components/SasiOpenMarketplace.tsx");
 const detail=read("components/SasiMarketplaceProductDetail.tsx");
 const copy=read("lib/sasi-software/ui-copy.ts");
 for(const source of [home,detail]){
  assert.match(source,/sasiSoftwareUiText\(lang,/);
  assert.doesNotMatch(source,/zh\?"[^"]+":"[^"]+"/);
  assert.match(source,/dir=\{lang==="ar"\?"rtl":"ltr"\}/);
 }
 for(const locale of ["ja","ko","fr","de","es","pt","ar"])assert.match(copy,new RegExp("\\b"+locale+":"));
 assert.match(copy,/PREMIUM_COPY/);
 for(const label of ["Software Market","Full software description (up to 100,000 characters)","One main image per listing; detail images are optional","Pay securely with PayPal"]){
  assert.ok(copy.includes(JSON.stringify(label)),"nine-language key "+label);
 }
 assert.match(home,/hero-original\.webp/);
 assert.match(home,/friendlyError\(e,lang\)/);
 assert.match(home,/translatedStatus\(lang,item\.status\)/);
 assert.match(home,/categoryLabel\(lang,item\.category\)/);
 assert.match(detail,/photos\.filter\(p=>p\.kind==="detail"\)\.slice\(0,4\)/);
 assert.doesNotMatch(copy,/Up to four cover images and four detail images/);
});
