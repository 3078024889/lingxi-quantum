import fs from "node:fs";
import {test,expect} from "playwright/test";
test("paper signature becomes transparent ink inside PDF editor without charging",async({page})=>{
 await page.goto("/tools/e-sign-pdf?lang=en");
 const pdf=fs.readFileSync("tests/fixtures/generated/basic.pdf");
 await page.locator('input[type="file"]').first().setInputFiles({name:"paper.pdf",mimeType:"application/pdf",buffer:pdf});
 await expect(page.getByTestId("pdf-source-page-count")).toBeVisible({timeout:30000});
 const dataUrl=await page.evaluate(()=>{
  const c=document.createElement("canvas");c.width=280;c.height=140;
  const ctx=c.getContext("2d")!;
  const g=ctx.createLinearGradient(0,0,280,140);g.addColorStop(0,"#b9b6b3");g.addColorStop(1,"#e4e0dc");
  ctx.fillStyle=g;ctx.fillRect(0,0,280,140);
  ctx.strokeStyle="#24396e";ctx.lineWidth=5;ctx.lineCap="round";
  ctx.beginPath();ctx.moveTo(50,83);ctx.bezierCurveTo(80,12,90,110,130,58);ctx.bezierCurveTo(158,24,200,100,240,59);ctx.stroke();
  return c.toDataURL("image/png");
 });
 await page.locator("label").filter({hasText:"Extract handwritten signature"}).locator('input[type="file"]').setInputFiles({name:"handwritten.png",mimeType:"image/png",buffer:Buffer.from(dataUrl.split(",")[1],"base64")});
 const preview=page.getByTestId("signature-ink-preview");
 await expect(preview).toBeVisible({timeout:30000});
 const sample=await preview.locator("img").evaluate(async(img:HTMLImageElement)=>{
  await img.decode();
  const c=document.createElement("canvas");c.width=img.naturalWidth;c.height=img.naturalHeight;
  const ctx=c.getContext("2d")!;ctx.drawImage(img,0,0);
  const a=ctx.getImageData(0,0,c.width,c.height).data;
  let clear=0,solid=0;
  for(let i=3;i<a.length;i+=4){if(a[i]===0)clear++;if(a[i]>160)solid++}
  return {clear,solid,width:c.width,height:c.height};
 });
 expect(sample.clear).toBeGreaterThan(sample.solid);
 expect(sample.solid).toBeGreaterThan(30);
 expect(sample.width).toBeLessThan(280);
 await page.getByRole("slider",{name:"Ink sensitivity"}).focus();
 await page.getByRole("slider",{name:"Ink sensitivity"}).press("ArrowRight");
 await page.getByRole("button",{name:"Extract again"}).click();
 await expect(preview).toBeVisible();
});
