import {test,expect} from "./export-test";
import type {Page} from "playwright";
import {PDFDocument,StandardFonts,rgb} from "pdf-lib";
import fs from "node:fs/promises";

async function makePdf(pages:string[]){
 const doc=await PDFDocument.create(),font=await doc.embedFont(StandardFonts.Helvetica);
 for(const text of pages){const page=doc.addPage([420,570]);if(text)page.drawText(text,{x:40,y:500,size:19,font,color:rgb(.15,.15,.15)})}
 return Buffer.from(await doc.save());
}
const workbench=(page:Page)=>page.locator("[data-tool-workbench]");
async function upload(page:Page,slug:string,contents:string[],names?:string[]){
 await page.goto(`/tools/${slug}?lang=en`);
 const files=await Promise.all(contents.map(async(text,i)=>({name:names?.[i]||`doc-${i+1}.pdf`,mimeType:"application/pdf",buffer:await makePdf([text])})));
 await workbench(page).locator('input[type="file"]').first().setInputFiles(files);
 return workbench(page);
}
async function press(page:Page){const area=workbench(page);await area.locator("> div > button").first().click();}
async function getSaved(page:Page){
 const actions=workbench(page).getByTestId("result-file-actions").first();
 await expect(actions).toBeVisible({timeout:30000});
 const pending=page.waitForEvent("download");
 await actions.getByRole("button",{name:"Save file",exact:true}).click();
 const downloaded=await pending;
 expect(await downloaded.failure()).toBeNull();
 return {filename:downloaded.suggestedFilename(),data:await fs.readFile((await downloaded.path())!)};
}
async function renderedText(bytes:Buffer){
 const pdfjs=await import("pdfjs-dist/legacy/build/pdf.mjs");
 const opened=await pdfjs.getDocument({data:new Uint8Array(bytes)}).promise;
 try{const page=await opened.getPage(1);return (await page.getTextContent()).items.map((item:any)=>item.str||"").join(" ")}
 finally{await opened.destroy()}
}

test("pdf-to-text: real vector source preserves page text in exported TXT",async({page})=>{
 await upload(page,"pdf-to-text",["HELLO PDF TEXT"]);
 await press(page);
 const out=await getSaved(page);
 expect(out.filename).toMatch(/\.txt$/);
 expect(out.data.toString("utf8")).toContain("HELLO PDF TEXT");
 expect(out.data.toString("utf8")).toContain("Page 1");
});

test("pdf-to-markdown: vector PDF becomes valid Markdown with heading and text",async({page})=>{
 await upload(page,"pdf-to-markdown",["ORIGINAL MARKDOWN"]);
 await press(page);
 const out=await getSaved(page);
 expect(out.filename).toMatch(/\.md$/);
 expect(out.data.toString("utf8")).toContain("# Page 1");
 expect(out.data.toString("utf8")).toContain("ORIGINAL MARKDOWN");
});

test("pdf-page-numbers: adds vector number, preserves original text and dimension",async({page})=>{
 await upload(page,"pdf-page-numbers",["PAGINATION SOURCE"]);
 await press(page);
 const out=await getSaved(page);
 const pdf=await PDFDocument.load(out.data);
 expect(pdf.getPageCount()).toBe(1);
 expect([pdf.getPage(0).getWidth(),pdf.getPage(0).getHeight()]).toEqual([420,570]);
 const text=await renderedText(out.data);
 expect(text).toContain("PAGINATION SOURCE");expect(text).toContain("1");
});

test("pdf-watermark: visible vector text watermark survives downloadable output",async({page})=>{
 const area=await upload(page,"pdf-watermark",["WATERMARK SOURCE"]);
 const field=area.locator('input[type="text"]').first();
 if(await field.count())await field.fill("REVIEWED");
 await press(page);
 const out=await getSaved(page);
 expect(out.filename).toContain("watermarked");
 const text=await renderedText(out.data);
 expect(text).toContain("WATERMARK SOURCE");
 expect(text).toContain("REVIEWED");
});

test("pdf-crop: exported actual PDF has narrowed crop box while retaining original media",async({page})=>{
 await upload(page,"pdf-crop",["CROP SOURCE"]);
 await press(page);
 const result=await PDFDocument.load((await getSaved(page)).data);
 const p=result.getPage(0);
 expect([p.getWidth(),p.getHeight()]).toEqual([420,570]);
 const crop=p.getCropBox();expect([crop.width,crop.height]).toEqual([400,550]);
});

test("pdf-flatten: form field is flattened in output and original document remains valid",async({page})=>{
 const source=await PDFDocument.create(),sheet=source.addPage([400,550]);
 const field=source.getForm().createTextField("CustomerName");
 field.setText("ALICE");field.addToPage(sheet,{x:30,y:410,width:170,height:25});
 await page.goto("/tools/pdf-flatten?lang=en");
 await workbench(page).locator('input[type="file"]').first().setInputFiles({name:"form.pdf",mimeType:"application/pdf",buffer:Buffer.from(await source.save())});
 await press(page);
 const output=await PDFDocument.load((await getSaved(page)).data);
 expect(output.getForm().getFields()).toHaveLength(0);
 expect(output.getPageCount()).toBe(1);
});

test("pdf-compare: changed source text exports Markdown diff, not false identical status",async({page})=>{
 await upload(page,"pdf-compare",["AGREEMENT PRICE 100","AGREEMENT PRICE 200"],["older.pdf","newer.pdf"]);
 await press(page);
 const out=await getSaved(page);
 expect(out.filename).toMatch(/\.md$/);
 expect(out.data.toString("utf8")).toContain("PRICE 100");
 expect(out.data.toString("utf8")).toContain("PRICE 200");
});

test("pdf-search: two real documents, matching source PDF produces truthful per-page downloadable CSV",async({page})=>{
 const area=await upload(page,"pdf-search",["FINDME ACCOUNT 29","UNRELATED CONTENT"],["one.pdf","two.pdf"]);
 const input=area.locator('input:not([type="file"])').first();
 await input.fill("FINDME");
 await area.getByRole("button",{name:/Search all PDFs|搜索所有 PDF/}).click();
 await expect(area).toContainText("one.pdf",{timeout:30000});
 const saved=await getSaved(page);
 expect(saved.filename).toMatch(/\.csv$/);
 const csv=saved.data.toString("utf8").replace(/^\uFEFF/,"");
 expect(csv).toContain('"one.pdf"');expect(csv).toContain('"1"');expect(csv).not.toContain('"two.pdf"');
});

test("pdf-inspect: real PDF structural information reports page count without writing output",async({page})=>{
 const area=await upload(page,"pdf-inspect",["INSPECT ONE"]);
 await area.getByRole("button",{name:"Inspect PDF",exact:true}).click();
 await expect(area).toContainText(/Pages/i,{timeout:45000});
 await expect(area).toContainText(/1/);
 await expect(area.getByTestId("result-file-actions")).toHaveCount(0);
});
