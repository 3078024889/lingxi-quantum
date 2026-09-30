import fs from"node:fs";
const p="fixtures/food-final/localization-5901x9.production.json";
if(!fs.existsSync(p)){console.error("LOCALIZATION_5901X9=BLOCKED_MISSING_PRODUCTION_ASSET");process.exit(2)}
const a=JSON.parse(fs.readFileSync(p,"utf8")),langs=["en","zh","ja","ko","fr","de","es","pt","ar"];
if(!Array.isArray(a)||a.length!==5901){console.error("LOCALIZATION_ROW_COUNT=FAIL");process.exit(3)}
for(const x of a)for(const l of langs){const v=String(x["name_"+l]||"").trim();if(!v){console.error("LOCALIZATION_EMPTY="+x.food_id+":"+l);process.exit(4)}
 if(l!=="en"&&v===String(x.name_en||"").trim()){console.error("LOCALIZATION_ENGLISH_COPY="+x.food_id+":"+l);process.exit(5)}}
console.log("LOCALIZATION_5901X9=PASS");
