import fs from "node:fs";

const targets=[
  "components/SasiPricingCurrencyClient.tsx",
  "app/sasi/ConnectionCenter.tsx",
  "lib/sasi/function-menu-i18n.ts",
  "lib/sasi/composer-i18n.ts",
  "components/SasiByokTextWorkbench.tsx",
  "components/KnowledgeWorkspace.tsx",
  "components/SasiCommandCenter.tsx",
  "app/account/page.tsx",
  "lib/sasi/byok-copy.ts"
];

const forbidden=[
  "充值多少到账多少",
  "长期保留。",
  "统一计费",
  "成功生成秒",
  "模型费用由对应服务商直接收取",
  "费用由对应服务商直接结算",
  "供应商预估",
  "供应商任务",
  "创作余额",
  "AI余额",
  "连接创作服务",
  "知识来源",
  "SASI 编排",
  "连接安全",
  "当前边界",
  "CNY 与 USD 是两套独立价格",
  "不按汇率换算"
];

const bad=[];
for(const path of targets){
  if(!fs.existsSync(path))continue;
  const text=fs.readFileSync(path,"utf8");
  for(const phrase of forbidden)if(text.includes(phrase))bad.push(`${path}: ${phrase}`);
}

if(bad.length){
  console.error(bad.join("\n"));
  process.exit(1);
}
console.log("V49R3_USER_FACING_COPY_BOUNDARY=PASS");
