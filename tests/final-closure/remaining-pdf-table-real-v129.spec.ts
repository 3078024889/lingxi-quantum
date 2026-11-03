import {test,expect} from "./export-test";
import {PDFDocument,StandardFonts} from "pdf-lib";
import ExcelJS from "exceljs";
import fs from "node:fs/promises";

async function pdfWithTable(){
 const doc=await PDFDocument.create(),font=await doc.embedFont(StandardFonts.Helvetica),page=doc.addPage([580,780]);
 const cells=[["Product","Quantity"],["Apple","4"],["Banana","7"],["Pear","2"]];
 for(let i=0;i<cells.length;i++){
  page.drawText(cells[i][0],{x:40,y:690-i*42,size:16,font});
  page.drawText(cells[i][1],{x:275,y:690-i*42,size:16,font});
 }
 return Buffer.from(await doc.save());
}
test("pdf-to-xlsx: real vector table is extracted as independently readable XLSX with original cell text",async({page})=>{
 test.setTimeout(120000);
 await page.goto("/tools/pdf-to-xlsx?lang=en");
 await page.locator('[data-tool-workbench] input[type="file"]').first().setInputFiles({name:"products.pdf",mimeType:"application/pdf",buffer:await pdfWithTable()});
 await page.locator("[data-tool-workbench]").getByRole("button",{name:"Process now"}).click();
 const button=page.getByTestId("result-file-actions").first();
 await expect(button).toBeVisible({timeout:60000});
 const wait=page.waitForEvent("download");
 await button.getByRole("button",{name:"Save file",exact:true}).click();
 const dl=await wait;expect(dl.suggestedFilename()).toMatch(/\.xlsx$/i);
 const output=await fs.readFile((await dl.path())!);
 const book=new ExcelJS.Workbook();
 await book.xlsx.load(output);
 const sheet=book.getWorksheet("Extracted Text");
 expect(sheet).toBeDefined();
 const records=sheet!.getSheetValues().map(row=>JSON.stringify(row||[])).join("\n");
 for(const term of ["Product","Quantity","Apple","Banana","Pear","4","7"])expect(records).toContain(term);
 expect(book.worksheets.length).toBeGreaterThanOrEqual(2);
});
test("pdf-to-xlsx: scanned/no-text PDF refuses bogus Excel output and routes to OCR",async({page})=>{
 const doc=await PDFDocument.create(),p=doc.addPage([500,700]);
 p.drawRectangle({x:30,y:40,width:400,height:600});
 await page.goto("/tools/pdf-to-xlsx?lang=en");
 await page.locator('[data-tool-workbench] input[type="file"]').first().setInputFiles({name:"scan.pdf",mimeType:"application/pdf",buffer:Buffer.from(await doc.save())});
 await page.locator("[data-tool-workbench]").getByRole("button",{name:"Process now"}).click();
 await expect(page.getByTestId("result-file-actions")).toHaveCount(0);
 await expect(page.locator("[data-tool-workbench]")).toContainText(/OCR|scanned|no extractable/i);
});