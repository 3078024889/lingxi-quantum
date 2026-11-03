import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";
const read=(path)=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
const localized=read("app/[locale]/siai/page.tsx");
const root=read("app/siai/page.tsx");
const sitemap=read("app/sitemap.ts");
const data=read("app/siai/catalog-data.ts");
test("SIAI has nine canonical indexable page paths with hreflang, inLanguage and localized FAQs",()=>{
 assert.match(localized,/generateStaticParams/);
 assert.match(localized,/LOCALIZED_LOCALES/);
 assert.match(localized,/languageAlternates\("\/siai"\)/);
 assert.match(localized,/inLanguage:c\.hreflang/);
 assert.match(localized,/SIAI_DISCOVERY\[locale\]/);
 assert.match(localized,/getSiaiDirectoryRows\(\)/);
 assert.match(sitemap,/localePath\(locale,"\/siai"\)/);
 assert.match(root,/languageAlternates\("\/siai"\)/);
 assert.match(root,/title:\{absolute:/);
});
test("No duplicate company profiles and no unsourced candidate SEO listing",()=>{
 assert.match(data,/getSiaiSourcePreviewRows\(\)/);
 assert.match(data,/curated\.length!==32/);
 assert.match(data,/rows\.length!==62/);
 assert.match(root,/numberOfItems:curated\.length/);
 assert.match(localized,/numberOfItems:curated\.length/);
 assert(!localized.includes("publishApproved:true"));
});
