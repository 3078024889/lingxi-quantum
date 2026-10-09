import fs from "node:fs";
import {test,expect} from "playwright/test";
import {PDFDocument} from "pdf-lib";

const png=fs.readFileSync("tests/fixtures/generated/pixel.png");
const pdf=fs.readFileSync("tests/fixtures/generated/basic.pdf");
async function saveBytes(page:any){
 const downloadPromise=page.waitForEvent("download");
 await page.getByRole("button",{name:"Save",exact:true}).last().click();
 const download=await downloadPromise;
 const file=await download.path();if(!file)throw new Error("DOWNLOAD_MISSING");
 return {name:download.suggestedFilename(),bytes:fs.readFileSync(file)};
}
test("actual PNG to JPEG export is a readable JPEG, not a file renamed jpg",async({page})=>{
 await page.goto("/tools/png-to-jpg?lang=en");
 await page.locator('input[type="file"]').first().setInputFiles({name:"sample.png",mimeType:"image/png",buffer:png});
 await page.getByRole("button",{name:/^Convert/}).click();
 await expect(page.getByText("sample.jpg")).toBeVisible();
 const output=await saveBytes(page);
 expect(output.name).toMatch(/\.jpg$/);
 expect(Array.from(output.bytes.slice(0,3))).toEqual([255,216,255]);
 expect(output.bytes.length).toBeGreaterThan(100);
});
test("actual JPEG to PNG export decodes as a PNG file",async({page})=>{
 await page.goto("/tools/jpg-to-png?lang=en");
 const jpegBase64=await page.evaluate(()=>{
  const c=document.createElement("canvas");c.width=16;c.height=16;
  const ctx=c.getContext("2d")!;ctx.fillStyle="#126cab";ctx.fillRect(0,0,16,16);
  return c.toDataURL("image/jpeg",.95).split(",")[1];
 });
 await page.locator('input[type="file"]').first().setInputFiles({name:"camera.jpg",mimeType:"image/jpeg",buffer:Buffer.from(jpegBase64,"base64")});
 await page.getByRole("button",{name:/^Convert/}).click();
 await expect(page.getByText("camera.png")).toBeVisible();
 const output=await saveBytes(page);
 expect(output.name).toMatch(/\.png$/);
 expect(output.bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))).toBeTruthy();
});
test("actual PDF merge produces two valid pages and allows downloading",async({page})=>{
 await page.goto("/tools/pdf-merge-split?lang=en");
 await page.locator('input[type="file"]').first().setInputFiles([
  {name:"first.pdf",mimeType:"application/pdf",buffer:pdf},
  {name:"second.pdf",mimeType:"application/pdf",buffer:pdf}
 ]);
 await page.getByRole("button",{name:"Merge PDFs"}).click();
 await expect(page.getByText("lingxifield-merged.pdf")).toBeVisible();
 const output=await saveBytes(page);
 expect((await PDFDocument.load(output.bytes)).getPageCount()).toBe(2);
});
test("actual PDF page extraction preserves a valid PDF",async({page})=>{
 await page.goto("/tools/pdf-merge-split?lang=en");
 await page.locator('input[type="file"]').first().setInputFiles({name:"book.pdf",mimeType:"application/pdf",buffer:pdf});
 await page.getByPlaceholder("1-3,5,8-10").fill("1");
 await page.getByRole("button",{name:"Extract pages"}).click();
 await expect(page.getByText("lingxifield-pages.pdf")).toBeVisible();
 const output=await saveBytes(page);
 expect((await PDFDocument.load(output.bytes)).getPageCount()).toBe(1);
});
