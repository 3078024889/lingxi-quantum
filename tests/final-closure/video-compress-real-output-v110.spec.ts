import {test,expect} from "./export-test";
import fs from "node:fs/promises";

test("browser compression never delivers a larger unrequested output",async({page})=>{
 test.setTimeout(150000);
 await page.route("**/api/tools/free-export",route=>route.fulfill({status:200,json:{id:route.request().postDataJSON().id,allowed:true,paidUnits:0,loginRequired:false}}));
 await page.goto("/tools/video-toolkit?lang=en&mini=1");
 const source=Buffer.from(await page.evaluate(async()=>{
  const canvas=document.createElement("canvas");canvas.width=160;canvas.height=120;
  const ctx=canvas.getContext("2d")!;ctx.fillStyle="#38465e";ctx.fillRect(0,0,160,120);
  const stream=canvas.captureStream(12);
  const recorder=new MediaRecorder(stream,{mimeType:"video/webm;codecs=vp8"});
  const chunks:BlobPart[]=[];
  const done=new Promise<Blob>(resolve=>{recorder.ondataavailable=e=>chunks.push(e.data);recorder.onstop=()=>resolve(new Blob(chunks,{type:"video/webm"}))});
  recorder.start();await new Promise(r=>setTimeout(r,1400));recorder.stop();
  const blob=await done;stream.getTracks().forEach(t=>t.stop());
  return Array.from(new Uint8Array(await blob.arrayBuffer()));
 }));
 expect(source.length).toBeGreaterThan(100);
 const area=page.locator("[data-tool-workbench]");
 await area.locator('input[type="file"]').first().setInputFiles({name:"tiny-compression.webm",mimeType:"video/webm",buffer:source});
 await area.getByRole("button",{name:"Start processing"}).click();
 const actions=page.getByTestId("result-file-actions");
 await expect(actions).toBeVisible({timeout:120000});
 // Desktop Chromium may not offer the Web Share API. Compression and download
 // must work without pretending native sharing is supported.
 const download=page.waitForEvent("download");
 await actions.getByRole("button",{name:"Save file",exact:true}).click();
 const result=await download,bytes=await fs.readFile((await result.path())!);
 expect(bytes.byteLength).toBeGreaterThan(0);
 expect(bytes.byteLength).toBeLessThanOrEqual(source.byteLength);
 if(result.suggestedFilename()==="tiny-compression.webm"){
  expect(bytes).toEqual(source);
  await expect(area).toContainText("original file is provided instead");
 }else{
  expect(result.suggestedFilename()).toBe("tiny-compression-compressed.mp4");
  expect(bytes.byteLength).toBeLessThan(source.byteLength);
 }
});
