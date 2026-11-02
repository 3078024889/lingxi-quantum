import {test,expect} from "./export-test";
import type {Page} from "playwright";
import {PDFDocument,StandardFonts,PDFName,rgb} from "pdf-lib";
import sharp from "sharp";
import fs from "node:fs/promises";

const wb=(page:Page)=>page.locator("[data-tool-workbench]");
async function pdfFixture(pages=3){
 const d=await PDFDocument.create(),font=await d.embedFont(StandardFonts.Helvetica);
 for(let i=0;i<pages;i++){const p=d.addPage([360+i*60,500+i*50]);p.drawText("SOURCE PAGE "+(i+1),{x:32,y:420,font,size:18,color:rgb(0.1,0.1,0.1)});}
 return Buffer.from(await d.save());
}
async function upload(page:Page,slug:string,files:Array<{name:string;buffer:Buffer}>){
 await page.goto("/tools/"+slug+"?lang=en");
 await wb(page).locator('input[type="file"]').first().setInputFiles(files.map(f=>({name:f.name,mimeType:"application/pdf",buffer:f.buffer})));
}
async function download(page:Page,index=0){
 const section=wb(page).getByTestId("result-file-actions").nth(index);
 await expect(section).toBeVisible({timeout:60000});
 const wait=page.waitForEvent("download");
 await section.getByRole("button",{name:"Save file",exact:true}).click();
 const dl=await wait;expect(await dl.failure()).toBeNull();
 return await fs.readFile((await dl.path())!);
}
async function content(bytes:Buffer){
 const mod=await import("pdfjs-dist/legacy/build/pdf.mjs"),p=await mod.getDocument({data:new Uint8Array(bytes)}).promise;
 try{let s="";for(let i=1;i<=p.numPages;i++)s+=(await (await p.getPage(i)).getTextContent()).items.map((x:any)=>x.str||"").join(" ")+"\n";return s;}finally{await p.destroy()}
}

test("pdf-pages: user moves and rotates pages; prior output vanishes and exported PDF has correct order and geometry",async({page})=>{
 const data=await pdfFixture(3);
 await upload(page,"pdf-pages",[{name:"three.pdf",buffer:data}]);
 await expect(wb(page).getByRole("button",{name:"Move down",exact:true}).first()).toBeVisible();
 await wb(page).getByRole("button",{name:"Move down",exact:true}).first().click();
 await wb(page).getByRole("button",{name:"Rotate page",exact:true}).first().click();
 await wb(page).getByRole("button",{name:"Preview",exact:true}).click();
 const out=await PDFDocument.load(await download(page));
 expect(out.getPageCount()).toBe(3);
 expect(out.getPages().map(p=>p.getRotation().angle)).toEqual([90,0,0]);
 expect(out.getPages().map(p=>p.getWidth())).toEqual([420,360,480]);
 await wb(page).getByRole("button",{name:"Delete",exact:true}).first().click();
 await expect(wb(page).getByTestId("result-file-actions")).toHaveCount(0);
 await wb(page).getByRole("button",{name:"Preview",exact:true}).click();
 const second=await PDFDocument.load(await download(page));
 expect(second.getPageCount()).toBe(2);
});

test("pdf-merge-split: merging, extraction and rotation save real correct vector PDF documents",async({page})=>{
 const first=await pdfFixture(2),second=await pdfFixture(1);
 await upload(page,"pdf-merge-split",[{name:"one.pdf",buffer:first},{name:"two.pdf",buffer:second}]);
 await wb(page).getByRole("button",{name:"Merge PDFs",exact:true}).click();
 expect((await PDFDocument.load(await download(page))).getPageCount()).toBe(3);
 await wb(page).locator('input[placeholder="1-3,5,8-10"]').fill("2");
 await expect(wb(page).getByTestId("result-file-actions")).toHaveCount(0);
 await wb(page).getByRole("button",{name:"Extract pages",exact:true}).click();
 const extracted=await PDFDocument.load(await download(page));
 expect(extracted.getPageCount()).toBe(1);
 expect(extracted.getPage(0).getWidth()).toBe(420);
 await wb(page).getByRole("button",{name:"Rotate selected pages 90°",exact:true}).click();
 const rotated=await PDFDocument.load(await download(page));
 expect(rotated.getPage(1).getRotation().angle).toBe(90);
});

test("subtitle-tools: genuine SRT with 1.5 second offset saves shifted SRT, VTT and plain transcript",async({page})=>{
 await page.goto("/tools/subtitle-tools?lang=en");
 await wb(page).locator("textarea").fill("1\n00:00:01,000 --> 00:00:02,500\nHello star\n\n2\n00:00:04,000 --> 00:00:05,000\nSecond cue");
 await wb(page).locator('input[type="number"]').first().fill("1500");
 await wb(page).getByRole("button",{name:/Create SRT \/ VTT \/ TXT/}).click();
 await expect(wb(page).getByTestId("result-file-actions")).toHaveCount(3);
 const waitDownload=async(index:number)=>{
  const w=page.waitForEvent("download");
  await wb(page).getByTestId("result-file-actions").nth(index).getByRole("button",{name:"Save file",exact:true}).click();
  const d=await w;return fs.readFile((await d.path())!,"utf8");
 };
 const srt=await waitDownload(0);expect(srt).toContain("00:00:02,500 --> 00:00:04,000");
 const vtt=await waitDownload(1);expect(vtt).toContain("00:00:02.500 --> 00:00:04.000");
 const txt=await waitDownload(2);expect(txt).toContain("Second cue");expect(txt).not.toContain("-->");
 await wb(page).locator('input[type="number"]').first().fill("2000");
 await expect(wb(page).getByTestId("result-file-actions")).toHaveCount(0);
});

test("pdf-viewer-preferences: output stores actual PageLayout, PageMode and viewer settings",async({page})=>{
 await upload(page,"pdf-viewer-preferences",[{name:"reading.pdf",buffer:await pdfFixture(1)}]);
 await wb(page).locator("select").nth(0).selectOption("TwoPageLeft");
 await wb(page).locator("select").nth(1).selectOption("UseOutlines");
 await wb(page).getByRole("button",{name:"Process",exact:true}).click();
 const pdf=await PDFDocument.load(await download(page));
 expect(pdf.catalog.get(PDFName.of("PageLayout"))?.toString()).toBe("/TwoPageLeft");
 expect(pdf.catalog.get(PDFName.of("PageMode"))?.toString()).toBe("/UseOutlines");
 expect(pdf.catalog.get(PDFName.of("ViewerPreferences"))).toBeDefined();
});

test("pdf-web-optimize: browser qpdf exports valid non-rasterized text-preserving PDF",async({page})=>{
 test.setTimeout(120000);
 await upload(page,"pdf-web-optimize",[{name:"web.pdf",buffer:await pdfFixture(2)}]);
 await wb(page).getByRole("button",{name:"Process",exact:true}).click();
 const out=await download(page);
 expect((await PDFDocument.load(out)).getPageCount()).toBe(2);
 expect(await content(out)).toContain("SOURCE PAGE 1");
});

test("document-copy-layout: two genuine image sides become one A4 JPEG-backed PDF",async({page})=>{
 const front=await sharp({create:{width:180,height:105,channels:3,background:"#e12c44"}}).png().toBuffer();
 const back=await sharp({create:{width:180,height:105,channels:3,background:"#227ecc"}}).png().toBuffer();
 await page.goto("/tools/document-copy-layout?lang=en");
 const inputs=wb(page).locator('input[type="file"]');
 await inputs.nth(0).setInputFiles({name:"front.png",mimeType:"image/png",buffer:front});
 await inputs.nth(1).setInputFiles({name:"back.png",mimeType:"image/png",buffer:back});
 await wb(page).getByRole("button",{name:"Create A4 PDF",exact:true}).click();
 const pdf=await PDFDocument.load(await download(page));
 expect(pdf.getPageCount()).toBe(1);
 expect(pdf.getPage(0).getSize().width).toBeCloseTo(595.28,1);
 expect(pdf.getPage(0).getSize().height).toBeCloseTo(841.89,1);
 await wb(page).getByTestId("document-copy-tone-color").check();
 await expect(wb(page).getByTestId("result-file-actions")).toHaveCount(0);
});

test("pdf-bookmarks: real PDF with no outline honestly shows empty bookmark state",async({page})=>{
 await upload(page,"pdf-bookmarks",[{name:"no-bookmarks.pdf",buffer:await pdfFixture(1)}]);
 await wb(page).getByRole("button",{name:"Inspect PDF",exact:true}).click();
 await expect(wb(page)).toContainText("None",{timeout:60000});
 await expect(wb(page).getByTestId("result-file-actions")).toHaveCount(0);
});
