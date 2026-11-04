import {test,expect,type Page} from "./export-test";
import {PDFDocument} from "pdf-lib";
import {readFile} from "node:fs/promises";

async function pdfPageWidths(widths:number[]){
 const document=await PDFDocument.create();
 widths.forEach((width,i)=>{const p=document.addPage([width,420]);p.drawText("Page "+(i+1),{x:25,y:380,size:18});});
 return Buffer.from(await document.save());
}
async function loadTool(page:Page,files:{name:string;buffer:Buffer}[]){
 await page.goto("/tools/pdf-merge-split?lang=en");
 const picker=page.locator('input[type="file"]').first();
 await expect(picker).toBeEnabled({timeout:20000});
 await picker.setInputFiles(files.map(f=>({name:f.name,mimeType:"application/pdf",buffer:f.buffer})));
 await expect(page.getByText(/Pages in first file/)).toContainText(String((await PDFDocument.load(files[0].buffer)).getPageCount()),{timeout:20000});
}
async function takePdf(page:Page){
 const save=page.getByRole("button",{name:"Save file",exact:true}).first();
 await expect(save).toBeVisible({timeout:30000});
 const pending=page.waitForEvent("download",{timeout:20000});
 await save.click();
 const downloaded=await pending;
 expect(await downloaded.failure()).toBeNull();
 const bytes=await readFile((await downloaded.path())!);
 return PDFDocument.load(bytes);
}

test("PDF extract uses only requested pages and downloaded file independently reopens",async({page})=>{
 test.setTimeout(90000);
 await loadTool(page,[{name:"source.pdf",buffer:await pdfPageWidths([301,302,303])}]);
 await page.getByRole("textbox",{name:/Page range/}).fill("2-3");
 await page.getByRole("button",{name:"Extract pages",exact:true}).click();
 const reopened=await takePdf(page);
 expect(reopened.getPages().map(p=>p.getWidth())).toEqual([302,303]);
 await page.getByRole("textbox",{name:/Page range/}).fill("1");
 await expect(page.getByRole("button",{name:"Save file",exact:true})).toHaveCount(0);
 await page.getByRole("button",{name:"Extract pages",exact:true}).click();
 const first=await takePdf(page);
 expect(first.getPages().map(p=>p.getWidth())).toEqual([301]);
});

test("PDF invalid or oversized ranges fail closed; never silently export only a subset",async({page})=>{
 test.setTimeout(90000);
 await loadTool(page,[{name:"source.pdf",buffer:await pdfPageWidths([301,302,303])}]);
 for(const bad of ["1,2-foo","1-99999999","1.5-2","2-1","1,","1--2"]){
  await page.getByRole("textbox",{name:/Page range/}).fill(bad);
  await page.getByRole("button",{name:"Extract pages",exact:true}).click();
  await expect(page.locator("[data-tool-workbench] p[role=alert]")).toContainText("Enter valid pages",{timeout:15000});
  await expect(page.getByRole("button",{name:"Save file",exact:true})).toHaveCount(0);
 }
});

test("PDF rotate modifies only selected original pages in downloaded document",async({page})=>{
 test.setTimeout(90000);
 await loadTool(page,[{name:"source.pdf",buffer:await pdfPageWidths([301,302,303])}]);
 await page.getByRole("textbox",{name:/Page range/}).fill("1,3");
 await page.getByRole("button",{name:"Rotate selected pages 90°",exact:true}).click();
 const reopened=await takePdf(page);
 expect(reopened.getPages().map(p=>p.getRotation().angle)).toEqual([90,0,90]);
 expect(reopened.getPages().map(p=>p.getWidth())).toEqual([301,302,303]);
});

test("PDF merge retains page dimensions and order of both uploaded source PDFs",async({page})=>{
 test.setTimeout(90000);
 await loadTool(page,[{name:"first.pdf",buffer:await pdfPageWidths([310,320])},{name:"second.pdf",buffer:await pdfPageWidths([410])}]);
 await page.getByRole("button",{name:"Merge PDFs",exact:true}).click();
 const reopened=await takePdf(page);
 expect(reopened.getPages().map(p=>p.getWidth())).toEqual([310,320,410]);
});

test("PDF merge/split offers correctly translated page headings in all nine site languages",async({page})=>{
 test.setTimeout(90000);
 const headings:{
  lang:string;name:string
 }[]=[
  {lang:"zh",name:"PDF 合并、拆分与旋转"},
  {lang:"en",name:"Merge, Split & Rotate PDFs"},
  {lang:"ja",name:"PDFの結合・分割・回転"},
  {lang:"ko",name:"PDF 병합·분할·회전"},
  {lang:"fr",name:"Fusionner, diviser et pivoter des PDF"},
  {lang:"de",name:"PDFs zusammenfügen, teilen und drehen"},
  {lang:"es",name:"Unir, dividir y girar PDF"},
  {lang:"pt",name:"Mesclar, dividir e girar PDFs"},
  {lang:"ar",name:"دمج وتقسيم وتدوير ملفات PDF"},
 ];
 for(const {lang,name} of headings){
  await page.goto("/tools/pdf-merge-split?lang="+lang);
  await expect(page.getByRole("heading",{level:1})).toHaveText(name,{timeout:15000});
 }
});
