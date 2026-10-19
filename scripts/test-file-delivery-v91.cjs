const fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript'),assert=require('node:assert/strict');
(async()=>{
 const events=[],timers=[],navigator={userAgent:'MicroMessenger'},exports={};let shares=0,uploads=0,deny=false,accessChecks=0;
 const anchor={click(){events.push({name:this.download,attached:this.attached})},remove(){this.attached=false}};
 const document={createElement:()=>anchor,body:{appendChild(a){a.attached=true}}};
 class DeliveryURL extends URL{static createObjectURL(){return 'blob:local-only'}static revokeObjectURL(u){events.push({revoked:u})}}const url=DeliveryURL;
 vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/tools/shared/download.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports,ClipboardItem:class{constructor(data){this.data=data}},require:()=>({ensureToolExportAccess:async()=>{accessChecks++;if(deny)throw Error('EXPORT_CANCELLED')}}),navigator,document,location:{pathname:'/tools/qr-code',href:'https://example.test/tools/qr-code'},window:{location:{search:'?mini=1'}},URL:url,URLSearchParams,File,Blob,setTimeout:(fn,ms)=>timers.push({fn,ms}),fetch:async()=>{uploads++;throw Error('NO_IMPLICIT_UPLOAD')}});
 const blob=new Blob(['real bytes']);
 for(const [ext,mime]of Object.entries({mp3:'audio/mpeg',pdf:'application/pdf',png:'image/png',mp4:'video/mp4',zip:'application/zip',docx:'application/vnd.openxmlformats-officedocument.wordprocessingml.document'})){
  const file=exports.deliveryFile(blob,'source.'+ext);assert.equal(file.type,mime);assert.equal(await file.text(),'real bytes');
 }
 assert(exports.safeFilename('x'.repeat(250)+'.mp3').endsWith('.mp3'));assert(exports.safeFilename('a/b\n.mp3').includes('_'));assert.equal(exports.safeFilename('source.mp3'),'source.mp3');
 navigator.canShare=()=>true;navigator.share=async p=>{shares++;assert.equal(p.files[0].type,'audio/mpeg');assert.equal(p.files[0].name,'source.mp3')};
 assert.equal(await exports.downloadBlob(blob,'source.mp3'),'download');assert.equal(shares,0);assert.equal(uploads,0);assert.deepEqual(events[0],{name:'source.mp3',attached:true});assert(timers[0].ms>=60000);
 assert.equal(await exports.shareFile(blob,'source.mp3'),'shared');
 const sentBeforeExpired=shares;navigator.userActivation={isActive:false};assert.equal(await exports.shareFile(blob,'source.mp3'),'ready');assert.equal(shares,sentBeforeExpired,'Expired activation must not call the OS share API');navigator.userActivation.isActive=true;assert.equal(await exports.shareFile(blob,'source.mp3'),'shared');delete navigator.userActivation;
 navigator.share=async()=>{throw {name:'AbortError'}};assert.equal(await exports.shareFile(blob,'source.mp3'),'cancelled');
 navigator.share=async()=>{throw {name:'DataError'}};assert.equal(await exports.shareFile(blob,'source.mp3'),'failed');
 const beforeUnsupported=accessChecks;navigator.canShare=()=>false;assert.equal(await exports.shareFile(blob,'source.mp3'),'unsupported');assert.equal(accessChecks,beforeUnsupported);
 delete navigator.canShare;assert.equal(await exports.shareFile(blob,'source.mp3'),'unsupported');
 let copied=0;const beforeCopy=accessChecks;assert.equal(await exports.copyPngForChat(blob,'source.png'),'unsupported');assert.equal(accessChecks,beforeCopy);
 navigator.clipboard={write:async items=>{copied++;assert.equal(items[0].data['image/png'].type,'image/png');assert.equal(await items[0].data['image/png'].text(),'real bytes')}};
 assert.equal(await exports.copyPngForChat(blob,'source.pdf'),'unsupported');assert.equal(accessChecks,beforeCopy);
 assert.equal(await exports.copyPngForChat(blob,'source.png'),'copied');assert.equal(copied,1);
 navigator.userActivation={isActive:false};assert.equal(await exports.copyPngForChat(blob,'source.png'),'ready');assert.equal(copied,1);navigator.userActivation.isActive=true;assert.equal(await exports.copyPngForChat(blob,'source.png'),'copied');assert.equal(copied,2);delete navigator.userActivation;
 deny=true;assert.equal(await exports.copyPngForChat(blob,'source.png'),'failed');assert.equal(copied,2);deny=false;
 navigator.clipboard.write=async()=>{throw Error('PERMISSION_DENIED')};assert.equal(await exports.copyPngForChat(blob,'source.png'),'failed');
 assert.equal(uploads,0);deny=true;const before=events.length;await assert.rejects(exports.downloadUrl('https://cdn.example.test/result.png','result.png'),/EXPORT_CANCELLED/);assert.equal(events.length,before,'A refused export must never fall through to a direct anchor');deny=false;console.log('FILE_DELIVERY_CONTRACT=PASS: MIME, bytes, extension, no implicit share/upload, cancellation, rejection, capability, URL lifetime');
})().catch(e=>{console.error(e);process.exitCode=1});
