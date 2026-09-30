import fs from"node:fs";const E=f=>fs.existsSync(f),R=f=>fs.readFileSync(f,"utf8");let ok=true;
const checks=[
["GLOBAL_FOOD",E("lib/tools/food/global-food-identity.ts")&&E("lib/tools/food/region-hierarchy.ts")],
["FOOD_RESULT_E2E",E("tests/final-closure/food-results.spec.ts")],
["SUPPORT",E("app/api/support/tickets/route.ts")&&R("components/support/LingxifieldFeedback.tsx").includes("getSession")],
["TEMPLATES",E("app/api/creator/templates/route.ts")&&R("app/api/creator/templates/route.ts").includes("CONSENT_REQUIRED")],
["MONEY_NOTIFICATIONS",R("app/api/notifications/route.ts").includes("balance_withdrawals")&&R("app/api/notifications/route.ts").includes("ai_refund_requests")],
["ANNOUNCEMENTS_LIVE",R("app/api/notifications/route.ts").includes("lingxifield_announcements")],
["CURRENT_VERSION_REGISTRY",(()=>{const v=R("lib/release/version.ts");const w=/website:\s*"([^"]+)"/.exec(v)?.[1]||"";const m=/miniProgram:\s*"([^"]+)"/.exec(v)?.[1]||"";return /^\d{4}\.\d{2}\.\d{2}\.\d+$/.test(w)&&/^\d+\.\d+\.\d+$/.test(m)})()]
];for(const[n,v]of checks){console.log(`CONVERGED_${n}=${v?"PASS":"FAIL"}`);ok&&=v}process.exit(ok?0:1);