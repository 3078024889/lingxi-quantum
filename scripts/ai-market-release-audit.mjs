/** Conservative, machine-readable AI market release audit. */
import {existsSync,readFileSync,mkdirSync,writeFileSync} from "node:fs";
import {dirname} from "node:path";
const required=[
 "lib/ai-discovery/catalog.ts",
 "lib/ai-discovery/market-discovery.ts",
 "lib/ai-discovery/model-cost.ts",
 "lib/ai-discovery/price-series.ts",
 "lib/ai-discovery/market-csv.ts",
 "scripts/ai-market-ingest.mjs",
 "scripts/ai-market-store-export.mjs",
 "scripts/ai-market-store-health.mjs",
 "app/ai/rankings/page.tsx",
 "app/ai/market-preview/page.tsx",
 "app/ai/market-preview/explore/page.tsx",
 "app/ai/market-preview/compare/page.tsx",
 "app/ai/market-preview/export/route.ts",
 "supabase/migrations/20261026150000_ai_discovery_evidence.sql"
];
const inventory=required.map(path=>({path,exists:existsSync(path)}));
const evidence={
 persistentProductionDatabase:process.env.AI_MARKET_PRODUCTION_DATABASE_VERIFIED==="true",
 multiDayLiveIngestion:process.env.AI_MARKET_MULTIDAY_INGESTION_VERIFIED==="true",
 publicRedistributionRights:process.env.AI_MARKET_REDISTRIBUTION_APPROVED==="true",
 mobileDesktopBrowserE2E:process.env.AI_MARKET_BROWSER_E2E_VERIFIED==="true",
 nineLanguageContentQA:process.env.AI_MARKET_NINE_LOCALE_QA_VERIFIED==="true",
 externalMetricsProvenance:process.env.AI_MARKET_METRICS_PROVENANCE_VERIFIED==="true",
 vendorModerationAndCommerce:process.env.AI_MARKET_VENDOR_COMMERCE_VERIFIED==="true",
 fullProductionGate:process.env.AI_MARKET_FULL_PRODUCTION_GATE_VERIFIED==="true"
};
const blockers=[...inventory.filter(x=>!x.exists).map(x=>"missing: "+x.path),...Object.entries(evidence).filter(([,ok])=>!ok).map(([key])=>"unverified: "+key)];
const report={schemaVersion:1,checkedAt:new Date().toISOString(),ready:blockers.length===0,inventory,evidence,blockers,publication:"review-only"};
const path=process.env.AI_MARKET_RELEASE_REPORT??"reports/ai-market/release-audit.json";
mkdirSync(dirname(path),{recursive:true});writeFileSync(path,JSON.stringify(report,null,2)+"\n");
console.log(JSON.stringify({ready:report.ready,files:inventory.length,blockers:blockers.length,report:path}));
if(inventory.some(x=>!x.exists))process.exitCode=1;
if(process.argv.includes("--require-release")&&!report.ready)process.exitCode=2;
