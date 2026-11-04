import {test,expect,type Page} from "./export-test";
import {PDFDocument,StandardFonts} from "pdf-lib";
import {readFile} from "node:fs/promises";

type Kind="text"|"markdown";
async function makePdf(pages:string[][]):Promise<Buffer>{
 const doc=await PDFDocument.create();
 const font=await doc.embedFont(StandardFonts.Helvetica);
 for(const lines of pages){
  const page=doc.addPage([600,800]);
  lines.forEach((line,i)=>page.drawText(line,{x:50,y:720-i*32,size:16,font}));
 }
 return Buffer.from(await doc.save());
}
async function openTool(page:Page,kind:Kind,buffer:Buffer){
 await page.goto(kind==="text"?"/tools/pdf-to-text?lang=en":"/tools/pdf-to-markdown?lang=en");
 const picker=page.locator('input[type="file"]').first();
 await expect(picker).toBeEnabled({timeout:15000});
 await picker.setInputFiles({name:"scanned-or-text.pdf",mimeType:"application/pdf",buffer});
 const run=page.getByTestId(kind==="text"?"pdf-text-run":"pdf-markdown-run");
 await expect(run).toBeEnabled({timeout:15000});
 await run.click();
}
for(const kind of ["text","markdown"] as const){
 test(`PDF to ${kind}: real two-page PDF is processed, downloaded and decoded`,async({page})=>{
  test.setTimeout(90000);
  const input=await makePdf([["Alpha first page","Contract reference A-123"],["Beta second page","Payment 1200"]]);
  await openTool(page,kind,input);
  const save=page.getByRole("button",{name:"Save file",exact:true}).first();
  await expect(save).toBeVisible({timeout:30000});
  const pending=page.waitForEvent("download",{timeout:15000});
  await save.click();
  const download=await pending;
  expect(download.suggestedFilename()).toBe(kind==="text"?"scanned-or-text.txt":"scanned-or-text.md");
  const data=(await readFile((await download.path())!)).toString("utf8");
  expect(data).toContain("Alpha first page");
  expect(data).toContain("Contract reference A-123");
  expect(data).toContain("Beta second page");
  expect(data).toContain("Payment 1200");
  expect(data).toContain(kind==="text"?"--- Page 2 ---":"# Page 2");
 });
 test(`PDF to ${kind}: blank scan cannot produce misleading successful download`,async({page})=>{
  test.setTimeout(90000);
  await openTool(page,kind,await makePdf([[]]));
  await expect(page.locator('p[role="alert"]')).toHaveText("This PDF has no extractable text. Run PDF OCR first.",{timeout:30000});
  await expect(page.getByRole("button",{name:"Save file",exact:true})).toHaveCount(0);
 });
}
