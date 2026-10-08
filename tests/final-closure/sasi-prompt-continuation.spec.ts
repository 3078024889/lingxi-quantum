import {test,expect} from 'playwright/test';

test('chat follow-up includes previous conversation without starting paid generation',async({page})=>{
 const requests:Array<{text:string;history?:Array<{role:string;content:string}>}>=[];let paid=0;
 await page.route('**/api/sasi/experience/text',route=>{requests.push(route.request().postDataJSON());return route.fulfill({json:{state:'answer',answer:requests.length===1?'The name is Bluebird.':'Bluebird is the name.'}})});
 await page.route('**/api/sasi/byok/text',route=>{paid++;return route.fulfill({status:500,json:{error:'UNEXPECTED_PAID_CALL'}})});
 await page.goto('/sasi?mode=chat&lang=en');const composer=page.locator('textarea');await composer.fill('Remember the name Bluebird.');await composer.press('Enter');await expect(page.locator('[data-sasi-role="assistant"]')).toHaveCount(1);await composer.fill('What name did I give you?');await composer.press('Enter');await expect(page.locator('[data-sasi-role="assistant"]')).toHaveCount(2);expect(requests[1].text).toBe('What name did I give you?');expect(requests[1].history).toEqual(expect.arrayContaining([{role:'user',content:'Remember the name Bluebird.'},{role:'assistant',content:'The name is Bluebird.'}]));expect(paid).toBe(0);
});

test('explicit website workspace still performs real website creation',async({page})=>{
 const pid='66666666-6666-4666-8666-666666666666';let created=0;
 await page.route('**/api/sasi/projects',route=>{created++;expect(route.request().postDataJSON().kind).toBe('build');return route.fulfill({json:{project:{id:pid}}})});
 await page.route('**/api/sasi/projects/*/context*',route=>route.fulfill({json:{documents:[]}}));
 await page.route('**/api/sasi/learning/**',route=>route.fulfill({json:{ok:true}}));
 await page.route('**/api/sasi/experience/website',route=>route.fulfill({json:{state:'answer',website:{html:'<!doctype html><html><head></head><body><h1>Bluebird Hotel</h1></body></html>',files:[{path:'index.html',content:'<!doctype html><html><body>Bluebird Hotel</body></html>'}]}}}));
 await page.goto('/sasi?mode=website&lang=en');await expect(page.locator('[data-sasi-task="website"]')).toBeVisible();await page.locator('[data-sasi-task="website"] textarea').fill('Build a website for the Bluebird Hotel.');await page.locator('[data-sasi-task="website"] textarea').press('Enter');await expect(page.locator('[data-sasi-result-kind="website"]')).toBeVisible();expect(created).toBe(1);
});

test('image creation confirms frozen currency and displays supplier billing before sending',async({page})=>{
 let submitted=0;
 await page.route('https://image.example/bird.png',route=>route.fulfill({contentType:'image/png',body:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl6ZV8AAAAASUVORK5CYII=','base64')}));
 await page.route('**/api/sasi/byok/image',route=>{const body=route.request().postDataJSON();if(body.action==='quote'){expect(body.rightsConfirmed).toBe(true);return route.fulfill({json:{billingCurrency:'USD',task:{id:'77777777-7777-4777-8777-777777777777',estimated_fen:35}}})}submitted++;expect(body.acceptSupplierBilling).toBe(true);return route.fulfill({json:{task:{id:body.taskId,state:'succeeded',output:{imageUrl:'https://image.example/bird.png'}}}})});
 await page.goto('/sasi?mode=image&lang=en');await page.locator('section input[type="checkbox"]').check();await page.locator('textarea').fill('Draw a small blue bird.');await page.locator('textarea').press('Enter');await expect(page.getByRole('button',{name:'Confirm $0.35'})).toBeVisible();await expect(page.getByText('This is the LINGXIFIELD fee. Your connected AI service charges separately.')).toBeVisible();expect(submitted).toBe(0);await page.getByRole('button',{name:'Confirm $0.35'}).click();await expect(page.locator('[data-sasi-result-kind="image"] img')).toHaveAttribute('src','https://image.example/bird.png');expect(submitted).toBe(1);
});
