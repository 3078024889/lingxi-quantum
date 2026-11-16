import fs from "node:fs";
const read=p=>fs.readFileSync(p,"utf8"),must=(v,m)=>{if(!v)throw new Error(m)};

// The current food workbench is localized and mode-driven. Manual entry is a
// custom/free analysis path; image analysis uses a persisted image session and
// server-calculated quantity. Do not pin this audit to retired button copy or
// fixed quantity literals from the previous implementation.
const food=read("components/tools/FoodCalorieWorkbench.tsx");
must(food.includes("PaidActionButton"),"FOOD_PAYMENT_COMPONENT_MISSING");
must(food.includes("manual={mode==='custom'}"),"FOOD_MANUAL_MODE_MISSING");
must(food.includes("mode==='custom'?'custom':'image'"),"FOOD_ANALYSIS_MODE_ROUTING_MISSING");
must(food.includes("<LabelEntry lang={lang} add={add} disabled={disabled}/>"),"FOOD_MANUAL_LABEL_ENTRY_MISSING");
must(food.includes("quantity={prepared.quantity}"),"FOOD_SERVER_QUANTITY_BINDING_MISSING");
must(food.includes("createFoodImageSession(files"),"FOOD_IMAGE_SESSION_MISSING");
must(food.includes("recognizeFoodImage(file)"),"FOOD_IMAGE_RECOGNITION_MISSING");

const foodCopy=read("lib/tools/food/workbench-copy.ts");
must(foodCopy.includes('custom:"输入食物"'),"FOOD_MANUAL_LOCALIZED_ENTRY_MISSING");
must(foodCopy.includes('input:"输入食物名称'),"FOOD_SEARCH_LOCALIZED_INPUT_MISSING");
must(foodCopy.includes('portion:"份量（克）"'),"FOOD_PORTION_LOCALIZED_INPUT_MISSING");
const extraCopy=read("lib/tools/food/workbench-extra-copy.ts");
for(const key of ["labelEntry","labelSource","per100"])must(extraCopy.includes(key),`FOOD_MANUAL_LABEL_COPY_MISSING:${key}`);

const vision=read("lib/tools/food/image-recognition-local.ts");
must(vision.includes("onnx-community/swin-finetuned-food101-ONNX"),"FOOD101_RUNTIME_MISSING");
must(vision.includes("local_files_only:true"),"FOOD_MODEL_MUST_BE_LOCAL_ONLY");
must(vision.includes("m.env.allowLocalModels=true"),"FOOD_LOCAL_MODEL_RUNTIME_DISABLED");
must(vision.includes("m.env.localModelPath='/models/'"),"FOOD_LOCAL_MODEL_PATH_MISSING");

for(const p of [
 "public/models/onnx-community/swin-finetuned-food101-ONNX/config.json",
 "public/models/onnx-community/swin-finetuned-food101-ONNX/preprocessor_config.json",
 "public/models/onnx-community/swin-finetuned-food101-ONNX/onnx/model_q4f16.onnx"
]) must(fs.existsSync(p)&&fs.statSync(p).size>100,`FOOD101_ASSET_MISSING:${p}`);

for(const p of [
 "miniapp/pages/pay/index.js",
 "miniapp/pages/orders/index.js",
 "app/api/wechat/mini/tool-pay/create/route.ts"
]) must(fs.existsSync(p),`MINI_PAYMENT_FILE_MISSING:${p}`);

must(read("miniapp/pages/pay/index.js").includes("wx.requestVirtualPayment"),"MINI_TOOL_VIRTUAL_PAY_MISSING");
const app=JSON.parse(read("miniapp/app.json"));
for(const p of ["pages/pay/index","pages/orders/index"])must(app.pages.includes(p),`MINI_ROUTE_MISSING:${p}`);
must(!app.pages.includes("pages/balance/index")&&!app.pages.includes("pages/recharge/index"),"MINI_LEGACY_WALLET_ROUTE_REMAINS");
for(const p of ["miniapp/pages/balance","miniapp/pages/recharge","miniapp/utils/topup-expiry.js","miniapp/utils/virtual-payment-errors.js","app/api/wechat/mini/balance-pay/create/route.ts","app/api/wechat/mini/balance-pay/availability/route.ts","app/api/wechat/mini/balance-pay/status/route.ts"])must(!fs.existsSync(p),`MINI_LEGACY_WALLET_MODULE_REMAINS:${p}`);
must(read("miniapp/pages/pay/index.js").includes("wx.requestVirtualPayment"),"MINI_TOOL_VIRTUAL_PAY_MISSING");
must(read("miniapp/pages/pay/index.js").includes("/pages/cny-wallet/index"),"MINI_TOOL_RECHARGE_MUST_OPEN_NATIVE_CNY_WALLET");
must(read("lib/mini/payment-client.ts").includes("/ai-wallet?currency=USD"),"MINI_USD_MUST_OPEN_WEBSITE_WALLET");

const pkg=JSON.parse(read("package.json"));
for(const d of ["mammoth","exceljs","jsdom","dompurify","@mozilla/readability","turndown"])
 must(Boolean(pkg.dependencies?.[d]||pkg.devDependencies?.[d]),`ENGINE_DEP_MISSING:${d}`);

console.log("FOOD_MANUAL_ENTRY_AND_LABEL_CAPTURE=PASS");
console.log("FOOD_IMAGE_SESSION_AND_DYNAMIC_BILLING=PASS");
console.log("FOOD101_SELF_HOSTED_LOCAL_RUNTIME=PASS");
console.log("FOOD_IMAGE_EXTERNAL_API_REQUIRED=NO");
console.log("MINI_TOOL_NATIVE_PAY=PASS");
console.log("MINI_LEGACY_BALANCE_PAGE_AND_API_REMOVED=PASS");
console.log("DOCUMENT_WEB_DEPS=PASS");
console.log("V164_4_OFFLINE_FINAL_AUDIT=PASS");
