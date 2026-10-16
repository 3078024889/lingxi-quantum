import {test,expect} from './export-test';
for(const slug of ['pdf-editor','pdf-to-jpg','compress-pdf']){
test(`${slug}: declining Office conversion sends no metadata or file bytes`,async({page})=>{
 let calls=0;
 await page.route('**/api/tools/document/**',route=>{if(!['GET','HEAD'].includes(route.request().method()))calls++;return route.fulfill({status:503,json:{error:'DOCUMENT_CONVERSION_UNAVAILABLE'}})});
 await page.goto(`/tools/${slug}?lang=en`);
 await expect(page.getByText(/Office documents are sent to the conversion service only after your confirmation/).first()).toBeVisible();
 page.once('dialog',async dialog=>{expect(dialog.message()).toContain('Send the selected documents');await dialog.dismiss()});
 const input=page.locator('input[type=file]').first();await expect(input).toBeEnabled();await input.setInputFiles({name:'private.docx',mimeType:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',buffer:Buffer.from('local fixture, never uploaded')});
 await page.evaluate(()=>new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve()))));expect(calls).toBe(0);await expect(page.getByText('private.docx',{exact:true})).toHaveCount(0);
});
test(`${slug}: accepting conversion permits the existing ticket flow and unavailable service stays visible`,async({page})=>{
 let calls=0;await page.route('**/api/tools/document/ticket',route=>{calls++;return route.fulfill({status:503,json:{error:'DOCUMENT_CONVERSION_UNAVAILABLE'}})});await page.goto(`/tools/${slug}?lang=en`);
 page.once('dialog',dialog=>dialog.accept());const input=page.locator('input[type=file]').first();await expect(input).toBeEnabled();await input.setInputFiles({name:'sample.docx',mimeType:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',buffer:Buffer.from('fixture')});
 await expect.poll(()=>calls).toBe(1);await expect(page.getByText(/Document conversion is temporarily unavailable/)).toBeVisible();
});
}
