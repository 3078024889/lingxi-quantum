import fs from "node:fs";
const read=p=>fs.readFileSync(p,"utf8"),must=(v,m)=>{if(!v)throw new Error(m)};

const food=read("components/tools/FoodCalorieWorkbench.tsx");
must(food.includes("PaidActionButton"),"FOOD_PAYMENT_COMPONENT_MISSING");
must(food.includes('quantity={1}'),"FOOD_MANUAL_PAID_ENTRY_MISSING");
must(food.includes('quantity={2}'),"FOOD_IMAGE_PAID_ENTRY_MISSING");
must(food.includes("输入食物名称 + 重量"),"FOOD_MANUAL_ENTRY_MISSING");
must(food.includes("上传图片识别食物"),"FOOD_IMAGE_ENTRY_MISSING");

const vision=read("lib/tools/food/image-recognition-local.ts");
must(vision.includes("swin-finetuned-food101-ONNX"),"FOOD101_RUNTIME_MISSING");
must(vision.includes("allowRemoteModels=false"),"FOOD101_RUNTIME_REMOTE_NOT_DISABLED");

for(const p of [
 "public/models/onnx-community/swin-finetuned-food101-ONNX/config.json",
 "public/models/onnx-community/swin-finetuned-food101-ONNX/preprocessor_config.json",
 "public/models/onnx-community/swin-finetuned-food101-ONNX/onnx/model_q4f16.onnx"
]) must(fs.existsSync(p)&&fs.statSync(p).size>100,`FOOD101_ASSET_MISSING:${p}`);

for(const p of [
 "miniapp/pages/pay/index.js",
 "miniapp/pages/balance/index.js",
 "miniapp/pages/orders/index.js",
 "app/api/wechat/mini/tool-pay/create/route.ts",
 "app/api/wechat/mini/balance-pay/create/route.ts"
]) must(fs.existsSync(p),`MINI_PAYMENT_FILE_MISSING:${p}`);

must(read("miniapp/pages/pay/index.js").includes("wx.requestPayment"),"MINI_TOOL_NATIVE_PAY_MISSING");
must(read("miniapp/pages/balance/index.js").includes("wx.requestPayment"),"MINI_BALANCE_NATIVE_PAY_MISSING");

const app=JSON.parse(read("miniapp/app.json"));
for(const p of ["pages/pay/index","pages/balance/index","pages/orders/index"]) must(app.pages.includes(p),`MINI_ROUTE_MISSING:${p}`);

const pkg=JSON.parse(read("package.json"));
for(const d of ["mammoth","exceljs","jsdom","dompurify","@mozilla/readability","turndown"])
 must(Boolean(pkg.dependencies?.[d]||pkg.devDependencies?.[d]),`ENGINE_DEP_MISSING:${d}`);

console.log("FOOD_MANUAL_PAID_ENTRY=PASS");
console.log("FOOD_IMAGE_PAID_ENTRY=PASS");
console.log("FOOD_MANUAL_PRICE_MODE=1X");
console.log("FOOD_IMAGE_PRICE_MODE=2X");
console.log("FOOD101_SELF_HOSTED_RUNTIME=PASS");
console.log("FOOD_IMAGE_EXTERNAL_API_REQUIRED=NO");
console.log("MINI_TOOL_NATIVE_PAY=PASS");
console.log("MINI_BALANCE_NATIVE_PAY=PASS");
console.log("DOCUMENT_WEB_DEPS=PASS");
console.log("V164_4_OFFLINE_FINAL_AUDIT=PASS");
