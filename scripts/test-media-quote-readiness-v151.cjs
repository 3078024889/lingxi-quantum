const fs=require("node:fs"),vm=require("node:vm"),ts=require("typescript"),assert=require("node:assert/strict");
const file="lib/tools/service-readiness.ts";
const code=ts.transpileModule(fs.readFileSync(file,"utf8"),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;
let providerReady=true,nativeCalls=0,nativeOnline=false;
const bindings={
 "server-only":{},
 "@/lib/r2-private":{r2Ready:()=>true},
 "@/lib/sasi-kernel/compute/native-client":{nativeComputeReadiness:async()=>{nativeCalls++;return {state:nativeOnline?"ready":"offline"}}},
 "@/lib/tools/media/provider":{mediaProviderReady:()=>providerReady},
 "@/lib/tools/temp-mail-policy":{TEMP_MAIL_BATCH_SALES_ENABLED:false}
};
const environment={SASI_NATIVE_COMPUTE_URL:"https://compute.example.test",SASI_NATIVE_COMPUTE_SECRET:"x".repeat(36)};
const exposed={};
vm.runInNewContext(code,{exports:exposed,require:(name)=>{if(!Object.hasOwn(bindings,name))throw Error("UNKNOWN_MODULE:"+name);return bindings[name]},process:{env:environment},Date,Set,Promise,Boolean,String,Number,Error});
(async()=>{
 for(const name of ["video-dubbing","video-translate","image-translator"]){
  const r=await exposed.toolRuntimeStateLive(name);
  assert.equal(r.ready,true,name+" should depend only on its media provider");
  assert.equal(r.mode,"compute");
 }
 assert.equal(nativeCalls,0,"Media quote readiness must not call unrelated SASI-native compute");
 providerReady=false;
 for(const name of ["video-dubbing","video-translate"]){
  const r=await exposed.toolRuntimeStateLive(name);
  assert.equal(r.ready,false);
  assert.equal(r.reason,"MEDIA_PROVIDER_NOT_CONFIGURED");
 }
 assert.equal(nativeCalls,0,"An absent media provider must never call native compute");
 providerReady=true;
 const native=await exposed.toolRuntimeStateLive("sasi-deep-reason");
 assert.equal(native.ready,false,"SASI-native tool must still reject unhealthy native compute");
 assert.equal(native.reason,"SASI_NATIVE_COMPUTE_UNHEALTHY");
 assert.equal(nativeCalls,1,"Native compute gate must remain active for native tools");
 const mediaAfterNative=await exposed.toolRuntimeStateLive("video-dubbing");
 assert.equal(mediaAfterNative.ready,true,"A cached SASI outage must not block media quote");
 assert.equal(nativeCalls,1);
 const burn=await exposed.toolRuntimeStateLive("burn-after-read-file");
 assert.equal(burn.ready,true,"R2 storage readiness remains separate");
 assert.equal(exposed.toolRuntimeStateLive instanceof Function,true);
 console.log("MEDIA_QUOTE_READINESS_V151=PASS: video dubbing/translation use independent media provider; outage native compute only blocks native tools; existing media/R2 error gates preserved.");
})().catch(e=>{console.error(e);process.exitCode=1});
