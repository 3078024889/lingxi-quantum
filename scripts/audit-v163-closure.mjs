import fs from "node:fs";
const read=p=>fs.readFileSync(p,"utf8"),must=(v,m)=>{if(!v)throw new Error(m)};
for(const p of ["mammoth","exceljs","jsdom","dompurify","@mozilla/readability","turndown"]){
 const pkg=JSON.parse(read("package.json"));must(Boolean(pkg.dependencies?.[p]||pkg.devDependencies?.[p]),`NODE_ENGINE_DEP_MISSING:${p}`);
}
const ui=read("components/tools/FoodCalorieWorkbench.tsx");
must(ui.includes('quantity={1}'),"MANUAL_PRICE_QUANTITY_MISSING");
must(ui.includes('quantity={2}'),"IMAGE_PRICE_QUANTITY_MISSING");
must(ui.includes("recognizeFoodImage"),"FOOD_IMAGE_RUNTIME_NOT_CONNECTED");
must(ui.includes("输入食物名称 + 重量"),"MANUAL_ENTRY_MISSING");
must(ui.includes("上传图片识别食物"),"IMAGE_ENTRY_MISSING");
const vr=read("lib/tools/food/image-recognition-local.ts");
must(vr.includes("allowRemoteModels=false"),"FOOD_VISION_REMOTE_RUNTIME_ENABLED");
must(vr.includes("swin-finetuned-food101-ONNX"),"FOOD101_MODEL_NOT_CONNECTED");
for(const p of [
 "public/models/onnx-community/swin-finetuned-food101-ONNX/config.json",
 "public/models/onnx-community/swin-finetuned-food101-ONNX/preprocessor_config.json",
 "public/models/onnx-community/swin-finetuned-food101-ONNX/onnx/model_q4f16.onnx"
])must(fs.existsSync(p)&&fs.statSync(p).size>100,`FOOD_VISION_ASSET_MISSING:${p}`);
console.log("DOCUMENT_WEB_NODE_DEPS=PASS");
console.log("FOOD_MANUAL_PAID_ENTRY=PASS");
console.log("FOOD_IMAGE_PAID_ENTRY=PASS");
console.log("FOOD_IMAGE_PRICE_RATIO=2X");
console.log("FOOD_VISION_SELF_HOSTED_RUNTIME=PASS");
console.log("FOOD_VISION_REMOTE_API_REQUIRED=NO");
console.log("V163_CLOSURE_AUDIT=PASS");
