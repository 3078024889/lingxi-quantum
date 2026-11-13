import {test,expect,type Page} from "./export-test";
import {PDFDocument} from "pdf-lib";
import sharp from "sharp";
import {readFile} from "node:fs/promises";

async function clean(page:Page,name:string,mimeType:string,buffer:Buffer){
 await page.goto("/tools/privacy-cleaner?lang=en");
 const input=page.locator('input[type="file"]').first();
 await expect(input).toBeEnabled({timeout:15000});
 await input.setInputFiles({name,mimeType,buffer});
 await page.getByRole("button",{name:"Clean & export",exact:true}).click();
 const save=page.getByRole("button",{name:"Save file",exact:true}).first();
 await expect(save).toBeVisible({timeout:30000});
 const pending=page.waitForEvent("download",{timeout:15000});
 await save.click();
 const result=await pending;
 return {name:result.suggestedFilename(),bytes:await readFile((await result.path())!)};
}

test("Privacy cleaner removes real JPEG EXIF and fixes filename after download",async({page})=>{
 const original=await sharp({create:{width:80,height:40,channels:3,background:"#aabbcc"}})
  .jpeg().withExif({IFD0:{Make:"PRIVATE_DEVICE_123"}}).toBuffer();
 expect((await sharp(original).metadata()).exif).toBeDefined();
 const {name,bytes}=await clean(page,"camera.jpeg","image/jpeg",original);
 expect(name).toBe("clean-camera.jpg");
 expect(bytes[0]).toBe(0xff);expect(bytes[1]).toBe(0xd8);
 const meta=await sharp(bytes).metadata();
 expect(meta.format).toBe("jpeg");
 expect(meta.width).toBe(80);expect(meta.height).toBe(40);
 expect(meta.exif).toBeUndefined();
});

test("Privacy cleaner WebP output retains usable WebP bytes and extension",async({page})=>{
 const original=await sharp({create:{width:64,height:36,channels:4,background:{r:90,g:120,b:150,alpha:0.6}}}).webp().toBuffer();
 const {name,bytes}=await clean(page,"photo.webp","image/webp",original);
 expect(name).toBe("clean-photo.webp");
 expect(bytes.subarray(0,4).toString("ascii")).toBe("RIFF");
 const meta=await sharp(bytes).metadata();
 expect(meta.format).toBe("webp");
 expect(meta.width).toBe(64);expect(meta.height).toBe(36);
});

test("Privacy cleaner PDF actually removes author metadata and downloaded PDF reopens",async({page})=>{
 const doc=await PDFDocument.create();doc.addPage([500,700]);doc.setAuthor("PRIVATE_AUTHOR");
 const {name,bytes}=await clean(page,"contract.pdf","application/pdf",Buffer.from(await doc.save()));
 expect(name).toBe("clean-contract.pdf");
 const verified=await PDFDocument.load(bytes,{updateMetadata:false});
 expect(verified.getPageCount()).toBe(1);
 expect(verified.context.trailerInfo.Info).toBeUndefined();
});