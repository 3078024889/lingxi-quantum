import fs from "node:fs";
import path from "node:path";

const root=process.cwd();
const specPath=process.argv[2]||path.join(root,"scripts","expected-paid-tools-v1581.json");
const spec=JSON.parse(fs.readFileSync(specPath,"utf8"));

const files=[];
function walk(d){
  if(!fs.existsSync(d))return;
  for(const e of fs.readdirSync(d,{withFileTypes:true})){
    if(e.name==="node_modules"||e.name===".next"||e.name.startsWith(".lingxi-backup-"))continue;
    const p=path.join(d,e.name);
    if(e.isDirectory())walk(p);
    else if(/\.(ts|tsx|js|jsx|mjs|cjs)$/.test(e.name))files.push(p);
  }
}
for(const r of ["app","components","lib"])walk(path.join(root,r));
const docs=files.map(file=>({file,rel:path.relative(root,file).replaceAll("\\","/"),text:fs.readFileSync(file,"utf8")}));
const all=docs.map(x=>x.text).join("\n");

function hasEvery(markers){return markers.every(m=>all.includes(m))}
function fail(msg){console.error("PAID_TOOLS_AUDIT=FAIL");console.error(msg);process.exit(1)}

const report=[];
for(const tool of spec){
  if(!fs.existsSync(path.join(root,tool.page)))fail(`MISSING_TOOL_PAGE:${tool.toolId}:${tool.page}`);
  if(!hasEvery(tool.entry))fail(`MISSING_PAYMENT_ENTRY:${tool.toolId}:${tool.entry.join(",")}`);
  if(!hasEvery(tool.execute))fail(`MISSING_EXECUTION_PATH:${tool.toolId}:${tool.execute.join(",")}`);
  if(!hasEvery(tool.result))fail(`MISSING_RESULT_PATH:${tool.toolId}:${tool.result.join(",")}`);
  if(tool.download?.length && !tool.download.some(m=>all.includes(m)))fail(`MISSING_DOWNLOAD_OR_DELIVERY:${tool.toolId}:${tool.download.join(",")}`);
  report.push({toolId:tool.toolId,page:true,payment:true,execute:true,result:true,delivery:true});
}

const quote=fs.readFileSync(path.join(root,"app/api/tools/quote/route.ts"),"utf8");
if(!quote.includes("isPublicPaidToolId"))fail("QUOTE_PUBLIC_CATALOG_GUARD_MISSING");

const migrationDir=path.join(root,"supabase","migrations");
const migrationFile=fs.readdirSync(migrationDir).find(name=>/paid_tools_catalog_v1581\.sql$/i.test(name));
if(!migrationFile)fail("PAID_TOOLS_CATALOG_MIGRATION_MISSING");
const migration=fs.readFileSync(path.join(migrationDir,migrationFile),"utf8");
for(const wanted of ["unit_price_rmb = 1.00","min_price_rmb = 1.00","unit_price_usd = 0.50","min_price_usd = 0.50","tool_id = 'food-calorie'"])if(!migration.includes(wanted))fail(`FOOD_PRICE_DRIFT:${wanted}`);
if(!/tool_id = 'cross-page-stamp'[\s\S]*?enabled = false|enabled = false[\s\S]*?tool_id = 'cross-page-stamp'/.test(migration))fail("ORPHAN_CROSS_PAGE_STAMP_NOT_DISABLED");

const visualChecks=[
 ["public/images/tool-stories/temp-mail",9],
 ["public/images/tool-stories/burn-after-read",9],
 ["public/images/tool-stories/id-photo",1],
];
for(const [dir,count] of visualChecks){
 const full=path.join(root,dir);
 if(!fs.existsSync(full))fail(`VISUAL_DIR_MISSING:${dir}`);
 const n=fs.readdirSync(full).filter(x=>/\.webp$/i.test(x)).length;
 if(n<count)fail(`VISUAL_COUNT_MISSING:${dir}:${n}<${count}`);
}

const banned=[
 "批量 AI 修复会产生逐张模型成本",
 "视频本体由浏览器本地 FFmpeg 处理",
 "支付只解锁本次处理额度",
 "最终文件只在当时浏览器本地生成",
 "服务器结果",
 "unit(s)"
];
const userFiles=docs.filter(x=>x.rel.startsWith("app/")||x.rel.startsWith("components/"));
const hits=[];
for(const x of userFiles)for(const b of banned)if(x.text.includes(b))hits.push(`${x.rel} :: ${b}`);
if(hits.length)fail("USER_VISIBLE_ENGINEERING_COPY:\n"+hits.join("\n"));

fs.mkdirSync(path.join(root,"audit-output"),{recursive:true});
fs.writeFileSync(path.join(root,"audit-output","paid-tools-v1581.json"),JSON.stringify(report,null,2));
console.log(`PAID_TOOL_COUNT=${report.length}`);
console.log("PAID_TOOL_PAYMENT_ENTRY=PASS");
console.log("PAID_TOOL_EXECUTION_PATH=PASS");
console.log("PAID_TOOL_RESULT_PATH=PASS");
console.log("PAID_TOOL_DOWNLOAD_OR_DELIVERY=PASS");
console.log("FOOD_PRICE_BOOK=PASS");
console.log("ORPHAN_PRICE_ROW_POLICY=PASS");
console.log("TOOL_VISUALS_9_9_1=PASS");
console.log("PAID_TOOLS_AUDIT=PASS");
