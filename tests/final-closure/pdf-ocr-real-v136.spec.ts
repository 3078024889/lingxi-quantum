import {test,expect} from "./export-test";
import {PDFDocument} from "pdf-lib";
import sharp from "sharp";
import fs from "node:fs/promises";

async function scannedPdf(words:string){
 const svg='<svg xmlns="http://www.w3.org/2000/svg" width="1350" height="360"><rect width="100%" height="100%" fill="white"/><text x="55" y="235" font-family="DejaVu Sans,Arial,sans-serif" font-size="136" font-weight="bold" fill="black">'+words+'</text></svg>';
 const png=await sharp(Buffer.from(svg)).png().toBuffer();
 const doc=await PDFDocument.create(),page=doc.addPage([750,240]),image=await doc.embedPng(png);
 page.drawImage(image,{x:0,y:0,width:750,height:240});
 return Buffer.from(await doc.save());
}

test("pdf-ocr: real scanned PDF page becomes actual TXT via local Tesseract WASM; download matches visible text and language changes remove old result",async({page})=>{
 test.setTimeout(220000);
 const input=await scannedPdf("HELLO 123");
 await page.goto("/tools/pdf-ocr?lang=en");
 const work=page.locator("main");
 await work.locator('input[type="file"]').first().setInputFiles({name:"scan.pdf",mimeType:"application/pdf",buffer:input});
 await work.getByRole("combobox",{name:"Recognition language"}).selectOption("eng");
 await work.getByRole("button",{name:"Recognize page 1 free",exact:true}).click();
 const result=work.getByTestId("result-file-actions").first();
 await expect(result).toBeVisible({timeout:180000});
 const pending=page.waitForEvent("download");
 await result.getByRole("button",{name:"Save file",exact:true}).click();
 const download=await pending;
 expect(await download.failure()).toBeNull();
 expect(download.suggestedFilename()).toBe("scan.txt");
 const body=(await fs.readFile((await download.path())!,"utf8")).replace(/\s+/g," ").toUpperCase();
 expect(body).toContain("HELLO");expect(body).toContain("123");
 await work.getByRole("combobox",{name:"Recognition language"}).selectOption("chi_sim+eng");
 await expect(work.getByTestId("result-file-actions")).toHaveCount(0);
 await expect(work.locator("textarea")).toHaveCount(0);
});

test("pdf-ocr: an image-only blank PDF refuses to publish empty OCR exports",async({page})=>{
 test.setTimeout(220000);
 const blank=await sharp({create:{width:1100,height:400,channels:3,background:"white"}}).png().toBuffer();
 const doc=await PDFDocument.create(),p=doc.addPage([700,270]),i=await doc.embedPng(blank);p.drawImage(i,{x:0,y:0,width:700,height:270});
 await page.goto("/tools/pdf-ocr?lang=en");
 const work=page.locator("main");
 await work.locator('input[type="file"]').first().setInputFiles({name:"blank.pdf",mimeType:"application/pdf",buffer:Buffer.from(await doc.save())});
 await work.getByRole("combobox",{name:"Recognition language"}).selectOption("eng");
 await work.getByRole("button",{name:"Recognize page 1 free",exact:true}).click();
 await expect(work.getByRole("alert")).toBeVisible({timeout:180000});
 await expect(work.getByTestId("result-file-actions")).toHaveCount(0);
});
