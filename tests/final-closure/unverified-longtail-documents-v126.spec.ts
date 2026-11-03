import {test,expect} from "./export-test";
import type {Page} from "playwright";
import JSZip from "jszip";
import fs from "node:fs/promises";

type Fixture={name:string;mimeType:string;buffer:Buffer};
const area=(page:Page)=>page.locator("[data-tool-workbench]");
async function upload(page:Page,slug:string,file:Fixture){
 await page.goto(`/tools/${slug}?lang=en`);
 await area(page).locator('input[type="file"]').first().setInputFiles(file);
}
async function downloaded(page:Page){
 const action=area(page).getByTestId("result-file-actions").first();
 await expect(action).toBeVisible({timeout:30000});
 const wait=page.waitForEvent("download");
 await action.getByRole("button",{name:"Save file",exact:true}).click();
 const dl=await wait;expect(await dl.failure()).toBeNull();
 return {name:dl.suggestedFilename(),contents:await fs.readFile((await dl.path())!,"utf8")};
}
async function zipFile(entries:Record<string,string>,name:string,mimeType:string):Promise<Fixture>{
 const zip=new JSZip();
 for(const [filename,content]of Object.entries(entries))zip.file(filename,content);
 return{name,mimeType,buffer:await zip.generateAsync({type:"nodebuffer",compression:"DEFLATE"})};
}
test("ics-to-csv: one real calendar event preserves UID, date and summary in downloaded CSV",async({page})=>{
 const ics="BEGIN:VCALENDAR\r\nVERSION:2.0\r\nBEGIN:VEVENT\r\nUID:event-90210\r\nDTSTART:20261102T100000Z\r\nDTEND:20261102T110000Z\r\nSUMMARY:Product review\r\nLOCATION:Online\r\nDESCRIPTION:Status call\r\nEND:VEVENT\r\nEND:VCALENDAR\r\n";
 await upload(page,"ics-to-csv",{name:"meeting.ics",mimeType:"text/calendar",buffer:Buffer.from(ics)});
 await area(page).locator(":scope > div > button").first().click();
 const out=await downloaded(page);expect(out.name).toMatch(/\.csv$/);
 expect(out.contents).toContain("Product review");expect(out.contents).toContain("event-90210");expect(out.contents).toContain("20261102T100000Z");
});
test("vcf-to-csv: UTF-8 name, phone and email remain intact in saved CSV",async({page})=>{
 const vcf="BEGIN:VCARD\r\nVERSION:3.0\r\nFN:Celestial Star\r\nN:Star;Celestial;;;\r\nTEL;TYPE=CELL:+8613900000000\r\nEMAIL:star@example.com\r\nEND:VCARD\r\n";
 await upload(page,"vcf-to-csv",{name:"contacts.vcf",mimeType:"text/vcard",buffer:Buffer.from(vcf)});
 await area(page).locator(":scope > div > button").first().click();
 const out=await downloaded(page);
 expect(out.name).toMatch(/\.csv$/);
 expect(out.contents).toContain("Celestial Star");expect(out.contents).toContain("+8613900000000");expect(out.contents).toContain("star@example.com");
});
test("odt-to-txt: actual ZIP/OpenDocument content.xml headings and paragraphs export as UTF-8 text",async({page})=>{
 const file=await zipFile({
  "mimetype":"application/vnd.oasis.opendocument.text",
  "content.xml":'<?xml version="1.0" encoding="UTF-8"?><office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0"><office:body><office:text><text:h>Research Notes</text:h><text:p>Hello ODT body</text:p></office:text></office:body></office:document-content>'
 },"notes.odt","application/vnd.oasis.opendocument.text");
 await upload(page,"odt-to-txt",file);
 await area(page).locator(":scope > div > button").first().click();
 const out=await downloaded(page);
 expect(out.name).toMatch(/\.txt$/);
 expect(out.contents).toContain("Research Notes");expect(out.contents).toContain("Hello ODT body");
});
test("epub-to-txt: actual EPUB spine chapter converts to text in reading order",async({page})=>{
 const file=await zipFile({
  "mimetype":"application/epub+zip",
  "META-INF/container.xml":'<?xml version="1.0"?><container xmlns="urn:oasis:names:tc:opendocument:xmlns:container" version="1.0"><rootfiles><rootfile full-path="OPS/book.opf" media-type="application/oebps-package+xml"/></rootfiles></container>',
  "OPS/book.opf":'<?xml version="1.0"?><package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="id"><manifest><item id="c1" href="chapter1.xhtml" media-type="application/xhtml+xml"/></manifest><spine><itemref idref="c1"/></spine></package>',
  "OPS/chapter1.xhtml":'<html xmlns="http://www.w3.org/1999/xhtml"><body><h1>First Chapter</h1><p>Original EPUB text goes here.</p></body></html>'
 },"novel.epub","application/epub+zip");
 await upload(page,"epub-to-txt",file);
 await area(page).locator(":scope > div > button").first().click();
 const out=await downloaded(page);
 expect(out.contents).toContain("First Chapter");expect(out.contents).toContain("Original EPUB text goes here.");
});
test("pptx-to-txt: real archive slide XML exports numbered text in saved UTF-8 file",async({page})=>{
 const file=await zipFile({
  "ppt/slides/slide1.xml":'<p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><p:cSld><p:spTree><a:t>Budget Overview</a:t></p:spTree></p:cSld></p:sld>',
  "ppt/slides/slide2.xml":'<p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><p:cSld><p:spTree><a:t>Action Items</a:t></p:spTree></p:cSld></p:sld>'
 },"slides.pptx","application/vnd.openxmlformats-officedocument.presentationml.presentation");
 await upload(page,"pptx-to-txt",file);
 await area(page).getByRole("button",{name:"Process now",exact:true}).click();
 const out=await downloaded(page);
 expect(out.contents).toContain("# Slide 1");expect(out.contents).toContain("Budget Overview");
 expect(out.contents).toContain("# Slide 2");expect(out.contents).toContain("Action Items");
});
test("docx-to-txt: real document.xml Unicode extracted into actual text file",async({page})=>{
 const file=await zipFile({
  "word/document.xml":'<?xml version="1.0"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>Sample research notes</w:t></w:r></w:p><w:p><w:r><w:t>Verified document text</w:t></w:r></w:p></w:body></w:document>'
 },"report.docx","application/vnd.openxmlformats-officedocument.wordprocessingml.document");
 await upload(page,"docx-to-txt",file);
 await area(page).getByRole("button",{name:"Process now",exact:true}).click();
 const out=await downloaded(page);
 expect(out.contents).toContain("Sample research notes");expect(out.contents).toContain("Verified document text");
});
