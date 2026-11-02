import {test,expect} from "./export-test";
import {mkdtemp,readFile,writeFile,rm} from "node:fs/promises";
import {tmpdir} from "node:os";
import path from "node:path";
import {execFileSync} from "node:child_process";

// Genuine video to subtitles: 4 s MP4 video stream + an audible offline
// TTS WAV is muxed into a real MP4. The site extracts audio using browser
// decoders / its FFmpeg WASM fallback and recognizes speech with ONNX Whisper.
// Only the quote/payment status are isolated; audio, ASR and downloads are real.
test("real MP4 speech -> browser audio extraction -> Whisper Tiny -> downloadable timed TXT/SRT/VTT",async({page})=>{
 test.setTimeout(300000);
 const dir=await mkdtemp(path.join(tmpdir(),"lingxifield-v150-real-video-"));
 try{
  const wav=path.join(dir,"speech.wav"),video=path.join(dir,"silent.mp4"),voiced=path.join(dir,"spoken.mp4");
  execFileSync("espeak-ng",["-v","en-us","-s","145","-w",wav,"The blue planet Earth has mountains and rivers."],{timeout:15000});
  await writeFile(video,Buffer.from((await readFile("tests/fixtures/sasi-video-4s.mp4.base64","utf8")).trim(),"base64"));
  // The fixture is a finite 4-second video. Do not loop it indefinitely: stream-copy muxing\n  // combined with -shortest can hang in FFmpeg while reading endless video packets.\n  // A finite video input and -shortest end when either audio or video finishes.\n  execFileSync("ffmpeg",["-hide_banner","-loglevel","error","-y","-i",video,"-i",wav,"-map","0:v:0","-map","1:a:0","-c:v","copy","-c:a","aac","-b:a","96k","-shortest","-movflags","+faststart",voiced],{timeout:30000});
  const asset=await readFile(voiced);
  expect(asset.length).toBeGreaterThan(5000);
  expect(asset.includes(Buffer.from("vide"))).toBe(true);
  expect(asset.includes(Buffer.from("soun"))).toBe(true);
  let quote:any=null;
  await page.route("**/api/tools/quote",route=>{
   const body=route.request().postDataJSON();
   expect(body.toolId).toBe("video-transcription");
   quote={id:"isolated-real-video-asr",tool_id:"video-transcription",quantity:body.quantity,unit_name:"minute",amount_rmb:1,amount_usd:1,display_amount:1,display_currency:body.currency,currency:body.currency,metadata:body.metadata,expires_at:new Date(Date.now()+3600000).toISOString()};
   return route.fulfill({json:quote});
  });
  await page.route("**/api/tools/pay/status**",r=>r.fulfill({json:{paid:true,quote:{tool_id:"video-transcription",quantity:quote?.quantity,metadata:quote?.metadata}}}));
  const diagnostics:string[]=[];
  page.on("pageerror",e=>diagnostics.push("PAGE:"+e.message.slice(0,220)));
  page.on("console",m=>{if(m.type()==="error")diagnostics.push("CONSOLE:"+m.text().slice(0,220))});
  page.on("response",r=>{if(r.status()>=400&&/models|onnx|wasm/i.test(r.url()))diagnostics.push("HTTP:"+r.status()+":"+r.url().slice(0,160))});
  await page.goto("/tools/video-transcription?lang=en");
  await page.locator('input[type="file"]').first().setInputFiles({name:"spoken-real.mp4",mimeType:"video/mp4",buffer:asset});
  const start=page.getByRole("button",{name:/price|查看价格/i}).first();
  await expect(start).toBeEnabled({timeout:30000});
  await start.click();
  await expect(page.getByRole("button",{name:"Confirm & pay",exact:true})).toBeVisible({timeout:15000});
  await page.evaluate(()=>window.dispatchEvent(new Event("pageshow")));
  const transcript=page.locator('textarea[readonly]').first();
  const started=Date.now();
  while(Date.now()-started<200000&&!await transcript.isVisible()){
   const retry=page.getByRole("button",{name:"Resume paid task",exact:true});
   if(await retry.isVisible()&&await retry.isEnabled())break;
   await page.waitForTimeout(1000);
  }
  if(!await transcript.isVisible())throw Error("REAL_VIDEO_WHISPER_FAILED:"+JSON.stringify({alert:await page.locator('[role="alert"]').allTextContents(),diagnostics}));
  const txt=await transcript.inputValue();
  expect(txt.toLowerCase()).toMatch(/earth|planet|mountain|river/);
  const controls=page.getByTestId("result-file-actions");
  await expect(controls).toHaveCount(3,{timeout:15000});
  for(const [n,ext] of [[0,"txt"],[1,"srt"],[2,"vtt"]] as const){
   const download=page.waitForEvent("download");
   await controls.nth(n).getByRole("button",{name:"Save file",exact:true}).click();
   const item=await download;
   expect(item.suggestedFilename()).toBe("lingxifield-transcript."+ext);
   expect(await item.failure()).toBeNull();
   const data=(await readFile((await item.path())!)).toString("utf8");
   expect(data.toLowerCase()).toMatch(/earth|planet|mountain|river/);
   if(ext==="srt")expect(data).toMatch(/\d\d:\d\d:\d\d,\d{3} --> \d\d:\d\d:\d\d,\d{3}/);
   if(ext==="vtt"){expect(data).toMatch(/^WEBVTT\n\n/);expect(data).toMatch(/\d\d:\d\d:\d\d\.\d{3} --> \d\d:\d\d:\d\d\.\d{3}/)}
  }
 }finally{await rm(dir,{recursive:true,force:true})}
});
