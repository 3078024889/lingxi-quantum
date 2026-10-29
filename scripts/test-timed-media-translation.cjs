const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
const exportsObject={};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/tools/media/translate-timed-text.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports:exportsObject});
const {translateTimedText}=exportsObject;
(async()=>{
 const input=Array.from({length:27},(_,i)=>({start:i*2,end:i*2+1,text:'source '+i,id:'cue-'+i})),before=JSON.stringify(input),requests=[];
 const out=await translateTimedText(input,'zh','en',async text=>{requests.push(text);return text.replaceAll('source','translated')});
 assert.equal(requests.length,2);assert.deepEqual(Array.from(out,x=>[x.id,x.start,x.end]),input.map(x=>[x.id,x.start,x.end]));assert(out.every((x,i)=>x.text==='translated '+i));assert.equal(JSON.stringify(input),before);
 for(const broken of ['⟦LX0⟧ translated zero\n⟦LX0⟧ duplicate','⟦LX1⟧ wrong identity\n⟦LX2⟧ unknown','⟦LX0⟧\n⟦LX1⟧ translated one','missing markers']){
  let calls=0;const recovered=await translateTimedText(input.slice(0,2),'zh','en',async text=>++calls===1?broken:text.replace('source','recovered'));
  assert.equal(calls,3);assert.deepEqual(Array.from(recovered,x=>x.text),['recovered 0','recovered 1']);
 }
 await assert.rejects(()=>translateTimedText(input.slice(0,2),'zh','en',async()=>''),/INCOMPLETE/);
 await assert.rejects(()=>translateTimedText(input.slice(0,2),'zh','en',async()=>{throw Error('NETWORK_DOWN')}),/NETWORK_DOWN/);
 const reordered=await translateTimedText(input.slice(0,2),'zh','en',async()=> '⟦LX1⟧ second\n⟦LX0⟧ first');assert.deepEqual(Array.from(reordered,x=>x.text),['first','second']);
 const same=await translateTimedText(input,'en','en',async()=>{throw Error('MUST_NOT_TRANSLATE')});assert.equal(JSON.stringify(same),before);assert.notEqual(same[0],input[0]);
 const long=[{start:0,end:1,text:'x'.repeat(15000)},{start:1,end:2,text:'y'.repeat(15000)}];let count=0;await translateTimedText(long,'zh','en',async text=>{count++;assert(text.length<=30000);return text});assert.equal(count,2);
 console.log('TIMED_MEDIA_TRANSLATION=PASS: 27-cue batching, exact cue identities/timings, no input mutation, duplicate/missing/unknown/empty IDs, individual recovery, empty/network rejection, reordered replies, same-language no-op, request-size bounds. Provider isolated.');
})().catch(error=>{console.error(error);process.exitCode=1});
