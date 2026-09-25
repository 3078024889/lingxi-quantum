import fs from "node:fs";

const failures=[];
const touched=new Set();

function read(path){return fs.readFileSync(path,"utf8")}
function save(path,text){fs.writeFileSync(path,text,"utf8");touched.add(path)}

function replace(path,before,after,label){
  let s=read(path);
  if(after!=="" && s.includes(after)){console.log(`ALREADY ${label}`);return}
  if(!s.includes(before)){
    if(after===""){console.log(`ALREADY ${label}`);return}
    console.error(`MISS ${label} :: ${path}`);
    failures.push(`${label} :: ${path}`);
    return;
  }
  s=s.replace(before,after);
  save(path,s);
  console.log(`PASS ${label}`);
}

function replaceAll(path,before,after,label){
  let s=read(path);
  if(!s.includes(before)){
    if(s.includes(after)){console.log(`ALREADY ${label}`);return}
    console.error(`MISS ${label} :: ${path}`);
    failures.push(`${label} :: ${path}`);
    return;
  }
  s=s.replaceAll(before,after);
  save(path,s);
  console.log(`PASS ${label}`);
}

// Account
replace("app/account/page.tsx",'zh="AI、SASI、工具与余额入口" en="AI, SASI, tools and balances"','zh="从正在做的事继续，不必重新找入口" en="Continue the work you already started without hunting for the right entry again."',"account product copy");
replaceAll("app/account/page.tsx","付费任务中心","订单与使用记录","account paid tasks title");
replace("app/account/page.tsx",'zh="查看余额与充值" en="View balance and top up"','zh="查看人民币 / 美元余额，需要时再充值" en="View CNY / USD balances and top up only when needed."',"account wallet copy");
replace("app/account/page.tsx",'zh="进入创作工作台" en="Open creation workspace"','zh="继续短剧、资料与创作任务" en="Continue drama, source and creation work."',"account sasi copy");
replace("app/account/page.tsx",'zh="余额提现" en="Withdraw balance"','zh="余额退款" en="Balance refund"',"account withdrawal title");
replace("app/account/page.tsx",'zh="未使用充值本金原路退回" en="Refund unused principal to the original payment method"','zh="没用完的真实充值本金可原路退回" en="Unused paid principal can return to the original payment method."',"account withdrawal copy");

// Orders
replaceAll("app/account/orders/page.tsx","付费任务中心","订单与使用记录","orders title");
replace("app/account/orders/page.tsx",
'<Bi zh="这里集中显示当前 AI / SASI 余额充值与实用工具任务。" en="Current AI/SASI balance top-ups and utility-tool tasks are kept here."/>',
'<Bi zh="充值、工具处理和已经完成的付款都留在这里，方便你随时回来核对。" en="Top-ups, paid tool runs and completed payments stay here so you can check them whenever needed."/>',
"orders lead");
replace("app/account/orders/page.tsx",
'<Bi zh="PayPal 已返回，但订单仍在确认或权益入账中。请在下方查看最新订单状态；不要重复付款。" en="PayPal returned, but the order is still being confirmed or credited. Check the latest order status below and do not pay again."/>',
'<Bi zh="付款已经返回，正在确认到账。请不要重复支付；确认完成后余额会自动更新。" en="Your payment has returned and is being confirmed. Do not pay again; the balance will update automatically once confirmed."/>',
"orders paypal pending");
replace("app/account/orders/page.tsx",
'<Bi zh="这次 PayPal 返回无法与本地订单安全匹配。没有确认到账前不会增加余额；请检查订单状态后再操作。" en="This PayPal return could not be safely matched to a local order. No balance is credited until payment is verified. Check the order status before trying again."/>',
'<Bi zh="这次付款还没有确认到账。请先查看下面的订单状态；未确认前不会增加余额。" en="This payment has not been confirmed yet. Check the order below; your balance will not change before confirmation."/>',
"orders paypal error");

replace("app/account/orders/page.tsx",
'function currentProductLabel(id:string){',
`function statusText(status:string,lang:"zh"|"en"){
  const map:Record<string,{zh:string;en:string}>={
    pending:{zh:"等待付款",en:"Awaiting payment"},
    paid:{zh:"已到账",en:"Paid"},
    failed:{zh:"未完成",en:"Not completed"},
    refunded:{zh:"已退款",en:"Refunded"},
    cancelled:{zh:"已取消",en:"Cancelled"},
  };
  return map[status]?.[lang]??status;
}
function providerText(provider:string|null,lang:"zh"|"en"){
  if(provider==="paypal")return "PayPal";
  if(provider==="wechat")return lang==="zh"?"微信支付":"WeChat Pay";
  if(provider==="alipay")return lang==="zh"?"支付宝":"Alipay";
  return lang==="zh"?"其他支付":"Other payment";
}

function currentProductLabel(id:string){`,
"orders helpers");
replace("app/account/orders/page.tsx",
'<p className="text-[11px] text-[var(--lx-faint)]">{o.id}</p>',
'<p className="text-[11px] text-[var(--lx-faint)]"><Bi zh={`订单号 ${o.id}`} en={`Order ${o.id}`}/></p>',
"orders id");
replace("app/account/orders/page.tsx",
'<p className="mt-2 text-xs text-[var(--lx-muted)]">{new Date(o.created_at).toLocaleString()} · {o.provider||"—"}</p>',
'<p className="mt-2 text-xs text-[var(--lx-muted)]">{new Date(o.created_at).toLocaleString()} · <Bi zh={providerText(o.provider,"zh")} en={providerText(o.provider,"en")}/></p>',
"orders provider");
replace("app/account/orders/page.tsx",
'<div className="text-right"><b className="text-lg text-[var(--lx-ink)]">{amount}</b><p className="mt-1 text-xs text-[var(--lx-muted)]">{o.status}</p></div>',
'<div className="text-right"><b className="text-lg text-[var(--lx-ink)]">{amount}</b><p className="mt-1 text-xs text-[var(--lx-muted)]"><Bi zh={statusText(o.status,"zh")} en={statusText(o.status,"en")}/></p></div>',
"orders status");

// Withdrawals
replace("app/account/withdrawals/page.tsx","LINGXIFIELD · ACCOUNT","灵犀场 · 我的账户","withdrawal kicker");
replace("app/account/withdrawals/page.tsx","余额提现","余额退款","withdrawal title");
replace("app/account/withdrawals/page.tsx",
"不想继续使用时，可将尚未消耗的真实充值本金按原支付渠道退回。系统不会把赠送额度、邀请奖励或已经产生服务成本的余额提现为现金。",
"如果暂时不再使用灵犀场，可以把还没有用掉的真实充值本金退回原来的支付方式。赠送额度、邀请奖励和已经使用的部分不属于可退本金。",
"withdrawal lead");

// Withdrawal panel
replace("components/BalanceWithdrawalPanel.tsx",
'function label(status:string){',
`function providerName(provider:string){
  if(provider==="paypal")return "PayPal";
  if(provider==="wechat")return "微信支付";
  if(provider==="alipay")return "支付宝";
  return "其他支付";
}
function label(status:string){`,
"withdrawal provider helper");
replace("components/BalanceWithdrawalPanel.tsx",
'<span className="text-sm opacity-60">{o.product_id}</span>',
'<span className="text-sm opacity-60">余额充值</span>',
"withdrawal product id");
replaceAll("components/BalanceWithdrawalPanel.tsx","可提现","可退款","withdrawal available wording");
replaceAll("components/BalanceWithdrawalPanel.tsx","提现申请失败","退款申请失败","withdrawal error wording");
replaceAll("components/BalanceWithdrawalPanel.tsx","提现金额","退款金额","withdrawal input label");
replaceAll("components/BalanceWithdrawalPanel.tsx","提现记录","退款记录","withdrawal history");
replace("components/BalanceWithdrawalPanel.tsx",
'{w.provider}{w.provider_currency&&w.provider_currency!==w.currency?` · 原路退款 ${w.provider_currency} ${(Number(w.provider_amount_minor)/100).toFixed(2)}`:""}',
'{providerName(w.provider)}{w.provider_currency&&w.provider_currency!==w.currency?` · 原路退回 ${w.provider_currency} ${(Number(w.provider_amount_minor)/100).toFixed(2)}`:""}',
"withdrawal provider record");

// Refund policy
replace("app/refunds/page.tsx",
'zh="不再使用服务时，可对未消耗的真实充值本金申请原路退款。系统会以原充值订单、钱包流水和实际结算记录为准，先冻结申请金额，再向原支付渠道发起退款。"',
'zh="不再使用服务时，可以申请把尚未消耗的真实充值本金退回原支付方式。灵犀场会先确认这笔充值确实属于你的账户、且这部分金额还没有被使用，再发起退款。"',
"refund zh");
replace("app/refunds/page.tsx",
'en="If you stop using the service, unused paid principal may be refunded to the original payment method. The platform verifies the original top-up, wallet ledger and settled usage, then places the requested amount on hold before sending the refund to the original provider."',
'en="If you stop using the service, unused paid principal may be returned to the original payment method. LINGXIFIELD first confirms that the top-up belongs to your account and that the requested amount has not been used, then sends the refund."',
"refund en");
replace("app/refunds/page.tsx",
'zh="退款只退回原支付渠道和原支付币种。支付渠道确认存在延迟时，申请金额会保持冻结，系统不会因为一次网络超时就重复退款或重新释放余额。"',
'zh="退款只退回原支付方式和原支付币种。如果支付平台还在处理中，这笔金额会继续保持为“退款处理中”，不会因为网络延迟而重复退款。"',
"refund provider zh");
replace("app/refunds/page.tsx",
'en="Refunds return only to the original payment method and currency. If provider confirmation is delayed, the requested amount remains on hold; a network timeout does not trigger a duplicate refund or premature release."',
'en="Refunds return only to the original payment method and currency. If the payment service is still processing the refund, the amount remains marked as pending and is not refunded twice because of a network delay."',
"refund provider en");

// Knowledge page
replace("app/ai-knowledge/page.tsx","按真实 AI 用量结算的私人智能体","能持续追问的私人智能体","knowledge meta");
replaceAll("app/ai-knowledge/page.tsx","书本 SASI · 已上线","书本 SASI","knowledge kicker zh");
replaceAll("app/ai-knowledge/page.tsx","Book SASI · Live","Book SASI","knowledge kicker en");

// Knowledge workspace
replaceAll("components/KnowledgeWorkspace.tsx","SASI LEARNING FEEDBACK","让 SASI 更懂你","knowledge feedback title");
replaceAll("components/KnowledgeWorkspace.tsx","这条反馈只作为 SASI 的学习/失败信号，不会直接覆盖知识。","告诉 SASI 这次回答哪里有帮助、哪里需要改进。你的反馈不会改写资料原文。","knowledge feedback zh");
replaceAll("components/KnowledgeWorkspace.tsx","Feedback is used as a SASI learning/failure signal and does not directly overwrite knowledge.","Tell SASI what helped and what needs improvement. Your feedback never rewrites the original source material.","knowledge feedback en");
replaceAll("components/KnowledgeWorkspace.tsx","现在是真实接口：","现在可以直接使用：","knowledge real api zh");
replaceAll("components/KnowledgeWorkspace.tsx","本次 AI 消耗","本次使用费用","knowledge charge zh");
replaceAll("components/KnowledgeWorkspace.tsx","AI charge","Usage cost","knowledge charge en");
replaceAll("components/KnowledgeWorkspace.tsx","当前模式 ","当前智能档位 ","knowledge mode zh");

// Tools: remove retired number-energy from current public discovery.
{
  const path="lib/tools/registry.ts";
  let s=read(path);
  const start=s.indexOf("  // —— 已有场域工具 ——");
  const end=s.indexOf("  // —— 图片 · P0 ——",start);
  if(start<0||end<0){
    console.error("MISS retired field block :: lib/tools/registry.ts");
    failures.push("retired field block :: lib/tools/registry.ts");
  }else{
    s=s.slice(0,start)+s.slice(end);
    save(path,s);
    console.log("PASS retired field block");
  }
}
replace("components/tools/ToolsHubV11.tsx",
'type Category = "all" | "image" | "pdf" | "media" | "privacy" | "utility" | "ai" | "qr" | "field";',
'type Category = "all" | "image" | "pdf" | "media" | "privacy" | "utility" | "ai" | "qr";',
"tools category type");
replace("components/tools/ToolsHubV11.tsx",
'  field: { zh: "场域小工具", en: "Field tools" },\n',
'',
"tools field label");
replace("components/tools/ToolsHubV11.tsx",
'  if (category === "field") return "field";\n',
'',
"tools registry field map");
replace("components/tools/ToolsHubV11.tsx",
'const categories: Category[] = ["all", "image", "pdf", "media", "privacy", "utility", "ai", "qr", "field"];',
'const categories: Category[] = ["all", "image", "pdf", "media", "privacy", "utility", "ai", "qr"];',
"tools categories");
replace("middleware.ts",
'    "/archetype","/mini-report","/membership","/origin"',
'    "/archetype","/mini-report","/membership","/origin","/tools/number-energy"',
"number energy redirect");

if(failures.length){
  console.error(`V14.67.1_PATCH_FAILURES=${failures.length}`);
  failures.forEach((x,i)=>console.error(`${i+1}. ${x}`));
  process.exit(1);
}
console.log(`V14.67.1_PATCH=PASS files=${touched.size}`);
