import fs from"node:fs";
const p="audit-reports/food-recognition-benchmark.json";
if(!fs.existsSync(p)){console.error("RECOGNITION_BENCHMARK=BLOCKED_NOT_RUN");process.exit(2)}
const x=JSON.parse(fs.readFileSync(p,"utf8"));
if(Number(x.top3_recall)<.90||Number(x.dangerous_confident_wrong_primary)>.02||x.low_confidence_confirmation!==true){console.error("RECOGNITION_BENCHMARK=FAIL");process.exit(3)}
console.log("RECOGNITION_BENCHMARK=PASS");
