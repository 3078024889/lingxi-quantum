import{test,expect}from"playwright/test";
import{PDFDocument,StandardFonts,rgb}from"pdf-lib";
import ExcelJS from"exceljs";

async function tablePdf(){
 const pdf=await PDFDocument.create(),page=pdf.addPage([500,700]),font=await pdf.embedFont(StandardFonts.Helvetica);
 const rows=[["Name","Qty","Price"],["Apple","2","3.50"],["Pear","4","2.00"]];
 const xs=[55,245,350];let y=625;
 for(const row of rows){for(let i=0;i<row.length;i++)page.drawText(row[i],{x:xs[i],y,size:12,font});y-=28}
 return Buffer.from(await pdf.save());
}
async function imageOnlyPdf(){
 const pdf=await PDFDocument.create(),page=pdf.addPage([500,700]);
 page.drawRectangle({x:40,y:500,width:420,height:120,color:rgb(.9,.9,.9)});
 return Buffer.from(await pdf.save());
}
async function paragraphPdf(){
 const pdf=await PDFDocument.create(),page=pdf.addPage([500,700]),font=await pdf.embedFont(StandardFonts.Helvetica);
 const lines=["This is a normal paragraph, not a table.","It has several lines of prose with no repeated columns.","The converter should not invent spreadsheet structure."];
 let y=620;for(const line of lines){page.drawText(line,{x:55,y,size:12,font});y-=26}
 return Buffer.from(await pdf.save());
}

test("PDF to Excel exports a real editable XLSX from positioned table text",async({page})=>{
 await page.goto("/tools/pdf-to-xlsx?lang=en");
 await page.locator('input[type="file"]').first().setInputFiles({name:"invoice.pdf",mimeType:"application/pdf",buffer:await tablePdf()});
 await page.getByRole("button",{name:"Process now"}).click();
 await expect(page.getByText("invoice.xlsx")).toBeVisible({timeout:30000});
 const downloadPromise=page.waitForEvent("download");
 await page.getByRole("button",{name:/Save/}).click();
 const download=await downloadPromise,path=await download.path();expect(path).not.toBeNull();
 const workbook=new ExcelJS.Workbook();await workbook.xlsx.readFile(path!);
 const sheet=workbook.getWorksheet("Page 1");expect(sheet).toBeTruthy();
 const values:string[]=[];
 sheet!.eachRow(row=>row.eachCell(cell=>values.push(String(cell.value??""))));
 expect(values).toEqual(expect.arrayContaining(["Name","Qty","Price","Apple","2","3.50","Pear","4","2.00"]));
});

test("image-only PDF is routed to OCR instead of pretending table extraction succeeded",async({page})=>{
 await page.goto("/tools/pdf-to-xlsx?lang=en");
 await page.locator('input[type="file"]').first().setInputFiles({name:"scan.pdf",mimeType:"application/pdf",buffer:await imageOnlyPdf()});
 await page.getByRole("button",{name:"Process now"}).click();
 await expect(page.getByText("This PDF has no extractable text table. It may be a scanned or image-based PDF.")).toBeVisible({timeout:30000});
 await expect(page.getByText("Run PDF OCR first, then export the recognized table to Excel.")).toBeVisible();
 await page.getByRole("button",{name:"Continue with PDF OCR"}).click();
 await expect(page).toHaveURL(/\/tools\/pdf-ocr/);
 await expect(page.getByText("This scanned PDF was continued from PDF to Excel.",{exact:false})).toBeVisible({timeout:10000});
});

test("normal paragraph PDF is not falsely exported as a spreadsheet",async({page})=>{
 await page.goto("/tools/pdf-to-xlsx?lang=en");
 await page.locator('input[type="file"]').first().setInputFiles({name:"article.pdf",mimeType:"application/pdf",buffer:await paragraphPdf()});
 await page.getByRole("button",{name:"Process now"}).click();
 await expect(page.getByText("article.xlsx")).toHaveCount(0);
 await expect(page.getByText("This PDF has no extractable text table. It may be a scanned or image-based PDF.")).toBeVisible({timeout:30000});
});
