import {test,expect} from 'playwright/test';
test('switch tasks preserves each draft',async({page})=>{
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto('/sasi?mode=website&lang=en');const website=page.locator('[data-sasi-task="website"] textarea');await website.fill('A bakery website draft');
 await page.getByRole('button',{name:/Switch task/}).click();await page.getByRole('button',{name:'Study',exact:true}).click();
 const study=page.locator('[data-sasi-task="learning"] textarea');await study.fill('Explain this chapter');
 await page.getByRole('button',{name:/Switch task/}).click();await page.getByRole('button',{name:'Build a website',exact:true}).click();await expect(website).toHaveValue('A bakery website draft');
 await page.getByRole('button',{name:/Switch task/}).click();await page.getByRole('button',{name:'Study',exact:true}).click();await expect(study).toHaveValue('Explain this chapter');expect(errors).toEqual([]);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
test('launcher Enter respects IME and Shift, accepts pasted files',async({page})=>{
 await page.goto('/sasi?lang=en');const field=page.getByPlaceholder('Tell SASI what you want to do…');await field.fill('Build a bakery website');
 await field.dispatchEvent('keydown',{key:'Enter',code:'Enter',isComposing:true,keyCode:229});await expect(page).not.toHaveURL(/mode=website/);
 await field.press('Shift+Enter');await expect(field).toHaveValue('Build a bakery website\n');
 await field.evaluate(el=>{const transfer=new DataTransfer();transfer.items.add(new File(['bakery brief'],'brief.txt',{type:'text/plain'}));el.dispatchEvent(new ClipboardEvent('paste',{clipboardData:transfer,bubbles:true,cancelable:true}))});await expect(page.getByText('brief.txt',{exact:true})).toBeVisible();
 await field.press('Enter');await expect(page.locator('[data-sasi-task="website"]')).toBeVisible();await expect(page.locator('[data-sasi-task="website"] textarea')).toHaveValue('Build a bakery website');
});
test('free website returns real pages and failure removes stale results',async({page})=>{
 const id='11111111-1111-4111-8111-111111111111';let paidCalls=0;
 await page.route('**/api/sasi/projects',route=>route.fulfill({json:{project:{id}}}));
 await page.route('**/api/sasi/projects/*/context*',route=>route.fulfill({json:{documents:[]}}));
 await page.route('**/api/sasi/learning/**',route=>route.fulfill({json:{ok:true}}));
 await page.route('**/api/sasi/byok/text',route=>{paidCalls++;return route.fulfill({status:409,json:{error:'CONNECTION_REQUIRED'}})});
 const html=(title:string)=>`<!doctype html><html><head><title>${title}</title><meta name="viewport" content="width=device-width"><meta name="description" content="A bakery"></head><body><h1>${title}</h1></body></html>`;
 let calls=0;await page.route('**/api/sasi/experience/website',route=>{calls++;return route.fulfill(calls===1?{json:{website:{html:html('Bakery'),files:[{path:'index.html',content:html('Bakery')},{path:'about.html',content:html('About the bakery')}]}}}:{status:503,json:{state:'unavailable'}})});
 await page.goto('/sasi?mode=website&lang=en');const field=page.getByPlaceholder('Ask SASI',{exact:true});await field.fill('Build a bakery website');await field.press('Enter');
 const output=page.locator('[data-sasi-result-kind="website"]');await expect(output).toBeVisible();await expect(page.getByRole('button',{name:'About the bakery',exact:true})).toBeVisible();await page.getByRole('button',{name:'About the bakery',exact:true}).click();await expect(output.locator('iframe')).toHaveAttribute('srcdoc',/About the bakery/);expect(paidCalls).toBe(0);
 const downloadPromise=page.waitForEvent('download');await output.locator('button').click();const download=await downloadPromise;expect(download.suggestedFilename()).toMatch(/\.zip$/);
 await field.fill('Try a different website');await field.press('Enter');await expect(output).not.toBeVisible();await expect(page.getByRole('status')).toBeVisible();expect(paidCalls).toBe(0);
});
for(const lang of ['zh','en','ja','ko','fr','de','es','pt','ar'])test('brand and compact footer '+lang,async({page})=>{
 await page.goto('/?lang='+lang);await expect(page.locator('.lx-v37-brand-title')).toContainText('LINGXIFIELD');
 const footer=page.locator('footer');await expect(footer).toContainText('SASI');await expect(footer.locator('details')).toHaveCount(5);await footer.locator('summary').first().click();await expect(footer.locator('details').first()).toHaveAttribute('open','');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
