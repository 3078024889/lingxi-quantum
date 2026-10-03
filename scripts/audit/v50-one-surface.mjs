import fs from "node:fs";
const need=[
 ["app/sasi/page.tsx","SasiOneSurface"],
 ["components/SasiOneSurface.tsx",'id:"drama"'],
 ["components/SasiOneSurface.tsx",'id:"website"'],
 ["components/SasiOneSurface.tsx",'id:"book"'],
 ["components/SasiOneSurface.tsx",'id:"learning"'],
 ["components/SasiOneSurface.tsx",'id:"research"'],
 ["app/sasi/ConnectionCenter.tsx","volcengine"],
 ["app/sasi/ConnectionCenter.tsx","openrouter"],
 ["app/sasi/ConnectionCenter.tsx","连接一个 API Key，使用你账号下已开通的多智能生态模型"],
 ["app/sasi/ConnectionCenter.tsx","连接一个 API Key，使用你有权访问的多智能生态模型。"],
 ["app/sasi/ConnectionCenter.tsx","SASI 会在短剧、网站、书本、学习和科研中自动选择适配的能力"],
];
const bad=[];
for(const [p,x] of need){const s=fs.readFileSync(p,"utf8");if(!s.includes(x))bad.push(`${p}: missing ${x}`)}
const redirects={
 "app/sasi/drama/page.tsx":"mode=drama",
 "app/sasi/build/page.tsx":"mode=website",
 "app/ai-knowledge/page.tsx":"mode=book",
 "app/ai-learning/page.tsx":"mode=learning",
 "app/ai-research/page.tsx":"mode=research",
};
for(const [p,x] of Object.entries(redirects)){const s=fs.readFileSync(p,"utf8");if(!s.includes(x))bad.push(`${p}: redirect missing`)}
const ui=["components/SasiByokTextWorkbench.tsx","components/KnowledgeWorkspace.tsx","lib/sasi/byok-copy.ts","lib/sasi/composer-i18n.ts"];
const forbidden=["模型费用由对应服务商直接收取","费用由对应服务商直接结算","供应商预估","供应商任务"];
for(const p of ui){if(!fs.existsSync(p))continue;const s=fs.readFileSync(p,"utf8");for(const f of forbidden)if(s.includes(f))bad.push(`${p}: ${f}`)}
if(bad.length){console.error(bad.join("\n"));process.exit(1)}
console.log("V50_SASI_ONE_SURFACE=PASS");
console.log("V50_MULTIMODEL_PRIMARY_CONNECTIONS=PASS");
console.log("V50_LEGACY_ROUTE_REDIRECTS=PASS");
console.log("V50_USER_COPY_BOUNDARY=PASS");
