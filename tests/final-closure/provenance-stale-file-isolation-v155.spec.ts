import {test,expect} from "./export-test";
import sharp from "sharp";
import type {Page} from "playwright";

/**
 * A file replaced while the previous format scan is suspended must never
 * receive the old scan's C2PA result or optional AI analysis controls.
 * Test the real browser workbench, not a mocked provenance verdict.
 */
function wav(){
 const rate=16000,n=8000,b=Buffer.alloc(44+n*2);
 b.write("RIFF",0);b.writeUInt32LE(b.length-8,4);
 b.write("WAVEfmt ",8);b.writeUInt32LE(16,16);
 b.writeUInt16LE(1,20);b.writeUInt16LE(1,22);
 b.writeUInt32LE(rate,24);b.writeUInt32LE(rate*2,28);
 b.writeUInt16LE(2,32);b.writeUInt16LE(16,34);
 b.write("data",36);b.writeUInt32LE(n*2,40);
 return b;
}
async function slowOldFile(page:Page){
 await page.addInitScript(()=>{
  const original=File.prototype.slice;
  File.prototype.slice=function(this:File,start?:number,end?:number,contentType?:string){
   const blob=original.call(this,start,end,contentType);
   if(!this.name.startsWith("old-"))return blob;
   const raw=blob.arrayBuffer.bind(blob);
   Object.defineProperty(blob,"arrayBuffer",{
    configurable:true,
    value:()=>new Promise<ArrayBuffer>((resolve,reject)=>{
     setTimeout(()=>{void raw().then(resolve,reject)},1500);
    })
   });
   return blob;
  };
 });
}
for(const data of [
 {slug:"ai-image-check",extension:"png",mime:"image/png",format:"PNG"},
 {slug:"ai-video-audio-check",extension:"wav",mime:"audio/wav",format:"WAV"}
] as const){
 test(`${data.slug}: replacing an in-flight scan cannot pair an old provenance result with a new file`,async({page})=>{
  test.setTimeout(95000);
  await slowOldFile(page);
  const bytes=data.extension==="png"
   ?await sharp({create:{width:24,height:24,channels:3,background:"#c0ffee"}}).png().toBuffer()
   :wav();
  await page.goto("/tools/"+data.slug+"?lang=en");
  const input=page.locator('main input[type="file"]').first();
  const oldName="old-source."+data.extension;
  const newName="new-source."+data.extension;
  await input.setInputFiles({name:oldName,mimeType:data.mime,buffer:bytes});
  await page.getByRole("button",{name:"Start checking",exact:true}).click();
  // The source can be removed while a slow file read is in flight.
  await page.locator("main li").filter({hasText:oldName}).getByRole("button").first().click();
  await input.setInputFiles({name:newName,mimeType:data.mime,buffer:bytes});
  await page.getByRole("button",{name:"Start checking",exact:true}).click();
  const results=page.locator("main > section > ul > li");
  await expect(results).toHaveCount(1,{timeout:20000});
  await expect(results.first()).toContainText(newName);
  await expect(results.first()).toContainText("Detected format: "+data.format);
  await page.waitForTimeout(1900);
  await expect(results).toHaveCount(1);
  await expect(results.first()).toContainText(newName);
  await expect(results.first()).not.toContainText(oldName);
  await expect(results.first().locator("[data-c2pa-verification]")).toHaveCount(1);
 });
}
