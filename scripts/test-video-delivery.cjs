const fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript'),assert=require('node:assert/strict');
async function main(){
 let payload={},download,request;
 const imports={'server-only':{},'@/lib/supabase/admin':{},'@/lib/sasi/credential-vault':{decryptProviderKey:()=> 'isolated-key'},'./provider-defaults':{defaultBaseUrl:()=> 'https://approved.example/v1'},'@/lib/sasi/gateway/ssrf-guard':{validateProviderBaseUrl:raw=>({pass:true,normalized:raw})},'./runtime-health':{},'./telemetry':{},'@/lib/security/provider-json-probe':{providerJsonProbe:async()=>({ok:true,payload})},'@/lib/security/public-media-range':{authenticatedMediaRange:async(...args)=>{download=args;return{body:Buffer.from('test')}}}};
 imports['./provider-lifecycle']={officialOpenAiVideoRetired:(provider,base)=>provider==='openai'&&(!base||new URL(base).hostname==='api.openai.com')};
 imports['./runtime-health']={errorCode:()=> 'ISOLATED_FAILURE',recordConnectionSuccess:async()=>{},recordConnectionFailure:async()=>{}};
 imports['./telemetry']={recordIntelligenceRun:async()=>{}};
 imports['@/lib/security/provider-json-probe']={providerJsonProbe:async(url,headers,timeout,maxBytes,options)=>{request={url,headers,options};return {ok:true,payload}}};
 imports['@/lib/security/public-media-fetch']={fetchPublicMedia:async()=>{throw Error('not used in range test')}};
 const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/sasi/intelligence/user-video.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports,require:n=>{if(n in imports)return imports[n];throw Error(n)},URL,Headers,Date,FormData,Response,Uint8Array});
 for(const provider of ['volcengine','xai','aliyun']){
  const connection={provider,videoModel:'isolated',encrypted_credential:'test'};
  const result=url=>provider==='volcengine'?{status:'succeeded',content:{video_url:url}}:provider==='xai'?{status:'completed',video:{url}}:{output:{task_status:'SUCCEEDED',video_url:url}};
  for(const invalid of [undefined,'','http://video.example/film.mp4','https://key:secret@video.example/film.mp4']){payload=result(invalid);await assert.rejects(exports.pollUserVideo({userId:'isolated',connection,jobId:'test-id'}),/VIDEO_RESULT_INVALID/)}
  payload=result('https://video.example/film.mp4');const delivered=await exports.pollUserVideo({userId:'isolated',connection,jobId:'test-id'});assert.equal(delivered.state,'succeeded');assert.equal(delivered.output.videoUrl,'https://video.example/film.mp4');
 }
 for(const [provider,base,receipt,path] of [
  ['volcengine','https://ark.cn-beijing.volces.com/api/v3',{id:'actual-task-123'},'/contents/generations/tasks'],
  ['xai','https://api.x.ai/v1',{request_id:'actual-task-123'},'/videos/generations'],
  ['aliyun','https://dashscope.aliyuncs.com/compatible-mode/v1',{output:{task_id:'actual-task-123'}},'/api/v1/services/aigc/video-generation/video-synthesis'],
 ]){
  const connection={id:'isolated',provider,videoModel:'isolated-model',encrypted_credential:'test',base_url:base};
  payload=receipt;const created=await exports.submitUserVideo({userId:'isolated',connection,prompt:'Photoreal live-action product demonstration',duration:12,ratio:'9:16',resolution:'1080p'});assert.equal(created.jobId,'actual-task-123');assert(request.url.endsWith(path));assert.equal(request.options.method,'POST');const body=JSON.parse(request.options.body);assert.equal(body.model,'isolated-model');assert.equal(provider==='volcengine'?body.resolution:provider==='aliyun'?body.parameters.resolution:body.resolution,provider==='aliyun'?'1080P':'1080p');if(provider==='aliyun')assert.equal(request.headers['x-dashscope-async'],'enable');
  payload={};await assert.rejects(exports.submitUserVideo({userId:'isolated',connection,prompt:'Real motion video',duration:12,ratio:'9:16',resolution:'1080p'}),/VIDEO_TASK_ID_INVALID/);
 }
 await assert.rejects(exports.submitUserVideo({userId:'isolated',connection:null,prompt:'Real video',duration:12,ratio:'9:16',resolution:'720p'}),/VIDEO_CONNECTION_REQUIRED/);
 await assert.rejects(exports.downloadAuthenticatedUserVideo({userId:'isolated',connection:{provider:'openai',encrypted_credential:'test'},jobId:'job/id',start:0}),/OPENAI_VIDEO_RETIRED/);
 await exports.downloadAuthenticatedUserVideo({userId:'isolated',connection:{provider:'openai',base_url:'https://approved.example/v1',encrypted_credential:'test'},jobId:'job/id',start:0});assert.equal(download[0],'https://approved.example/v1/videos/job%2Fid/content');assert.equal(download[2].Authorization,'Bearer isolated-key');
 await assert.rejects(exports.downloadAuthenticatedUserVideo({userId:'isolated',connection:{provider:'xai'},jobId:'id',start:0}),/VIDEO_DOWNLOAD_UNSUPPORTED/);
 console.log('PASS: real adapter submit/poll contracts for Volcengine, xAI and Aliyun preserve duration/ratio/resolution; missing connection or supplier receipt cannot become a delivered video. Success needs HTTPS media; authenticated download stays on original connection. Suppliers mocked; zero paid calls; generated content quality not certified.');
}
main().catch(error=>{console.error(error);process.exitCode=1});
