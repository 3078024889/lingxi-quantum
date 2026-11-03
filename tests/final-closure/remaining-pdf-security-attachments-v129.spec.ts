import {test,expect} from "./export-test";
import {PDFDocument,StandardFonts} from "pdf-lib";
import fs from "node:fs/promises";
import type {Page} from "playwright";

const wb=(page:Page)=>page.locator("[data-tool-workbench]");
async function source(){
 const pdf=await PDFDocument.create(),page=pdf.addPage([420,580]),font=await pdf.embedFont(StandardFonts.Helvetica);
 page.drawText("Private reference",{x:35,y:450,size:18,font});
 return Buffer.from(await pdf.save());
}
async function pdfUpload(page:Page,slug:string,buffer:Buffer){
 await page.goto("/tools/"+slug+"?lang=en");
 await wb(page).locator('input[type="file"]').first().setInputFiles({name:"contract.pdf",mimeType:"application/pdf",buffer});
}
async function saved(page:Page){
 const el=wb(page).getByTestId("result-file-actions").first();
 await expect(el).toBeVisible({timeout:90000});
 const pending=page.waitForEvent("download");
 await el.getByRole("button",{name:"Save file",exact:true}).click();
 const d=await pending;
 expect(await d.failure()).toBeNull();
 return fs.readFile((await d.path())!);
}
test("pdf-protect then pdf-unlock: mismatched password denied, encrypted bytes require password, correct password restores original content",async({page})=>{
 test.setTimeout(180000);
 await pdfUpload(page,"pdf-protect",await source());
 const passwords=wb(page).locator('input[type="password"]');
 await passwords.nth(0).fill("Open-Only-8271");
 await passwords.nth(1).fill("MISMATCH");
 await wb(page).getByRole("button",{name:"Process",exact:true}).click();
 await expect(wb(page).getByRole("alert")).toContainText("do not match");
 await expect(wb(page).getByTestId("result-file-actions")).toHaveCount(0);
 await passwords.nth(1).fill("Open-Only-8271");
 await passwords.nth(2).fill("Owner-8271");
 await wb(page).getByRole("button",{name:"Process",exact:true}).click();
 const encrypted=await saved(page);
 expect(encrypted.toString("latin1")).toContain("/Encrypt");
 await expect(PDFDocument.load(encrypted)).rejects.toThrow();
 await pdfUpload(page,"pdf-unlock",encrypted);
 await wb(page).locator('input[type="password"]').fill("NOT_THE_PASSWORD");
 await wb(page).getByRole("button",{name:"Process",exact:true}).click();
 await expect(wb(page).getByTestId("result-file-actions")).toHaveCount(0);
 await wb(page).locator('input[type="password"]').fill("Open-Only-8271");
 await wb(page).getByRole("button",{name:"Process",exact:true}).click();
 const clear=await saved(page);
 const pdf=await PDFDocument.load(clear);
 expect(pdf.getPageCount()).toBe(1);
 expect(clear.toString("latin1")).not.toContain("/Encrypt");
});
test("pdf-permissions: missing owner password fails closed, valid owner generates protected PDF with different bytes",async({page})=>{
 test.setTimeout(120000);
 const initial=await source();
 await pdfUpload(page,"pdf-permissions",initial);
 await wb(page).getByRole("button",{name:"Process",exact:true}).click();
 await expect(wb(page).getByRole("alert")).toContainText("owner password");
 await wb(page).locator('input[type="password"]').fill("owner-12345");
 await wb(page).locator("select").first().selectOption("none");
 await wb(page).getByRole("button",{name:"Process",exact:true}).click();
 const out=await saved(page);
 expect(out.toString("latin1")).toContain("/Encrypt");
 expect(out.equals(initial)).toBe(false);
});
test("pdf-attachments: add actual UTF-8 attachment, save/reopen, independently inspect embedded bytes",async({page})=>{
 test.setTimeout(180000);
 await pdfUpload(page,"pdf-attachments",await source());
 await wb(page).getByRole("button",{name:"Inspect PDF",exact:true}).click();
 const files=wb(page).locator('input[type="file"]');
 await files.nth(1).setInputFiles({name:"evidence.txt",mimeType:"text/plain",buffer:Buffer.from("VERIFIED ATTACHMENT 2026","utf8")});
 await wb(page).getByRole("button",{name:"Add attachment",exact:true}).click();
 const out=await saved(page);
 const pdfjs=await import("pdfjs-dist/legacy/build/pdf.mjs");
 const loaded=await pdfjs.getDocument({data:new Uint8Array(out)}).promise;
 try{
  const attachments=await loaded.getAttachments();
  const entry=Object.values(attachments||{}).find((v:any)=>String(v.filename||"").includes("evidence.txt")) as {content?:Uint8Array}|undefined;
  expect(entry).toBeDefined();
  expect(Buffer.from(entry!.content||[]).toString("utf8")).toBe("VERIFIED ATTACHMENT 2026");
 }finally{await loaded.destroy()}
});
