import {test,expect} from "./export-test";
import fs from "node:fs/promises";

const fixture="tests/fixtures/sasi-video-4s.mp4.base64";
async function syntheticMp4(){return Buffer.from((await fs.readFile(fixture,"utf8")).trim(),"base64");}

async function decodedDuration(page:import("playwright").Page,bytes:Buffer){
 return page.evaluate(async(encoded)=>{
  const source=atob(encoded),bytes=new Uint8Array(source.length);
  for(let i=0;i<source.length;i++)bytes[i]=source.charCodeAt(i);
  const url=URL.createObjectURL(new Blob([bytes],{type:"video/mp4"}));
  try{
   const video=document.createElement("video");video.preload="metadata";video.muted=true;
   const result=await new Promise<{duration:number,width:number,height:number}>((resolve,reject)=>{
    const timer=setTimeout(()=>reject(new Error("VIDEO_METADATA_TIMEOUT")),15000);
    video.onloadedmetadata=()=>{clearTimeout(timer);resolve({duration:video.duration,width:video.videoWidth,height:video.videoHeight})};
    video.onerror=()=>{clearTimeout(timer);reject(new Error("NOT_A_DECODABLE_VIDEO"))};
    video.src=url;
   });video.src="";return result;
  }finally{URL.revokeObjectURL(url)}
 },bytes.toString("base64"));
}

test("video-toolkit: actual four-second H264 input trims to a one-second decodable MP4",async({page})=>{
 test.setTimeout(180000);
 const source=await syntheticMp4();
 await page.goto("/tools/video-toolkit?lang=en");
 const area=page.locator("[data-video-toolkit]");
 await expect(area).toHaveAttribute("data-hydrated","true");
 await area.locator('input[type="file"]').first().setInputFiles({name:"four-seconds.mp4",mimeType:"video/mp4",buffer:source});
 await area.getByRole("button",{name:"Trim",exact:true}).click();
 await area.getByRole("spinbutton",{name:"Start second"}).fill("1");
 await area.getByRole("spinbutton",{name:"Duration"}).fill("1");
 await area.getByRole("button",{name:"Start processing",exact:true}).click();
 const result=area.getByTestId("result-file-actions");
 await expect(result).toHaveCount(1,{timeout:140000});
 const pending=page.waitForEvent("download");
 await result.getByRole("button",{name:"Save file",exact:true}).click();
 const dl=await pending;expect(await dl.failure()).toBeNull();
 expect(dl.suggestedFilename()).toMatch(/-trimmed\.mp4$/);
 const bytes=await fs.readFile((await dl.path())!);
 expect(bytes.toString("latin1",4,8)).toBe("ftyp");
 const metadata=await decodedDuration(page,bytes);
 expect(metadata.duration).toBeGreaterThan(0.45);
 expect(metadata.duration).toBeLessThan(2.2);
 expect(metadata.width).toBeGreaterThan(0);
 expect(metadata.height).toBeGreaterThan(0);
 await area.getByRole("spinbutton",{name:"Duration"}).fill("2");
 await expect(result).toHaveCount(0);
});

test("video-toolkit: invalid MP4 must fail closed without fake downloadable output",async({page})=>{
 test.setTimeout(120000);
 await page.goto("/tools/video-toolkit?lang=en");
 const area=page.locator("[data-video-toolkit]");
 await expect(area).toHaveAttribute("data-hydrated","true");
 await area.locator('input[type="file"]').first().setInputFiles({name:"broken.mp4",mimeType:"video/mp4",buffer:Buffer.from("not a video file; no ftyp or mdat")});
 await area.getByRole("button",{name:"Start processing",exact:true}).click();
 await expect(area.getByRole("button",{name:"Start processing",exact:true})).toBeEnabled({timeout:100000});
 await expect(area.getByTestId("result-file-actions")).toHaveCount(0);
 await expect(area).toContainText("file",{timeout:5000});
});
