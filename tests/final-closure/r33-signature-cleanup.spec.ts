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
 const rect=await editor.locator("canvas").boundingBox();expect(rect).not.toBeNull();
 const x=rect!.x+(spot.x+.5)*rect!.width/spot.w,y=rect!.y+(spot.y+.5)*rect!.height/spot.h;
 await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x+4,y+3,{steps:4});await page.mouse.up();
 await expect.poll(alpha).toBeLessThan(before);
 const placement=page.locator('img[src^="data:image/png"]').last();
 await expect(placement).toBeVisible();
 await editor.getByRole("button",{name:"Undo erasing"}).click();
 await expect.poll(alpha).toBeGreaterThanOrEqual(before-4);
});
