import {test,expect} from './export-test';
test('global SIAI double horizontal rail and inline details',async({page})=>{
 await page.goto('/siai');
 const bar=page.locator('.siai-home-top-scroll'),grid=page.locator('.siai-home-table-scroll');
 await expect(bar).toBeVisible();await expect(grid).toBeVisible();
 await expect.poll(()=>bar.evaluate(el=>el.scrollWidth>el.clientWidth)).toBeTruthy();
 await bar.evaluate(el=>{el.scrollLeft=300;el.dispatchEvent(new Event('scroll'));});
 await expect.poll(()=>grid.evaluate(el=>el.scrollLeft)).toBeGreaterThan(200);
 await grid.evaluate(el=>{el.scrollTop=360;});
 // The page-sticky floating header is a non-interactive mirror and stays hidden until
 // the document reaches the ranking. Always assert against the real grid's header.
 await expect(grid.locator('table.siai-home-table thead th').first()).toBeVisible();
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
 // Submit from the actual browser origin; the server must reject malformed data at validation.
 const sameOrigin=await page.evaluate(async()=>{
  const result=await fetch('/api/vendor/submit',{method:'POST',headers:{'content-type':'application/json'},body:'{}'});
  const body=await result.json();
  return {status:result.status,error:body.error};
 });
 expect(sameOrigin).toEqual({status:400,error:'INVALID_SUBMISSION'});
 // A forged cross-site origin must still fail closed before body validation.
 const forged=await page.request.post('/api/vendor/submit',{headers:{origin:'https://untrusted.example'},data:{}});
 expect(forged.status()).toBe(403);
 expect((await forged.json()).error).toBe('INVALID_ORIGIN');
});
