import {test,expect} from "./export-test";
import {PDFDocument,StandardFonts,rgb} from "pdf-lib";
import fs from "node:fs/promises";

async function document(text:string,form=false){
 const pdf=await PDFDocument.create(),p=pdf.addPage([595,842]);
 const font=await pdf.embedFont(StandardFonts.Helvetica);
 p.drawText(text,{x:85,y:712,size:24,font,color:rgb(.1,.1,.1)});
 pdf.setTitle("Sensitive Example Title");
 pdf.setAuthor("Private Source Author");
 if(form){const field=pdf.getForm().createTextField("internal.project");
  field.setText("APPROVED 123");field.addToPage(p,{x:85,y:612,width:220,height:28});
 }
 return Buffer.from(await pdf.save());
}
test("batch-pdf: actual two PDF inputs rotate, remove metadata, stamp, paginate, flatten a form, merge and independently reopen PDF",async({page})=>{
 test.setTimeout(125000);
 const quoteId="11111111-1111-4111-8111-111111111111";
 let quote:Record<string,unknown>={},quoteCount=0,paymentCalls=0;
 await page.addInitScript(()=>{window.open=()=>({} as Window)});
 await page.route("**/api/tools/quote",route=>{
  quoteCount++;const b=route.request().postDataJSON();
  expect(b.toolId).toBe("batch-pdf");expect(b.quantity).toBe(1);
  quote={id:quoteId,tool_id:"batch-pdf",quantity:1,unit_name:"batch",currency:b.currency,display_currency:b.currency,display_amount:3,amount_usd:3,amount_rmb:3,expires_at:new Date(Date.now()+3600000).toISOString(),metadata:b.metadata};
  return route.fulfill({json:quote});
 });
 await page.route("**/api/tools/pay/status**",route=>route.fulfill({json:{paid:true,quote,grant:{}}}));
 await page.route("**/api/tools/pay/create",route=>{paymentCalls++;return route.fulfill({status:403,json:{error:"REAL_PAYMENT_FORBIDDEN"}})});
 await page.goto("/tools/batch-pdf?lang=en");
 const work=page.locator("main");
 await work.locator('input[type="file"]').first().setInputFiles([
  {name:"alpha.pdf",mimeType:"application/pdf",buffer:await document("FIRST FILE 123",true)},
  {name:"beta.pdf",mimeType:"application/pdf",buffer:await document("SECOND FILE 456")}
 ]);
 await work.getByRole("combobox",{name:"Rotate every page"}).selectOption("90");
 await work.getByPlaceholder("Example: Internal").fill("Internal");
 await work.getByRole("checkbox",{name:"Add page numbers to each PDF"}).check();
 await work.getByRole("checkbox",{name:"Fix form fields into the PDF for consistent display"}).check();
 await work.getByRole("checkbox",{name:"Merge into one PDF after processing"}).check();
 await work.getByRole("button",{name:"Process 2 PDFs",exact:true}).click();
 await page.getByRole("button",{name:"Confirm & pay",exact:true}).click();
 await page.evaluate(()=>window.dispatchEvent(new Event("pageshow")));
 const result=work.getByTestId("result-file-actions");
 await expect(result).toHaveCount(1,{timeout:90000});
 const download=page.waitForEvent("download");
 await result.getByRole("button",{name:"Save file",exact:true}).click();
 const done=await download;expect(done.suggestedFilename()).toBe("lingxifield-batch-merged.pdf");expect(await done.failure()).toBeNull();
 const bytes=await fs.readFile((await done.path())!);
 expect(bytes.subarray(0,5).toString()).toBe("%PDF-");
 const reopened=await PDFDocument.load(bytes);
 expect(reopened.getPageCount()).toBe(2);
 expect(reopened.getPages().every(p=>p.getRotation().angle===90)).toBeTruthy();
 expect(reopened.getForm().getFields()).toHaveLength(0);
 expect(reopened.getAuthor()).not.toBe("Private Source Author");
 expect(reopened.getTitle()).not.toBe("Sensitive Example Title");
 const pdfjs=await import("pdfjs-dist/legacy/build/pdf.mjs");
 const doc=await pdfjs.getDocument({data:new Uint8Array(bytes)}).promise;
 const texts:string[]=[];
 for(let n=1;n<=doc.numPages;n++){
  const items=(await (await doc.getPage(n)).getTextContent()).items;
  texts.push(items.map((x:any)=>x.str||"").join(" "));
 }
 expect(texts[0]).toContain("FIRST FILE");
 expect(texts[1]).toContain("SECOND FILE");
 expect(texts.join(" ")).toContain("Internal");
 await doc.destroy();
 await work.getByPlaceholder("Example: Internal").fill("Changed");
 await expect(work.getByTestId("result-file-actions")).toHaveCount(0);
 expect(quoteCount).toBe(1);expect(paymentCalls).toBe(0);
});
