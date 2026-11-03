import {test,expect} from "./export-test";
import {PDFDocument,StandardFonts} from "pdf-lib";
import sharp from "sharp";
import fs from "node:fs/promises";
import type {Page} from "playwright";

async function makePdf(width:number,height:number,word:string){
 const doc=await PDFDocument.create(),font=await doc.embedFont(StandardFonts.Helvetica);
 doc.addPage([width,height]).drawText(word,{font,size:16,x:30,y:height-55});
 return Buffer.from(await doc.save());
}
async function save(page:Page){
 const action=page.locator("[data-tool-workbench]").getByTestId("result-file-actions").first();
 await expect(action).toBeVisible({timeout:30000});
 const pending=page.waitForEvent("download");
 await action.getByRole("button",{name:"Save file",exact:true}).click();
 const file=await pending;
 expect(await file.failure()).toBeNull();
 return fs.readFile((await file.path())!);
}

test("PDF merge: changing order immediately removes old download and recomputes true page order",async({page})=>{
 const first=await makePdf(212,310,"FIRST"),second=await makePdf(333,440,"SECOND");
 await page.goto("/tools/merge-pdf?lang=en");
 const area=page.locator("[data-tool-workbench]");
 await area.locator('input[type="file"]').first().setInputFiles([
  {name:"first.pdf",mimeType:"application/pdf",buffer:first},
  {name:"second.pdf",mimeType:"application/pdf",buffer:second}
 ]);
 await area.getByRole("button",{name:"Process now",exact:true}).click();
 const initial=await PDFDocument.load(await save(page));
 expect(initial.getPages().map(p=>[p.getWidth(),p.getHeight()])).toEqual([[212,310],[333,440]]);
 await area.getByRole("button",{name:"Move up",exact:true}).nth(1).click();
 await expect(area.getByTestId("result-file-actions")).toHaveCount(0);
 await area.getByRole("button",{name:"Process now",exact:true}).click();
 const changed=await PDFDocument.load(await save(page));
 expect(changed.getPages().map(p=>[p.getWidth(),p.getHeight()])).toEqual([[333,440],[212,310]]);
 await area.getByRole("button",{name:"Clear",exact:true}).click();
 await expect(area.getByTestId("result-file-actions")).toHaveCount(0);
 await expect(area.getByRole("button",{name:"Process now",exact:true})).toBeDisabled();
});

test("Image compression: target KB, quality and clear all invalidate previously downloaded image",async({page})=>{
 const original=await sharp({create:{width:480,height:320,channels:3,background:"#793e68"}}).png().toBuffer();
 await page.goto("/tools/compress-image?lang=en");
 const area=page.locator("[data-tool-workbench]");
 await area.locator('input[type="file"]').first().setInputFiles({name:"photo.png",mimeType:"image/png",buffer:original});
 await area.getByRole("button",{name:"Process now",exact:true}).click();
 const bytes=await save(page);
 const meta=await sharp(bytes).metadata();
 expect(meta.format).toBe("jpeg");
 expect([meta.width,meta.height]).toEqual([480,320]);
 await area.getByRole("spinbutton",{name:"Target size (KB)"}).fill("90");
 await expect(area.getByTestId("result-file-actions")).toHaveCount(0);
 await area.getByRole("button",{name:"Process now",exact:true}).click();
 await expect(area.getByTestId("result-file-actions")).toHaveCount(1,{timeout:30000});
 await area.getByRole("spinbutton",{name:"Quality seed (0.4–0.95)"}).fill("0.65");
 await expect(area.getByTestId("result-file-actions")).toHaveCount(0);
 await area.getByRole("button",{name:"Process now",exact:true}).click();
 const latest=await sharp(await save(page)).metadata();
 expect([latest.format,latest.width,latest.height]).toEqual(["jpeg",480,320]);
 await area.getByRole("button",{name:"Clear",exact:true}).click();
 await expect(area.getByTestId("result-file-actions")).toHaveCount(0);
});
