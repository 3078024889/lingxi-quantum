import fs from "node:fs";
import path from "node:path";
const root=process.cwd(),fail=m=>{throw new Error(m)};
const pkg=JSON.parse(fs.readFileSync(path.join(root,"package.json"),"utf8"));
for(const s of ["audit:tools:v1593","audit:tools:coverage","audit:platform-stability","audit:global-commerce"]){
 if(!pkg.scripts?.[s])fail("REQUIRED_AUDIT_SCRIPT_MISSING:"+s);
}
const cov=fs.readFileSync(path.join(root,"scripts/audit/tool-graph-coverage-v1593.mjs"),"utf8");
if(!cov.includes("SHARED_DYNAMIC_ROUTE_CONTRACTS")&&!cov.includes("SHARED_DYNAMIC_ROUTE_WIRING"))fail("DYNAMIC_ROUTE_COVERAGE_MODEL_MISSING");
console.log("AUDIT_2_TOOL_EXECUTION_ARCHITECTURE=PASS");
