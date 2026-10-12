const fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript'),assert=require('node:assert/strict');
async function main(){
 let payload={},download;
 const imports={'server-only':{},'@/lib/supabase/admin':{},'@/lib/sasi/credential-vault':{decryptProviderKey:()=> 'isolated-key'},'./provider-defaults':{defaultBaseUrl:()=> 'https://approved.example/v1'},'@/lib/sasi/gateway/ssrf-guard':{validateProviderBaseUrl:raw=>({pass:true,normalized:raw})},'./runtime-health':{},'./telemetry':{},'@/lib/security/provider-json-probe':{providerJsonProbe:async()=>({ok:true,payload})},'@/lib/security/public-media-range':{authenticatedMediaRange:async(...args)=>{download=args;return{body:Buffer.from('test')}}}};
 imports['./provider-lifecycle']={officialOpenAiVideoRetired:(provider,base)=>provider==='openai'&&(!base||new URL(base).hostname==='api.openai.com')};
 imports['@/lib/security/public-media-fetch']={fetchPublicMedia:async()=>{throw Error('not used in range test')}};
 const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/sasi/intelligence/user-video.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports,require:n=>{if(n in imports)return imports[n];throw Error(n)},URL,Headers,Date,FormData,Response,Uint8Array});
 for(const provider of ['volcengine','xai','aliyun']){
  const connection={provider,videoModel:'isolated',encrypted_credential:'test'};
  const result=url=>provider==='volcengine'?{status:'succeeded',content:{video_url:url}}:provider==='xai'?{status:'completed',video:{url}}:{output:{task_status:'SUCCEEDED',video_url:url}};
  for(const invalid of [undefined,'','http://video.example/film.mp4','https://key:secret@video.example/film.mp4']){payload=result(invalid);await assert.rejects(exports.pollUserVideo({userId:'isolated',connection,jobId:'test-id'}),/VIDEO_RESULT_INVALID/)}
  payload=result('https://video.example/film.mp4');const delivered=await exports.pollUserVideo({userId:'isolated',connection,jobId:'test-id'});assert.equal(delivered.state,'succeeded');assert.equal(delivered.output.videoUrl,'https://video.example/film.mp4');
 }
 await assert.rejects(exports.downloadAuthenticatedUserVideo({userId:'isolated',connection:{provider:'openai',encrypted_credential:'test'},jobId:'job/id',start:0}),/OPENAI_VIDEO_RETIRED/);
 await exports.downloadAuthenticatedUserVideo({userId:'isolated',connection:{provider:'openai',base_url:'https://approved.example/v1',encrypted_credential:'test'},jobId:'job/id',start:0});assert.equal(download[0],'https://approved.example/v1/videos/job%2Fid/content');assert.equal(download[2].Authorization,'Bearer isolated-key');
 await assert.rejects(exports.downloadAuthenticatedUserVideo({userId:'isolated',connection:{provider:'xai'},jobId:'id',start:0}),/VIDEO_DOWNLOAD_UNSUPPORTED/);
 console.log('PASS: successful supplier status needs a usable HTTPS result; authenticated download is constructed from the original connection, not an arbitrary output URL. Supplier mocked; no production user data used.');
}
main().catch(error=>{console.error(error);process.exitCode=1});
