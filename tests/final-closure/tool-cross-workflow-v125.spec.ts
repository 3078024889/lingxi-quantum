import {test,expect} from "./export-test";
import type {Page} from "playwright";
import fs from "node:fs/promises";
import sharp from "sharp";
import {PDFDocument} from "pdf-lib";
import JSZip from "jszip";

async function downloadResult(page:Page,index=0){
 const fileAction=page.getByTestId("result-file-actions").nth(index);
 await expect(fileAction).toBeVisible({timeout:30000});
 const pending=page.waitForEvent("download");
 await fileAction.getByRole("button",{name:"Save file",exact:true}).click();
 const dl=await pending;
 expect(await dl.failure()).toBeNull();
 return {name:dl.suggestedFilename(),content:await fs.readFile((await dl.path())!)};
}
const sample=(w:number,h:number,color:string)=>sharp({create:{width:w,height:h,channels:3,background:color}}).png().toBuffer();

test("Image→PDF: fit margins work; changed options and page order invalidate old download; saved PDF preserves real geometry",async({page})=>{
 test.setTimeout(120000);
 const first=await sample(72,50,"#ed4251");
 const second=await sample(120,75,"#338ac9");
 await page.goto("/tools/image-to-pdf?lang=en");
 await page.locator('input[type="file"]').first().setInputFiles([
  {name:"red.png",mimeType:"image/png",buffer:first},
  {name:"blue.png",mimeType:"image/png",buffer:second}
 ]);
 await page.getByRole("combobox",{name:"Margin",exact:true}).selectOption("small");
 await page.getByRole("button",{name:"Create PDF",exact:true}).click();
 const firstOutput=await downloadResult(page);
 expect(firstOutput.name).toMatch(/\.pdf$/i);
 const pdf=await PDFDocument.load(firstOutput.content);
 expect(pdf.getPages().map(p=>[p.getWidth(),p.getHeight()])).toEqual([[108,86],[156,111]]);
 const margin=page.getByRole("combobox",{name:"Margin",exact:true});
 await margin.selectOption("none");
 await expect(page.getByTestId("result-file-actions")).toHaveCount(0);
 await page.getByRole("button",{name:"Create PDF",exact:true}).click();
 const noMargin=await PDFDocument.load((await downloadResult(page)).content);
 expect(noMargin.getPages().map(p=>[p.getWidth(),p.getHeight()])).toEqual([[72,50],[120,75]]);
 const up=page.getByRole("button",{name:"Up",exact:true});
 await up.nth(1).click();
 await expect(page.getByTestId("result-file-actions")).toHaveCount(0);
 await page.getByRole("button",{name:"Create PDF",exact:true}).click();
 const reordered=await PDFDocument.load((await downloadResult(page)).content);
 expect(reordered.getPages().map(p=>[p.getWidth(),p.getHeight()])).toEqual([[120,75],[72,50]]);
});

test("PNG→JPEG→PDF→JPEG: three real browser tools interoperate with valid decoded files",async({page})=>{
 test.setTimeout(120000);
 const original=await sample(80,54,"#b34237");
 await page.goto("/tools/png-to-jpg?lang=en");
 await page.locator('input[type="file"]').first().setInputFiles({name:"sample.png",mimeType:"image/png",buffer:original});
 await page.getByRole("button",{name:/^Convert(?: ·|$)/}).click();
 const jpeg=await downloadResult(page);
 expect((await sharp(jpeg.content).metadata()).format).toBe("jpeg");
 await page.goto("/tools/image-to-pdf?lang=en");
 await page.locator('input[type="file"]').first().setInputFiles({name:"converted.jpg",mimeType:"image/jpeg",buffer:jpeg.content});
 await page.getByRole("combobox",{name:"Margin",exact:true}).selectOption("none");
 await page.getByRole("button",{name:"Create PDF",exact:true}).click();
 const savedPdf=await downloadResult(page);
 const native=await PDFDocument.load(savedPdf.content);
 expect(native.getPageCount()).toBe(1);
 expect([native.getPage(0).getWidth(),native.getPage(0).getHeight()]).toEqual([80,54]);
 await page.goto("/tools/pdf-to-jpg?lang=en");
 await page.locator('input[type="file"]').first().setInputFiles({name:"converted.pdf",mimeType:"application/pdf",buffer:savedPdf.content});
 const pending=page.waitForEvent("download");
 await page.getByRole("button",{name:"Convert",exact:true}).click();
 const zipped=await pending;
 expect(await zipped.failure()).toBeNull();
 const archive=await JSZip.loadAsync(await fs.readFile((await zipped.path())!));
 const entries=Object.keys(archive.files).filter(name=>!archive.files[name].dir);
 expect(entries).toHaveLength(1);
 expect(entries[0]).toMatch(/page-001\.jpg$/);
 const resultBytes=await archive.file(entries[0])!.async("nodebuffer");
 const decoded=await sharp(resultBytes).metadata();
 expect(decoded.format).toBe("jpeg");
 expect(decoded.width).toBeGreaterThan(80);
 expect(decoded.height).toBeGreaterThan(54);
 const avg=(await sharp(resultBytes).stats()).channels.map(v=>v.mean);
 expect(avg.some(v=>v<245)).toBe(true);
});


test("Image converter: quality setting change invalidates prior downloadable output",async({page})=>{
 const bytes=await sample(84,56,"#ff8866");
 await page.goto("/tools/png-to-jpg?lang=en");
 await page.locator('input[type="file"]').first().setInputFiles({name:"quality.png",mimeType:"image/png",buffer:bytes});
 await page.getByRole("button",{name:/^Convert(?: ·|$)/}).click();
 await expect(page.getByTestId("result-file-actions")).toBeVisible();
 await page.locator('input[type="range"]').first().press("ArrowLeft");
 await expect(page.getByTestId("result-file-actions")).toHaveCount(0);
 await expect(page.getByTestId("image-before-after")).toHaveCount(0);
 await page.getByRole("button",{name:/^Convert(?: ·|$)/}).click();
 const jpeg=await downloadResult(page);
 expect((await sharp(jpeg.content).metadata()).format).toBe("jpeg");
});
