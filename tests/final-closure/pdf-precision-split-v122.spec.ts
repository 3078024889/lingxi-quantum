import {test,expect} from "./export-test";
import {PDFDocument,StandardFonts} from "pdf-lib";
import fs from "node:fs/promises";

async function sourcePdf(){
 const doc=await PDFDocument.create(),font=await doc.embedFont(StandardFonts.Helvetica);
 for(let i=1;i<=7;i++){const page=doc.addPage([200+i*10,300+i*10]);page.drawText("CONFIDENTIAL_PAGE_"+i,{x:18,y:170,size:12,font});}
 return Buffer.from(await doc.save());
}
async function upload(page:any,mode:string,range?:string,n?:string){
 await page.goto("/tools/split-pdf?lang=en");
 const area=page.locator("[data-tool-workbench]");
 await area.locator('input[type="file"]').first().setInputFiles({name:"seven.pdf",mimeType:"application/pdf",buffer:await sourcePdf()});
 await area.getByTestId("pdf-split-mode").selectOption(mode);
 if(range!==undefined)await area.getByTestId("pdf-split-range").fill(range);
 if(n!==undefined)await area.getByTestId("pdf-split-group-size").fill(n);
 return area;
}
async function downloadAt(page:any,area:any,index:number){
 const buttons=area.getByTestId("result-file-actions");
 const ready=buttons.nth(index).getByRole("button",{name:"Save file",exact:true});
 await expect(ready).toBeVisible({timeout:30000});
 const pending=page.waitForEvent("download");
 await ready.click();
 const download=await pending;expect(await download.failure()).toBeNull();
 return{name:download.suggestedFilename(),doc:await PDFDocument.load(await fs.readFile((await download.path())!))};
}

test("PDF precision split: default still outputs one PDF per original page",async({page})=>{
 const area=await upload(page,"every-page");
 await area.getByRole("button",{name:"Process now"}).click();
 await expect(area.getByTestId("result-file-actions")).toHaveCount(7,{timeout:30000});
 const first=await downloadAt(page,area,0),last=await downloadAt(page,area,6);
 expect(first.name).toBe("seven-page-001.pdf");
 expect(last.name).toBe("seven-page-007.pdf");
 expect(first.doc.getPageCount()).toBe(1);
 expect(last.doc.getPage(0).getWidth()).toBe(270);
});

test("PDF precision split: selected original pages produce separate, correctly named PDFs",async({page})=>{
 const area=await upload(page,"selected-pages","5-6,2,5,last");
 await area.getByRole("button",{name:"Process now"}).click();
 await expect(area.getByTestId("result-file-actions")).toHaveCount(4,{timeout:30000});
 for(const [index,pageNo]of [2,5,6,7].entries()){
  const result=await downloadAt(page,area,index);
  expect(result.name).toBe(`seven-page-${String(pageNo).padStart(3,"0")}.pdf`);
  expect(result.doc.getPageCount()).toBe(1);
  expect(result.doc.getPage(0).getWidth()).toBe(200+pageNo*10);
 }
});

test("PDF precision split: extract 1,3-4,last into one PDF keeps page text and vector geometry",async({page})=>{
 const area=await upload(page,"extract","1,3-4,last");
 await area.getByRole("button",{name:"Process now"}).click();
 await expect(area.getByTestId("result-file-actions")).toHaveCount(1,{timeout:30000});
 const result=await downloadAt(page,area,0);
 expect(result.name).toBe("seven-extracted.pdf");
 expect(result.doc.getPages().map(p=>p.getWidth())).toEqual([210,230,240,270]);
 const pdfjs=await import("pdfjs-dist/legacy/build/pdf.mjs");
 const bytes=new Uint8Array(await result.doc.save());
 const opened=await pdfjs.getDocument({data:bytes}).promise;
 const text:string[]=[];
 for(let p=1;p<=opened.numPages;p++){
  const pageData=await opened.getPage(p);
  text.push((await pageData.getTextContent()).items.map((item:any)=>item.str||"").join(" "));
 }
 expect(text).toEqual(["CONFIDENTIAL_PAGE_1","CONFIDENTIAL_PAGE_3","CONFIDENTIAL_PAGE_4","CONFIDENTIAL_PAGE_7"]);
 await opened.destroy();
});

test("PDF precision split: fixed groups of three retain remainder pages",async({page})=>{
 const area=await upload(page,"every-n",undefined,"3");
 await area.getByRole("button",{name:"Process now"}).click();
 await expect(area.getByTestId("result-file-actions")).toHaveCount(3,{timeout:30000});
 for(const [index,count]of [3,3,1].entries()){
  const result=await downloadAt(page,area,index);
  expect(result.name).toBe(`seven-part-${String(index+1).padStart(3,"0")}.pdf`);
  expect(result.doc.getPageCount()).toBe(count);
 }
});

test("PDF precision split: invalid or out-of-range selections fail without export",async({page})=>{
 const area=await upload(page,"extract","3-2");
 await area.getByRole("button",{name:"Process now"}).click();
 await expect(area.getByText("Invalid page selection.",{exact:false})).toBeVisible();
 await expect(area.getByTestId("result-file-actions")).toHaveCount(0);
 await area.getByTestId("pdf-split-range").fill("8");
 await area.getByRole("button",{name:"Process now"}).click();
 await expect(area.getByText("Invalid page selection.",{exact:false})).toBeVisible();
 await expect(area.getByTestId("result-file-actions")).toHaveCount(0);
 await area.getByTestId("pdf-split-mode").selectOption("every-n");
 await area.getByTestId("pdf-split-group-size").fill("0");
 await area.getByRole("button",{name:"Process now"}).click();
 await expect(area.getByText("Pages per PDF must be an integer",{exact:false})).toBeVisible();
 await expect(area.getByTestId("result-file-actions")).toHaveCount(0);
});
