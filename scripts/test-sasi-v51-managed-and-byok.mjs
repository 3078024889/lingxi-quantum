import fs from "node:fs";
const quote=fs.readFileSync("app/api/sasi/quote/route.ts","utf8");
const jobs=fs.readFileSync("app/api/sasi/jobs/route.ts","utf8");
const drama=fs.readFileSync("app/sasi/drama/page.tsx","utf8");
if(quote.includes("VIDEO_BYOK_REQUIRED")||jobs.includes("VIDEO_BYOK_REQUIRED"))throw new Error("MANAGED_VIDEO_STILL_RETIRED");
if(!drama.includes("SasiManagedVideoCreate")||!drama.includes("SasiByokVideoStudio"))throw new Error("DEFAULT_AND_ADVANCED_VIDEO_MODES_REQUIRED");
console.log("SASI_V51_MANAGED_AND_BYOK=PASS");
