const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),ts=require('typescript');
async function main(){
 let mode='complete',resets=0,calls=0,states={};const deltas=[],records=[],timers=[];
 const providers=[1,2].map(n=>({id:'test-'+n,wire:'openai',baseUrl:'https://isolated.invalid',apiKey:'test',model:'test',tasks:['chat'],canaryPercent:100,dailyShare:1,quality:1,speed:1,priority:n}));
 const exports={},imports={'server-only':{},'./free-provider-config':{experienceProviders:()=>providers},'./provider-state':{providerStates:async()=>states,recordProviderRun:async x=>records.push(x)},'./session-affinity':{getSessionAffinity:async()=>null,setSessionAffinity:async()=>{}},'./canary':{canaryAllowed:()=>true}};
 const frame=x=>'data: '+JSON.stringify(x)+'\r\n\r\n';
 vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/sasi/experience/free-text-router.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports,require:n=>{if(n in imports)return imports[n];throw Error(n)},TextDecoder,AbortController,Date,console,setTimeout:(fn,ms)=>{timers.push(ms);return setTimeout(fn,ms)},clearTimeout,fetch:async(_url,options)=>{
  calls++;
  const body=new ReadableStream({start(c){const wire=mode==='truncated'&&calls===1?frame({choices:[{delta:{content:'half'},finish_reason:null}]})+frame({choices:[{delta:{},finish_reason:'length'}]}):frame({choices:[{delta:{content:'完整结果'},finish_reason:null}]})+frame({choices:[{delta:{},finish_reason:'stop'}]})+'data: [DONE]\r\n\r\n';for(const byte of new TextEncoder().encode(wire))c.enqueue(Uint8Array.of(byte));c.close()}});
  return new Response(body,{headers:{'content-type':'text/event-stream'}});
 }});
 const input={region:'global',task:'chat',messages:[{role:'user',content:'Write a complete answer'}],userId:'user',sessionKey:'session',onDelta:x=>deltas.push(x),onReset:()=>{resets++}};
 const first=await exports.runExperienceText(input);assert.equal(first.text,'完整结果');assert(timers.some(ms=>ms>12_000));assert(timers.includes(12_000));
 assert(timers.some(ms=>ms>140_000),'a progressing long answer must not be cut off at the former 42s deadline');
 const buffered=await exports.runExperienceText({...input,onDelta:undefined});assert.equal(buffered.text,'完整结果','non-UI callers also consume a complete provider stream');
 for(const route of ['app/api/knowledge/ask/route.ts','app/api/sasi/experience/text/route.ts','app/api/sasi/experience/website/route.ts','app/api/sasi/drama/plan/route.ts','app/api/internal/sasi/worker/tick/route.ts'])assert(/maxDuration\s*=\s*180/.test(fs.readFileSync(route,'utf8')),route+' must outlive generation and settlement');
 mode='truncated';calls=0;deltas.length=0;records.length=0;
 const fallback=await exports.runExperienceText(input);assert.equal(fallback.text,'完整结果');assert.equal(calls,2);assert.equal(resets,1);assert.equal(records[0].ok,false);assert.equal(records[1].ok,true);
 mode='complete';calls=0;
 states={'test-1':{requestCount:2,successCount:0,failureCount:2,latencyEwmaMs:12000,cooldownUntil:null},'test-2':{requestCount:100,successCount:100,failureCount:0,latencyEwmaMs:1500,cooldownUntil:null}};
 const reliable=await exports.runExperienceText(input);assert.equal(reliable.providerId,'test-2');assert.equal(calls,1,'least-used failing service must not delay a healthy service');
 states['test-2'].cooldownUntil=new Date(Date.now()+60000).toISOString();const recovering=await exports.runExperienceText(input);assert.equal(recovering.providerId,'test-1','retain fallback when reliable service is cooling down');
 console.log('PASS: fragmented provider stream; first-token and whole-answer deadlines differ; token-limit output rejected and reset before fallback.');
}
main().catch(e=>{console.error(e);process.exitCode=1});
