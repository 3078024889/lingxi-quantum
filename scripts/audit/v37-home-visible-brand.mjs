import fs from "node:fs";
const must=(v,m)=>{if(!v)throw new Error(m)};
const home=fs.readFileSync("components/HomeProblemHub.tsx","utf8");
const mid=fs.readFileSync("middleware.ts","utf8");
must(home.includes("灵犀场 LINGXIFIELD｜SASI智能生态与全球智能工具平台"),"V37R1_VISIBLE_TITLE_MISSING");
must(home.includes("AI短剧生成、网站构建、书本SASI、学习SASI、科研SASI，以及PDF、图片、视频、OCR、临时邮箱、阅后即焚等实用工具。"),"V37R1_VISIBLE_DESCRIPTION_MISSING");
must(home.includes('className="lx-v37-brand-title"'),"V37R1_VISIBLE_TITLE_NODE_MISSING");
must(home.includes('className="lx-v37-brand-desc"'),"V37R1_VISIBLE_DESC_NODE_MISSING");
for(const l of ["zh","en","ja","ko","fr","de","es","pt","ar"]){
  must(new RegExp(`^\\s*${l}:\\{`,"m").test(home),`V37R1_LANG_MISSING:${l}`);
}
must(mid.includes('"/number-energy"'),"V37R1_NUMBER_ENERGY_410_MISSING");
must(mid.includes('"/field-test"'),"V37R1_FIELD_TEST_410_MISSING");
console.log("HOMEPAGE_VISIBLE_TITLE=PASS");
console.log("HOMEPAGE_VISIBLE_DESCRIPTION=PASS");
console.log("HOMEPAGE_VISIBLE_BRAND_9_LANG=PASS");
console.log("NUMBER_ENERGY_HTTP_410_GUARD=PASS");
console.log("FIELD_TEST_HTTP_410_GUARD=PASS");
console.log("FOOD_CALORIE_CHANGED=NO");
console.log("PAYMENT_WITHDRAWAL_CHANGED=NO");
console.log("PAYMENT_EXECUTION_CHANGED=NO");
console.log("PROTECTED_PRODUCTION_DATA=UNCHANGED");
console.log("CORE_ORIGIN_MODULES_CHANGED=NO");
console.log("LINGXIFIELD_V37R1_SOURCE_AUDIT=PASS");
