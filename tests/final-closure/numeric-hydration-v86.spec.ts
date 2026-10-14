import {test,expect} from 'playwright/test';
test('numeric control stays disabled until its browser handlers are ready',async({page})=>{
 await page.route('**/_next/static/chunks/*.js',async route=>{await new Promise(resolve=>setTimeout(resolve,1200));await route.continue();});
 const response=await page.goto('/tools/pdf-crop?lang=en',{waitUntil:'commit'});const html=await response!.text();const fieldMarkup=html.match(/<input[^>]*type="number"[^>]*>/)?.[0];expect(fieldMarkup).toContain('disabled');expect(fieldMarkup).toContain('data-numeric-ready="false"');
 const field=page.locator('input[type=number]').first();await expect(field).toBeEnabled({timeout:15000});await field.fill('');await field.pressSequentially('300');await field.press('Tab');await expect(field).toHaveValue('300');
});
test('blur commits a valid native value even when an earlier input event was missed',async({page})=>{
 await page.goto('/tools/pdf-crop?lang=en');const field=page.locator('input[type=number]').first();await expect(field).toBeEnabled();await field.focus();
 await field.evaluate((element:HTMLInputElement)=>{Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value')!.set!.call(element,'300');});
 await expect(field).toHaveValue('300');await field.press('Tab');await expect(field).toHaveValue('300');await field.focus();await expect(field).toHaveValue('300');
});
