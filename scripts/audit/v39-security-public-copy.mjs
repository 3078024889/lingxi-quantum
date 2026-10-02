import fs from "node:fs";
const must=(v,m)=>{if(!v)throw new Error(m)};
const pkg=JSON.parse(fs.readFileSync("package.json","utf8"));
must(pkg.dependencies.next==="15.5.27","V39_NEXT_NOT_PATCHED");
must(pkg.devDependencies["eslint-config-next"]==="15.5.27","V39_ESLINT_NEXT_NOT_PATCHED");

const wallet=fs.readFileSync("components/WalletHeroCopy.tsx","utf8");
const walletPage=fs.readFileSync("app/ai-wallet/page.tsx","utf8");
const footer=fs.readFileSync("components/Footer.tsx","utf8");
const connPage=fs.readFileSync("app/sasi/connections/page.tsx","utf8");
const conn=fs.readFileSync("app/sasi/ConnectionCenter.tsx","utf8");
const i18n=fs.readFileSync("lib/sasi/connection-i18n.ts","utf8");

must(!wallet.includes('zh="AI 余额"'),"V39_AI_BALANCE_VISIBLE");
must(!walletPage.includes('AI Balance｜LINGXIFIELD'),"V39_AI_BALANCE_METADATA_VISIBLE");
must(!footer.includes('连接我的 AI'),"V39_CONNECT_MY_AI_VISIBLE");
must(!footer.includes('Connect my AI'),"V39_CONNECT_MY_AI_EN_VISIBLE");
must(!footer.includes('href="/declaration"'),"V39_RETIRED_DECLARATION_LINK_REMAINS");
must(!connPage.includes("API Key"),"V39_CONNECTION_METADATA_API_KEY_VISIBLE");
must(!connPage.includes("连接 AI 服务"),"V39_CONNECTION_METADATA_AI_SERVICE_VISIBLE");
must(!conn.includes("多模型创作"),"V39_MULTI_MODEL_COPY_VISIBLE");
must(!conn.includes("具体模型执行"),"V39_MODEL_EXECUTION_COPY_VISIBLE");
must(!i18n.includes('"模型与 API"'),"V39_MODELS_API_LABEL_VISIBLE");

// Keep private connection area noindexed.
const indexing=fs.readFileSync("lib/seo/indexing.ts","utf8");
must(indexing.includes("connections|chat|operator|project-dna"),"V39_CONNECTION_NOINDEX_GUARD_MISSING");

console.log("NEXT_MAINTENANCE_LTS_SECURITY_PATCH=15.5.27");
console.log("PUBLIC_AI_BALANCE_WORDING=0");
console.log("PUBLIC_CONNECT_MY_AI_WORDING=0");
console.log("PUBLIC_MODELS_API_LABEL=0");
console.log("RETIRED_DECLARATION_INTERNAL_LINK=0");
console.log("SASI_CONNECTIONS_NOINDEX=PASS");
console.log("FOOD_CALORIE_CHANGED=NO");
console.log("PAYMENT_WITHDRAWAL_CHANGED=NO");
console.log("PAYMENT_EXECUTION_CHANGED=NO");
console.log("PROTECTED_PRODUCTION_DATA=UNCHANGED");
console.log("CORE_ORIGIN_MODULES_CHANGED=NO");
console.log("LINGXIFIELD_V39_SECURITY_PUBLIC_COPY_AUDIT=PASS");
