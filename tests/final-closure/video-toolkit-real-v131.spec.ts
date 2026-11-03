import {test,expect} from "./export-test";
import fs from "node:fs/promises";

// Reuse the repository's checked-in, synthetic, four-second H.264 MP4 fixture.
// Browser FFmpeg must actually create a new decodable MP4; UI visibility alone fails this test.
test("rotate-video: synthetic MP4 is transcoded, decoded, and invalidated by a subsequent angle change",async({page})=>{
 test.setTimeout(180000);
 const raw=(await fs.readFile("tests/fixtures/sasi-video-4s.mp4.base64","utf8")).trim();
 const source=Buffer.from(raw,"base64");
 expect(source.toString("latin1",4,8)).toBe("ftyp");
 await page.goto("/tools/rotate-video?lang=en");
 const area=page.locator("[data-video-toolkit]");
 await expect(area).toHaveAttribute("data-hydrated","true");
 await area.locator('input[type="file"]').first().setInputFiles({name:"synthetic.mp4",mimeType:"video/mp4",buffer:source});
 await area.getByRole("combobox",{name:/Rotation/}).selectOption("90");
 await area.getByRole("button",{name:"Start processing",exact:true}).click();
 await expect(area.getByRole("button",{name:"Cancel",exact:true})).toBeVisible({timeout:15000});
 await expect(area.getByTestId("result-file-actions")).toHaveCount(1,{timeout:140000});
 const pending=page.waitForEvent("download");
 await area.getByTestId("result-file-actions").getByRole("button",{name:"Save file",exact:true}).click();
 const downloaded=await pending;
 expect(await downloaded.failure()).toBeNull();
 const bytes=await fs.readFile((await downloaded.path())!);
 expect(bytes.toString("latin1",4,8)).toBe("ftyp");
 expect(bytes.length).toBeGreaterThan(350);
 expect(downloaded.suggestedFilename()).toMatch(/rotate-90\.mp4$/);
 const metadata=await page.evaluate(async(encoded)=>{
  const binary=atob(encoded),bytes=new Uint8Array(binary.length);
  for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);
  const uri=URL.createObjectURL(new Blob([bytes],{type:"video/mp4"}));
  try{
   const video=document.createElement("video");video.preload="metadata";video.muted=true;
   const value=await new Promise<{width:number;height:number;duration:number}>((resolve,reject)=>{
    const timer=setTimeout(()=>reject(new Error("VIDEO_METADATA_TIMEOUT")),15000);
    video.onloadedmetadata=()=>{clearTimeout(timer);resolve({width:video.videoWidth,height:video.videoHeight,duration:video.duration})};
    video.onerror=()=>{clearTimeout(timer);reject(new Error("VIDEO_NOT_DECODABLE"))};
    video.src=uri;
   });
   video.src="";return value;
  }finally{URL.revokeObjectURL(uri)}
 },bytes.toString("base64"));
 expect(metadata.width).toBeGreaterThan(0);
 expect(metadata.height).toBeGreaterThan(0);
 expect(metadata.duration).toBeGreaterThan(0.5);
 expect(metadata.duration).toBeLessThan(7);
 await area.getByRole("combobox",{name:/Rotation/}).selectOption("180");
 await expect(area.getByTestId("result-file-actions")).toHaveCount(0);
 await expect(area.getByRole("button",{name:"Start processing",exact:true})).toBeEnabled();
});
