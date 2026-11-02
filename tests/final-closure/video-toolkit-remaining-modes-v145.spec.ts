import {test,expect} from "./export-test";
import {execFileSync} from "node:child_process";
import {mkdtemp,readFile,writeFile,rm} from "node:fs/promises";
import path from "node:path";
import {tmpdir} from "node:os";
import type {Page} from "playwright";

// The 4s H264 test source has no audio. Add a real AAC audio track using a
// deterministic offline sine source, then independently inspect the outputs.
async function mediaFixture(){
 const dir=await mkdtemp(path.join(tmpdir(),"lingxifield-v145-"));
 const source=Buffer.from((await readFile("tests/fixtures/sasi-video-4s.mp4.base64","utf8")).trim(),"base64");
 const video=path.join(dir,"input.mp4"),combined=path.join(dir,"with-audio.mp4"),mov=path.join(dir,"with-audio.mov");
 await writeFile(video,source);
 execFileSync("ffmpeg",["-hide_banner","-loglevel","error","-y","-i",video,"-f","lavfi","-i","sine=frequency=440:sample_rate=16000:duration=4","-map","0:v:0","-map","1:a:0","-c:v","copy","-c:a","aac","-shortest",combined],{timeout:20000});
 execFileSync("ffmpeg",["-hide_banner","-loglevel","error","-y","-i",combined,"-c","copy",mov],{timeout:20000});
 const mixed=await readFile(combined);
 expect(mixed.includes(Buffer.from("soun"))).toBe(true);
 expect(mixed.includes(Buffer.from("vide"))).toBe(true);
 return {dir,mixed,mov:await readFile(mov)};
}
function streams(file:string){
 const raw=execFileSync("ffprobe",["-v","error","-show_entries","stream=codec_type","-of","csv=p=0",file],{encoding:"utf8",timeout:15000});
 return raw.trim().split(/\s+/).sort();
}
async function runMode(page:Page,mode:string,name:string,bytes:Buffer){
 await page.goto("/tools/video-toolkit?lang=en");
 const area=page.locator("[data-video-toolkit]");
 await expect(area).toHaveAttribute("data-hydrated","true");
 await area.locator('input[type="file"]').first().setInputFiles({name,mimeType:mode==="Convert MP4"?"video/quicktime":"video/mp4",buffer:bytes});
 if(mode!=="Compress")await area.getByRole("button",{name:mode==="Convert MP4"?"Convert to MP4":mode,exact:true}).click();
 await area.getByRole("button",{name:"Start processing",exact:true}).click();
 const actions=area.getByTestId("result-file-actions").first();
 await expect(actions).toBeVisible({timeout:150000});
 const pending=page.waitForEvent("download");
 await actions.getByRole("button",{name:"Save file",exact:true}).click();
 const download=await pending;
 expect(await download.failure()).toBeNull();
 return {name:download.suggestedFilename(),path:(await download.path())!,bytes:await readFile((await download.path())!)};
}
test("Video Toolkit compresses real AAC+H264 video or truthfully returns byte-identical original if savings are impossible",async({page})=>{
 test.setTimeout(210000);
 const fx=await mediaFixture();
 try{
  const result=await runMode(page,"Compress","source-with-audio.mp4",fx.mixed);
  if(result.name==="source-with-audio.mp4"){
   expect(result.bytes).toEqual(fx.mixed);
   await expect(page.getByText(/original file is provided instead/i)).toBeVisible();
  }else{
   expect(result.name).toBe("source-with-audio-compressed.mp4");
   expect(result.bytes.length).toBeLessThan(fx.mixed.length);
   expect(result.bytes.toString("latin1",4,8)).toBe("ftyp");
   expect(streams(result.path)).toContain("video");
  }
 }finally{await rm(fx.dir,{recursive:true,force:true})}
});
test("Video Toolkit Mute removes an actual AAC audio track but leaves decodable H264 video",async({page})=>{
 test.setTimeout(210000);
 const fx=await mediaFixture();
 try{
  const result=await runMode(page,"Mute","source-with-audio.mp4",fx.mixed);
  expect(result.name).toBe("source-with-audio-muted.mp4");
  expect(result.bytes.toString("latin1",4,8)).toBe("ftyp");
  const types=streams(result.path);
  expect(types).toContain("video");
  expect(types).not.toContain("audio");
  expect(result.bytes.includes(Buffer.from("soun"))).toBe(false);
 }finally{await rm(fx.dir,{recursive:true,force:true})}
});
test("Video Toolkit Convert MP4 truly transcodes a MOV with audio into a readable video+audio MP4",async({page})=>{
 test.setTimeout(210000);
 const fx=await mediaFixture();
 try{
  const result=await runMode(page,"Convert MP4","source-with-audio.mov",fx.mov);
  expect(result.name).toBe("source-with-audio.mp4");
  expect(result.bytes.toString("latin1",4,8)).toBe("ftyp");
  expect(streams(result.path)).toEqual(["audio","video"]);
  expect(result.bytes.length).toBeGreaterThan(1500);
 }finally{await rm(fx.dir,{recursive:true,force:true})}
});
