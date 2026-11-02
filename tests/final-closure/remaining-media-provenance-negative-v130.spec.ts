import {test,expect} from "./export-test";
import sharp from "sharp";

// Unsigned-media negative-path tests only. Signed C2PA samples are required
// before claiming full provenance verification or authenticity detection.
function wav(seconds=0.5){
 const rate=16000,samples=Math.round(rate*seconds),buf=Buffer.alloc(44+samples*2);
 buf.write("RIFF",0);buf.writeUInt32LE(buf.length-8,4);buf.write("WAVEfmt ",8);
 buf.writeUInt32LE(16,16);buf.writeUInt16LE(1,20);buf.writeUInt16LE(1,22);
 buf.writeUInt32LE(rate,24);buf.writeUInt32LE(rate*2,28);
 buf.writeUInt16LE(2,32);buf.writeUInt16LE(16,34);
 buf.write("data",36);buf.writeUInt32LE(samples*2,40);
 for(let i=0;i<samples;i++)buf.writeInt16LE(Math.round(Math.sin(i/rate*Math.PI*440*2)*12000),44+i*2);
 return buf;
}
for(const item of [
 {slug:"ai-image-check",file:"photo-spoofed-jpeg.jpg",mimeType:"image/jpeg",expected:"PNG",kind:"image"},
 {slug:"ai-video-audio-check",file:"speech.wav",mimeType:"audio/wav",expected:"WAV",kind:"audio"}
] as const){
 test(item.slug+": real unsigned media detects format and reports uncertain provenance without false signature claims",async({page})=>{
  test.setTimeout(130000);
  const bytes=item.kind==="image"
   ?await sharp({create:{width:48,height:36,channels:3,background:"#2096c4"}}).png().toBuffer()
   :wav();
  await page.goto("/tools/"+item.slug+"?lang=en");
  const upload=page.locator('main input[type="file"]').first();
  await upload.setInputFiles({name:item.file,mimeType:item.mimeType,buffer:bytes});
  await page.getByRole("button",{name:"Start checking",exact:true}).click();
  const fileResult=page.locator("main section li").filter({hasText:item.file}).first();
  await expect(fileResult).toBeVisible({timeout:20000});
  await expect(fileResult).toContainText("Detected format: "+item.expected);
  const status=fileResult.locator("[data-c2pa-verification]");
  await expect(status).toBeVisible({timeout:30000});
  await expect.poll(async()=>await status.getAttribute("data-c2pa-verification"),{timeout:100000}).toMatch(/^(absent|unavailable)$/);
  await expect(fileResult).not.toContainText("Signature verified; signer trusted");
  await expect(fileResult).not.toContainText("Signature verified; review the origin");
  await expect(page).toHaveURL(new RegExp("/tools/"+item.slug));
 });
}