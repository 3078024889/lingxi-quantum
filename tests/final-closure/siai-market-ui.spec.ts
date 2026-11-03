import {test,expect} from './export-test';
test('global SIAI double horizontal rail and inline details',async({page})=>{
 await page.goto('/siai');
 const bar=page.locator('.siai-home-top-scroll'),grid=page.locator('.siai-home-table-scroll');
 await expect(bar).toBeVisible();await expect(grid).toBeVisible();
 await expect.poll(()=>bar.evaluate(el=>el.scrollWidth>el.clientWidth)).toBeTruthy();
 await bar.evaluate(el=>{el.scrollLeft=300;el.dispatchEvent(new Event('scroll'));});
 await expect.poll(()=>grid.evaluate(el=>el.scrollLeft)).toBeGreaterThan(200);
 await grid.evaluate(el=>{el.scrollTop=360;});
 await expect(page.locator('.siai-home-table thead th').first()).toBeVisible();
 await expect(page.locator('.siai-home-claim')).toHaveAttribute('href',/\/siai\/claim\?lang=(zh|en|ja|ko|fr|de|es|pt|ar)/);
 const calc=page.locator('.siai-home-cost-accordion');
 await expect(calc).toBeVisible();await calc.locator('summary').click();await expect(calc.locator('.lxCostEstimate')).toBeVisible();
 await page.locator('.siai-home-actions button[aria-expanded]').first().click();
 await expect(page.getByRole('dialog')).toBeVisible();
 await expect(page.getByRole('dialog').locator('a[href^="https://"]')).not.toHaveCount(0);
 await page.keyboard.press('Escape');
 await expect(page.getByRole('dialog')).toHaveCount(0);
});
test('global SIAI scroll rail and vendor entry work at mobile width',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/siai');
 await expect(page.locator('.siai-home-top-scroll')).toBeVisible();
 await expect(page.locator('.siai-home-claim')).toBeVisible();
 const grid=page.locator('.siai-home-table-scroll');
 await expect.poll(()=>grid.evaluate(el=>el.scrollWidth>el.clientWidth)).toBeTruthy();
 await grid.evaluate(el=>{el.scrollLeft=180;el.dispatchEvent(new Event('scroll'));});
 await expect.poll(()=>page.locator('.siai-home-top-scroll').evaluate(el=>el.scrollLeft)).toBeGreaterThan(80);
});

test('main-site vendor submission is reachable and rejects invalid requests',async({page})=>{
 await page.goto('/siai/claim?lang=zh&product=chatgpt&name=ChatGPT');
 await expect(page.locator('input[name="productName"]')).toHaveValue('ChatGPT');
 await expect(page.locator('input[name="officialSite"]')).toBeVisible();
 const invalid=await page.request.post('/api/vendor/submit',{headers:{origin:new URL(page.url()).origin},data:{}});
 expect(invalid.status()).toBe(400);
});
