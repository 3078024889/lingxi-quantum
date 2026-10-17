const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),ts=require('typescript');
const source=ts.createSourceFile('VideoToolkitWorkbench.tsx',fs.readFileSync(process.argv[2]||'components/tools/VideoToolkitWorkbench.tsx','utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
const names=['expectedOutputDuration','videoFilters','run','cancel'],functions=new Map();
function visit(n){if(ts.isFunctionDeclaration(n)&&names.includes(n.name?.text))functions.set(n.name.text,n.getText(source));ts.forEachChild(n,visit)}visit(source);
for(const name of names)assert(functions.has(name),name);
const code=ts.transpileModule([...functions.values()].join('\n')+'\nexports.run=run;exports.cancel=cancel;',{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
function deferred(){let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b});return{promise,resolve,reject}}
async function until(check){for(let i=0;i<100;i++){if(check())return;await new Promise(setImmediate)}assert.fail('task never reached controlled suspension')}
function fixture(){
 const instances=[],metadata=deferred(),state={outputs:[],stages:[],errors:[],metadataWait:false};
 class FFmpeg{
  constructor(){this.job=deferred();this.terminated=0;instances.push(this)}on(event,callback){if(event==='progress')this.progress=callback}async load(){}async writeFile(){}
  exec(){this.started=true;return this.job.promise}async readFile(){return new Uint8Array(2048)}async deleteFile(){}terminate(){this.terminated++}
 }
 const context={exports:{},require:n=>n==='@ffmpeg/ffmpeg'?{FFmpeg}:n==='@ffmpeg/util'?{fetchFile:async()=>new Uint8Array(2048)}:assert.fail(n),files:[{name:'old.mp4'}],mode:'convert',start:0,duration:30,speed:1,preset:'balanced',rotation:'90',resolution:'source',fps:0,busy:false,runId:{current:0},ff:{current:null},lang:'en',URL,Blob,Uint8Array,TextEncoder,location:{origin:'https://example.com'},CRF:{balanced:28},SCALE:{},safeFilename:x=>x,t:(_zh,en)=>en,plainText:(_lang,key)=>key,workbenchCopy:(_lang,key)=>key,readMediaDuration:async file=>{if(file.waitMeta){state.metadataWait=true;await metadata.promise}return 10},setBusy:v=>{context.busy=v},setError:v=>state.errors.push(v),setStage:v=>state.stages.push(v),setOutputs:v=>state.outputs.push(v)};
 vm.runInNewContext(code,context);return{context,instances,state,metadata};
}
(async()=>{
 const {context:c,instances,state}=fixture();const old=c.exports.run();await until(()=>instances[0]?.started);c.exports.cancel();c.files=[{name:'new.mp4'}];
 const next=c.exports.run();await until(()=>instances[1]?.started);const newRuntime=instances[1],stage=state.stages.at(-1);instances[0].progress({progress:.9});assert.equal(state.stages.at(-1),stage,'cancelled progress must not overwrite the new task');instances[0].job.reject(Error('old cancelled worker failed late'));await old;
 assert.equal(newRuntime.terminated,0,'old task must not terminate the new runtime');assert.equal(c.ff.current,newRuntime);assert.equal(c.busy,true,'old finally must not unlock the active task');assert.equal(state.outputs.filter(x=>x.length).length,0);
 newRuntime.job.resolve(0);await next;assert.equal(c.busy,false);assert.equal(newRuntime.terminated,1);assert.equal(state.outputs.at(-1)[0].name,'new.mp4');assert.equal(state.errors.filter(Boolean).length,0);
 const pre=fixture();pre.context.files=[{name:'late-metadata.mp4',waitMeta:true}];const pending=pre.context.exports.run();await until(()=>pre.state.metadataWait);pre.context.exports.cancel();pre.metadata.resolve();await pending;
 assert.equal(pre.instances.length,0,'cancel during metadata must prevent a late runtime launch');assert.equal(pre.state.outputs.filter(x=>x.length).length,0);assert.equal(pre.state.stages.at(-1),'Cancelled');assert.equal(pre.state.errors.filter(Boolean).length,0);
 console.log('PASS: actual video callbacks isolate cancelled/next runtimes, block stale delivery/progress cleanup and cancel before runtime startup. Engine scheduling is isolated, no real encoding/payment.');
})().catch(e=>{console.error(e);process.exitCode=1});
