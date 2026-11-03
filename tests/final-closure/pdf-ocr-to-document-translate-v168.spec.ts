import {test,expect} from "./export-test";
import {PDFDocument} from "pdf-lib";
import sharp from "sharp";
import fs from "node:fs/promises";
// Real raster PDF -> local OCR -> single-use IndexedDB handoff -> translated
// TXT download. Only the translation provider response is isolated.
async function scan(){
 const svg='<svg xmlns="http://www.w3.org/2000/svg" width="1350" height="360"><rect width="100%" height="100%" fill="white"/><text x="55" y="235" font-family="DejaVu Sans,Arial,sans-serif" font-size="136" font-weight="bold" fill="black">HELLO 123</text></svg>';
 const png=await sharp(Buffer.from(svg)).png().toBuffer();
 const pdf=await PDFDocument.create(),p=pdf.addPage([750,240]),i=await pdf.embedPng(png);p.drawImage(i,{x:0,y:0,width:750,height:240});
 return Buffer.from(await pdf.save());
}
test("scanned PDF: real local OCR transfers one-use text directly to document translation and downloads translated TXT",async({page})=>{
 test.setTimeout(240000);
 let translateCalls=0;
 await page.route("**/api/tools/document-translate",async route=>{
  translateCalls++;
  const body=route.request().postDataJSON() as {segments:{id:string;text:string}[];target:string};
  expect(body.target).toBe("fr");
  expect(body.segments.length).toBeGreaterThan(0);
  await route.fulfill({json:{segments:body.segments.map(x=>({id:x.id,text:x.text.replace(/HELLO/gi,"BONJOUR")}))}});
 });
 await page.goto("/tools/pdf-ocr?lang=en");
 await page.locator('input[type="file"]').first().setInputFiles({name:"scan.pdf",mimeType:"application/pdf",buffer:await scan()});
 await page.getByRole("combobox",{name:"Recognition language"}).selectOption("eng");
 await page.getByRole("button",{name:"Recognize page 1 free",exact:true}).click();
 await expect(page.getByTestId("result-file-actions")).toBeVisible({timeout:180000});
 await expect(page.locator("textarea")).toHaveValue(/HELLO/i);
 await page.getByRole("button",{name:"Translate recognized text",exact:true}).click();
 await expect(page).toHaveURL(/\/tools\/document-translate\?/,{timeout:25000});
 // Native file input intentionally remains blank: handoff populates FileDropzone's
 // React file state, not a synthetic upload event.
 await expect(page.getByText("scan-ocr.txt")).toBeVisible({timeout:25000});
 await expect(page).not.toHaveURL(/handoff=/);
 await page.getByRole("combobox",{name:/Target/i}).selectOption("fr");
 await page.getByRole("button",{name:"Translate",exact:true}).click();
 const result=page.getByTestId("result-file-actions").first();
 await expect(result).toBeVisible({timeout:60000});
 const pending=page.waitForEvent("download");
 await result.getByRole("button",{name:"Save file",exact:true}).click();
 const file=await pending;
 expect(file.suggestedFilename()).toBe("fr-scan-ocr.txt");
 const bytes=await fs.readFile((await file.path())!,"utf8");
 expect(bytes.toUpperCase()).toContain("BONJOUR");
 expect(bytes).toContain("123");
 expect(translateCalls).toBeGreaterThan(0);
 await page.reload();
 await expect(page.getByText("scan-ocr.txt")).toHaveCount(0);
});
