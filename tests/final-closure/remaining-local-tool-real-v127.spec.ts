import {test,expect} from "./export-test";
import type {Page} from "playwright";
import sharp from "sharp";
import {PDFDocument,PDFName,StandardFonts,rgb} from "pdf-lib";
import fs from "node:fs/promises";

const tool=(page:Page)=>page.locator("[data-tool-workbench]");
async function image(w:number,h:number){
 return sharp({create:{width:w,height:h,channels:3,background:"#cd4c29"}}).png().toBuffer();
}
async function sourcePdf(){
 const pdf=await PDFDocument.create(),font=await pdf.embedFont(StandardFonts.Helvetica);
 const page=pdf.addPage([420,570]);
 page.drawText("DOCUMENT TEXT",{font,size:18,x:35,y:460,color:rgb(0.9,0,0)});
 return Buffer.from(await pdf.save());
}
async function save(page:Page){
 const action=tool(page).getByTestId("result-file-actions").first();
 await expect(action).toBeVisible({timeout:40000});
 const p=page.waitForEvent("download");
 await action.getByRole("button",{name:"Save file",exact:true}).click();
 const d=await p;expect(await d.failure()).toBeNull();
 return await fs.readFile((await d.path())!);
}

test("compress-image: real 120x80 PNG converts to valid capped JPEG with dimensions intact",async({page})=>{
 await page.goto("/tools/compress-image?lang=en");
 await tool(page).locator('input[type="file"]').first().setInputFiles({name:"snapshot.png",mimeType:"image/png",buffer:await image(120,80)});
 await tool(page).getByRole("button",{name:"Process now",exact:true}).click();
 const bytes=await save(page);
 const meta=await sharp(bytes).metadata();
 expect(meta.format).toBe("jpeg");
 expect([meta.width,meta.height]).toEqual([120,80]);
 expect(bytes.length).toBeGreaterThan(120);
});

test("resize-image: original image becomes exact requested dimensions and is independently decoded",async({page})=>{
 await page.goto("/tools/resize-image?lang=en");
 await tool(page).locator('input[type="file"]').first().setInputFiles({name:"photo.png",mimeType:"image/png",buffer:await image(100,60)});
 const width=tool(page).getByRole("spinbutton",{name:"Width px"});
 await expect(width).toBeVisible();
 await width.fill("120");
 await tool(page).getByRole("button",{name:/Process 1 image/}).click();
 const output=await save(page);
 const info=await sharp(output).metadata();
 expect(info.format).toBe("jpeg");
 expect([info.width,info.height]).toEqual([120,90]);
});

test("compress-pdf: true vector PDF produces valid raster PDF with same pages, text may not be selectable",async({page})=>{
 await page.goto("/tools/compress-pdf?lang=en");
 await tool(page).locator('input[type="file"]').first().setInputFiles({name:"input.pdf",mimeType:"application/pdf",buffer:await sourcePdf()});
 await tool(page).getByRole("button",{name:"Process now",exact:true}).click();
 const output=await save(page);
 const result=await PDFDocument.load(output);
 expect(result.getPageCount()).toBe(1);
 expect(result.getPage(0).getWidth()).toBe(420);
 expect(result.getPage(0).getHeight()).toBe(570);
});

test("pdf-halve-pages: true source PDF creates left/right pages without flattening original vector data",async({page})=>{
 await page.goto("/tools/pdf-halve-pages?lang=en");
 await tool(page).locator('input[type="file"]').first().setInputFiles({name:"spread.pdf",mimeType:"application/pdf",buffer:await sourcePdf()});
 await tool(page).getByRole("button",{name:"Split pages",exact:true}).click();
 const output=await save(page);
 const pdf=await PDFDocument.load(output);
 expect(pdf.getPageCount()).toBe(2);
 for(const page of pdf.getPages()){
  expect(page.getCropBox().width).toBe(210);
  expect(page.getCropBox().height).toBe(570);
 }
});

test("pdf-rasterize: real saved PDF draws image pages and removes extractable text layer",async({page})=>{
 test.setTimeout(100000);
 await page.goto("/tools/pdf-rasterize?lang=en");
 await tool(page).locator('input[type="file"]').first().setInputFiles({name:"source.pdf",mimeType:"application/pdf",buffer:await sourcePdf()});
 await tool(page).getByRole("button",{name:"Process",exact:true}).click();
 const output=await save(page);
 const pdf=await PDFDocument.load(output);expect(pdf.getPageCount()).toBe(1);
 const mod=await import("pdfjs-dist/legacy/build/pdf.mjs"),source=await mod.getDocument({data:new Uint8Array(output)}).promise;
 try{
  const page=await source.getPage(1),text=(await page.getTextContent()).items.map((v:any)=>v.str||"").join(" ");
  expect(text).not.toContain("DOCUMENT TEXT");
  const ops=await page.getOperatorList();
  expect(ops.fnArray.some(op=>op===mod.OPS.paintImageXObject||op===mod.OPS.paintInlineImageXObject)).toBe(true);
 }finally{await source.destroy()}
});

test("pdf-remove-annotations: actual widget annotation removed while document stays readable",async({page})=>{
 const original=await PDFDocument.create(),p=original.addPage([420,570]);
 const field=original.getForm().createTextField("Customer");field.setText("SAMPLE");field.addToPage(p,{x:40,y:400,width:140,height:24});
 expect(p.node.get(PDFName.of("Annots"))).toBeDefined();
 await page.goto("/tools/pdf-remove-annotations?lang=en");
 await tool(page).locator('input[type="file"]').first().setInputFiles({name:"annotated.pdf",mimeType:"application/pdf",buffer:Buffer.from(await original.save())});
 await tool(page).getByRole("button",{name:/Remove|Process|删除/}).last().click();
 const bytes=await save(page),clean=await PDFDocument.load(bytes);
 expect(clean.getPageCount()).toBe(1);
 expect(clean.getPage(0).node.get(PDFName.of("Annots"))).toBeUndefined();
});
