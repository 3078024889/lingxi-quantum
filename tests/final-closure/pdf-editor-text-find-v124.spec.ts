import {test,expect} from "./export-test";
import {PDFDocument,StandardFonts,rgb} from "pdf-lib";

async function makePdf(labels:string[]){
 const pdf=await PDFDocument.create(),font=await pdf.embedFont(StandardFonts.Helvetica);
 for(const label of labels){
  const page=pdf.addPage([360,500]);
  if(label)page.drawText(label,{x:35,y:420,size:17,font,color:rgb(0,0,0)});
 }
 return Buffer.from(await pdf.save());
}

test("PDF editor text find: real local search results jump to correct page without uploading PDF",async({page})=>{
 test.setTimeout(90000);
 let uploaded=0;page.on("request",request=>{if(request.method()==="POST"&&/\/api\/tools\/(upload|document\/upload)/.test(new URL(request.url()).pathname))uploaded++});
 await page.goto("/tools/pdf-editor?lang=en");
 const original=await makePdf(["Contract introduction","Invoice 837 payment total","Sign here, invoice 837 approved"]);
 await page.locator('input[type="file"]').first().setInputFiles({name:"contract.pdf",mimeType:"application/pdf",buffer:original});
 await expect(page.getByTestId("pdf-source-page-count")).toBeVisible({timeout:30000});
 const find=page.getByTestId("pdf-text-find");
 await find.locator("summary").click();
 await find.getByTestId("pdf-search-query").fill("invoice 837");
 await find.getByTestId("pdf-search-submit").click();
 await expect(find.getByTestId("pdf-search-count")).toContainText("2 matching pages",{timeout:30000});
 await expect(find.getByTestId("pdf-search-result")).toHaveCount(2);
 await expect(find.getByTestId("pdf-search-result").first()).toContainText("Page 2");
 await expect(find.getByTestId("pdf-search-result").last()).toContainText("Page 3");
 await find.getByTestId("pdf-search-result").last().click();
 await expect(page.getByTestId("pdf-page-number-input")).toHaveValue("3");
 await expect(page.getByTestId("pdf-source-preview")).toBeVisible({timeout:30000});
 expect(uploaded).toBe(0);
 await find.getByTestId("pdf-search-query").fill("nonexistent clause");
 await find.getByTestId("pdf-search-submit").click();
 await expect(find.getByTestId("pdf-search-count")).toContainText("0 matching pages");
 await expect(find).toContainText("No matching text found.");
});

test("PDF editor text find: image-only PDF explains why text search needs OCR",async({page})=>{
 const blank=await makePdf([""]);
 await page.goto("/tools/pdf-editor?lang=en");
 await page.locator('input[type="file"]').first().setInputFiles({name:"image-only.pdf",mimeType:"application/pdf",buffer:blank});
 await expect(page.getByTestId("pdf-source-page-count")).toBeVisible({timeout:30000});
 const find=page.getByTestId("pdf-text-find");
 await find.locator("summary").click();
 await find.getByTestId("pdf-search-query").fill("signature");
 await find.getByTestId("pdf-search-submit").click();
 await expect(find).toContainText("This may be a scanned PDF",{timeout:30000});
 await expect(find.getByTestId("pdf-search-result")).toHaveCount(0);
});
