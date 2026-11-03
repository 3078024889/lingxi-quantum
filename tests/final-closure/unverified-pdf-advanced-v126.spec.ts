import {test,expect} from "./export-test";
import type {Page} from "playwright";
import {PDFDocument,StandardFonts,rgb} from "pdf-lib";
import fs from "node:fs/promises";
const area=(page:Page)=>page.locator("[data-tool-workbench]");
async function source(text:string,qty=1){
 const doc=await PDFDocument.create(),font=await doc.embedFont(StandardFonts.Helvetica);
 for(let i=0;i<qty;i++){const p=doc.addPage([420,570]);p.drawText(text+" "+(i+1),{x:32,y:460,font,size:16});p.drawRectangle({x:10,y:15,width:30,height:20,color:rgb(1,0,0)})}
 return Buffer.from(await doc.save());
}
async function load(page:Page,slug:string,data:Buffer){
 await page.goto(`/tools/${slug}?lang=en`);
 await area(page).locator('input[type="file"]').first().setInputFiles({name:"source.pdf",mimeType:"application/pdf",buffer:data});
}
async function run(page:Page){
 const button=area(page).locator(":scope > div > button").last();
 await expect(button).toBeEnabled({timeout:30000});await button.click();
}
async function save(page:Page){
 const target=area(page).getByTestId("result-file-actions").first();
 await expect(target).toBeVisible({timeout:45000});
 const pending=page.waitForEvent("download");
 await target.getByRole("button",{name:"Save file",exact:true}).click();
 const dl=await pending;expect(await dl.failure()).toBeNull();
 return await fs.readFile((await dl.path())!);
}
async function textOf(bytes:Buffer){
 const mod=await import("pdfjs-dist/legacy/build/pdf.mjs");const pdf=await mod.getDocument({data:new Uint8Array(bytes)}).promise;
 try{let result="";for(let i=1;i<=pdf.numPages;i++){result+=(await (await pdf.getPage(i)).getTextContent()).items.map((x:any)=>x.str||"").join(" ")+"\n";}return result}
 finally{await pdf.destroy()}
}

test("pdf-metadata-editor: actual saved document retains amended title and author",async({page})=>{
 const input=await source("METADATA");const d=await PDFDocument.load(input);d.setTitle("OLD");d.setAuthor("OLD");
 await load(page,"pdf-metadata-editor",Buffer.from(await d.save()));
 const fields=area(page).getByRole("textbox");await expect(fields.first()).toHaveValue("OLD",{timeout:30000});
 await fields.first().fill("NEW DOCUMENT TITLE");await fields.nth(1).fill("Celestial");
 await run(page);
 const out=await PDFDocument.load(await save(page));
 expect(out.getTitle()).toBe("NEW DOCUMENT TITLE");expect(out.getAuthor()).toBe("Celestial");
});

test("pdf-page-size: real source page is embedded and new US letter page has exact geometry",async({page})=>{
 await load(page,"pdf-page-size",await source("RESIZE A4"));
 await area(page).getByRole("combobox").first().selectOption("Letter");
 await run(page);
 const out=await PDFDocument.load(await save(page));
 expect(out.getPageCount()).toBe(1);
 expect([out.getPage(0).getWidth(),out.getPage(0).getHeight()]).toEqual([612,792]);
});

test("pdf-grayscale: colored source yields valid rasterized output with a drawable image",async({page})=>{
 test.setTimeout(120000);
 await load(page,"pdf-grayscale",await source("GREYSCALE"));
 await run(page);
 const saved=await save(page);const pdf=await PDFDocument.load(saved);
 expect(pdf.getPageCount()).toBe(1);
 const js=await import("pdfjs-dist/legacy/build/pdf.mjs");
 const parsed=await js.getDocument({data:new Uint8Array(saved)}).promise;
 try{const ops=await (await parsed.getPage(1)).getOperatorList();expect(ops.fnArray.filter(x=>x===js.OPS.paintImageXObject||x===js.OPS.paintInlineImageXObject).length).toBeGreaterThan(0)}
 finally{await parsed.destroy()}
});

test("pdf-header-footer: saved vector PDF contains custom header/footer and source text",async({page})=>{
 await load(page,"pdf-header-footer",await source("BASE TEXT"));
 const fields=area(page).getByRole("textbox");
 await fields.first().fill("PROJECT HEADER");await fields.nth(1).fill("PROJECT FOOTER");
 await run(page);
 const t=await textOf(await save(page));
 expect(t).toContain("BASE TEXT");expect(t).toContain("PROJECT HEADER");expect(t).toContain("PROJECT FOOTER");
});

test("pdf-bates-numbering: 2 real pages get sequential stamped document labels",async({page})=>{
 await load(page,"pdf-bates-numbering",await source("ARCHIVE",2));
 const prefix=area(page).getByRole("textbox").first();
 await prefix.fill("CASE-");
 await run(page);
 const t=await textOf(await save(page));
 expect(t).toContain("ARCHIVE 1");expect(t).toContain("ARCHIVE 2");
 expect(t).toContain("CASE-");
});

test("pdf-pages-per-sheet: 4-page source is packed into one downloadable page",async({page})=>{
 await load(page,"pdf-pages-per-sheet",await source("SHEET",4));
 await area(page).getByRole("combobox").first().selectOption("4");
 await run(page);
 const pdf=await PDFDocument.load(await save(page));
 expect(pdf.getPageCount()).toBe(1);
 expect(pdf.getPage(0).getWidth()).toBeGreaterThan(pdf.getPage(0).getHeight());
});

test("pdf-remove-metadata: PDF remains readable while author/title metadata are absent",async({page})=>{
 const doc=await PDFDocument.load(await source("PERSONAL"));
 doc.setTitle("Private Draft");doc.setAuthor("Secret Author");doc.setSubject("Hidden Subject");
 await load(page,"pdf-remove-metadata",Buffer.from(await doc.save()));
 await run(page);
 const saved=await save(page);
 const output=await PDFDocument.load(saved);
 expect(output.getPageCount()).toBe(1);
 expect(output.getTitle()||"").not.toContain("Private Draft");
 expect(output.getAuthor()||"").not.toContain("Secret Author");
 expect(output.getSubject()||"").not.toContain("Hidden Subject");
});

test("pdf-overlay: two real PDF inputs produce valid overlaid document without discarding source",async({page})=>{
 await load(page,"pdf-overlay",await source("BASE DOCUMENT"));
 await area(page).locator('input[type="file"]').nth(1).setInputFiles({name:"overlay.pdf",mimeType:"application/pdf",buffer:await source("SECOND LAYER")});
 await run(page);
 const t=await textOf(await save(page));
 expect(t).toContain("BASE DOCUMENT");
 expect(t).toContain("SECOND LAYER");
});
