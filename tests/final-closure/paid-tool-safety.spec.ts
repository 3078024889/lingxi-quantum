import {test,expect,Page} from "playwright/test";
import {PDFDocument} from "pdf-lib";
async function uploadPdf(page:Page){
 const pdf=await PDFDocument.create();for(let i=0;i<5;i++)pdf.addPage();
 await page.goto("/tools/e-sign-pdf?lang=en",{waitUntil:"domcontentloaded"});
 const input=page.locator('input[type="file"][accept*="pdf"]').first();await expect(input).toBeEnabled();
 await input.setInputFiles({name:"five-pages.pdf",mimeType:"application/pdf",buffer:Buffer.from(await pdf.save())});
 await expect(page.getByTestId("pdf-source-page-count")).toContainText(/\b5\b/);
 await expect.poll(()=>page.evaluate(()=>localStorage.getItem("lingxifield:paid-draft:latest:e-sign-pdf")||"")).not.toBe("");
}
test("PDF saves the latest edit before creating a payment quote",async({page})=>{
 let savedRange="";
 await page.route("**/api/tools/quote",async route=>{
  const id=route.request().postDataJSON().metadata.draftId;
  savedRange=await page.evaluate(id=>new Promise<string>((resolve,reject)=>{
   const request=indexedDB.open("lingxifield-paid-task-drafts",2);request.onerror=()=>reject(request.error);
   request.onsuccess=()=>{const db=request.result;const read=db.transaction("drafts","readonly").objectStore("drafts").get(id);read.onsuccess=()=>{resolve(read.result?.state?.pageRange||"");db.close()};read.onerror=()=>reject(read.error)};
  }),id);
  await route.fulfill({status:503,json:{error:"TEST_QUOTE_UNAVAILABLE"}});
 });
 await uploadPdf(page);await page.getByTestId("pdf-export-range-input").fill("2-4");
 await page.getByRole("button",{name:/Confirm price/i}).click();await expect.poll(()=>savedRange).toBe("2-4");
});
test("PDF storage failure prevents payment and preserves the editable file",async({page})=>{
 let quotes=0;await page.route("**/api/tools/quote",async route=>{quotes++;await route.fulfill({status:503,json:{error:"UNEXPECTED_QUOTE"}})});
 await uploadPdf(page);
 await page.evaluate(()=>{IDBObjectStore.prototype.put=function(){throw new DOMException("Storage unavailable","QuotaExceededError")}});
 await page.getByRole("button",{name:/Confirm price/i}).click();
 await expect(page.getByText("Your file and edits could not be saved.",{exact:false}).first()).toBeVisible();
 expect(quotes).toBe(0);await expect(page.getByTestId("pdf-source-page-count")).toContainText(/\b5\b/);
});
for(const route of ["/tools/admin","/tools/pay","/tools/burn-after-read/private-token"]) {
 test("private route never offers public sharing: "+route,async({page})=>{
  await page.goto(route,{waitUntil:"domcontentloaded"});await expect(page.locator("body")).toBeVisible();
  await expect(page.getByTestId("tool-share-open")).toHaveCount(0);
 });
}
test("switching language keeps the public share dialog open and updates its link",async({page})=>{
 await page.goto("/tools/e-sign-pdf?lang=en",{waitUntil:"domcontentloaded"});
 const trigger=page.getByTestId("tool-share-open");await expect(trigger).toBeEnabled();await trigger.click();
 const dialog=page.getByRole("dialog");await expect(dialog).toBeVisible();
 await page.evaluate(()=>window.dispatchEvent(new CustomEvent("lingxi:lang",{detail:"fr"})));
 await expect(dialog).toBeVisible();await expect(dialog.locator("input[readonly]")).toHaveValue(/\?lang=fr$/);
});

const headingCopy={"sign":["PDF电子签名与电子签章","PDF e-signatures and seals","PDFの電子署名と印鑑","PDF 전자 서명 및 도장","Signatures et tampons PDF","PDF-Unterschriften und Stempel","Firmas y sellos PDF","Assinaturas e carimbos PDF","توقيعات وأختام PDF"],"edit":["PDF 自由编辑","Edit PDF","PDFを編集","PDF 편집","Modifier un PDF","PDF bearbeiten","Editar PDF","Editar PDF","تحرير PDF"]};
test("PDF workbench headings follow all nine selected languages",async({page})=>{
 for(const [i,lang] of ["zh","en","ja","ko","fr","de","es","pt","ar"].entries()){
  for(const [kind,route] of [["sign","e-sign-pdf"],["edit","pdf-editor"]] as const){
   await page.goto("/tools/"+route+"?lang="+lang,{waitUntil:"domcontentloaded"});
   await expect(page.getByRole("heading",{level:1})).toHaveText(headingCopy[kind][i]);
  }
 }
});
