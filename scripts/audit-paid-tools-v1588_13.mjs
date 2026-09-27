import fs from "node:fs";
import path from "node:path";

const root=process.cwd();
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const must=(ok,msg)=>{if(!ok)throw new Error(msg)};

const paid=read("lib/tools/paid-catalog.ts");
const readiness=read("lib/tools/service-readiness.ts");
const pricing=read("app/api/tools/pricing/route.ts");
const hint=read("components/tools/ToolPriceHint.tsx");
const advanced=read("components/tools/AdvancedToolPage.tsx");
const miniJs=read("miniapp/pages/tools/index.js");
const miniWxml=read("miniapp/pages/tools/index.wxml");

const ids=[
 "audio-transcription","batch-image-watermark-remover","burn-after-read-file",
 "e-sign-pdf","food-calorie","id-photo-ai","image-watermark-remover","pdf-editor",
 "subtitle-translate","temp-mail-batch","video-dubbing","video-transcription",
 "video-watermark-remover",
];

for(const id of ids)must(paid.includes(`"${id}"`),`PAID_CATALOG_MISSING:${id}`);
for(const id of ids.filter(x=>x!=="burn-after-read-file"))
 must(readiness.includes(`"${id}"`),`LOCAL_RUNTIME_MISSING:${id}`);

must(!readiness.includes("OPENAI_API_KEY"),"PAID_RUNTIME_STILL_DEPENDS_ON_OPENAI");
must(!readiness.includes("ELEVENLABS_API_KEY"),"PAID_RUNTIME_STILL_DEPENDS_ON_ELEVENLABS");
must(pricing.includes("calculateToolQuote"),"PUBLIC_PRICING_NOT_USING_PRICE_BOOK");
must(pricing.includes("PUBLIC_PAID_TOOL_IDS"),"PUBLIC_PRICING_NOT_CATALOG_BOUND");
must(hint.includes("/api/tools/pricing"),"WEB_PRICE_HINT_ENDPOINT_MISSING");
must(advanced.includes("ToolPriceHint"),"WEB_PRICE_HINT_NOT_MOUNTED");

const legacyMiniPriceUi=
  miniJs.includes("/api/tools/pricing")
  && miniWxml.includes("item.price");

// V21 policy: tools hub must not prefetch/show prices.
// The explanation must say:
// 1) prices appear only before real execution/export,
// 2) the list does not show advance prices,
// 3) the user then goes to an available payment method for the selected currency.
// Do not force the old provider-specific "微信支付" string because USD does not use WeChat Pay.
const hasDeferredMoment=
  miniWxml.includes("真正执行或导出前") ||
  miniWxml.includes("执行或导出前") ||
  miniWxml.includes("实际使用时");

const hasNoListPrice=
  miniWxml.includes("工具列表不提前展示价格") ||
  miniWxml.includes("列表不提前展示价格") ||
  miniWxml.includes("工具列表不显示价格");

const hasPaymentMethodExplanation=
  miniWxml.includes("当前币种可用的付款方式") ||
  miniWxml.includes("可用的付款方式") ||
  miniWxml.includes("付款方式");

const deferredPricingUi=
  !miniJs.includes("loadPrices")
  && !miniWxml.includes("item.price")
  && hasDeferredMoment
  && hasNoListPrice
  && hasPaymentMethodExplanation;

must(legacyMiniPriceUi||deferredPricingUi,"MINI_PRICING_POLICY_MISSING");

console.log("PAID_TOOL_COUNT="+ids.length);
console.log("PAID_RUNTIME_PROVIDER_KEY_DEPENDENCY=ABSENT");
console.log("WEB_PUBLIC_PRICE_ENDPOINT=PASS");
console.log("WEB_PRICE_VISIBILITY=PASS");
if(deferredPricingUi){
  console.log("MINI_PRICE_LIST=HIDDEN_BY_POLICY");
  console.log("MINI_DEFERRED_PRICING_EXPLANATION=PASS");
  console.log("MINI_CURRENCY_AWARE_PAYMENT_EXPLANATION=PASS");
}else{
  console.log("MINI_PRICE_VISIBILITY=PASS");
}
console.log("PAID_TOOLS_SYNC_AUDIT=PASS");
