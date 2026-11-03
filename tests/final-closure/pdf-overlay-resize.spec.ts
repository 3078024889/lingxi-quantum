import fs from "node:fs";
import {test,expect} from "./export-test";

test("PDF signature/image can resize on-page by dragging a corner on desktop",async({page})=>{
 test.setTimeout(90000);
 await page.goto("/tools/pdf-editor?lang=en",{waitUntil:"domcontentloaded"});
 const pdf=fs.readFileSync("tests/fixtures/generated/basic.pdf");
 const upload=page.locator('input[type="file"]').first();
 await expect(upload).toBeEnabled({timeout:15000});
 await upload.setInputFiles({name:"resize.pdf",mimeType:"application/pdf",buffer:pdf});
 await expect(page.getByTestId("pdf-source-page-count")).toBeVisible({timeout:30000});
 const png=await page.evaluate(()=>{
  const canvas=document.createElement("canvas");canvas.width=90;canvas.height=30;
  const ctx=canvas.getContext("2d")!;ctx.fillStyle="#224488";ctx.fillRect(4,8,80,14);
  return canvas.toDataURL("image/png").split(",")[1];
 });
 const imageInput=page.locator("label").filter({hasText:"Add image"}).locator('input[type="file"]');
 await imageInput.setInputFiles({name:"signature.png",mimeType:"image/png",buffer:Buffer.from(png,"base64")});
 const handle=page.getByTestId("pdf-overlay-resize").last();
 await expect(handle).toBeVisible();
 const overlay=handle.locator("..");
 const before=await overlay.boundingBox();
 const control=await handle.boundingBox();
 expect(before).not.toBeNull();expect(control).not.toBeNull();
 await page.mouse.move(control!.x+control!.width/2,control!.y+control!.height/2);
 await page.mouse.down();
 await page.mouse.move(control!.x+control!.width/2+50,control!.y+control!.height/2+10,{steps:8});
 await page.mouse.up();
 const after=await overlay.boundingBox();expect(after).not.toBeNull();
 expect(after!.width).toBeGreaterThan(before!.width+10);
 const stage=await page.getByTestId("pdf-stage").boundingBox();expect(stage).not.toBeNull();
 expect(after!.x+after!.width).toBeLessThanOrEqual(stage!.x+stage!.width+2);
 await expect(overlay.locator("img")).toBeVisible();
});
