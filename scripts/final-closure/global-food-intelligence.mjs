import fs from"node:fs";let ok=true;const R=f=>fs.readFileSync(f,"utf8");
const id=R("lib/tools/food/global-food-identity.ts"),reg=R("lib/tools/food/region-hierarchy.ts"),src=R("lib/tools/food/data-provider-registry.ts"),search=R("app/api/tools/food/search/route.ts"),calc=R("app/api/tools/food/manual-calculate/route.ts"),vision=R("lib/tools/food/common-food-vocabulary.ts"),ver=R("lib/release/version.ts");
const checks=[
["INFOODS_REGIONS",["NEASIAFOODS","ASEANFOODS","EUROFOODS","LATINFOODS","NORAMFOODS","SARCFOODS"].every(x=>reg.includes(x))],
["YOUTIAO_ALIASES",["油条","油條","油炸鬼","油炸粿","youtiao","you tiao","yu char kway"].every(x=>id.includes(x))],
["CN_FOODS",["肠粉","粽子","麻辣烫","螺蛳粉","肉夹馍"].every(x=>id.includes(x))],
["ASEAN_FOODS",["海南鸡饭","叻沙","椰浆饭","炒粿条","越南河粉"].every(x=>id.includes(x))],
["JP_KR_FOODS",["寿司","拉面","韩式拌饭","辣炒年糕"].every(x=>id.includes(x))],
["GLOBAL_FOODS",["Tacos","Paella","Fish and chips","Fruit salad"].every(x=>id.includes(x))],
["LICENSE_GATE",src.includes('commercialUse:"restricted"')&&src.includes("verify-license")],
["REGION_SEARCH",search.includes("foodRegionsForCountry")&&search.includes("foodSearchTerms")],
["UNRESOLVED_HONESTY",search.includes("NO_CLEARED_SOURCE")],
["LOCAL_REMOTE_CALC",calc.includes("isLocalFoodId")&&calc.includes("calculate_food_compact_v1")],
["VISION_REGIONAL",vision.includes('"youtiao"')&&vision.includes('"mixed fruit platter"')]
];
for(const [n,p]of checks){console.log(`GLOBAL_FOOD_${n}=${p?"PASS":"FAIL"}`);ok&&=p}process.exit(ok?0:1);