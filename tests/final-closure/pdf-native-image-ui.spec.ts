import type {Route} from "playwright";
import fs from "node:fs/promises";
import {PDFDocument} from "pdf-lib";
import sharp from "sharp";
import {test,expect} from "./export-test";
import {locatePageImages} from "../../lib/tools/pdf-native/image-mutate";

async function twoPageSource(){
 const pdf=await PDFDocument.create();
 const png=await sharp({create:{width:64,height:32,channels:4,background:{r:220,g:40,b:40,alpha:1}}}).png().toBuffer();
 const image=await pdf.embedPng(png);
 pdf.addPage([480,560]).drawImage(image,{x:72,y:96,width:120,height:60});
 pdf.addPage([480,560]).drawImage(image,{x:170,y:200,width:120,height:60});
 return Buffer.from(await pdf.save());
}
async function paymentMock(page:any){
 let quote:any=null;
 await page.addInitScript(()=>{window.open=()=>({} as Window)});
 await page.route("**/api/tools/quote",(route:Route)=>{
  const b=route.request().postDataJSON();
  expect(b.toolId).toBe("pdf-editor");
  quote={id:"b4ff2806-b45f-4e22-aea5-acfcaef45b26",tool_id:b.toolId,quantity:b.quantity,unit_name:"file",amount_rmb:1,amount_usd:1,currency:b.currency,display_currency:b.currency,display_amount:1,expires_at:new Date(Date.now()+3600000).toISOString(),metadata:b.metadata};
  return route.fulfill({json:quote});
 });
 await page.route("**/api/tools/pay/status**",(route:Route)=>route.fulfill({json:{paid:true,quote}}));
 await page.route("**/api/tools/export/consume",(route:Route)=>route.fulfill({json:{ok:true}}));
}
async function upload(page:any,source:Buffer){
 await page.goto("/tools/pdf-editor?lang=en");
 await page.locator('input[type="file"]').first().setInputFiles({name:"source-images.pdf",mimeType:"application/pdf",buffer:source});
 await expect(page.getByTestId("pdf-source-page-count")).toBeVisible({timeout:30000});
 await expect(page.getByTestId("pdf-source-image-region").first()).toBeVisible({timeout:30000});
}
async function exportPdf(page:any){
 const download=page.waitForEvent("download",{timeout:100000});
 await page.getByTestId("paid-export-start").click();
 const file=await download;
 const bytes=await fs.readFile((await file.path())!);
 expect(bytes.length).toBeGreaterThan(1000);
 const pdf=await PDFDocument.load(bytes);
 expect(pdf.getPageCount()).toBe(2);
 return bytes;
}
test("original PDF image delete removes the source Do operator while preserving the next page",async({page})=>{
 test.setTimeout(150000);
 await paymentMock(page);
 const before=await twoPageSource();
 await upload(page,before);
 await page.getByTestId("pdf-source-image-region").first().click();
 const overlay=page.locator('[data-testid="pdf-overlay"][data-native-image="true"]');
 await expect(overlay).toBeVisible();
 await expect(page.getByTestId("pdf-grip-rotate")).toHaveCount(0);
 await page.getByTestId("pdf-native-image-delete").first().click();
 await expect(page.getByTestId("pdf-native-image-source-mask")).toBeVisible();
 const after=await exportPdf(page);
 expect((await locatePageImages(after,0)).length).toBe(0);
 const [other]=await locatePageImages(after,1);
 expect(other.rect.x).toBeCloseTo(170,2);
 expect(other.rect.y).toBeCloseTo(200,2);
 await page.locator('input[type="file"]').first().setInputFiles({name:"reopened-images.pdf",mimeType:"application/pdf",buffer:after});
 await expect(page.getByTestId("pdf-source-page-count")).toBeVisible({timeout:30000});
 await expect(page.getByTestId("pdf-source-image-region")).toHaveCount(0,{timeout:30000});
});
test("original PDF image can be replaced with an independent resource, without affecting the next page",async({page})=>{
 test.setTimeout(150000);
 await paymentMock(page);
 const original=await twoPageSource();
 await upload(page,original);
 await page.getByTestId("pdf-source-image-region").first().click();
 await expect(page.locator('[data-testid="pdf-overlay"][data-native-image="true"]')).toBeVisible();
 const green=await sharp({create:{width:24,height:24,channels:4,background:{r:20,g:210,b:60,alpha:1}}}).png().toBuffer();
 await page.getByTestId("pdf-native-image-replace-file").first().setInputFiles({name:"new-green.png",mimeType:"image/png",buffer:green});
 await expect(page.locator('[data-testid="pdf-overlay"][data-native-image="true"] img')).toBeVisible();
 const after=await exportPdf(page);
 const [edited]=await locatePageImages(after,0);
 const [other]=await locatePageImages(after,1);
 expect(edited.naturalWidth).toBe(24);
 expect(other.naturalWidth).toBe(64);
 expect(other.rect.x).toBeCloseTo(170,2);
});

test("dragging a corner of an existing PDF image changes its original PDF drawing geometry",async({page},testInfo)=>{
 test.setTimeout(150000);
 await paymentMock(page);
 const original=await twoPageSource();
 await upload(page,original);
 await page.getByTestId("pdf-source-image-region").first().click();
 const overlay=page.locator('[data-testid="pdf-overlay"][data-native-image="true"]');
 const grip=page.getByTestId("pdf-grip-se");
 await expect(grip).toBeVisible();
 const before=await overlay.boundingBox(),box=await grip.boundingBox();
 expect(before).not.toBeNull();expect(box).not.toBeNull();
 const x=box!.x+box!.width/2,y=box!.y+box!.height/2;
 if(testInfo.project.name==="mobile-chromium"){
  const client=await page.context().newCDPSession(page);
  await client.send("Input.dispatchTouchEvent",{type:"touchStart",touchPoints:[{x,y,id:1,force:1,radiusX:4,radiusY:4}]});
  for(let i=1;i<=10;i++)await client.send("Input.dispatchTouchEvent",{type:"touchMove",touchPoints:[{x:x+5*i,y:y+2*i,id:1,force:1,radiusX:4,radiusY:4}]});
  await client.send("Input.dispatchTouchEvent",{type:"touchEnd",touchPoints:[]});
 }else{
  await page.mouse.move(x,y);await page.mouse.down();
  await page.mouse.move(x+50,y+20,{steps:10});await page.mouse.up();
 }
 await expect.poll(async()=> (await overlay.boundingBox())?.width||0,{timeout:10000}).toBeGreaterThan(before!.width+5);
 const after=await exportPdf(page);
 const [moved]=await locatePageImages(after,0),[sibling]=await locatePageImages(after,1);
 expect(moved.rect.width).toBeGreaterThan(120);
 expect(sibling.rect.x).toBeCloseTo(170,2);
 expect(sibling.rect.width).toBeCloseTo(120,2);
});
