import fs from "node:fs";
import {test,expect,type Page} from "./export-test";

async function dragGesture(page:Page,x:number,y:number,dx:number,dy:number,mobile:boolean){
 if(mobile){
  // Dispatch genuine touch events. Mouse-only tests can miss pointer capture
  // and state updates in mobile Chromium / touch-action:none elements.
  const cdp=await page.context().newCDPSession(page);
  try{
   await cdp.send("Input.dispatchTouchEvent",{type:"touchStart",touchPoints:[{x,y,id:1,force:1,radiusX:5,radiusY:5}]});
   for(let i=1;i<=12;i++){
    await cdp.send("Input.dispatchTouchEvent",{type:"touchMove",touchPoints:[{x:x+dx*i/12,y:y+dy*i/12,id:1,force:1,radiusX:5,radiusY:5}]});
    // A physical finger spans multiple animation frames; do not batch 12 moves into one frame.
    await page.waitForTimeout(16);
   }
   await cdp.send("Input.dispatchTouchEvent",{type:"touchEnd",touchPoints:[]});
  }finally{await cdp.detach();}
 }else{
  await page.mouse.move(x,y);await page.mouse.down();
  await page.mouse.move(x+dx,y+dy,{steps:12});await page.mouse.up();
 }
}

test("PDF added image resizes on-page with handles and rotates using real mouse or touch",async({page},info)=>{
 test.setTimeout(90000);
 const mobile=info.project.name==="mobile-chromium";
 await page.goto("/tools/pdf-editor?lang=en");
 const upload=page.locator('input[type=file]').first();
 await expect(upload).toBeEnabled({timeout:15000});
 await upload.setInputFiles({name:"demo.pdf",mimeType:"application/pdf",buffer:fs.readFileSync("tests/fixtures/generated/basic.pdf")});
 await expect(page.getByTestId("pdf-source-page-count")).toBeVisible({timeout:30000});
 const png=await page.evaluate(()=>{
  const c=document.createElement("canvas");c.width=160;c.height=60;
  const x=c.getContext("2d")!;x.fillStyle="#224488";x.fillRect(4,8,150,44);
  return c.toDataURL("image/png").split(",")[1];
 });
 const input=page.locator("label").filter({hasText:"Add image"}).locator('input[type=file]');
 await input.setInputFiles({name:"stamp.png",mimeType:"image/png",buffer:Buffer.from(png,"base64")});
 const item=page.getByTestId("pdf-overlay").last();
 await expect(item).toBeVisible();
 const grip=page.getByTestId("pdf-grip-se");
 await grip.scrollIntoViewIfNeeded();await expect(grip).toBeVisible();
 if(mobile){
  // The 44px southeast touch target must be the actual hit-tested control.
  // On small overlays, eight adjacent touch handles previously overlapped.
  await expect(page.getByTestId("pdf-grip-e")).toBeHidden();
  const target=await grip.evaluate(el=>{
   const r=el.getBoundingClientRect();
   return document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.closest('[data-testid="pdf-grip-se"]')===el;
  });
  expect(target).toBe(true);
 }
 const stage=page.getByTestId("pdf-stage");
 const normalizedWidth=async()=>{
  const [overlay,pageBox]=await Promise.all([item.boundingBox(),stage.boundingBox()]);
  return overlay&&pageBox&&pageBox.width>0?overlay.width/pageBox.width:0;
 };
 const before=await item.boundingBox(),r=await grip.boundingBox();
 expect(before).not.toBeNull();expect(r).not.toBeNull();
 const beforeRelative=await normalizedWidth();
 await dragGesture(page,r!.x+r!.width/2,r!.y+r!.height/2,55,18,mobile);
 // A mobile viewport may relayout while the finger is moving. Verify that
 // the actual overlay grows relative to the PDF page, not merely its pixels.
 await expect.poll(normalizedWidth,{timeout:10000}).toBeGreaterThan(beforeRelative+0.02);
 if(mobile){
  // Adversarial browser hit-test regression: the same finger lands at the
  // visible corner, but Chromium selects its ancestor overlay instead of the
  // 44px grip. Only disable hit-testing on the grip for this test, never the
  // user's touch events or the real resize assertion.
  const widthBeforeRetarget=await normalizedWidth();
  await grip.evaluate(el=>{(el as HTMLElement).style.pointerEvents="none"});
  const target=await grip.boundingBox();expect(target).not.toBeNull();
  const x=target!.x+target!.width/2-2,y=target!.y+target!.height/2-2;
  const hit=await page.evaluate(({x,y})=>document.elementFromPoint(x,y)?.closest('[data-testid="pdf-overlay"]')?.getAttribute("data-testid")||null,{x,y});
  expect(hit).toBe("pdf-overlay");
  await dragGesture(page,x,y,35,12,true);
  await expect.poll(normalizedWidth,{timeout:10000}).toBeGreaterThan(widthBeforeRetarget+0.012);
  await grip.evaluate(el=>{(el as HTMLElement).style.pointerEvents=""});
 }
 const rotate=page.getByTestId("pdf-grip-rotate");
 await rotate.scrollIntoViewIfNeeded();await expect(rotate).toBeVisible();
 const rr=await rotate.boundingBox();expect(rr).not.toBeNull();
 await dragGesture(page,rr!.x+rr!.width/2,rr!.y+rr!.height/2,30,40,mobile);
 await expect.poll(async()=>item.evaluate(el=>{
  const matrix=new DOMMatrixReadOnly(getComputedStyle(el).transform);
  return Math.abs(matrix.b)+Math.abs(matrix.c);
 }),{timeout:10000}).toBeGreaterThan(.05);
 await expect(item.locator("img")).toBeVisible();
});
