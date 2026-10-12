const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),ts=require('typescript');
function load(file,imports={}){const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports,require:n=>{if(n in imports)return imports[n];throw Error(n)},TextDecoder,TextEncoder,console});return exports;}
async function main(){
 const identity=load('lib/sasi/core/platform-identity.ts');
 for(const question of ['你好 你是什么模型，有什么功能','Who are you?','What can you do?'])assert(identity.asksSasiIdentity(question));
 for(const question of ['这本书中你是什么模型的解释是什么','你能做什么样的网站？','你觉得幸福是什么？','你解释一下什么模型适合分类','Summarize the author’s argument'])assert.equal(identity.asksSasiIdentity(question),false);
 assert.match(identity.sasiIdentityAnswer('zh'),/不是灵犀场自研/);
 const {receiveSasiStream}=load('lib/sasi/client/receive-text-stream.ts');
 const wire='event: delta\r\ndata: {"text":"旧回复"}\r\n\r\nevent: reset\r\ndata: {}\r\n\r\nevent: delta\r\ndata: {"text":"完整回答"}\r\n\r\nevent: done\r\ndata: {"answer":"完整回答","source":"experience"}\r\n\r\n';
 const bytes=new TextEncoder().encode(wire),updates=[];
 const response=new Response(new ReadableStream({start(c){for(const byte of bytes)c.enqueue(Uint8Array.of(byte));c.close()}}),{headers:{'content-type':'text/event-stream'}});
 const result=await receiveSasiStream(response,x=>updates.push(x));
 assert.equal(result.answer,'完整回答');assert.deepEqual(updates,['旧回复','','完整回答']);
 for(const frame of ['event: delta\ndata: {"text":"半句"}\n\n','event: done\ndata: {"error":"failed"}\n\n','event: delta\ndata: invalid\n\n'])await assert.rejects(receiveSasiStream(new Response(frame,{headers:{'content-type':'text/event-stream'}}),()=>{}));
 assert.deepEqual(await receiveSasiStream(Response.json({answer:'JSON compatibility'}),()=>{}),{answer:'JSON compatibility'});
 class Busy extends Error{};const changes=[],events=[];
 const {durableExecute}=load('lib/sasi/durable/orchestrator.ts',{'server-only':{},'node:crypto':require('node:crypto'),'./step-store':{DurableStepBusyError:Busy},'./run-store':{beginDurableRun:async()=>({id:'run',state:'running',attempt:0}),checkpointRun:async x=>changes.push(x),appendRunEvent:async x=>events.push(x)},'./trace':{startSpan:()=>({}),endSpan:async()=>{}}});
 let attempts=0;
 await assert.rejects(durableExecute({userId:'user',sessionKey:'session',task:'knowledge',payload:{},execute:async()=>{attempts++;throw new Busy()},maxAttempts:2}),Busy);
 assert.equal(attempts,1);assert.equal(changes.some(x=>x.state==='failed'),false);assert.equal(events.some(x=>x.kind==='RUN_FAILED'),false);
 let owner='user',authCalls=0,generations=0,runState='running';
 const route=load('app/api/knowledge/ask/route.ts',{
  'next/server':{NextResponse:{json:(body,options={})=>({body,status:options.status||200,headers:options.headers})}},
  '@/lib/supabase/server':{createClient:()=>({auth:{getUser:async()=>{authCalls++;return{data:{user:owner?{id:owner}:null}}}}})},
  '@/lib/sasi/request-security':{isSameOriginMutation:()=>true},
  '@/lib/security/abuse-guard':{},'@/lib/sasi-kernel/cognition/grounded-answer':{},'@/lib/sasi/skills/router':{},'@/lib/sasi/experience/free-provider-config':{},
  '@/lib/sasi/knowledge/durable-knowledge':{runKnowledgeText:async()=>{generations++;throw Error('not expected')}},
  '@/lib/sasi/durable/step-store':{DurableStepBusyError:Busy},
  '@/lib/sasi/core/platform-identity':identity,
  '@/lib/security/bounded-request-json':{boundedRequestJson:req=>req.json()},
  '@/lib/sasi/durable/public-event-store':{assertRunOwner:async user=>user==='user'?{task:'knowledge.knowledge',state:runState,output_json:{kind:'answer',answer:'Saved completed answer',source:'experience'}}:null}
 });
 const self=await route.POST({headers:new Headers(),json:async()=>({question:'你好 你是什么模型，有什么功能',evidence:[{text:'A book unrelated to model identity'}]})});
 assert.equal(self.status,200);assert.match(self.body.answer,/不是灵犀场自研/);assert.equal(authCalls,0);assert.equal(generations,0);
 const getReq={nextUrl:new URL('https://local.invalid/api/knowledge/ask?runId=12345678-1234-1234-1234-123456789012')};
 assert.equal((await route.GET(getReq)).status,202);runState='succeeded';assert.equal((await route.GET(getReq)).body.answer,'Saved completed answer');
 owner='other';assert.equal((await route.GET(getReq)).status,404);owner='';assert.equal((await route.GET(getReq)).status,401);assert.equal(generations,0);
 console.log('PASS: identity ignores uploaded book without provider/billing; owner-only saved-answer recovery never resubmits generation.');
 console.log('PASS: identity routing; byte-fragmented UTF-8/CRLF; fallback reset; completion required; JSON compatibility; busy task is neither retried nor failed.');
}
main().catch(e=>{console.error(e);process.exitCode=1});
