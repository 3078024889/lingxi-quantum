import {test,expect} from "./export-test";
import {PDFDocument,StandardFonts} from "pdf-lib";
import QRCode from "qrcode";
import sharp from "sharp";
import fs from "node:fs/promises";

async function makePdf(pages:Array<{width:number;height:number;word:string}>){
 const doc=await PDFDocument.create(),font=await doc.embedFont(StandardFonts.Helvetica);
 for(const p of pages){const page=doc.addPage([p.width,p.height]);page.drawText(p.word,{x:20,y:p.height-45,size:14,font});}
 return Buffer.from(await doc.save());
}

test("PDF merge: actual uploaded PDFs keep exact page order and dimensions in downloaded result",async({page})=>{
 const a=await makePdf([{width:210,height:300,word:"FIRST"}]);
 const b=await makePdf([{width:330,height:440,word:"SECOND"}]);
 await page.goto("/tools/merge-pdf?lang=en");
 const area=page.locator("[data-tool-workbench]");
 await area.locator('input[type="file"]').first().setInputFiles([
  {name:"first.pdf",mimeType:"application/pdf",buffer:a},
  {name:"second.pdf",mimeType:"application/pdf",buffer:b}
 ]);
 await expect(area.locator("li").filter({hasText:/\.pdf/})).toHaveCount(2);
 await area.getByRole("button",{name:"Process now"}).click();
 const action=area.getByTestId("result-file-actions");
 await expect(action).toBeVisible({timeout:30000});
 const pending=page.waitForEvent("download");
 await action.getByRole("button",{name:"Save file"}).click();
 const dl=await pending,bytes=await fs.readFile((await dl.path())!);
 expect(await dl.failure()).toBeNull();
 const doc=await PDFDocument.load(bytes);
 expect(doc.getPageCount()).toBe(2);
 expect(doc.getPages().map(p=>[p.getWidth(),p.getHeight()])).toEqual([[210,300],[330,440]]);
});

test("PDF split: downloaded pages stay valid and retain order, even when source page sizes differ",async({page})=>{
 const original=await makePdf([
  {width:200,height:280,word:"ONE"},
  {width:310,height:400,word:"TWO"},
  {width:160,height:250,word:"THREE"},
 ]);
 await page.goto("/tools/split-pdf?lang=en");
 const area=page.locator("[data-tool-workbench]");
 await area.locator('input[type="file"]').first().setInputFiles({name:"three.pdf",mimeType:"application/pdf",buffer:original});
 await area.getByRole("button",{name:"Process now"}).click();
 const actions=area.getByTestId("result-file-actions");
 await expect(actions).toHaveCount(3,{timeout:30000});
 for(const [i,size]of [[0,[200,280]],[1,[310,400]],[2,[160,250]]] as const){
  const pending=page.waitForEvent("download");
  await actions.nth(i).getByRole("button",{name:"Save file"}).click();
  const dl=await pending,content=await fs.readFile((await dl.path())!);
  expect(await dl.failure()).toBeNull();
  expect(dl.suggestedFilename()).toMatch(new RegExp(`page-00${i+1}\\.pdf$`));
  const pdf=await PDFDocument.load(content);
  expect(pdf.getPageCount()).toBe(1);
  expect([pdf.getPage(0).getWidth(),pdf.getPage(0).getHeight()]).toEqual(size);
 }
});

test("QR reader: real generated QR PNG yields the complete Unicode payload with no file export",async({page})=>{
 const payload="https://example.com/celestial?search="+encodeURIComponent("星河与宇宙");
 const data=await QRCode.toBuffer(payload,{width:280,errorCorrectionLevel:"H"});
 await page.goto("/tools/qr-code-reader?lang=en");
 const area=page.locator("[data-tool-workbench]");
 await area.locator('input[type="file"]').first().setInputFiles({name:"宇宙二维码.png",mimeType:"image/png",buffer:data});
 await area.getByRole("button",{name:"Process now"}).click();
 await expect(area.locator("dl")).toContainText(payload);
 await expect(area.getByTestId("result-file-actions")).toHaveCount(0);
});

test("QR reader: blank image must be rejected; it is not a successful decoded QR",async({page})=>{
 const data=await sharp({create:{width:180,height:180,channels:3,background:"white"}}).png().toBuffer();
 await page.goto("/tools/qr-code-reader?lang=en");
 const area=page.locator("[data-tool-workbench]");
 await area.locator('input[type="file"]').first().setInputFiles({name:"blank.png",mimeType:"image/png",buffer:data});
 await area.getByRole("button",{name:"Process now"}).click();
 await expect(area).toContainText("The file could not be processed this time");
 await expect(area.getByTestId("result-file-actions")).toHaveCount(0);
});
