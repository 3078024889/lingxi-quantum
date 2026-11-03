import {test,expect,type Page} from "./export-test";
import {readFile} from "node:fs/promises";
import JSZip from "jszip";

const mime="application/vnd.openxmlformats-officedocument.wordprocessingml.document";
async function sourceDocx(){
 const zip=new JSZip();
 zip.file("[Content_Types].xml",'<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>');
 zip.file("_rels/.rels",'<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>');
 zip.file("word/document.xml",'<?xml version="1.0" encoding="UTF-8"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>Celestial 小仙女 &amp; 星咕咕</w:t></w:r></w:p><w:p><w:r><w:t>Second</w:t><w:tab/><w:t>Tab</w:t><w:br/><w:t>银河 123</w:t></w:r></w:p></w:body></w:document>');
 return zip.generateAsync({type:"nodebuffer",compression:"DEFLATE"});
}
async function upload(page:Page,bytes:Buffer,name="document.docx"){
 await page.goto("/tools/docx-to-txt?lang=en");
 const input=page.locator('[data-tool-workbench] input[type=file]').first();
 await expect(input).toBeEnabled({timeout:15000});
 await input.setInputFiles({name,mimeType:mime,buffer:bytes});
 await page.getByRole("button",{name:"Process now",exact:true}).click();
}
test("DOCX produces an actual UTF-8 text file with Unicode, paragraphs, tab and linebreak",async({page})=>{
 const bytes=await sourceDocx();await upload(page,bytes,"constellation.docx");
 const save=page.getByRole("button",{name:"Save file",exact:true}).first();
 await expect(save).toBeVisible({timeout:20000});
 const pending=page.waitForEvent("download",{timeout:15000});
 await save.click();
 const d=await pending;
 expect(d.suggestedFilename()).toBe("constellation.txt");
 const text=(await readFile((await d.path())!)).toString("utf8");
 expect(text).toContain("Celestial 小仙女 & 星咕咕");
 expect(text).toContain("Second\tTab\n银河 123");
 expect(text).not.toContain("<w:t>");
});
test("corrupt or empty DOCX rejects and never presents a fake download",async({page})=>{
 for(const [name,bytes] of [["not-office.docx",Buffer.from("not a zip")],["empty-office.docx",await new JSZip().file("word/document.xml","<w:document/>").generateAsync({type:"nodebuffer"})]] as const){
  await upload(page,bytes,name);
  await expect(page.getByText("Could not finish this time",{exact:true})).toBeVisible({timeout:15000});
  await expect(page.getByRole("button",{name:"Save file",exact:true})).toHaveCount(0);
 }
});
