import{test,expect,type Page}from'./export-test';
import{PDFDocument}from'pdf-lib';
import{readFile}from'node:fs/promises';

async function source(page:Page){
 await page.route('**/api/preferences/currency',r=>r.fulfill({json:{accountCurrency:null,cookieCurrency:'USD',recommendedCurrency:'USD'}}));
 const d=await PDFDocument.create();d.addPage().drawText('REAL BATCH SOURCE');
 await page.goto('/tools/batch-pdf?lang=en');const input=page.locator('input[type=file]').first();await expect(input).toBeEnabled();
 await input.setInputFiles({name:'source.pdf',mimeType:'application/pdf',buffer:Buffer.from(await d.save())});
 return page.locator('[data-tool-workbench]');
}
async function isolate(page:Page){
 const state={quotes:[]as any[],paid:false,writes:0};
 await page.route('**/api/tools/quote**',async route=>{
  if(route.request().method()==='POST'){
   const body=route.request().postDataJSON();const quote={id:'batch-'+state.quotes.length,tool_id:'batch-pdf',quantity:1,unit_name:'batch',amount_rmb:3,amount_usd:3,display_amount:3,display_currency:body.currency,currency:body.currency,metadata:body.metadata,expires_at:new Date(Date.now()+60000).toISOString()};
   const saved=await page.evaluate(async id=>{const db=await new Promise<IDBDatabase>((resolve,reject)=>{const r=indexedDB.open('lingxifield-paid-task-drafts',2);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});try{return await new Promise<any>((resolve,reject)=>{const r=db.transaction('drafts').objectStore('drafts').get(id);r.onsuccess=()=>resolve(r.result?{id:r.result.id,state:r.result.state,files:r.result.files.map((f:any)=>({name:f.name,bytes:f.blob.size}))}:null);r.onerror=()=>reject(r.error)})}finally{db.close()}},body.metadata.draftId);
   expect(saved?.id).toBe(body.metadata.draftId);expect(saved.files[0].bytes).toBeGreaterThan(100);state.quotes.push({...quote,saved});return route.fulfill({json:quote});
  }
  const id=new URL(route.request().url()).searchParams.get('id'),q=state.quotes.find(x=>x.id===id);return q?route.fulfill({json:q}):route.fulfill({status:404,json:{}});
 });
 await page.route('**/api/tools/pay/**',route=>{if(route.request().method()!=='GET'){state.writes++;return route.abort()}const id=new URL(route.request().url()).searchParams.get('quoteId'),quote=state.quotes.find(q=>q.id===id);return route.fulfill({json:{paid:state.paid,quote}})});
 return state;
}

test('batch PDF option edits clear the completed export and bind the next quote to a saved new draft',async({page})=>{
 const state=await isolate(page),area=await source(page);await area.getByPlaceholder('Example: Internal',{exact:true}).fill('FIRST');
 await area.getByRole('button',{name:'Process 1 PDF',exact:true}).click();await expect(area.getByRole('button',{name:'Confirm & pay',exact:true})).toBeVisible();
 expect(state.quotes[0].saved.state.watermark).toBe('FIRST');state.paid=true;await page.evaluate(()=>window.dispatchEvent(new Event('pageshow')));await expect(area.getByRole('button',{name:'Save file',exact:true})).toBeVisible();await expect(area.getByText('Task complete',{exact:true})).toBeVisible();
 await area.getByRole('slider').fill('0.2');await expect(area.getByRole('button',{name:'Save file',exact:true})).toHaveCount(0);await expect(area.getByRole('button',{name:'Process 1 PDF',exact:true})).toBeEnabled();
 await area.getByRole('combobox').selectOption('90');await area.getByRole('button',{name:'Process 1 PDF',exact:true}).click();await expect(area.getByRole('button',{name:'Confirm & pay',exact:true})).toBeVisible();
 expect(state.quotes).toHaveLength(2);expect(state.quotes[1].metadata.draftId).not.toBe(state.quotes[0].metadata.draftId);expect(state.quotes[1].saved.state.rotation).toBe(90);expect(state.quotes[1].saved.state.watermarkOpacity).toBe(.2);
 await page.evaluate(()=>window.dispatchEvent(new Event('pageshow')));const waiting=page.waitForEvent('download');await area.getByRole('button',{name:'Save file',exact:true}).click();const doc=await PDFDocument.load(await readFile((await(await waiting).path())!));expect(doc.getPage(0).getRotation().angle).toBe(90);expect(state.writes).toBe(0);
});

test('batch PDF reload restores files and all selected options before resuming an isolated paid order',async({page})=>{
 const state=await isolate(page),area=await source(page);await area.getByRole('combobox').selectOption('180');await area.getByPlaceholder('Example: Internal',{exact:true}).fill('RESTORED');await area.getByRole('slider').fill('0.23');await area.getByRole('checkbox',{name:'Add page numbers to each PDF',exact:true}).check();
 await area.getByRole('button',{name:'Process 1 PDF',exact:true}).click();await expect(area.getByRole('button',{name:'Confirm & pay',exact:true})).toBeVisible();const quote=state.quotes[0];
 await page.goto(`/tools/batch-pdf?lang=en&resumeDraft=${quote.metadata.draftId}&resumeQuote=${quote.id}`);
 await expect(page.locator('input[type=file]').first()).toBeEnabled();await expect(area).toContainText('source.pdf');await expect(area.getByRole('combobox')).toHaveValue('180');await expect(area.getByPlaceholder('Example: Internal',{exact:true})).toHaveValue('RESTORED');await expect(area.getByRole('slider')).toHaveValue('0.23');await expect(area.getByRole('checkbox',{name:'Add page numbers to each PDF',exact:true})).toBeChecked();await expect(area.getByRole('button',{name:'Confirm & pay',exact:true})).toBeVisible();
 state.paid=true;await page.evaluate(()=>window.dispatchEvent(new Event('pageshow')));await expect(area.getByRole('button',{name:'Save file',exact:true})).toBeVisible();expect(state.quotes).toHaveLength(1);expect(state.writes).toBe(0);
});

test('batch PDF storage failure prevents quotation and payment entry',async({page})=>{
 await page.addInitScript(()=>Object.defineProperty(window,'indexedDB',{value:{open(){throw new DOMException('unavailable','QuotaExceededError')}}}));let calls=0;await page.route('**/api/tools/quote**',r=>{calls++;return r.abort()});const area=await source(page);await area.getByRole('button',{name:'Process 1 PDF',exact:true}).click();await expect(area).toContainText('Your file and edits could not be saved.');expect(calls).toBe(0);await expect(area.getByRole('button',{name:'Confirm & pay',exact:true})).toHaveCount(0);
});

test('batch PDF ignores a quote returned after its settings changed',async({page})=>{
 let release!:()=>void;const gate=new Promise<void>(r=>{release=r});let seen=false;
 await page.route('**/api/tools/quote**',async route=>{const body=route.request().postDataJSON();seen=true;await gate;return route.fulfill({json:{id:'old-config',tool_id:'batch-pdf',quantity:1,unit_name:'batch',currency:body.currency,display_currency:body.currency,display_amount:3,metadata:body.metadata,expires_at:new Date(Date.now()+60000).toISOString()}})});
 const area=await source(page);await area.getByRole('button',{name:'Process 1 PDF',exact:true}).click();await expect.poll(()=>seen).toBe(true);await area.getByPlaceholder('Example: Internal',{exact:true}).fill('NEW');release();await expect(area.getByRole('button',{name:'Process 1 PDF',exact:true})).toBeEnabled();await expect(area.getByRole('button',{name:'Confirm & pay',exact:true})).toHaveCount(0);
});
