import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {DIAGNOSTIC_COPY,DIAGNOSIS_RESULT_COPY} from "../lib/siai/spend-diagnostic-i18n.ts";
const langs=["zh","en","ja","ko","fr","de","es","pt","ar"];
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");

test("all 9 language entries complete and show no empty user-facing labels",()=>{
 assert.deepEqual(Object.keys(DIAGNOSTIC_COPY).sort(),[...langs].sort());
 const master=Object.keys(DIAGNOSTIC_COPY.zh);
 for(const lang of langs){
  assert.deepEqual(Object.keys(DIAGNOSTIC_COPY[lang]).sort(),master.sort());
  for(const value of Object.values(DIAGNOSTIC_COPY[lang]))assert.ok(typeof value==="string"&&value.trim().length>0,lang);
  for(const value of Object.values(DIAGNOSIS_RESULT_COPY[lang]))assert.ok(typeof value==="string"&&value.trim().length>0,lang);
 }
});
test("public diagnostic exists in Chinese + eight existing locale routes",()=>{
 assert.match(read("app/siai/spend-diagnostic/page.tsx"),/SpendDiagnostic/);
 assert.match(read("app\/\[locale\]\/siai\/spend-diagnostic\/page.tsx"),/generateStaticParams/);
 assert.match(read("components/SiaiRankingHome.tsx"),/<SpendDiagnosticEntry\/>/);
});
test("localized link uses existing localePath and domain policy uses allowlisted host",()=>{
 assert.match(read("components/siai/SpendDiagnosticEntry.tsx"),/localePath\(lang,/);
 assert.match(read("lib/seo/siai-domain-policy.ts"),/knownHost/);
 assert.match(read("middleware.ts"),/lingxifield\.cn/);
});
test("web data remains browser-local, without billing credentials",()=>{
 const ui=read("components/siai/SpendDiagnostic.tsx");
 assert.doesNotMatch(ui,/fetch\(|XMLHttpRequest|localStorage|sessionStorage|document\.cookie/);
 assert.match(ui,/diagnoseAiSpend/);
});
