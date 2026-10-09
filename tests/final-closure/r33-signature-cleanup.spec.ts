import fs from "node:fs";
import {test,expect} from "playwright/test";
test("handwriting cleanup can erase remaining photo marks, undo and update PDF placement",async({page})=>{
 await page.goto("/tools/e-sign-pdf?lang=en");
 const pdf=fs.readFileSync("tests/fixtures/generated/basic.pdf");
 await page.locator('input[type="file"]').first().setInputFiles({name:"document.pdf",mimeType:"application/pdf",buffer:pdf});
 await expect(page.getByTestId("pdf-source-page-count")).toBeVisible();
 const png=await page.evaluate(()=>{
  const c=document.createElement("canvas");c.width=320;c.height=160;const ctx=c.getContext("2d")!;
  ctx.fillStyle="#cccccc";ctx.fillRect(0,0,320,160);
  ctx.fillStyle="#162552";ctx.fillRect(50,75,180,6);
  ctx.fillRect(258,70,12,12); // accidental remaining mark
  return c.toDataURL("image/png").split(",")[1];
 });
 await page.locator("label").filter({hasText:"Extract handwritten signature"}).locator('input[type="file"]').setInputFiles({name:"ink.png",mimeType:"image/png",buffer:Buffer.from(png,"base64")});
 const editor=page.getByTestId("signature-manual-cleanup");
 await expect(editor).toBeVisible();
 const alpha=()=>editor.locator("canvas").evaluate((c:HTMLCanvasElement)=>{const ctx=c.getContext("2d")!;const d=ctx.getImageData(0,0,c.width,c.height).data;let count=0;for(let i=3;i<d.length;i+=4)if(d[i]>0)count++;return count});
 const before=await alpha();
 const rect=await editor.locator("canvas").boundingBox();expect(rect).not.toBeNull();
 await page.mouse.move(rect!.x+rect!.width*.85,rect!.y+rect!.height*.5);
 await page.mouse.down();await page.mouse.move(rect!.x+rect!.width*.80,rect!.y+rect!.height*.54,{steps:4});await page.mouse.up();
 await expect.poll(alpha).toBeLessThan(before);
 const placement=page.locator('img[src^="data:image/png"]').last();
 await expect(placement).toBeVisible();
 await editor.getByRole("button",{name:"Undo erasing"}).click();
 await expect.poll(alpha).toBeGreaterThanOrEqual(before-4);
});
