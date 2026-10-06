import {test,expect} from 'playwright/test';

test('every SASI task keeps the video composer width',async({page})=>{
 await page.goto('/sasi?mode=drama&lang=zh');
 const core=()=>page.locator('[data-sasi-composer-core]:visible');
 const initial=await core().boundingBox();expect(initial).not.toBeNull();
 for(const label of ['对话','生成图片','做网站','深度研究','读书与资料','学习','生成视频']){
  await page.locator('[data-sasi-task-toolbar]:visible').getByRole('button',{name:label,exact:true}).click();
  await expect(core()).toBeVisible();const size=await core().boundingBox();expect(Math.abs(size!.width-initial!.width)).toBeLessThan(2);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
 }
});
for(const currency of ['CNY','USD'])test(currency+' paid tool accepts the existing balance (mock checkout)',async({page})=>{
 const id='33333333-3333-4333-8333-333333333333';let charges=0;
 await page.route('**/api/tools/quote?*',r=>r.fulfill({json:{id,tool_id:'pdf-editor',quantity:1,unit_name:'page',currency,display_currency:currency,display_amount:1}}));
 await page.route('**/api/pay/providers',r=>r.fulfill({json:{wechat:false,alipay:false,paypal:false}}));
 await page.route('**/api/tools/pay/status?*',r=>r.fulfill({json:{paid:false}}));
 await page.route('**/api/tools/pay/create',r=>{expect(r.request().postDataJSON()).toMatchObject({quoteId:id,provider:'balance'});charges++;return r.fulfill({json:{ok:true,paid:true}})});
 await page.goto('/tools/pay?lang=zh&quoteId='+id);await page.getByRole('button',{name:'余额支付',exact:true}).click();await expect(page.getByRole('button',{name:'余额支付',exact:true})).toHaveCount(0);expect(charges).toBe(1);
});
test('insufficient balance leaves other payment methods available',async({page})=>{
 const id='33333333-3333-4333-8333-333333333333';
 await page.route('**/api/tools/quote?*',r=>r.fulfill({json:{id,quantity:1,unit_name:'page',currency:'CNY',display_currency:'CNY',display_amount:1}}));
 await page.route('**/api/pay/providers',r=>r.fulfill({json:{wechat:true,alipay:false,paypal:false}}));
 await page.route('**/api/tools/pay/status?*',r=>r.fulfill({json:{paid:false}}));
 await page.route('**/api/tools/pay/create',r=>r.fulfill({status:402,json:{ok:false,error:'SASI_BALANCE_INSUFFICIENT'}}));
 await page.goto('/tools/pay?lang=zh&quoteId='+id);await page.getByRole('button',{name:'余额支付',exact:true}).click();await expect(page.getByRole('alert').filter({hasText:'余额不足'})).toContainText('余额不足');await expect(page.getByRole('button',{name:/微信/})).toBeEnabled();
});
