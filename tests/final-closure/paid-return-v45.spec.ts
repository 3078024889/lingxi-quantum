import{test,expect,Page}from"playwright/test";
import{PDFDocument}from"pdf-lib";

async function makePdf(n:number){
 const d=await PDFDocument.create();
 for(let i=0;i<n;i++)d.addPage();
 return Buffer.from(await d.save());
}

const Q="fd136df7-0a46-4767-b730-c7412ddbce66";

async function createRecoverableDraft(page:Page,count=5){
 await page.goto("/tools/e-sign-pdf",{waitUntil:"domcontentloaded"});
 const input=page.locator('input[type="file"][accept*="pdf"]').first();
 await expect(input).toBeEnabled();
 await input.setInputFiles({name:`${count}-pages.pdf`,mimeType:"application/pdf",buffer:await makePdf(count)});
 await expect(page.getByTestId("pdf-source-page-count")).toContainText(new RegExp(`\\b${count}\\b`),{timeout:15000});
 await expect.poll(async()=>page.evaluate(()=>localStorage.getItem("lingxifield:paid-draft:latest:e-sign-pdf")||""),{timeout:10000}).not.toBe("");
 return await page.evaluate(()=>localStorage.getItem("lingxifield:paid-draft:latest:e-sign-pdf")||"");
}

test("paid PDF return restores the real task, downloads once, consumes once, then clears it",async({page})=>{
 let downloads=0,consumeCalls=0,statusCalls=0;
 page.on("download",()=>downloads++);

 await page.route("**/api/tools/pay/status?quoteId=**",async r=>{
  statusCalls++;
  await r.fulfill({status:200,json:{ok:true,paid:true,quote:{id:Q,tool_id:"e-sign-pdf",quantity:5,unit_name:"page",amount_rmb:1.9,amount_usd:1.49,currency:"CNY",display_currency:"CNY",display_amount:1.9},grant:{id:"g",consumed_at:null}}});
 });
 await page.route("**/api/tools/export/consume",async r=>{
  consumeCalls++;
  await r.fulfill({status:200,json:{ok:true}});
 });

 const draftId=await createRecoverableDraft(page,5);
 const download=page.waitForEvent("download");
 await page.goto(`/tools/e-sign-pdf?resumeDraft=${encodeURIComponent(draftId)}&resumeQuote=${Q}`,{waitUntil:"domcontentloaded"});
 await download;

 await expect.poll(()=>downloads,{timeout:10000}).toBe(1);
 await expect.poll(()=>consumeCalls,{timeout:10000}).toBe(1);
 expect(statusCalls).toBeGreaterThan(0);

 // Completed task must be cleared from the active workbench.
 await expect(page.getByTestId("pdf-source-page-count")).toHaveCount(0,{timeout:10000});
 await expect(page.getByTestId("paid-export-start")).toHaveCount(0);
 const url=new URL(page.url());
 expect(url.searchParams.has("resumeQuote")).toBeFalsy();
 expect(url.searchParams.has("resumeDraft")).toBeFalsy();

 await page.waitForTimeout(2300);
 expect(downloads).toBe(1);
 expect(consumeCalls).toBe(1);
 await expect(page.getByTestId('paid-export-result')).toBeVisible();
 const redownload=page.waitForEvent('download');
 await page.getByTestId('paid-export-result').getByRole('button',{name:/保存文件|Save file/}).click();
 await redownload;expect(downloads).toBe(2);expect(consumeCalls).toBe(1);
 await page.reload();
 await expect(page.getByTestId('paid-export-result')).toBeVisible();
 expect(downloads).toBe(2);
});

test("already consumed paid grant restores then clears the old task without another download",async({page})=>{
 let downloads=0,consumeCalls=0,statusCalls=0;
 page.on("download",()=>downloads++);

 await page.route("**/api/tools/pay/status?quoteId=**",async r=>{
  statusCalls++;
  await r.fulfill({status:200,json:{ok:true,paid:true,quote:{id:Q,tool_id:"e-sign-pdf",quantity:5,unit_name:"page",amount_rmb:1.9,amount_usd:1.49,currency:"CNY",display_currency:"CNY",display_amount:1.9},grant:{id:"g",consumed_at:new Date().toISOString()}}});
 });
 await page.route("**/api/tools/export/consume",async r=>{
  consumeCalls++;
  await r.fulfill({status:200,json:{ok:true}});
 });

 const draftId=await createRecoverableDraft(page,5);
 await page.goto(`/tools/e-sign-pdf?resumeDraft=${encodeURIComponent(draftId)}&resumeQuote=${Q}`,{waitUntil:"domcontentloaded"});

 await expect.poll(()=>statusCalls,{timeout:10000}).toBeGreaterThan(0);
 await expect(page.getByTestId("pdf-source-page-count")).toHaveCount(0,{timeout:10000});
 await page.waitForTimeout(800);

 expect(downloads).toBe(0);
 expect(consumeCalls).toBe(0);
 const url=new URL(page.url());
 expect(url.searchParams.has("resumeQuote")).toBeFalsy();
 expect(url.searchParams.has("resumeDraft")).toBeFalsy();
});

test('failed acknowledgement retries the paid task without a second automatic download',async({page})=>{
 let downloads=0,consumes=0;
 page.on('download',()=>downloads++);
 await page.route('**/api/tools/pay/status?quoteId=**',r=>r.fulfill({json:{paid:true,quote:{id:Q,tool_id:'e-sign-pdf',quantity:5,currency:'CNY',amountRmb:1.9},grant:{consumed_at:null}}}));
 await page.route('**/api/tools/export/consume',r=>{consumes++;return r.fulfill({status:consumes===1?500:200,json:consumes===1?{error:'temporary'}:{ok:true}})});
 const draft=await createRecoverableDraft(page);
 await page.goto(`/tools/e-sign-pdf?resumeDraft=${draft}&resumeQuote=${Q}`);
 const retry=page.getByRole('button',{name:/继续已付款任务|Resume paid task/});
 await expect(retry).toBeVisible();
 expect(downloads).toBe(0);
 await expect(page.locator('body')).not.toContainText('NaN');
 await retry.click();
 await expect(page.getByTestId('pdf-source-page-count')).toHaveCount(0);
 expect(consumes).toBe(2);await expect.poll(()=>downloads).toBe(1);
});
