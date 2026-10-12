const fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript'),assert=require('node:assert/strict'),{EventEmitter}=require('node:events');
let responseBody=Buffer.from('clip'),range='bytes 0-3/4',status=206,headersSeen;
const transport={get(url,options,callback){headersSeen=options.headers;const request=new EventEmitter();request.destroy=e=>{request.emit('error',e);request.emit('close')};queueMicrotask(()=>{const response=new EventEmitter();response.statusCode=status;response.headers={'content-range':range,location:'https://elsewhere.example/content'};response.resume=()=>request.emit('close');response.destroy=()=>request.emit('close');callback(response);if(status===206){response.emit('data',responseBody);response.emit('end');request.emit('close')}});return request}};
const exportsValue={};vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/security/public-media-range.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,{exports:exportsValue,require:n=>n==='server-only'?{}:n==='node:https'?transport:n==='./public-endpoint'?{parsePublicHttpsUrl:async raw=>({url:new URL(raw),addresses:[{address:'93.184.216.34',family:4}]})}:require(n),Buffer,Date,setTimeout,clearTimeout});
(async()=>{
 assert.equal((await exportsValue.authenticatedMediaRange('https://original.example/content',0,{Authorization:'Bearer isolated'})).body.toString(),'clip');assert.equal(headersSeen.Authorization,'Bearer isolated');
 responseBody=Buffer.from('cl');await assert.rejects(exportsValue.publicMediaRange('https://original.example/content',0),/MEDIA_INCOMPLETE/);
 responseBody=Buffer.alloc(0);await assert.rejects(exportsValue.publicMediaRange('https://original.example/content',0),/MEDIA_INCOMPLETE/);
 range='bytes 0-3/3';await assert.rejects(exportsValue.publicMediaRange('https://original.example/content',0),/MEDIA_RANGE_UNAVAILABLE/);
 status=302;await assert.rejects(exportsValue.authenticatedMediaRange('https://original.example/content',0,{Authorization:'Bearer isolated'}),/MEDIA_REDIRECT/);
 console.log('PASS: exact body/range completion; empty and truncated chunks rejected; authenticated media never follows redirects with credentials.');
})().catch(error=>{console.error(error);process.exitCode=1});
