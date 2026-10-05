import fs from"node:fs";
const must=(v,m)=>{if(!v)throw new Error(m)};
const langs=["zh","en","ja","ko","fr","de","es","pt","ar"];
const i=fs.readFileSync("lib/lingxi-i18n.ts","utf8");
for(const l of langs)must(i.includes(`"${l}"`)||i.includes(`${l}:`),"R16_LANG_MISSING:"+l);
must(i.includes('root.dir=safe==="ar"?"rtl":"ltr"'),"R16_ARABIC_RTL_MISSING");
must(i.includes("const dictionaries:Record<LingxiLang"),"R16_DICTIONARY_REGISTRY_MISSING");

const seo=fs.readFileSync("lib/seo/global-seo.ts","utf8");
for(const l of langs)must(seo.includes(`"${l}":{`),"R16_SEO_LANG_MISSING:"+l);
must(seo.includes('hreflang:"ar"')&&seo.includes('dir:"rtl"'),"R16_ARABIC_SEO_RTL_MISSING");

const guide=fs.readFileSync("components/SasiStartGuide.tsx","utf8");
for(const l of langs)must(guide.includes(`${l}:`),"R16_SASI_GUIDE_LANG_MISSING:"+l);

const knowledge=fs.readFileSync("components/KnowledgeWorkspace.tsx","utf8");
must(knowledge.includes("const c=(zh:string,en:string,ja:string,ko:string,fr:string,de:string,es:string,pt:string,ar:string)"),"R16_KNOWLEDGE_9LANG_FACTORY_MISSING");
for(const signal of["helpful","not-helpful","incorrect","insufficient-evidence"]){
 const line=knowledge.split("\n").find(x=>x.includes(`${signal}:`)||x.includes(`"${signal}":`))||"";
 for(const l of langs)must(line.includes(`${l}:`),"R16_FEEDBACK_LANG_MISSING:"+signal+":"+l);
}

const connection=fs.readFileSync("lib/sasi/connection-i18n.ts","utf8");
must(connection.includes("(zh:string,en:string,ja:string,ko:string,fr:string,de:string,es:string,pt:string,ar:string)"),"R16_CONNECTION_9LANG_FACTORY_MISSING");

console.log("R16_I18N_LANG_SET_9=PASS");
console.log("R16_I18N_CORE_SURFACES_9LANG=PASS");
console.log("R16_ARABIC_RTL=PASS");
console.log("R16_KNOWLEDGE_FEEDBACK_9LANG=PASS");
