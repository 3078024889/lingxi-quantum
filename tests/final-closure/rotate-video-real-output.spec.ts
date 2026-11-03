import fs from "node:fs/promises";
import {test,expect} from "./export-test";
const fixture="tests/fixtures/media/fixed-watermark-vp8.webm";

async function probe(page:any, bytes:Buffer,mime:string){
 return page.evaluate(async ({data,mime})=>{
  const raw=Uint8Array.from(atob(data),c=>c.charCodeAt(0));
  const url=URL.createObjectURL(new Blob([raw],{type:mime}));
  try{
   const video=document.createElement("video");
   video.preload="metadata";video.src=url;
   await new Promise<void>((resolve,reject)=>{
    video.onloadedmetadata=()=>resolve();
    video.onerror=()=>reject(Error("VIDEO_DECODE_FAILURE"));
    setTimeout(()=>reject(Error("VIDEO_META_TIMEOUT")),20000);
   });
   return {w:video.videoWidth,h:video.videoHeight,duration:video.duration};
  }finally{URL.revokeObjectURL(url)}
 },{data:bytes.toString("base64"),mime});
}

test("rotate-video really rotates frames by 90 degrees and exports decodable MP4",async({page})=>{
 test.setTimeout(180000);
 const original=await fs.readFile(fixture);
 await page.goto("/tools/rotate-video?lang=en");
 const root=page.locator("[data-video-toolkit]");
 await expect(root).toHaveAttribute("data-hydrated","true",{timeout:12000});
 const input=root.locator('input[type="file"]').first();
 await input.setInputFiles({name:"rotate-fixture.webm",mimeType:"video/webm",buffer:original});
 await root.locator("select").first().selectOption("90");
 const originalMeta=await probe(page,original,"video/webm");
 expect(originalMeta.w).toBeGreaterThan(0);expect(originalMeta.h).toBeGreaterThan(0);
 await root.getByRole("button",{name:"Start processing",exact:true}).click();
 const result=page.getByTestId("result-file-actions").first();
 await expect(result).toBeVisible({timeout:160000});
 const waiting=page.waitForEvent("download",{timeout:30000});
 await result.getByRole("button",{name:/download|save file/i}).first().click();
 const downloaded=await waiting,bytes=await fs.readFile((await downloaded.path())!);
 expect(downloaded.suggestedFilename()).toBe("rotate-fixture-rotate-90.mp4");
 expect(bytes.indexOf(Buffer.from("ftyp"))).toBeGreaterThanOrEqual(0);
 expect(bytes.length).toBeGreaterThan(1000);
 const outputMeta=await probe(page,bytes,"video/mp4");
 expect(outputMeta.w).toBe(originalMeta.h);
 expect(outputMeta.h).toBe(originalMeta.w);
 expect(outputMeta.duration).toBeGreaterThan(0);
 await expect(root.getByRole("alert")).toHaveCount(0);
});
