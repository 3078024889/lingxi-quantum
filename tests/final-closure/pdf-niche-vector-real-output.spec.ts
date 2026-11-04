import {test,expect,type Page} from "./export-test";
import {readFile} from "node:fs/promises";
import {PDFDocument,StandardFonts,degrees,PDFDict,PDFName} from "pdf-lib";
import {getDocument} from "pdfjs-dist/legacy/build/pdf.mjs";

async function makeSource(count:number,rotateThird=false){
 const doc=await PDFDocument.create();
 const font=await doc.embedFont(StandardFonts.Helvetica);
 for(let i=1;i<=count;i++){
  const page=doc.addPage([200+(i%3)*20,300]);
  page.drawText("VECTOR PAGE "+i,{x:24,y:150,size:18,font});
  if(rotateThird&&i===3)page.setRotation(degrees(90));
 }
 return Buffer.from(await doc.save());
}
async function loadOutputText(bytes:Buffer){
 const task=getDocument({data:new Uint8Array(bytes),useSystemFonts:true,disableFontFace:true});
 try{
  const pdf=await task.promise;
  const texts:string[]=[];
  for(let i=1;i<=pdf.numPages;i++){
   const page=await pdf.getPage(i);
   const content=await page.getTextContent();
   texts.push(content.items.map(item=>"str" in item?item.str:"").join(" "));
  }
  return texts;
 }finally{await task.destroy()}
}
async function upload(page:Page,slug:string,source:Buffer,filename="source.pdf"){
 await page.goto("/tools/"+slug+"?lang=en");
 const input=page.locator('input[type="file"]').first();
 await expect(input).toBeEnabled({timeout:15000});
 await input.setInputFiles({name:filename,mimeType:"application/pdf",buffer:source});
 const button=page.getByRole("button",{name:"Process",exact:true});
 await expect(button).toBeEnabled({timeout:20000});
 return button;
}
async function download(page:Page){
 const save=page.getByRole("button",{name:"Save file",exact:true}).first();
 await expect(save).toBeVisible({timeout:30000});
 const pending=page.waitForEvent("download");
 await save.click();const d=await pending;
 expect(await d.failure()).toBeNull();
 return {bytes:await readFile((await d.path())!),name:d.suggestedFilename()};
}

for(const perSheet of [2,4,6,9] as const){
 test("PDF N-up "+perSheet+" preserves vector searchable page text and correct A4 sheet geometry",async({page})=>{
  test.setTimeout(120000);
  const source=await makeSource(10,true);
  const process=await upload(page,"pdf-pages-per-sheet",source);
  const combo=page.getByRole("combobox",{name:"Pages per sheet",exact:true});
  await combo.selectOption(String(perSheet));
  await process.click();
  const output=await download(page);
  expect(output.name).toBe("nup-source.pdf");
  const document=await PDFDocument.load(output.bytes);
  expect(document.getPageCount()).toBe(Math.ceil(10/perSheet));
  for(const p of document.getPages()){
   expect(p.getWidth()).toBeCloseTo(841.89,1);
   expect(p.getHeight()).toBeCloseTo(595.28,1);
  }
  const texts=(await loadOutputText(output.bytes)).join(" ");
  for(let i=1;i<=10;i++)expect(texts).toContain("VECTOR PAGE "+i);
  expect(texts.match(/VECTOR PAGE/g)).toHaveLength(10);
 });
}

test("N-up changing sheets or upload immediately invalidates outdated export",async({page})=>{
 const process=await upload(page,"pdf-pages-per-sheet",await makeSource(3));
 await process.click();
 await expect(page.getByRole("button",{name:"Save file",exact:true})).toBeVisible({timeout:25000});
 await page.getByRole("combobox",{name:"Pages per sheet",exact:true}).selectOption("2");
 await expect(page.getByRole("button",{name:"Save file",exact:true})).toHaveCount(0);
 await process.click();
 const result=await PDFDocument.load((await download(page)).bytes);
 expect(result.getPageCount()).toBe(2);
 await page.locator('input[type="file"]').first().setInputFiles({name:"new.pdf",mimeType:"application/pdf",buffer:await makeSource(1)});
 await expect(page.getByRole("button",{name:"Save file",exact:true})).toHaveCount(0);
});

test("Rasterize writes image XObjects and removes selectable PDF text without claiming secret removal",async({page})=>{
 test.setTimeout(90000);
 const process=await upload(page,"pdf-rasterize",await makeSource(2));
 await expect(page.getByText("This is not secure redaction.",{exact:false})).toBeVisible();
 await process.click();
 const output=await download(page);
 expect(output.name).toBe("rasterized-source.pdf");
 const pdf=await PDFDocument.load(output.bytes);
 expect(pdf.getPageCount()).toBe(2);
 for(const p of pdf.getPages()){
  const xobj=p.node.Resources()!.lookup(PDFName.of("XObject"),PDFDict);
  expect(xobj.keys().length).toBeGreaterThan(0);
 }
 const texts=(await loadOutputText(output.bytes)).join("").trim();
 expect(texts).toBe("");
 await page.getByRole("combobox",{name:"Render scale",exact:true}).selectOption("2");
 await expect(page.getByRole("button",{name:"Save file",exact:true})).toHaveCount(0);
});

test("Remove metadata rewrites and verifies output while preserving visible page content",async({page})=>{
 const source=await PDFDocument.create();
 const font=await source.embedFont(StandardFonts.Helvetica);
 source.addPage([222,333]).drawText("PUBLIC PAGE STAYS",{x:20,y:190,size:16,font});
 source.setTitle("PRIVATE TITLE");
 source.setAuthor("PRIVATE AUTHOR");
 source.setSubject("PRIVATE SUBJECT");
 const process=await upload(page,"pdf-remove-metadata",Buffer.from(await source.save()));
 await process.click();
 await expect(page.locator("[data-metadata-verified=true]")).toBeVisible({timeout:25000});
 const output=await download(page);
 const doc=await PDFDocument.load(output.bytes,{updateMetadata:false});
 expect(doc.getPageCount()).toBe(1);
 expect(doc.getTitle()).toBeUndefined();
 expect(doc.getAuthor()).toBeUndefined();
 expect(doc.getSubject()).toBeUndefined();
 expect((await loadOutputText(output.bytes)).join(" ")).toContain("PUBLIC PAGE STAYS");
});

test("Nine locale routes show localized titles instead of leaving hard-coded Chinese headings",async({page})=>{
 const cases=[
 ["zh","PDF 多页合一"],["en","PDF Pages per Sheet"],["ja","PDFページを1枚にまとめる"],
 ["ko","PDF 여러 페이지를 한 장에"],["fr","Plusieurs pages PDF par feuille"],
 ["de","Mehrere PDF-Seiten pro Blatt"],["es","Varias páginas PDF por hoja"],
 ["pt","Várias páginas PDF por folha"],["ar","دمج صفحات PDF في ورقة"]
 ];
 for(const [lang,title] of cases){
  await page.goto("/tools/pdf-pages-per-sheet?lang="+lang);
  await expect(page.getByRole("heading",{name:title,exact:true})).toBeVisible({timeout:15000});
 }
});
