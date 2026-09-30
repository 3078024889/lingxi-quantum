import fs from"node:fs";let ok=true;const R=f=>fs.readFileSync(f,"utf8");
const checks=[
["SUPPORT_API",R("app/api/support/tickets/route.ts").includes("lingxifield_support_tickets")],
["SUPPORT_GLOBAL_UI",R("components/support/LingxifieldFeedback.tsx").includes("发送给灵犀场")],
["CONTEXT_CAPTURE",R("app/api/support/tickets/route.ts").includes("release_version")&&R("app/api/support/tickets/route.ts").includes("userAgent")],
["TEMPLATE_CONSENT",R("app/api/creator/templates/route.ts").includes("CONSENT_REQUIRED")],
["NO_AUTO_PUBLICATION",R("app/api/creator/templates/route.ts").includes('visibility:"private"')],
["RESULT_GROWTH",R("components/growth/ResultGrowthActions.tsx").includes("提交为模板")],
["MONEY_NOTICES",["充值已到账","提现处理完成","退款处理完成"].every(x=>R("lib/notifications/money-events.ts").includes(x))],
["GROWTH_PRIVACY",R("lib/growth/result-loop.ts").includes("publicByDefault:false")&&R("lib/growth/result-loop.ts").includes("forcedWatermark:false")]
];for(const[n,v]of checks){console.log(`GROWTH_SUPPORT_${n}=${v?"PASS":"FAIL"}`);ok&&=v}process.exit(ok?0:1);