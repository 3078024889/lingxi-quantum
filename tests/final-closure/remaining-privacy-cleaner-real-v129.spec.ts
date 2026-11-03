import {test,expect} from "./export-test";
import {PDFDocument,StandardFonts} from "pdf-lib";
import fs from "node:fs/promises";
test("privacy-cleaner: scans real sensitive PDF document fields then produces valid cleaned PDF without private metadata",async({page})=>{
 const original=await PDFDocument.create(),font=await original.embedFont(StandardFonts.Helvetica),p=original.addPage([420,570]);
 p.drawText("Invoice content retained",{x:30,y:470,size:18,font});
 original.setTitle("SECRET CONTRACT TITLE");
 original.setAuthor("Private Alice");
 original.setSubject("Private Subject");
 original.setKeywords(["hidden","internal"]);
 const bytes=Buffer.from(await original.save());
 await page.goto("/tools/privacy-cleaner?lang=en");
 await page.locator('[data-tool-workbench] input[type="file"]').first().setInputFiles({name:"confidential.pdf",mimeType:"application/pdf",buffer:bytes});
 await page.getByRole("button",{name:"Scan metadata",exact:true}).click();
 await expect(page.locator("[data-tool-workbench]")).toContainText("confidential.pdf");
 await expect(page.locator("[data-tool-workbench]")).toContainText("PDF");
 await page.getByRole("button",{name:"Clean & export",exact:true}).click();
 const button=page.getByTestId("result-file-actions").first();
 await expect(button).toBeVisible({timeout:30000});
 const wait=page.waitForEvent("download");
 await button.getByRole("button",{name:"Save file",exact:true}).click();
 const dl=await wait;
 expect(await dl.failure()).toBeNull();
 const saved=await fs.readFile((await dl.path())!);
 const parsed=await PDFDocument.load(saved,{updateMetadata:false});
 expect(parsed.getPageCount()).toBe(1);
 expect(parsed.getAuthor()||"").not.toContain("Private Alice");
 expect(parsed.getTitle()||"").not.toContain("SECRET CONTRACT TITLE");
 expect(parsed.getSubject()||"").not.toContain("Private Subject");
 const pdfjs=await import("pdfjs-dist/legacy/build/pdf.mjs"),doc=await pdfjs.getDocument({data:new Uint8Array(saved)}).promise;
 try{
  const text=(await (await doc.getPage(1)).getTextContent()).items.map((r:any)=>r.str||"").join(" ");
  expect(text).toContain("Invoice content retained");
 }finally{await doc.destroy()}
});