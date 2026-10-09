import fs from "node:fs";
import {test,expect} from "playwright/test";
test("direct pen signature produces tightly cropped transparent ink and a page overlay",async({page})=>{
 await page.goto("/tools/e-sign-pdf?lang=en");
 await page.locator('input[type="file"]').first().setInputFiles({name:"contract.pdf",mimeType:"application/pdf",buffer:fs.readFileSync("tests/fixtures/generated/basic.pdf")});
 await expect(page.getByTestId("pdf-source-page-count")).toBeVisible();
 await page.getByRole("button",{name:"Draw signature"}).click();
 const pad=page.getByTestId("signature-draw-pad");
 await expect(pad).toBeVisible();
 const canvas=pad.locator("canvas");
 const rect=await canvas.boundingBox();expect(rect).not.toBeNull();
 const y=rect!.y+rect!.height*.55;
 await page.mouse.move(rect!.x+rect!.width*.23,y);
 await page.mouse.down();
 await page.mouse.move(rect!.x+rect!.width*.65,y-20,{steps:16});
 await page.mouse.up();
 await expect(pad.getByRole("button",{name:"Undo stroke"})).toBeEnabled();
 await pad.getByRole("button",{name:"Place in PDF"}).click();
 await expect(pad).toHaveCount(0);
 const outcome=await page.locator('img[src^="data:image/png"]').last().evaluate(async(img:HTMLImageElement)=>{
  await img.decode();
  const c=document.createElement("canvas");c.width=img.naturalWidth;c.height=img.naturalHeight;
  const ctx=c.getContext("2d")!;ctx.drawImage(img,0,0);
  const pixels=ctx.getImageData(0,0,c.width,c.height).data;
  let opaque=0,transparent=0;for(let i=3;i<pixels.length;i+=4){if(pixels[i]>80)opaque++;if(pixels[i]===0)transparent++}
  return {width:c.width,height:c.height,opaque,transparent};
 });
 expect(outcome.opaque).toBeGreaterThan(30);
 expect(outcome.transparent).toBeGreaterThan(outcome.opaque);
 expect(outcome.width).toBeLessThan(500);
});
