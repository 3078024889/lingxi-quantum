import{test,expect}from'./export-test';
import{PDFDocument}from'pdf-lib';
import{readFile}from'node:fs/promises';

test('PDF search exports actual matches and invalidates results when query or flags change',async({page})=>{
 const doc=await PDFDocument.create();for(const text of['Alpha alpha ALPHA','Beta Alpha'])doc.addPage().drawText(text);
 await page.goto('/tools/pdf-search?lang=en');const input=page.locator('input[type=file]').first();await expect(input).toBeEnabled();
 await input.setInputFiles({name:'search.pdf',mimeType:'application/pdf',buffer:Buffer.from(await doc.save())});
 const area=page.locator('[data-tool-workbench]'),query=area.locator('input:not([type])'),run=area.getByRole('button',{name:'Search all PDFs',exact:true});
 await query.fill('Alpha');await expect(area).not.toContainText('No matches in the text layer.');await run.click();
 const pending=page.waitForEvent('download');await area.getByRole('button',{name:'Save file',exact:true}).click();
 const csv=await readFile((await(await pending).path())!,'utf8');expect(csv).toContain('"search.pdf","1","3"');expect(csv).toContain('"search.pdf","2","1"');
 await query.fill('no-match');await expect(area.getByRole('button',{name:'Save file',exact:true})).toHaveCount(0);await expect(area.locator('article')).toHaveCount(0);
 await run.click();await expect(run).toBeEnabled();await expect(area).toContainText('No matches');
 await query.fill('Alpha');await run.click();await expect(area.getByRole('button',{name:'Save file',exact:true})).toBeVisible();
 await area.getByRole('checkbox',{name:'Case sensitive',exact:true}).check();await expect(area.getByRole('button',{name:'Save file',exact:true})).toHaveCount(0);
 await area.getByRole('checkbox',{name:'Regular expression',exact:true}).check();await run.click();await expect(area.locator('article')).toHaveCount(2);
 await query.fill('[');await run.click();await expect(area.getByRole('alert')).toContainText('Search did not finish.');await expect(area.getByRole('button',{name:'Save file',exact:true})).toHaveCount(0);
});

test('expensive PDF regular expression times out while the page remains responsive',async({page})=>{
 const doc=await PDFDocument.create();doc.addPage().drawText('a'.repeat(40)+'!');
 await page.goto('/tools/pdf-search?lang=en');const input=page.locator('input[type=file]').first();await expect(input).toBeEnabled();
 await input.setInputFiles({name:'bounded-regex.pdf',mimeType:'application/pdf',buffer:Buffer.from(await doc.save())});
 const area=page.locator('[data-tool-workbench]');await area.locator('input:not([type])').fill('(a+)+$');await area.getByRole('checkbox',{name:'Regular expression',exact:true}).check();
 await page.evaluate(()=>{(window as any).searchHeartbeat=0;const id=setInterval(()=>(window as any).searchHeartbeat++,20);Object.assign(window,{searchHeartbeatId:id})});
 await area.getByRole('button',{name:'Search all PDFs',exact:true}).click();await expect(area.getByRole('alert')).toContainText('Search did not finish.');
 expect(await page.evaluate(()=>{clearInterval((window as any).searchHeartbeatId);return(window as any).searchHeartbeat})).toBeGreaterThan(20);
 await expect(area.getByRole('button',{name:'Search all PDFs',exact:true})).toBeEnabled();
});
