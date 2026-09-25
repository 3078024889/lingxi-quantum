import fs from "node:fs";
const path="app/sasi/SasiProductionPanels.tsx";
let s=fs.readFileSync(path,"utf8");

if(s.includes("amountUsd:string") && s.includes("查看本次预算")){
  console.log("PATCH_SASI_PRODUCTION_V14651=ALREADY_APPLIED");
  process.exit(0);
}

const oldServerQuote='type ServerQuote = { amountFen: number; amountRmb: string; expiresAt: string; token: string };';
const newServerQuote='type ServerQuote = { amountFen:number; amountRmb:string; amountUsd:string; amountUsdCents:number; skillSource:"platform"|"user"; skillId:string; skillTitle:string; expiresAt:string; token:string };';
if(s.includes(oldServerQuote)){
  s=s.replace(oldServerQuote,newServerQuote);
}else{
  s=s.replace(/type ServerQuote[^\n]*;/,newServerQuote);
}
if(!s.includes('amountUsd:string')){
  console.error("PRODUCTION_SERVER_QUOTE_PATCH_FAILED");
  process.exit(30);
}

const toneRe=/const tone = \(dark: boolean\) => dark \? "border-white\/10 bg-white\/\[\.035\]" : "border-black\/10 bg-white";/;
if(!toneRe.test(s)){console.error("PRODUCTION_TONE_MARKER_NOT_FOUND");process.exit(31)}
s=s.replace(toneRe,m=>m+`\nfunction selectedSkill(){\n  try{const raw=sessionStorage.getItem("sasi-selected-skill-v1");if(raw){const value=JSON.parse(raw) as {source?:unknown;id?:unknown};if((value.source==="platform"||value.source==="user")&&typeof value.id==="string"&&value.id)return{skillSource:value.source,skillId:value.id};}}catch{}\n  return{skillSource:"platform" as const,skillId:"story-rhythm"};\n}\n`);

s=s.replace(/const \[duration,\s*setDuration\]\s*=\s*useState<8\s*\|\s*12>\(8\);/,'const [duration, setDuration] = useState<5 | 10 | 15>(5);');
s=s.replace(/const taskBody = \(\) => \(\{ projectId: detail\.project\.id, nodeId: shotNode\?\.id, prompt, duration, quality, aspectRatio, providerPreference: routingMode === "professional" \? providerPreference : null, rightsConfirmed, aiLabelAcknowledged \}\);/,
'const taskBody = () => ({ projectId:detail.project.id,nodeId:shotNode?.id,prompt,duration,quality,aspectRatio,providerPreference:routingMode==="professional"?providerPreference:null,rightsConfirmed,aiLabelAcknowledged,...selectedSkill() });');
s=s.replace(/<option value=\{8\}>8s<\/option><option value=\{12\}>12s<\/option>/,'<option value={5}>5 秒</option><option value={10}>10 秒</option><option value={15}>15 秒</option>');
s=s.replace(/setDuration\(Number\(e\.target\.value\) as 8 \| 12\)/g,'setDuration(Number(e.target.value) as 5 | 10 | 15)');
s=s.replace(/\{readiness\?\.videoRoutes\?\.[a-zA-Z]+\s*\?\s*" · Ready"\s*:\s*" · Unverified"\}/g,"");
s=s.replaceAll(" · Unverified","");
s=s.replaceAll(" · Ready","");


const reps=[
 ["制作内核仍受安全门控保护，请先完成商户、供应能力与内容标识配置。","这项制作暂时还不能开始，请稍后再试。"],
 ["The production kernel remains safely gated until merchant, provider and content-labeling configuration is complete.","This creation cannot start right now. Please try again later."],
 ["LIVE SHOT PRODUCTION","镜头制作"],["可授权","可以开始"],["安全门控中","暂不可用"],
 ["制作内核已通过三重门控","现在可以开始制作"],["Production kernel passed all three gates","Ready to create"],
 ["制作保护仍在生效","这项制作暂时不可用"],["Production safeguards remain active","Creation is temporarily unavailable"],
 ["账户、执行与内容标识均已就绪。","你可以在确认预算后开始。"],["Account, execution and content labeling are ready.","You can begin after reviewing the price."],
 ["商户通道、影像执行与内容标识全部就绪前，系统不会接受真实制作授权。","等这项能力恢复后再开始，不会提前扣除你的余额。"],
 ["No live production authorization is accepted until merchant, video execution and content labeling are ready.","Your balance will not be charged while this creation is unavailable."],
 ["ACCOUNT LEDGER","余额记录"],["刷新真实账本","刷新记录"],["Refresh ledger","Refresh"],
 ["报价已生成。确认前不会预留或扣除余额。","预算已经算好。确认开始前不会扣除余额。"],
 ["Quote ready. No balance is reserved or charged before confirmation.","Your price is ready. Nothing is charged until you confirm."],
 ["当前线路价格尚未核验，暂不启动付费任务。","这个规格暂时没有可用价格，请换一个规格再试。"],
 ["This route has no verified current price; paid execution is paused.","This specification has no available price right now. Try another one."],
 ["30-DAY VERIFIED USAGE","近 30 天使用"],
 ["人民币供应商成本","近 30 天制作支出"],
 ["CNY supplier cost","30-day creation spend"],
 ["人民币供应商成本记录","近 30 天实际费用"],
 ["CNY supplier cost records","30-day actual spend"],
 ["暂无可核验成本，不以估算冒充真实消耗","暂无已完成任务费用"],
 ["No verifiable cost yet; estimates are not shown as actual spend","No completed task cost yet"],
 ["服务端记录","账户记录"],
 ["server-owned records","account history"],
 ["任务已进入制作序列，本次预算已安全预留。","已经开始制作。本次费用会按实际使用结算。"],
 ["The task has entered production and its approved budget is reserved.","Creation has started. Your final charge follows actual usage."],
 ["近三十天实际用量趋势","近三十天使用趋势"],
 ["Verified usage across the last 30 days","Usage across the last 30 days"],
 ["产生真实制作结算后，这里会形成趋势；当前不使用演示数据。","完成实际制作后，这里会出现你的使用趋势。"],
 ["A trend appears after verified settlement. No demonstration data is used here.","Your usage trend appears after completed creation tasks."],
 ["双线使用独立尺度，只比较走势","两条趋势分别显示，只看变化即可"],
 ["Independent scales; compare trends only","Each trend uses its own scale; compare direction only"],
];
for(const [a,b] of reps)s=s.replaceAll(a,b);

const qRe=/\{serverQuote \? t\(lang, `本次预算上限 \$\{money\(serverQuote\.amountFen\)\} · 10 分钟内有效`, `Budget cap \$\{money\(serverQuote\.amountFen\)\} · valid for 10 minutes`\) : t\(lang, "先获取服务端报价；报价前不扣余额", "Get a server quote first; no charge before approval"\)\}/;
if(!qRe.test(s)){console.error("PRODUCTION_QUOTE_DISPLAY_NOT_FOUND");process.exit(32)}
s=s.replace(qRe,'{serverQuote ? t(lang, `本次预算 ¥${serverQuote.amountRmb} / $${serverQuote.amountUsd} · ${serverQuote.skillTitle}`, `Price ¥${serverQuote.amountRmb} / $${serverQuote.amountUsd} · ${serverQuote.skillTitle}`) : t(lang, "选好镜头规格和 Skill，再看本次真实预算。", "Choose the shot specification and Skill to see the real price.")}');

const bRe=/serverQuote \? t\(lang, `确认执行 · \$\{money\(serverQuote\.amountFen\)\}`, `Confirm · \$\{money\(serverQuote\.amountFen\)\}`\) : t\(lang, "获取本次任务报价", "Get task quote"\)/;
if(!bRe.test(s)){console.error("PRODUCTION_QUOTE_BUTTON_NOT_FOUND");process.exit(33)}
s=s.replace(bRe,'serverQuote ? t(lang, `确认开始 · ¥${serverQuote.amountRmb} / $${serverQuote.amountUsd}`, `Confirm · ¥${serverQuote.amountRmb} / $${serverQuote.amountUsd}`) : t(lang, "查看本次预算", "See price")');

if(!s.includes("amountUsd:string")){console.error("POSTCHECK_AMOUNT_USD_MISSING");process.exit(36)}
if(!s.includes("as 5 | 10 | 15")){console.error("POSTCHECK_DURATION_TYPE_MISSING");process.exit(37)}
if(!s.includes("查看本次预算")){console.error("POSTCHECK_PUBLIC_BUDGET_COPY_MISSING");process.exit(38)}
if(s.includes("Unverified")){console.error("POSTCHECK_UNVERIFIED_COPY_REMAINS");process.exit(39)}
fs.writeFileSync(path,s,"utf8");
console.log("PATCH_SASI_PRODUCTION_V14655=PASS");
