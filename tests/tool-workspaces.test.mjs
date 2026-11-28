import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import ts from 'typescript';
import {PDFDocument,degrees} from 'pdf-lib';
const require=createRequire(import.meta.url);
test('every public directory entry has a valid processing recipe',()=>{
 const catalog=readFileSync(new URL('../lib/seo/global-seo.ts',import.meta.url),'utf8').split('export const GLOBAL_TOOL_CATALOG=[')[1].split('export type GlobalTool=')[0];
 const slugs=[...catalog.matchAll(/slug:"([a-z0-9-]+)"/g)].map(match=>match[1]);
 const recipes=JSON.parse(readFileSync(new URL('../lib/tools/platform/tool-recipes.json',import.meta.url),'utf8'));
 const capabilities=new Set(JSON.parse(readFileSync(new URL('../lib/tools/platform/capability-genome.json',import.meta.url),'utf8')).map(row=>row.id));
 assert.equal(recipes.length,slugs.length);
 for(const slug of slugs){const row=recipes.find(item=>item.slug===slug);assert.ok(row,slug);assert.ok(row.capabilities.every(id=>capabilities.has(id)),slug)}
});
async function evidence(name,bytes){if(!process.env.TOOL_WORKSPACE_EVIDENCE_DIR)return;await mkdir(process.env.TOOL_WORKSPACE_EVIDENCE_DIR,{recursive:true});await writeFile(join(process.env.TOOL_WORKSPACE_EVIDENCE_DIR,name),bytes)}
function load(file,globals={},dependencies={}){
 const exports={};
 const source=readFileSync(new URL('../'+file,import.meta.url),'utf8');
 const {outputText}=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}});
 runInNewContext(outputText,{exports,Uint8Array,ArrayBuffer,Buffer,Map,process,...globals,require:name=>name==='server-only'?{}:name in dependencies?dependencies[name]:require(name)});
 return exports;
}
test('core directory has sixteen distinct existing entries and retains original icon IDs',()=>{
 const {CORE_TOOL_WORKSPACES,coreToolSurface,coreToolIcon,quotaToolSlug}=load('lib/tools/core-workspaces.ts');
 assert.equal(CORE_TOOL_WORKSPACES.length,16);assert.equal(new Set(CORE_TOOL_WORKSPACES.map(row=>row.slug)).size,16);
 const registry=load('lib/tools/registry.ts').TOOLS;
 const advanced=load('lib/tools/advanced-catalog.ts').ADVANCED_TOOLS;
 const surface=[...registry.filter(row=>row.status==='live').map(row=>({slug:row.slug,href:'/tools/'+row.slug})),...advanced.map(row=>({slug:row.href.slice('/tools/'.length),href:row.href}))];
 assert.equal(coreToolSurface(surface).length,16);assert.equal(coreToolIcon('image-workspace'),'resize-image');
 for(const n of [20,50,100,200,500])assert.equal(quotaToolSlug(`compress-image-to-${n}kb`),'compress-image');
 assert.equal(quotaToolSlug('compress-pdf'),'compress-pdf');
});
test('PDF workspace produces real merged and split PDFs in the chosen order and rotation',async()=>{
 const exports={};new Function('exports','require',ts.transpileModule(readFileSync(new URL('../lib/tools/shared/pdf-workspace.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText)(exports,require);
 const {buildWorkspacePdfs,moveWorkspacePage}=exports;
 const a=await PDFDocument.create();a.addPage([201,301]).drawText('Source A, page 1',{x:20,y:240,size:12});a.addPage([202,302]).drawText('Source A, page 2',{x:20,y:240,size:12});
 const b=await PDFDocument.create();const rotated=b.addPage([401,501]);rotated.drawText('Source B, page 1',{x:20,y:240,size:12});rotated.setRotation(degrees(90));
 const inputs=await Promise.all([a,b].map(async doc=>{const bytes=await doc.save();return{arrayBuffer:async()=>bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength)}}));
 const original=[{id:'a0',file:0,page:0,rotation:0},{id:'a1',file:0,page:1,rotation:0},{id:'b0',file:1,page:0,rotation:90}];
 const chosen=moveWorkspacePage(original,'b0','a0').filter(page=>page.id!=='a1');
 assert.equal(original[0].id,'a0');
 const merged=await buildWorkspacePdfs(inputs,chosen);const output=await PDFDocument.load(merged[0].bytes);
 assert.equal(output.getPageCount(),2);assert.equal(output.getPage(0).getWidth(),401);assert.equal(output.getPage(0).getRotation().angle,180);assert.equal(output.getPage(1).getWidth(),201);
 const split=await buildWorkspacePdfs(inputs,chosen,true);assert.equal(split.length,2);
 for(const item of split)assert.equal((await PDFDocument.load(item.bytes)).getPageCount(),1);
 await evidence('workspace-organized.pdf',merged[0].bytes);for(const item of split)await evidence(item.name,item.bytes);
 await assert.rejects(buildWorkspacePdfs(inputs,[{id:'bad',file:0,page:99,rotation:0}]),/PAGE_INVALID/);
 await assert.rejects(buildWorkspacePdfs(inputs,[]),/PAGE_LIMIT/);
});
test('image workspace really crops pixels, resizes, paints a watermark and places a signature',async()=>{
 const canvasRequire=createRequire(require.resolve('pdfjs-dist/legacy/build/pdf.mjs'));
 const {createCanvas,loadImage}=canvasRequire('@napi-rs/canvas');
 const geometry=load('lib/tools/shared/image-workspace-geometry.ts');
 const exports={};
 const code=ts.transpileModule(readFileSync(new URL('../lib/tools/shared/image-workspace-render.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const bitmap=async blob=>{const image=await loadImage(Buffer.from(await blob.arrayBuffer()));image.close=()=>{};return image};
 const document={createElement:()=>{const canvas=createCanvas(1,1);canvas.toBlob=(done,mime)=>done(new Blob([canvas.toBuffer(mime)],{type:mime}));return canvas}};
 new Function('exports','require','document','createImageBitmap','Blob',code)(exports,()=>geometry,document,bitmap,Blob);
 const canvas=createCanvas(200,100),ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,200,100);ctx.fillStyle='#00f';ctx.fillRect(100,0,100,100);
 const input=new Blob([canvas.toBuffer('image/png')],{type:'image/png'});
 const edits={crop:{x:.5,y:0,w:.5,h:1},scale:.5,mime:'image/png',text:'',textBox:{x:.05,y:.05,w:.3,h:.1},font:.1,color:'#000000',opacity:1,signatureBox:{x:.25,y:.25,w:.25,h:.25}};
 const cropped=await exports.renderWorkspaceImage(input,edits);assert.equal(cropped.width,50);assert.equal(cropped.height,50);
 const cropCanvas=createCanvas(50,50);cropCanvas.getContext('2d').drawImage(await bitmap(cropped.blob),0,0);
 assert.deepEqual(Array.from(cropCanvas.getContext('2d').getImageData(20,20,1,1).data),[0,0,255,255]);
 const stamp=createCanvas(20,10);stamp.getContext('2d').fillStyle='#00ff00';stamp.getContext('2d').fillRect(0,0,20,10);
 const edited=await exports.renderWorkspaceImage(input,{...edits,crop:{x:0,y:0,w:1,h:1},scale:1,text:'TEST',signature:new Blob([stamp.toBuffer('image/png')],{type:'image/png'})});
 const final=createCanvas(200,100),finalContext=final.getContext('2d');finalContext.drawImage(await bitmap(edited.blob),0,0);
 assert.deepEqual(Array.from(finalContext.getImageData(60,30,1,1).data),[0,255,0,255]);
 const textPixels=finalContext.getImageData(0,0,90,25).data;let dark=0;for(let i=0;i<textPixels.length;i+=4)if(textPixels[i]<100&&textPixels[i+1]<100&&textPixels[i+2]<100)dark++;
 assert(dark>10,'The exported file must contain the visible text watermark');
 await evidence('workspace-source.png',Buffer.from(await input.arrayBuffer()));await evidence('workspace-crop.png',Buffer.from(await cropped.blob.arrayBuffer()));await evidence('workspace-edited.png',Buffer.from(await edited.blob.arrayBuffer()));
});
test('image crop geometry keeps ratios, contains the selected area and rejects oversized exports',()=>{
 const {cropToRatio,clampImageBox,workspaceImageSize}=load('lib/tools/shared/image-workspace-geometry.ts');
 const crop=cropToRatio(1600,900,1);assert.equal(crop.w*1600,crop.h*900);
 const box=clampImageBox({x:2,y:-1,w:.3,h:.4});assert.equal(box.x,.7);assert.equal(box.y,0);
 const output=workspaceImageSize(1600,900,crop,.5);assert.equal(output.width,450);assert.equal(output.height,450);
 assert.throws(()=>workspaceImageSize(10000,10000,{x:0,y:0,w:1,h:1},1),/SIZE_LIMIT/);
 assert.throws(()=>workspaceImageSize(10,10,{x:0,y:0,w:1,h:1},NaN),/SIZE_INVALID/);
});

test('device cookies are signed, stable, distinct and cannot be forged by editing the ID',()=>{
 const {newToolDevice,readToolDevice}=load('lib/tools/commerce/tool-device.ts',{process:{env:{LINGXIFIELD_PRIVACY_HASH_SECRET:'fixture-only-secret-32-characters-long'}}});
 const first=newToolDevice(),second=newToolDevice();assert.notEqual(first,second);
 assert.match(readToolDevice(first),/^[a-f0-9]{64}$/);assert.equal(readToolDevice(first),readToolDevice(first));
 assert.notEqual(readToolDevice(first),readToolDevice(second));
 assert.equal(readToolDevice(first.slice(0,-1)+(first.endsWith('0')?'1':'0')),null);
 assert.equal(readToolDevice('v1.not-a-uuid.'+'a'.repeat(64)),null);assert.equal(readToolDevice(undefined),null);
});
test('cookie initialization retries the same request once and compression aliases share a receipt',async()=>{
 const core=load('lib/tools/core-workspaces.ts');const calls=[];
 const {claimToolStart,latestConfirmedToolClaim}=load('lib/tools/commerce/tool-start-client.ts',{
  process:{env:{NEXT_PUBLIC_TOOL_PASS_ENFORCED:'true'}},
  fetch:async(_url,options)=>{calls.push(JSON.parse(options.body));return calls.length===1?{status:409,ok:false,json:async()=>({error:'DEVICE_SESSION_READY'})}:{status:200,ok:true,json:async()=>({ok:true,requestId:'same-request'})}},
 },{'./free-acceptance':{isFreeLocalAcceptanceTool:()=>false,isFreeTranslationAcceptanceTool:()=>false},'../core-workspaces':core});
 const result=await claimToolStart('compress-image-to-50kb',1,'same-request');
 assert.equal(result.ok,true);assert.equal(calls.length,2);assert.deepEqual(calls[0],calls[1]);assert.equal(calls[0].toolSlug,'compress-image');
 assert.equal(latestConfirmedToolClaim('compress-image-to-200kb').requestId,'same-request');
});
