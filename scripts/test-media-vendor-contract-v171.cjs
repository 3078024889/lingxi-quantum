const fs=require("node:fs"),vm=require("node:vm"),ts=require("typescript"),assert=require("node:assert/strict");
const expose=(path,extra={})=>{
 const code=ts.transpileModule(fs.readFileSync(path,"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const out={},context={exports:out,Number,String,Math,Map,Error,Buffer,process:{env:{LINGXIFIELD_MEDIA_AI_KEY:"test-credential",LINGXIFIELD_MEDIA_AI_BASE_URL:"https://api.openai.com/v1"}},
 require(name){if(name==="server-only")return{};throw Error("UNEXPECTED_IMPORT:"+name);},...extra};
 vm.runInNewContext(code,context);return out;
};
const split=expose("lib/tools/media/tts-split.ts").splitSpeechText;
for(const n of [1,100,3500,3501,4000,7100,8500,14000]){
 const text=("Hello world, this is original speech. 日本語。 مرحباً بالعالم! ").repeat(Math.ceil(n/63)).slice(0,n).trim();
 if(!text)continue;
 const chunks=Array.from(split(text));
 assert(chunks.length>=1&&chunks.every(x=>x.length>0&&x.length<=3500),n+" oversized part");
 assert.equal(chunks.join(" ").replace(/\s+/g," ").trim(),text.replace(/\s+/g," ").trim(),n+" missing speech");
}
const giantSentence="x".repeat(13999);
const chunks=Array.from(split(giantSentence));assert.equal(chunks.join(""),giantSentence,"must not lose characters in an overlong sentence");
assert(chunks.every(x=>x.length<=3500));
for(const invalid of ["", " ", "x".repeat(250001)])assert.throws(()=>split(invalid),/TTS_TEXT_INVALID/);
let calls=[];
const response=(value,status=200,kind="application/json")=>({
 ok:status>=200&&status<300,status,headers:{get:(name)=>name==="content-type"?kind:null},
 json:async()=>value,text:async()=>JSON.stringify(value),arrayBuffer:async()=>kind==="application/json"?Buffer.from(JSON.stringify(value)):Buffer.from("ID3"+("x".repeat(512))),
 body:null
});
const provider=expose("lib/tools/media/provider.ts",{
 AbortSignal:{timeout:(ms)=>{assert.equal(ms,48000);return {timeout:ms};}},TextDecoder,Uint8Array,

 fetch:async(url,options)=>{
  calls.push({url,options});
  if(url.endsWith("/chat/completions"))return response({choices:[{message:{content:"Bonjour"}}]});
  if(url.endsWith("/audio/speech"))return response({},200,"audio/mpeg");
  throw Error("UNEXPECTED_URL:"+url);
 }
});
(async()=>{
 assert.equal(await provider.translateTextRemote({text:"Hello",source:"en",target:"fr"}),"Bonjour");
 const request=JSON.parse(calls[0].options.body);
 assert(!("temperature" in request),"unsupported temperature leaked into legacy GPT5 Mini");
 assert.equal(request.model,"gpt-5-mini");
 assert.equal(await provider.synthesizeRemote("Hello world","en").then(x=>x.length),515);
 // Reject application/json with HTTP 200, a common compatible-provider error.
 const good=Uint8Array.from(Buffer.from("ID3"+("x".repeat(512))));
 assert.equal(provider.checkedMp3Response(good,"audio/mpeg").byteLength,515);
 assert.throws(()=>provider.checkedMp3Response(good,"application/json"),/MEDIA_TTS_UNEXPECTED_CONTENT_TYPE/);
 assert.throws(()=>provider.checkedMp3Response(Uint8Array.from(Buffer.alloc(512,0)),"audio/mpeg"),/MEDIA_TTS_NOT_MP3/);
 assert.throws(()=>provider.checkedMp3Response(Uint8Array.from(Buffer.from("ID3")),"audio/mpeg"),/MEDIA_TTS_INVALID_AUDIO_SIZE/);
 assert.throws(()=>provider.checkedMp3Response(Uint8Array.from(Buffer.alloc(33*1024*1024,0)),"audio/mpeg"),/MEDIA_TTS_INVALID_AUDIO_SIZE/);
 const frame=Uint8Array.from(Buffer.concat([Buffer.from([0xff,0xfb]),Buffer.alloc(400,0)]));
 assert.equal(provider.checkedMp3Response(frame,"application/octet-stream").length,402);
 assert(calls.every(c=>c.options.signal&&c.options.signal.timeout===48000),"all provider calls need timeouts");

 const badProvider=expose("lib/tools/media/provider.ts",{
  AbortSignal:{timeout:()=>({})},TextDecoder,Uint8Array,
  fetch:async(url)=>url.endsWith("/audio/speech")?response({error:"provider failure ".repeat(40)},200,"application/json"):response({error:"bad"},200)
 });
 await assert.rejects(()=>badProvider.synthesizeRemote("Short sentence","en"),/MEDIA_TTS_UNEXPECTED_CONTENT_TYPE/,"HTTP 200 JSON must never become a paid MP3");
 const failingProvider=expose("lib/tools/media/provider.ts",{
  AbortSignal:{timeout:()=>({})},TextDecoder,Uint8Array,
  fetch:async()=>response({secret:"private body must not appear"},429)
 });
 await assert.rejects(()=>failingProvider.translateTextRemote({text:"private",source:"en",target:"fr"}),/MEDIA_PROVIDER_429/);
 const tooLargeJsonProvider=expose("lib/tools/media/provider.ts",{
  AbortSignal:{timeout:()=>({})},TextDecoder,Uint8Array,
  fetch:async()=>response({choices:[{message:{content:"x".repeat(1200000)}}]},200)
 });
 await assert.rejects(()=>tooLargeJsonProvider.translateTextRemote({text:"small",source:"en",target:"fr"}),/MEDIA_PROVIDER_JSON_TOO_LARGE/);
 const n=calls.length;
 await assert.rejects(()=>provider.synthesizeRemote("x".repeat(4001),"en"),/TTS_TEXT_EXCEEDS_PROVIDER_LIMIT/);
 assert.equal(calls.length,n,"oversized payload must fail before spending vendor credit");
 const component=fs.readFileSync("components/tools/VideoDubbingWorkbench.tsx","utf8");
 const translation=fs.readFileSync("components/tools/VideoTranslateWorkbench.tsx","utf8");
 assert(component.includes("splitSpeechText(translated,Math.min(3500"),"dubbing must chunk entire translated text");
 assert(translation.includes("splitSpeechText(txt,Math.min(3500"),"video translate must chunk entire translated text");
 const route=fs.readFileSync("app/api/tools/media/tts/route.ts","utf8");
 assert(route.includes("text.length>4000")&&route.includes("Math.min(4000,Math.max(1200"));
 assert(!fs.readFileSync("lib/tools/media/provider.ts","utf8").includes("text.slice(0,12000)"));
 console.log("MEDIA_VENDOR_CONTRACT_V171=PASS: 4k text limit, no truncation, full speech chunks, GPT-5 temperature omitted, signed provider call shape verified; HTTP mocked, live provider separate");
})().catch(err=>{console.error(err);process.exitCode=1});
