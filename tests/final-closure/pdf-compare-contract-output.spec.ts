import {test,expect,type Page} from "./export-test";
import {PDFDocument,StandardFonts} from "pdf-lib";
import {readFile} from "node:fs/promises";
async function pdfWith(lines:string[]){
 const d=await PDFDocument.create(),p=d.addPage([600,800]),font=await d.embedFont(StandardFonts.Helvetica);
 for(const [i,line] of lines.entries())p.drawText(line,{x:54,y:715-i*55,size:18,font});
 return Buffer.from(await d.save());
}
async function compare(page:Page,a:Buffer,b:Buffer){
 await page.goto("/tools/pdf-compare?lang=en");
 const picker=page.locator('input[type="file"]').first();
 await expect(picker).toBeEnabled({timeout:15000});
 await picker.setInputFiles([{name:"draft.pdf",mimeType:"application/pdf",buffer:a},{name:"signed-version.pdf",mimeType:"application/pdf",buffer:b}]);
 await page.getByRole("button",{name:/PDF Compare|PDF 比较/}).last().click();
}
test("PDF contract amount, due date and clause changes produce downloaded page-scoped Markdown",async({page})=>{
 const a=await pdfWith(["Contract Amount USD 1,200.00","Payment due 2026-11-03","Clause 2: Delivery by road"]);
 const b=await pdfWith(["Contract Amount USD 2,500.00","Payment due 2026-12-15","Clause 2: Delivery by air"]);
 await compare(page,a,b);
 const save=page.getByRole("button",{name:"Save file",exact:true}).first();
 await expect(save).toBeVisible({timeout:30000});
 const pending=page.waitForEvent("download",{timeout:15000});await save.click();
 const download=await pending;expect(download.suggestedFilename()).toBe("pdf-compare.md");
 const data=(await readFile((await download.path())!)).toString("utf8");
 for(const expected of ["Amounts / 金额","USD 1,200.00","USD 2,500.00","Dates / 日期","2026-11-03","2026-12-15","Clauses / 条款","Delivery by road","Delivery by air","Page-by-page comparison"])expect(data).toContain(expected);
 expect(data).toContain("extracted text only");
});
test("two textless PDFs cannot claim no differences or offer downloadable fake comparison",async({page})=>{
 const empty=await pdfWith([]);
 await compare(page,empty,empty);
 await expect(page.getByRole("alert")).toContainText("PDF_COMPARE_OCR_REQUIRED",{timeout:30000});
 await expect(page.getByRole("button",{name:"Save file",exact:true})).toHaveCount(0);
});
