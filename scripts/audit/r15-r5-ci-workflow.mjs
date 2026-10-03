import fs from"node:fs";
const bad=[];
const read=p=>fs.readFileSync(p,"utf8");

const test=read("tests/final-closure/tool-plain-language.spec.ts");
if(test.includes('page.getByRole("alert")'))bad.push("global alert locator remains");
if(!test.includes('page.locator("main").getByRole("alert")'))bad.push("main-scoped alert locator missing");

const finalConfig=read("playwright.final.config.ts");
const productionConfig=read("playwright.production.config.ts");
if(!finalConfig.includes('"**/production.spec.ts"'))bad.push("final closure must exclude external production.spec.ts");
if(!productionConfig.includes('testMatch: "**/production.spec.ts"'))bad.push("production browser config must exactly target production.spec.ts");

const wf=read(".github/workflows/production-gate.yml");
for(const x of[
 "actions/checkout@d23441a48e516b6c34aea4fa41551a30e30af803",
 "pnpm/action-setup@b906affcce14559ad1aafd4ab0e942779e9f58b1",
 "actions/setup-node@249970729cb0ef3589644e2896645e5dc5ba9c38"
])if(!wf.includes(x))bad.push(`immutable action pin missing ${x}`);

const cron=read("app/api/cron/withdrawal-reconcile/route.ts");
for(const x of["secureSecretEqual","processMoneyWebhookInbox","reconcileDueWithdrawals","markRuntimeStarted","markRuntimeSucceeded","markRuntimeFailed"])
 if(!cron.includes(x))bad.push(`money cron missing ${x}`);

if(bad.length){console.error(bad.join("\n"));process.exit(1)}
console.log("R15R10_PLAYWRIGHT_ALERT_LOCATOR_SCOPED=PASS");
console.log("R15R10_PRODUCTION_BROWSER_CHECK_SEPARATION=PASS");
console.log("R15R10_GITHUB_ACTIONS_IMMUTABLE_PINS=PASS");
console.log("R15R10_MONEY_CRON_WORKFLOW_PATH=PASS");
