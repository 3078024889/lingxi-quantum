import {test,expect} from "./export-test";
import fs from "node:fs/promises";
import type {Page} from "playwright";

function toneWav(){
 const rate=16000,seconds=1.5,total=Math.round(rate*seconds),wav=Buffer.alloc(44+total*2);
 wav.write("RIFF",0);wav.writeUInt32LE(wav.byteLength-8,4);wav.write("WAVEfmt ",8);
 wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(1,22);
 wav.writeUInt32LE(rate,24);wav.writeUInt32LE(rate*2,28);wav.writeUInt16LE(2,32);wav.writeUInt16LE(16,34);
 wav.write("data",36);wav.writeUInt32LE(total*2,40);
 for(let i=0;i<total;i++)wav.writeInt16LE(Math.round(7800*Math.sin(2*Math.PI*440*i/rate)),44+i*2);
 return wav;
}
async function output(page:Page){
 const actions=page.locator("[data-video-toolkit]").getByTestId("result-file-actions").first();
 await expect(actions).toBeVisible({timeout:150000});
 const pending=page.waitForEvent("download");
 await actions.getByRole("button",{name:"Save file",exact:true}).click();
 const dl=await pending;expect(await dl.failure()).toBeNull();
 return {name:dl.suggestedFilename(),bytes:await fs.readFile((await dl.path())!)};
}
test("video-toolkit: an actual synthesized WAV becomes a decodable MP3 file through browser FFmpeg",async({page})=>{
 test.setTimeout(210000);
 await page.goto("/tools/video-toolkit?lang=en");
 const work=page.locator("[data-video-toolkit]");
 await expect(work).toHaveAttribute("data-hydrated","true");
 await work.locator('input[type="file"]').first().setInputFiles({name:"private-tone.wav",mimeType:"audio/wav",buffer:toneWav()});
 await work.getByRole("button",{name:"Extract MP3",exact:true}).click();
 await work.getByRole("button",{name:"Start processing",exact:true}).click();
 const saved=await output(page);
 expect(saved.name).toBe("private-tone.mp3");
 expect(saved.bytes.byteLength).toBeGreaterThan(1800);
 const duration=await page.evaluate(async(encoded)=>{
  const raw=atob(encoded),bytes=Uint8Array.from(raw,c=>c.charCodeAt(0)),ctx=new AudioContext();
  try{return (await ctx.decodeAudioData(bytes.buffer)).duration}finally{await ctx.close()}
 },saved.bytes.toString("base64"));
 expect(duration).toBeGreaterThan(1.2);expect(duration).toBeLessThan(1.9);
});
test("video-toolkit: a four-second MP4 becomes playable two-times-speed video and stale output disappears on speed change",async({page})=>{
 test.setTimeout(210000);
 const bytes=Buffer.from((await fs.readFile("tests/fixtures/sasi-video-4s.mp4.base64","utf8")).trim(),"base64");
 await page.goto("/tools/video-toolkit?lang=en");
 const work=page.locator("[data-video-toolkit]");
 await expect(work).toHaveAttribute("data-hydrated","true");
 await work.locator('input[type="file"]').first().setInputFiles({name:"four-seconds.mp4",mimeType:"video/mp4",buffer:bytes});
 await work.getByRole("button",{name:"Speed",exact:true}).click();
 const slider=work.getByRole("slider",{name:/Playback speed/});
 await slider.focus();await slider.press("End");
 await work.getByRole("button",{name:"Start processing",exact:true}).click();
 const saved=await output(page);
 expect(saved.name).toMatch(/-2x\.mp4$/);
 expect(saved.bytes.toString("latin1",4,8)).toBe("ftyp");
 const metadata=await page.evaluate(async(encoded)=>{
  const array=Uint8Array.from(atob(encoded),x=>x.charCodeAt(0));
  const url=URL.createObjectURL(new Blob([array],{type:"video/mp4"}));
  try{
   const video=document.createElement("video");video.muted=true;video.preload="metadata";
   return await new Promise<{duration:number;width:number;height:number}>((resolve,reject)=>{
    const timer=setTimeout(()=>reject(Error("MP4_METADATA_TIMEOUT")),15000);
    video.onloadedmetadata=()=>{clearTimeout(timer);resolve({duration:video.duration,width:video.videoWidth,height:video.videoHeight})};
    video.onerror=()=>{clearTimeout(timer);reject(Error("MP4_INVALID"))};video.src=url;
   });
  }finally{URL.revokeObjectURL(url)}
 },saved.bytes.toString("base64"));
 expect(metadata.width).toBeGreaterThan(0);
 expect(metadata.height).toBeGreaterThan(0);
 expect(metadata.duration).toBeGreaterThan(1.5);
 expect(metadata.duration).toBeLessThan(3);
 await slider.press("ArrowLeft");
 await expect(work.getByTestId("result-file-actions")).toHaveCount(0);
});
