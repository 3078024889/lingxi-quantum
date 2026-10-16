const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ts=require('typescript');
const source=fs.readFileSync('lib/tools/autonomous/image-local.ts','utf8');
const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const w=20,h=20,input=new Uint8ClampedArray(w*h*4);
function pixel(x,y,color){input.set([...color,255],(y*w+x)*4)}
for(let y=0;y<h;y++)for(let x=0;x<w;x++)pixel(x,y,[120,120,120]);
// Distinct sides expose accidental interleaving of top/bottom/left/right samples.
for(let x=5;x<=15;x++){pixel(x,3,[240,0,0]);pixel(x,4,[240,0,0]);pixel(x,16,[0,0,240]);pixel(x,17,[0,0,240])}
for(let y=5;y<=15;y++){pixel(3,y,[0,240,0]);pixel(4,y,[0,240,0]);pixel(16,y,[240,240,240]);pixel(17,y,[240,240,240])}
let output;
const context={drawImage(){},getImageData(){return{data:new Uint8ClampedArray(input)}},putImageData(im){output=im.data}};
const sandbox={exports:{},Uint8ClampedArray,Uint8Array,createImageBitmap:async()=>({width:w,height:h,close(){}}),document:{createElement:()=>({getContext:()=>context,toBlob:cb=>cb({size:1})})}};
vm.runInNewContext(code,sandbox);
(async()=>{
 await sandbox.exports.localInpaint({}, {x:.25,y:.25,w:.5,h:.5});
 assert.deepEqual(Array.from(output.slice((5*w+10)*4,(5*w+10)*4+4)),[180,120,60,255]);
 assert.deepEqual(Array.from(output.slice((15*w+10)*4,(15*w+10)*4+4)),[60,120,180,255]);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(x<5||x>15||y<5||y>15){
  const i=(y*w+x)*4;assert.deepEqual(Array.from(output.slice(i,i+4)),Array.from(input.slice(i,i+4)));
 }
 // A white footer touching a dark photo must stay white, not inherit a gray band.
 for(let y=0;y<h;y++)for(let x=0;x<w;x++)pixel(x,y,[255,255,255]);
 for(let x=5;x<=15;x++)pixel(x,4,[20,30,40]);
 for(let x=8;x<=11;x++)for(let y=9;y<=10;y++)pixel(x,y,[80,80,80]);
 const before=new Uint8ClampedArray(input);
 await sandbox.exports.localInpaint({}, {x:.25,y:.25,w:.5,h:.5});
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const i=(y*w+x)*4;
  assert.deepEqual(Array.from(output.slice(i,i+4)),x>=5&&x<=15&&y>=5&&y<=15?[255,255,255,255]:Array.from(before.slice(i,i+4)));
 }
 // The final image row must be repairable too; the old clamp left it untouched.
 for(let y=0;y<h;y++)for(let x=0;x<w;x++)pixel(x,y,[255,255,255]);
 pixel(10,19,[80,80,80]);
 await sandbox.exports.localInpaint({}, {x:.25,y:.75,w:.5,h:.25});
 assert.deepEqual(Array.from(output.slice((19*w+10)*4,(19*w+10)*4+4)),[255,255,255,255]);
 console.log('PASS: independent boundary interpolation; white footer without dark bleed; unselected pixels unchanged.');
})().catch(e=>{console.error(e);process.exitCode=1});
