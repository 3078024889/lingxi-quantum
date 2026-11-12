import {test,expect} from "./export-test";
import {PDFDocument,StandardFonts} from "pdf-lib";
import fs from "node:fs/promises";

async function fixture(pages:Array<{width:number;height:number;text:string}>){
 const pdf=await PDFDocument.create(),font=await pdf.embedFont(StandardFonts.Helvetica);
 for(const item of pages){const page=pdf.addPage([item.width,item.height]);page.drawText(item.text,{x:24,y:item.height-50,size:16,font})}
 return Buffer.from(await pdf.save());
}
async function exportResult(page:any){
 const panel=page.getByTestId("pdf-page-organizer");
 await panel.getByTestId("pdf-organizer-export").click();
 const save=panel.getByTestId("result-file-actions").getByRole("button",{name:"Save file",exact:true});
 await expect(save).toBeVisible({timeout:30000});
 const download=page.waitForEvent("download");
 await save.click();const file=await download;
 expect(await file.failure()).toBeNull();
 expect(file.suggestedFilename()).toMatch(/-organized\.pdf$/);
 return fs.readFile((await file.path())!);
}

test("PDF organizer: reorder, rotate, duplicate, delete, undo/redo, save and reopen preserved vector PDF",async({page})=>{
 test.setTimeout(120000);
 const first=await fixture([{width:180,height:260,text:"PAGE_A"},{width:220,height:300,text:"PAGE_B"}]);
 const second=await fixture([{width:310,height:420,text:"PAGE_C"}]);
 await page.goto("/tools/merge-pdf?lang=en");
 const area=page.locator("[data-tool-workbench]");
 await area.locator('input[type="file"]').first().setInputFiles([
  {name:"first.pdf",mimeType:"application/pdf",buffer:first},
  {name:"second.pdf",mimeType:"application/pdf",buffer:second},
 ]);
 await area.getByTestId("open-pdf-organizer").click();
 const panel=area.getByTestId("pdf-page-organizer");
 await expect(panel.getByTestId("pdf-organizer-page")).toHaveCount(3,{timeout:30000});
 await expect(panel.getByTestId("pdf-organizer-count")).toContainText("3");
 await expect(panel.getByTestId("pdf-organizer-page").first()).toContainText("first.pdf");

 // A,B,C -> A,C,B
 await panel.getByRole("button",{name:"Move back 3"}).click();
 await expect(panel.getByTestId("pdf-organizer-page").nth(1)).toContainText("second.pdf");
 // rotate C +90°, then duplicate C
 await panel.getByRole("button",{name:"Rotate 90° right 2"}).click();
 await panel.getByRole("button",{name:"Duplicate page 2"}).click();
 await expect(panel.getByTestId("pdf-organizer-page")).toHaveCount(4);
 await expect(panel.getByTestId("pdf-organizer-page").nth(2)).toContainText("second.pdf");
 // delete A, undo, redo, undo: original A restored
 await panel.getByRole("button",{name:"Delete page 1"}).click();
 await expect(panel.getByTestId("pdf-organizer-page")).toHaveCount(3);
 await panel.getByRole("button",{name:"Undo",exact:true}).click();
 await expect(panel.getByTestId("pdf-organizer-page")).toHaveCount(4);
 await panel.getByRole("button",{name:"Redo",exact:true}).click();
 await expect(panel.getByTestId("pdf-organizer-page")).toHaveCount(3);
 await panel.getByRole("button",{name:"Undo",exact:true}).click();
 const bytes=await exportResult(page);
 const doc=await PDFDocument.load(bytes);
 expect(doc.getPageCount()).toBe(4);
 expect(doc.getPages().map(p=>[p.getWidth(),p.getHeight()])).toEqual([[180,260],[310,420],[310,420],[220,300]]);
 expect(doc.getPages().map(p=>p.getRotation().angle)).toEqual([0,90,90,0]);
 const pdfjs=await import("pdfjs-dist/legacy/build/pdf.mjs");
 const rendered=await pdfjs.getDocument({data:new Uint8Array(bytes)}).promise;
 const texts=[];for(let i=1;i<=4;i++){const p=await rendered.getPage(i);texts.push((await p.getTextContent()).items.map((it:any)=>it.str||"").join(" "));}
 expect(texts[0]).toContain("PAGE_A");expect(texts[1]).toContain("PAGE_C");expect(texts[2]).toContain("PAGE_C");expect(texts[3]).toContain("PAGE_B");
 await rendered.destroy();
});

test("PDF organizer: dragging pages rearranges their exported order",async({page})=>{
 test.setTimeout(90000);
 const original=await fixture([{width:180,height:210,text:"FIRST"},{width:220,height:250,text:"SECOND"},{width:300,height:350,text:"THIRD"}]);
 await page.goto("/tools/split-pdf?lang=en");
 const area=page.locator("[data-tool-workbench]");
 await area.locator('input[type="file"]').first().setInputFiles({name:"drag.pdf",mimeType:"application/pdf",buffer:original});
 await area.getByTestId("open-pdf-organizer").click();
 const panel=area.getByTestId("pdf-page-organizer");
 await expect(panel.getByTestId("pdf-organizer-page")).toHaveCount(3,{timeout:30000});
 const cards=panel.getByTestId("pdf-organizer-page");
 await cards.nth(2).dragTo(cards.nth(0));
 const bytes=await exportResult(page);
 const doc=await PDFDocument.load(bytes);
 expect(doc.getPages().map(p=>p.getWidth())).toEqual([300,180,220]);
});

test("PDF organizer: rejects oversized page collections without discarding the original split workflow",async({page})=>{
 test.setTimeout(60000);
 const doc=await PDFDocument.create();
 for(let i=0;i<121;i++)doc.addPage([200,200]);
 const original=Buffer.from(await doc.save());
 await page.goto("/tools/split-pdf?lang=en");
 const area=page.locator("[data-tool-workbench]");
 await area.locator('input[type="file"]').first().setInputFiles({name:"too-many.pdf",mimeType:"application/pdf",buffer:original});
 await area.getByTestId("open-pdf-organizer").click();
 await expect(area.getByTestId("pdf-page-organizer").getByRole("alert")).toContainText("120",{timeout:30000});
 await expect(area.getByTestId("pdf-organizer-export")).toHaveCount(0);
 await expect(area.getByRole("button",{name:"Process now"})).toBeEnabled();
});
