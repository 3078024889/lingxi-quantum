import fs from "node:fs/promises";
import {PDFDocument} from "pdf-lib";
import {test,expect} from "./export-test";

test("PDF overlay export downloads a real file and opens again in the PDF editor",async({page})=>{
 test.setTimeout(120000);
 await page.addInitScript(()=>{window.open=()=>({} as Window)});
 let quote:any=null;
 await page.route("**/api/tools/quote",route=>{
  const body=route.request().postDataJSON();expect(body.toolId).toBe("pdf-editor");
  quote={id:"8c6ffda1-7a16-4f8d-b1b7-3f7ac8057d51",tool_id:body.toolId,quantity:body.quantity,unit_name:"file",amount_rmb:1,amount_usd:1,currency:body.currency,display_currency:body.currency,display_amount:1,expires_at:new Date(Date.now()+3600000).toISOString(),metadata:body.metadata};
  return route.fulfill({json:quote});
 });
 await page.route("**/api/tools/pay/status**",route=>route.fulfill({json:{paid:true,quote}}));
 await page.route("**/api/tools/export/consume",route=>route.fulfill({json:{ok:true}}));
 const original=await PDFDocument.create();original.addPage([400,500]);original.addPage([400,500]);
 await page.goto("/tools/pdf-editor?lang=en");
 await page.locator('input[type=file]').first().setInputFiles({name:"two-pages.pdf",mimeType:"application/pdf",buffer:Buffer.from(await original.save())});
 await expect(page.getByTestId("pdf-source-page-count")).toBeVisible({timeout:30000});
 await page.getByPlaceholder("Text to add").fill("Page note 123");
 await page.getByRole("button",{name:"Add text",exact:true}).click();
 const edit=page.getByRole("textbox",{name:"Edit added text"});await expect(edit).toBeVisible();
 await edit.press("Enter");
 const downloadPending=page.waitForEvent("download",{timeout:100000});
 await page.getByTestId("paid-export-start").click();
 const downloaded=await downloadPending;
 const bytes=await fs.readFile((await downloaded.path())!);
 expect(bytes.byteLength).toBeGreaterThan(1000);
 const reopened=await PDFDocument.load(bytes);
 expect(reopened.getPageCount()).toBe(2);
 expect(reopened.getPage(0).getWidth()).toBe(400);
 expect(reopened.getPage(1).getHeight()).toBe(500);
 await page.locator('input[type=file]').first().setInputFiles({name:"reopened.pdf",mimeType:"application/pdf",buffer:bytes});
 await expect(page.getByTestId("pdf-source-page-count")).toContainText("2",{timeout:30000});
 await expect(page.getByTestId("pdf-stage").locator("img")).toBeVisible({timeout:30000});
});

test("scanned PDF OCR finds actual text positions that can be double-click edited",async({page},testInfo)=>{
 test.skip(testInfo.project.name!=="desktop-chromium","OCR worker validated once per commit to conserve CI resources");
 test.setTimeout(240000);
 await page.goto("/tools/pdf-editor?lang=en");
 const base64=await page.evaluate(()=>{
  const c=document.createElement("canvas");c.width=1200;c.height=400;
  const x=c.getContext("2d")!;x.fillStyle="#ffffff";x.fillRect(0,0,1200,400);
  x.fillStyle="#000000";x.font="bold 105px Arial";x.fillText("HELLO SCAN 123",48,225);
  return c.toDataURL("image/png").split(",")[1];
 });
 const original=await PDFDocument.create(),p=original.addPage([600,400]);
 const png=await original.embedPng(Buffer.from(base64,"base64"));
 p.drawImage(png,{x:0,y:0,width:600,height:400});
 await page.locator('input[type=file]').first().setInputFiles({name:"scan-only.pdf",mimeType:"application/pdf",buffer:Buffer.from(await original.save())});
 await expect(page.getByTestId("pdf-source-page-count")).toBeVisible({timeout:30000});
 await expect(page.getByTestId("pdf-source-text-region")).toHaveCount(0);
 await page.getByRole("button",{name:"Recognize scanned page",exact:true}).click();
 const result=page.locator('[data-testid="pdf-source-text-region"][data-source="ocr"]').first();
 await expect(result).toBeVisible({timeout:220000});
 await result.dblclick();
 const editing=page.getByRole("textbox",{name:"Edit added text"});
 await expect(editing).toBeVisible();await editing.fill("Replaced OCR text");await editing.press("Enter");
 await expect(page.getByTestId("pdf-overlay").filter({hasText:"Replaced OCR text"})).toBeVisible();
});

test("mobile touch drag enlarges PDF image overlay without numeric fields",async({page},info)=>{
 test.skip(info.project.name!=="mobile-chromium","Mobile Chromium only");
 test.setTimeout(120000);
 const original=await PDFDocument.create();original.addPage([612,792]);
 await page.goto("/tools/pdf-editor?lang=en");
 await page.locator('input[type=file]').first().setInputFiles({name:"mobile.pdf",mimeType:"application/pdf",buffer:Buffer.from(await original.save())});
 await expect(page.getByTestId("pdf-source-page-count")).toBeVisible({timeout:30000});
 const b64=await page.evaluate(()=>{const c=document.createElement("canvas");c.width=100;c.height=60;c.getContext("2d")!.fillRect(0,0,100,60);return c.toDataURL("image/png").split(",")[1]});
 const input=page.locator("label").filter({hasText:"Add image"}).locator('input[type=file]');
 await input.setInputFiles({name:"mobile-image.png",mimeType:"image/png",buffer:Buffer.from(b64,"base64")});
 const overlay=page.getByTestId("pdf-overlay").last(),grip=page.getByTestId("pdf-grip-se");
 await grip.scrollIntoViewIfNeeded();await expect(grip).toBeVisible();
 const a=await overlay.boundingBox(),r=await grip.boundingBox();expect(a).not.toBeNull();expect(r).not.toBeNull();
 const x=r!.x+r!.width/2,y=r!.y+r!.height/2;
 const client=await page.context().newCDPSession(page);
 await client.send("Input.dispatchTouchEvent",{type:"touchStart",touchPoints:[{x,y,id:1,force:1,radiusX:4,radiusY:4}]});
 for(let i=1;i<=8;i++)await client.send("Input.dispatchTouchEvent",{type:"touchMove",touchPoints:[{x:x+i*5,y:y+i*2,id:1,force:1,radiusX:4,radiusY:4}]});
 await client.send("Input.dispatchTouchEvent",{type:"touchEnd",touchPoints:[]});
 await expect.poll(async()=> (await overlay.boundingBox())?.width||0,{timeout:10000}).toBeGreaterThan(a!.width+5);
 await expect(page.locator('input[type=number]')).toHaveCount(0);
});
