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

test("a single touch point remains a visible transparent signing mark",async({page})=>{
 await page.goto("/tools/e-sign-pdf?lang=en");
 await page.locator('input[type="file"]').first().setInputFiles({name:"contract.pdf",mimeType:"application/pdf",buffer:fs.readFileSync("tests/fixtures/generated/basic.pdf")});
 await expect(page.getByTestId("pdf-source-page-count")).toBeVisible();
 await page.getByRole("button",{name:"Draw signature"}).click();
 const pad=page.getByTestId("signature-draw-pad"),canvas=pad.locator("canvas"),rect=await canvas.boundingBox();
 expect(rect).not.toBeNull();
 await page.mouse.click(rect!.x+rect!.width/2,rect!.y+rect!.height/2);
 await expect(pad.getByRole("button",{name:"Undo stroke"})).toBeEnabled();
 const ink=await canvas.evaluate((c:HTMLCanvasElement)=>{
  const data=c.getContext("2d")!.getImageData(0,0,c.width,c.height).data;
  let pixels=0;for(let i=3;i<data.length;i+=4)if(data[i]>0)pixels++;
  return pixels;
 });
 expect(ink).toBeGreaterThan(0);
 await pad.getByRole("button",{name:"Undo stroke"}).click();
 await expect(pad.getByRole("button",{name:"Undo stroke"})).toBeDisabled();
});

test("pen pressure and overlapping second touch keep a single valid ink stroke",async({page})=>{
 await page.goto("/tools/e-sign-pdf?lang=en");
 await page.locator('input[type="file"]').first().setInputFiles({name:"contract.pdf",mimeType:"application/pdf",buffer:fs.readFileSync("tests/fixtures/generated/basic.pdf")});
 await expect(page.getByTestId("pdf-source-page-count")).toBeVisible();
 await page.getByRole("button",{name:"Draw signature"}).click();
 const c=page.getByTestId("signature-draw-pad").locator("canvas");
 await c.dispatchEvent("pointerdown",{pointerId:8,pointerType:"pen",pressure:.4,clientX:180,clientY:140});
 await c.dispatchEvent("pointermove",{pointerId:8,pointerType:"pen",pressure:.8,clientX:245,clientY:135});
 await c.dispatchEvent("pointermove",{pointerId:9,pointerType:"touch",pressure:.5,clientX:400,clientY:160});
 await c.dispatchEvent("pointerup",{pointerId:8,pointerType:"pen",pressure:.6,clientX:295,clientY:140});
 const ink=await c.evaluate((canvas:HTMLCanvasElement)=>{
  const bytes=canvas.getContext("2d")!.getImageData(0,0,canvas.width,canvas.height).data;
  let count=0;for(let i=3;i<bytes.length;i+=4)if(bytes[i]>20)count++;return count;
 });
 expect(ink).toBeGreaterThan(5);
 await expect(page.getByTestId("signature-draw-pad").getByRole("button",{name:"Undo stroke"})).toBeEnabled();
});
