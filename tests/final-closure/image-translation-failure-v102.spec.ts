import{test,expect}from'./export-test';

for(const failure of ['unavailable','empty']as const)test(`image translation ${failure} preserves paid retry and never exports a false result`,async({page})=>{
 test.setTimeout(60000);let quote:any,quotes=0,translations=0;
 await page.route('**/api/tools/quote',route=>{quotes++;const b=route.request().postDataJSON();quote={id:'isolated-image-translation',tool_id:'image-translator',quantity:b.quantity,unit_name:'image',amount_rmb:1,amount_usd:1,display_amount:1,display_currency:b.currency,currency:b.currency,metadata:b.metadata,expires_at:new Date(Date.now()+3600000).toISOString()};return route.fulfill({json:quote})});
 await page.route('**/api/tools/pay/**',route=>route.request().method()==='GET'?route.fulfill({json:{paid:true,quote}}):route.abort());
 await page.route('**/api/tools/media/translate',route=>{translations++;return failure==='empty'?route.fulfill({json:{translated:'   '}}):route.fulfill({status:503,json:{error:'SUPPLIER_SECRET_STACK'}})});
 await page.goto('/tools/image-translator?lang=en');
 const input=page.locator('input[type=file]').first();await expect(input).toBeEnabled();
 const b64=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=1000;c.height=220;const ctx=c.getContext('2d')!;ctx.fillStyle='white';ctx.fillRect(0,0,1000,220);ctx.fillStyle='black';ctx.font='bold 64px Arial';ctx.fillText('HELLO WORLD 12345',30,130);return c.toDataURL().split(',')[1]});
 await input.setInputFiles({name:'clear-own-sample.png',mimeType:'image/png',buffer:Buffer.from(b64,'base64')});
 await page.getByRole('combobox',{name:'Text in image',exact:true}).selectOption('en');
 await page.getByRole('combobox',{name:'Translate to',exact:true}).selectOption('zh');
 await page.getByRole('button',{name:'See image translation price',exact:true}).click();
 await expect(page.getByRole('button',{name:'Confirm & pay',exact:true})).toBeVisible();
 await page.evaluate(()=>window.dispatchEvent(new Event('pageshow')));
 const alert=page.locator('[data-tool-workbench]').getByRole('alert');
 await expect(alert).toContainText('Image translation could not finish',{timeout:45000});
 await expect(page.getByRole('button',{name:'Save file',exact:true})).toHaveCount(0);
 await expect(page.locator('main')).not.toContainText('SUPPLIER_SECRET_STACK');
 await expect(page.locator('main')).not.toContainText('TRANSLATE_EMPTY');
 await expect(page.getByRole('button',{name:'Resume paid task',exact:true})).toBeEnabled();
 expect(quotes).toBe(1);expect(translations).toBeGreaterThan(0);
 await expect(page.getByText('clear-own-sample.png',{exact:true}).first()).toBeVisible();
});
