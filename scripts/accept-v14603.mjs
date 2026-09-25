import fs from "node:fs";
const v=JSON.parse(fs.readFileSync("vercel.json","utf8"));
const crons=Array.isArray(v.crons)?v.crons:[];
const w=crons.find(x=>x.path==="/api/cron/withdrawal-reconcile");
if(!w)throw new Error("FAIL withdrawal reconciliation cron missing");
if(w.schedule!=="47 3 * * *")throw new Error("FAIL withdrawal reconciliation cron is not daily");
if(crons.some(x=>String(x.schedule||"").includes("*/15")))throw new Error("FAIL sub-daily Hobby-incompatible cron remains");
console.log("V14.60.3 VERCEL CRON HOTFIX=PASS");
