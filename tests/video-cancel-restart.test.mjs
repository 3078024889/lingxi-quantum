import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import ts from 'typescript';

test('cancelled video jobs cannot terminate or replace a newer job',async()=>{
 const state=[true,[{name:'input.webm',size:10,type:'video/webm'}]],refs=[];
 let si=0,ri=0;const workers=[];
 const hooks={
  useState(initial){const i=si++;if(!(i in state))state[i]=initial;return [state[i],value=>{state[i]=typeof value==='function'?value(state[i]):value}]},
  useRef(initial){const i=ri++;return refs[i]||(refs[i]={current:initial})},useEffect(){},
 };
 class FFmpeg{
  constructor(){this.dead=false;this.loaded=new Promise((resolve,reject)=>{this.resolve=resolve;this.reject=reject});workers.push(this)}
  on(){}load(){return this.loaded}terminate(){this.dead=true}
  async writeFile(){}async exec(){return 0}async readFile(){return new Uint8Array([1,2,3])}async deleteFile(){}
 }
 const jsx=(type,props)=>({type,props});const exports={};
 const source=readFileSync(new URL('../components/tools/VideoToolkitWorkbench.tsx',import.meta.url),'utf8');
 runInNewContext(ts.transpileModule(source,{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText,{
  exports,Blob,Uint8Array,TextEncoder,URL,location:{origin:'https://example.test'},Error,
  require:name=>{
   if(name==='react')return hooks;
   if(name==='react/jsx-runtime')return{jsx,jsxs:jsx,Fragment:'fragment'};
   if(name==='@ffmpeg/ffmpeg')return{FFmpeg};
   if(name==='@ffmpeg/util')return{fetchFile:async()=>new Uint8Array([0])};
   if(name.endsWith('lingxi-i18n'))return{useLingxiLang:()=>({lang:'en'})};
   if(name.endsWith('video-labels'))return{videoUiText:(_lang,_zh,en)=>en};
   if(name.endsWith('compression-delivery'))return{chooseCompressionDelivery:()=> 'encoded'};
   if(name.endsWith('workbench-i18n-v1473'))return{workbenchCopy:()=> 'Preparing'};
   if(name.endsWith('plain-copy'))return{plainText:(_lang,key)=>key,plainMessage:(_lang,text)=>text};
   if(name.endsWith('shared/download'))return{safeFilename:text=>text};
   return{default:name};
  },
 });
 const component=exports.default;
 function render(){si=ri=0;return component({})}
 function find(node,label){
  if(!node||typeof node!=='object')return;
  if(node.type==='button'&&node.props.children===label)return node;
  for(const child of [node.props?.children].flat(Infinity)){const match=find(child,label);if(match)return match}
 }
 const first=find(render(),'Start processing').props.onClick();
 await new Promise(resolve=>setImmediate(resolve));assert.equal(workers.length,1);
 find(render(),'Cancel').props.onClick();assert(workers[0].dead);
 const second=find(render(),'Start processing').props.onClick();
 await new Promise(resolve=>setImmediate(resolve));assert.equal(workers.length,2);
 // The first worker rejects only after the replacement worker has started.
 workers[0].reject(Error('Old worker terminated'));await first;
 assert.equal(workers[1].dead,false,'stale catch must not terminate the active worker');
 workers[1].resolve();await second;
 const outputs=state[13];assert.equal(outputs.length,1);assert.equal(outputs[0].size,3);
});
