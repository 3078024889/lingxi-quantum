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
 const before=await item.boundingBox(),r=await grip.boundingBox();
 expect(before).not.toBeNull();expect(r).not.toBeNull();
 if(mobile)await page.evaluate(()=>{
  // Keep evidence of *real CDP touch events* for failed mobile sessions;
  // never use scripted CSS manipulation as a substitute for dragging.
  const events:Array<{type:string;target:string;x:number;y:number}>=[];
  (window as Window&{__pdfTouchDiagnostics?:typeof events}).__pdfTouchDiagnostics=events;
  (window as Window&{__pdfGestureTrace?:unknown[]}).__pdfGestureTrace=[];
  for(const type of ["pointerdown","touchstart","pointermove","touchmove","pointercancel","touchend"]){
   document.addEventListener(type,event=>{
    if(events.length>=45)return;
    const e=event as PointerEvent&TouchEvent;
    const t=e.changedTouches?.[0];
    const target=event.target instanceof Element?event.target.closest("[data-testid]"):null;
    events.push({type,target:target?.getAttribute("data-testid")||"other",x:t?.clientX??e.clientX??-1,y:t?.clientY??e.clientY??-1});
   },{capture:true,passive:true});
  }
 });
 await dragGesture(page,r!.x+r!.width/2,r!.y+r!.height/2,55,18,mobile);
 if(mobile){
  const trace=await page.evaluate(()=>(window as Window&{__pdfGestureTrace?:unknown[]}).__pdfGestureTrace||[]);
  console.log("PDF_MOBILE_GESTURE_DECISIONS",JSON.stringify({first:trace.slice(0,30),last:trace.slice(-12)}));
 }
 if(mobile&&(await item.boundingBox())!.width<=before!.width+6){
  const diagnostic=await page.evaluate(()=>({events:(window as Window&{__pdfTouchDiagnostics?:unknown[]}).__pdfTouchDiagnostics||[],
   overlay:document.querySelector('[data-testid="pdf-overlay"]')?.getAttribute("style")||"",
   gesture:(window as Window&{__pdfGestureTrace?:unknown[]}).__pdfGestureTrace||[]}));
  console.log("PDF_MOBILE_GESTURE_TRACE",JSON.stringify(diagnostic));
 }
 await expect.poll(async()=>(await item.boundingBox())?.width||0,{timeout:10000}).toBeGreaterThan(before!.width+6);
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
