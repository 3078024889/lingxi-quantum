import {test,expect,type Page} from "./export-test";
import {PDFDocument} from "pdf-lib";
import {readFile} from "node:fs/promises";

async function makePdf(widths:number[]){
 const document=await PDFDocument.create();
 for(const [i,width] of widths.entries()){const p=document.addPage([width,420]);p.drawText("P"+i,{x:30,y:390,size:16})}
 return Buffer.from(await document.save());
}
async function savePdf(page:Page){
 const button=page.getByRole("button",{name:"Save file",exact:true}).first();
 await expect(button).toBeVisible({timeout:30000});
 const future=page.waitForEvent("download",{timeout:20000});
 await button.click();
 const result=await future;
 return PDFDocument.load(await readFile((await result.path())!));
}
test("PDF page manager: reorder, rotate, remove and download the independently reopened result",async({page})=>{
 test.setTimeout(90000);
 await page.goto("/tools/pdf-pages?lang=en");
 const input=page.locator('input[type="file"]').first();
 await expect(input).toBeEnabled();
 await input.setInputFiles({name:"source.pdf",mimeType:"application/pdf",buffer:await makePdf([301,302,303])});
 const items=page.getByTestId("pdf-page-manager-item");
 await expect(items).toHaveCount(3,{timeout:20000});
 await page.getByRole("button",{name:"Preview",exact:true}).click();
 const original=await savePdf(page);
 expect(original.getPages().map(p=>p.getWidth())).toEqual([301,302,303]);

 await items.nth(1).getByRole("button",{name:"Rotate page",exact:true}).click();
 await expect(page.getByRole("button",{name:"Save file",exact:true})).toHaveCount(0);
 await items.nth(1).getByRole("button",{name:"Move up",exact:true}).click();
 await expect(items.nth(0)).toContainText("Page 2");
 await items.nth(2).getByRole("button",{name:"Delete",exact:true}).click();
 await expect(items).toHaveCount(2);
 await page.getByRole("button",{name:"Preview",exact:true}).click();
 const output=await savePdf(page);
 expect(output.getPages().map(p=>p.getWidth())).toEqual([302,301]);
 expect(output.getPages().map(p=>p.getRotation().angle)).toEqual([90,0]);

 const up=items.nth(1).getByRole("button",{name:"Move up",exact:true});
 const hit=await up.boundingBox();expect(hit?.height).toBeGreaterThanOrEqual(44);
});
