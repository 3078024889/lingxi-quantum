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
 const spot=await editor.locator("canvas").evaluate((c:HTMLCanvasElement)=>{
  const ctx=c.getContext("2d")!,d=ctx.getImageData(0,0,c.width,c.height).data;
  // Select the center of a solid local ink area, not the first semi-transparent edge pixel.
  let best={score:-1,x:0,y:0};
  for(let y=6;y<c.height-6;y+=2)for(let x=6;x<c.width-6;x+=2){
   let score=0;
   for(let dy=-3;dy<=3;dy++)for(let dx=-3;dx<=3;dx++)if(d[((y+dy)*c.width+x+dx)*4+3]>160)score++;
   if(score>best.score)best={score,x,y};
  }
  if(best.score<4)throw new Error("NO_INK_TO_ERASE");
  return {x:best.x,y:best.y,w:c.width,h:c.height};
 });
 // Mouse coordinates are viewport coordinates; the editor follows a PDF preview.
 // Scroll before measuring so the stroke reaches the canvas rather than the page.
 await editor.locator("canvas").scrollIntoViewIfNeeded();
 const rect=await editor.locator("canvas").boundingBox();expect(rect).not.toBeNull();
 const x=rect!.x+(spot.x+.5)*rect!.width/spot.w,y=rect!.y+(spot.y+.5)*rect!.height/spot.h;
 await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x+4,y+3,{steps:4});await page.mouse.up();
 await expect.poll(alpha).toBeLessThan(before);
 const preview=page.getByTestId("signature-ink-preview").locator("img");
 const edited=await preview.getAttribute("src");
 expect(edited).toMatch(/^data:image\/png;base64,/);
 const downloadPromise=page.waitForEvent("download");
 await page.getByRole("button",{name:"Save transparent signature"}).click();
 const download=await downloadPromise;
 expect(download.suggestedFilename()).toMatch(/\.png$/);
 const path=await download.path();expect(path).not.toBeNull();
 const bytes=fs.readFileSync(path!);
 expect(bytes.subarray(0,8)).toEqual(Buffer.from([137,80,78,71,13,10,26,10]));
 const placement=page.locator('img[src^="data:image/png"]').last();
 await expect(placement).toBeVisible();
 await editor.getByRole("button",{name:"Undo erasing"}).click();
 await expect.poll(alpha).toBeGreaterThanOrEqual(before-4);
});


test("already-transparent signature keeps its ink alpha and does not acquire a paper rectangle",async({page})=>{
 await page.goto("/tools/e-sign-pdf?lang=en");
 const pdf=fs.readFileSync("tests/fixtures/generated/basic.pdf");
 await page.locator('input[type="file"]').first().setInputFiles({name:"document.pdf",mimeType:"application/pdf",buffer:pdf});
 await expect(page.getByTestId("pdf-source-page-count")).toBeVisible();
 const png=await page.evaluate(()=>{
  const c=document.createElement("canvas");c.width=360;c.height=180;
  const x=c.getContext("2d")!;
  x.strokeStyle="#233d93";x.lineWidth=8;x.lineCap="round";
  x.beginPath();x.moveTo(70,98);x.bezierCurveTo(140,15,185,145,290,65);x.stroke();
  return c.toDataURL("image/png").split(",")[1];
 });
 await page.locator("label").filter({hasText:"Extract handwritten signature"}).locator('input[type="file"]').setInputFiles({name:"signature.png",mimeType:"image/png",buffer:Buffer.from(png,"base64")});
 const preview=page.getByTestId("signature-ink-preview").locator("img");
 await expect(preview).toBeVisible();
 const output=await preview.evaluate(async(img:HTMLImageElement)=>{
  await img.decode();
  const c=document.createElement("canvas");c.width=img.naturalWidth;c.height=img.naturalHeight;
  const ctx=c.getContext("2d")!;ctx.drawImage(img,0,0);
  const p=ctx.getImageData(0,0,c.width,c.height).data;
  let clear=0,ink=0,blue=0;
  for(let i=0;i<p.length;i+=4){
   if(p[i+3]===0)clear++;
   if(p[i+3]>80){ink++;if(p[i+2]>p[i])blue++}
  }
  return {width:c.width,height:c.height,clear,ink,blue};
 });
 expect(output.width).toBeLessThan(360);
 expect(output.height).toBeLessThan(180);
 expect(output.clear).toBeGreaterThan(output.ink);
 expect(output.blue).toBeGreaterThan(25);
});
