import fs from"node:fs";
const R=p=>fs.readFileSync(p,"utf8");
const region=R("lib/tools/food/region-hierarchy.ts"),providers=R("lib/tools/food/data-provider-registry.ts"),vision=R("lib/tools/food/vision-intelligence.ts"),image=R("lib/tools/food/image-recognition-local.ts"),search=R("app/api/tools/food/search/route.ts");
const checks=[
["INFOODS_ALL_REGIONS",["AFROFOODS","ASEANFOODS","CARICOMFOODS","CARKFOODS","EUROFOODS","LATINFOODS","NEASIAFOODS","MEFOODS_GULFOODS","NORAMFOODS","OCEANIAFOODS","SARCFOODS"].every(x=>region.includes(x))],
["REGIONAL_PROVIDER_REGISTRY",["sg-foodid","myfcd","china-food-composition","fao-infoods-directory","usda-fdc"].every(x=>providers.includes(x))],
["LICENSE_RUNTIME_SEPARATION",providers.includes('runtime:"registry-only"')&&providers.includes('commercialUse:"restricted"')],
["VISION_REGIONAL_RERANK",vision.includes("rerankFoodVision")&&image.includes("country?:string|null")],
["VISION_GLOBAL_VOCAB",image.includes("GLOBAL_VISION_VOCABULARY")],
["VISION_MIXED_MEAL_CONTRACT",vision.includes("mixedMealHints")&&vision.includes("USER_CONFIRM_REQUIRED")],
["VISION_LOW_CONFIDENCE_CONFIRM",vision.includes("requiresConfirmation")],
["NO_HARDCODED_USDA_RESULT_SOURCE",!search.includes('source:"USDA FoodData Central"')],
["NO_REMOTE_VISION",image.includes("allowRemoteModels=false")]
];
let ok=true;for(const[c,v]of checks){console.log(`GLOBAL_FOOD_VISION_${c}=${v?"PASS":"FAIL"}`);ok&&=v}process.exit(ok?0:1);
