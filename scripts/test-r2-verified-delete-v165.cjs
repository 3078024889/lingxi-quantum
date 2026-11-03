const fs=require("node:fs"),vm=require("node:vm"),ts=require("typescript"),assert=require("node:assert/strict");
const source=fs.readFileSync("lib/r2-private.ts","utf8");
const js=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;
async function scenario(name,statuses,expected){
 const calls=[],cancelled=[];
 const moduleExports={};
 const env={R2_ENDPOINT:"https://test-account.r2.cloudflarestorage.com",R2_ACCESS_KEY_ID:"ci-test-access",R2_SECRET_ACCESS_KEY:"ci-only-nonproduction-secret",R2_BUCKET_PRIVATE_BURN:"privacy-staging-test"};
 const fakeFetch=async(url,options)=>{
  const parsed=new URL(url),method=options.method;
  assert.equal(parsed.origin,env.R2_ENDPOINT);
  assert(parsed.pathname.includes("/privacy-staging-test/burn/test/object.encrypted"));
  assert.equal(parsed.searchParams.get("X-Amz-Algorithm"),"AWS4-HMAC-SHA256");
  assert.equal(parsed.searchParams.get("X-Amz-SignedHeaders"),"host");
  if(method==="GET")assert.equal(options.headers.Range,"bytes=0-0");
  calls.push(method);
  if(statuses[method]==="throw")throw Error("R2_BACKEND_OFFLINE");
  const status=statuses[method];
  assert(Number.isInteger(status),"missing fake response: "+method);
  return {status,ok:status>=200&&status<300,body:{cancel:async()=>{cancelled.push(method)}}};
 };
 vm.runInNewContext(js,{exports:moduleExports,require:name=>{
  if(name==="server-only")return{};
  if(name==="node:crypto")return require("node:crypto");
  throw Error("UNEXPECTED_IMPORT:"+name);
 },Buffer,URL,Date,AbortSignal,process:{env},fetch:fakeFetch});
 if(expected==="throw")await assert.rejects(()=>moduleExports.r2Delete("burn/test/object.encrypted"),/R2_BACKEND_OFFLINE/,name);
 else assert.equal(await moduleExports.r2Delete("burn/test/object.encrypted"),expected,name);
 const verifies=expected==="throw"||[200,201,202,204,404].includes(statuses.DELETE);
 assert.equal(calls.includes("HEAD"),verifies,name+": HEAD verification must follow accepted deletion only");
 assert.equal(calls.includes("GET"),verifies,name+": GET verification must follow accepted deletion only");
 if(verifies&&statuses.GET!=="throw")assert(cancelled.includes("GET"),name+": bounded read body must close");
}
(async()=>{
 await scenario("successful confirmed deletion",{DELETE:204,HEAD:404,GET:404},true);
 await scenario("previously absent, verified",{DELETE:404,HEAD:404,GET:404},true);
 await scenario("DELETE returned 204 but object survived",{DELETE:204,HEAD:200,GET:206},false);
 await scenario("HEAD denied",{DELETE:204,HEAD:403,GET:404},false);
 await scenario("GET still reads bytes",{DELETE:204,HEAD:404,GET:206},false);
 await scenario("GET unavailable",{DELETE:204,HEAD:404,GET:503},false);
 await scenario("DELETE denied",{DELETE:403},false);
 await scenario("DELETE service error",{DELETE:503},false);
 await scenario("verification network failure",{DELETE:204,HEAD:404,GET:"throw"},"throw");
 console.log("R2_VERIFIED_DELETE_V165=PASS: direct S3 HEAD/GET 404 proof, no leaked bytes, 403/5xx fail-closed, missed-delete detection, no remote R2 contacted");
})().catch(error=>{console.error(error);process.exitCode=1});
