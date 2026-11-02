import {test,expect} from "./export-test";
import type {Page} from "playwright";
import fs from "node:fs/promises";

async function videoFixture(){
 const b64=(await fs.readFile("tests/fixtures/sasi-video-4s.mp4.base64","utf8")).trim();
 const b=Buffer.from(b64,"base64");
 expect(b.toString("latin1",4,8)).toBe("ftyp");
 return b;
}
async function decodeVideo(page:Page,bytes:Buffer){
 return page.evaluate(async(encoded)=>{
  const raw=atob(encoded),array=new Uint8Array(raw.length);
  for(let i=0;i<raw.length;i++)array[i]=raw.charCodeAt(i);
  const uri=URL.createObjectURL(new Blob([array],{type:"video/mp4"}));
  try{
   const video=document.createElement("video");video.preload="metadata";video.muted=true;
   const metadata=await new Promise<{duration:number;width:number;height:number}>((resolve,reject)=>{
    const timer=setTimeout(()=>reject(new Error("VIDEO_METADATA_TIMEOUT")),15000);
    video.onloadedmetadata=()=>{clearTimeout(timer);resolve({duration:video.duration,width:video.videoWidth,height:video.videoHeight})};
    video.onerror=()=>{clearTimeout(timer);reject(new Error("BAD_MP4_OUTPUT"))};
    video.src=uri;
   });video.removeAttribute("src");video.load();
   return metadata;
  }finally{URL.revokeObjectURL(uri)}
 },bytes.toString("base64"));
}
async function output(page:Page){
 const file=page.getByTestId("result-file-actions").first();
 await expect(file).toBeVisible({timeout:145000});
 const pending=page.waitForEvent("download");
 await file.getByRole("button",{name:"Save file",exact:true}).click();
 const dl=await pending;expect(await dl.failure()).toBeNull();
 const b=await fs.readFile((await dl.path())!);
 expect(b.toString("latin1",4,8)).toBe("ftyp");
 expect(b.byteLength).toBeGreaterThan(1024);
 return {name:dl.suggestedFilename(),...await decodeVideo(page,b)};
}
for(const spec of [
 {slug:"loop-video",name:"Loop count",changed:"3",expected:2},
 {slug:"reverse-video",name:"Reverse speed",changed:"1.4",expected:1},
 {slug:"stop-motion-video",name:"Playback rate",changed:"20",expected:1}
] as const){
 test(spec.slug+": a real FFmpeg WASM job downloads a decodable MP4 and changing settings revokes old export",async({page})=>{
  test.setTimeout(210000);
  await page.goto("/tools/"+spec.slug+"?lang=en");
  const area=page.locator("main");
  await area.locator('input[type="file"]').first().setInputFiles({name:"sample.mp4",mimeType:"video/mp4",buffer:await videoFixture()});
  if(spec.slug==="loop-video")await area.getByRole("spinbutton",{name:"Loop count"}).fill("2");
  if(spec.slug==="reverse-video")await area.getByRole("checkbox",{name:"Mute output"}).check();
  if(spec.slug==="stop-motion-video")await area.getByRole("checkbox",{name:/Add a reverse pass/}).check();
  await area.getByRole("button",{name:"Start",exact:true}).click();
  const v=await output(page);
  expect(v.name).toMatch(/-(loop|reverse|stop-motion)\.mp4$/);
  expect(v.width).toBeGreaterThan(0);expect(v.height).toBeGreaterThan(0);
  expect(v.duration).toBeGreaterThan(0.3);
  expect(v.duration).toBeLessThan(25);
  if(spec.slug==="loop-video")expect(v.duration).toBeGreaterThan(6);
  if(spec.slug==="reverse-video")expect(v.duration).toBeLessThan(6);
  if(spec.slug==="stop-motion-video")expect(v.duration).toBeGreaterThan(4);
  if(spec.slug==="loop-video")await area.getByRole("spinbutton",{name:"Loop count"}).fill("3");
  if(spec.slug==="reverse-video")await area.getByRole("slider",{name:"Reverse speed"}).press("ArrowRight");
  if(spec.slug==="stop-motion-video")await area.getByRole("combobox",{name:"Playback rate"}).selectOption("20");
  await expect(area.getByTestId("result-file-actions")).toHaveCount(0);
 });
}
test("video effects: a corrupt MP4 cannot create a fake file or preserve an old success",async({page})=>{
 test.setTimeout(160000);
 await page.goto("/tools/loop-video?lang=en");
 const area=page.locator("main");
 await area.locator('input[type="file"]').first().setInputFiles({name:"corrupt.mp4",mimeType:"video/mp4",buffer:Buffer.from("Not an ISO BMFF movie")});
 await area.getByRole("button",{name:"Start",exact:true}).click();
 await expect(area.getByRole("button",{name:"Start",exact:true})).toBeVisible({timeout:135000});
 await expect(area.getByTestId("result-file-actions")).toHaveCount(0);
 await expect(area).toContainText("This video could not be processed");
});
