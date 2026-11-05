import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {DIAGNOSTIC_COPY,DIAGNOSIS_RESULT_COPY} from "../lib/siai/spend-diagnostic-i18n.ts";
import {SPEND_OPTION_COPY} from "../lib/siai/verified-spend-options-i18n.ts";
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
test("localized link uses light client routing and domain policy allowlists host",()=>{
 assert.ok(read("components/siai/SpendDiagnosticEntry.tsx").includes('"/"+lang+"/siai/spend-diagnostic"'));
 assert.match(read("lib/seo/siai-domain-policy.ts"),/knownHost/);
 assert.match(read("middleware.ts"),/lingxifield\.cn/);
});
test("web data remains browser-local, without billing credentials",()=>{
 const ui=read("components/siai/SpendDiagnostic.tsx");
 assert.doesNotMatch(ui,/fetch\(|XMLHttpRequest|localStorage|sessionStorage|document\.cookie/);
 assert.match(ui,/diagnoseAiSpend/);
});

test("task comparison labels exist in all nine native languages",()=>{
 assert.deepEqual(Object.keys(SPEND_OPTION_COPY).sort(),[...langs].sort());
 const master=Object.keys(SPEND_OPTION_COPY.zh).sort();
 for(const lang of langs){
  assert.deepEqual(Object.keys(SPEND_OPTION_COPY[lang]).sort(),master,lang);
  for(const text of Object.values(SPEND_OPTION_COPY[lang]))assert.ok(text.trim(),lang);
 }
});
test("candidate suggestions are curated and source-backed, not research previews",()=>{
 const source=read("lib/siai/verified-spend-options.ts");
 assert.match(source,/const curated=getPublishedSiaiRows\(\)/);
 assert.match(read("app/siai/catalog-data.ts"),/export function getPublishedSiaiRows/);
 assert.match(source,/priceEvidenceUrl=safeLink\(row\.priceSource\)/);
 assert.match(source,/if\(!priceEvidenceUrl\)return \[\]/);
 assert.match(source,/protocol==="https:"/);
 assert.match(read("components/siai/SpendDiagnostic.tsx"),/option\.priceEvidenceUrl/);
});
