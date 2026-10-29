const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
const path=require('node:path');
const sourceFile=process.argv[2]||'components/tools/VideoDubbingWorkbench.tsx';
async function scenario({sameLanguage=false,emptyTranslation=false,remote=false}={}){
 const original=[{start:1,end:2,text:'你好'},{start:3,end:4,text:'世界'}];
 const state=[],writes=new Map(),requests=[];let cursor=0,ttsText='',serializers;
 const jsx=(type,props)=>({type,props});
 const react={useState:initial=>{const index=cursor++;const value=index===0?[{name:'source.mp4'}]:index===2?(sameLanguage?'zh':'en'):typeof initial==='function'?initial():initial;state[index]=value;return[value,next=>{state[index]=typeof next==='function'?next(state[index]):next;writes.set(index,state[index])}]},useEffect:()=>{},useMemo:fn=>fn()};
 const modules={
  react,'react/jsx-runtime':{jsx,jsxs:jsx},
  '@/components/tools/ToolUiText':{default:'text'},'@/components/tools/FileDropzone':{default:'files'},
  '@/components/tools/PaidActionButton':{default:'paid'},'@/components/tools/ResultPanel':{default:'result'},
  '@/lib/tools/autonomous/transcribe-local':{localMediaDuration:async()=>6,transcribeLocal:async()=>{if(remote)throw Error('LOCAL_UNAVAILABLE');return{text:'你好 世界',segments:original}},toSrt:segments=>serializers.toSrt(segments)},
  '@/lib/tools/media/runtime':{},'@ffmpeg/util':{},
  '@/lib/lingxi-i18n':{useLingxiLang:()=>({lang:'en'})},'@/lib/tools/plain-copy':{plainText:()=> 'Please retry processing your file.'},
  '@/lib/tools/media/client':{extractCompactAudio:async()=>new Blob(['audio']),muxDubbedVideo:async()=>new Blob(['video'])},
  '@/lib/tools/workspace/paid-task-draft':{},
 };
 for(const value of Object.values(modules))if(value.default)value.__esModule=true;
 function load(file){const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText,{exports,Blob,FormData,console,URL,fetch:async(url,options)=>{if(url.endsWith('/transcribe'))return{ok:true,json:async()=>({text:'你好 世界'})};const body=JSON.parse(options.body);requests.push({url,body});if(url.endsWith('/tts')){ttsText=body.text;return{ok:true,blob:async()=>new Blob(['voice'])}}return{ok:true,json:async()=>({translated:emptyTranslation?'':body.text.replaceAll('你好','Hello').replaceAll('世界','World')})}},require:name=>{if(name in modules)return modules[name];if(name==='@/lib/tools/media/translate-timed-text')return load('lib/tools/media/translate-timed-text.ts');throw Error('Unexpected dependency '+name)}});return exports}
 serializers=load('lib/tools/autonomous/transcribe-local.ts');
 const component=load(sourceFile).default,tree=component();
 function find(node){if(!node||typeof node!=='object')return null;if(node.type==='paid')return node;for(const child of [node.props?.children].flat(Infinity)){const found=find(child);if(found)return found}return null}
 const paid=find(tree);assert(paid,'Paid action must exist');
 if(emptyTranslation){await assert.rejects(()=>paid.props.onPaid('isolated-quote'));assert.equal(ttsText,'','Incomplete translation must not reach TTS');assert.equal(state[8].length,0,'Incomplete subtitles must not be published');assert.equal(state[6],'Please retry processing your file.','A failed translation must show recovery copy rather than an internal error code');return}
 await paid.props.onPaid('isolated-quote');
 const subtitles=state[8];assert.equal(subtitles.length,1);const content=await subtitles[0].blob.text();
 if(!sameLanguage){assert(content.includes('Hello')&&content.includes('World'),'Downloaded subtitles must contain translated text for every cue');assert(!content.includes('你好')&&!content.includes('世界'),'Original-language cues must not be advertised as translated');assert(ttsText.includes('Hello')&&ttsText.includes('World'))}
 else{assert(content.includes('你好'));assert.equal(requests.filter(r=>r.url.endsWith('/translate')).length,0)}
 if(!remote){for(const stamp of ['00:00:01,000 --> 00:00:02,000','00:00:03,000 --> 00:00:04,000'])assert(content.includes(stamp),'Original cue timings must survive')}
 assert.equal(state[7].length,1,'Completed MP4 must be retained with the subtitle');
}
(async()=>{await scenario();await scenario({sameLanguage:true});await scenario({remote:true});await scenario({emptyTranslation:true});console.log('VIDEO_DUBBING_SUBTITLES=PASS: actual workbench callback; multiple translated cues, original timings, same-language path, remote fallback, empty-result rejection; ASR/TTS/payment isolated. No real charges.');})().catch(error=>{console.error(error);process.exitCode=1});
