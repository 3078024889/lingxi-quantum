import {test,expect} from 'playwright/test';

test('every SASI task keeps one stable composer width without task tabs',async({page})=>{
 const core=()=>page.locator('[data-sasi-composer-core]:visible');
 const routes=['drama','website','research','book','learning','chat','image'];
 let baseline:number|null=null;
 for(const mode of routes){
  await page.goto('/sasi?mode='+mode+'&lang=zh');
  await expect(page.locator('[data-sasi-task-toolbar]')).toHaveCount(0);
  await expect(core()).toBeVisible();
  const size=await core().boundingBox();expect(size).not.toBeNull();
  if(baseline===null)baseline=size!.width;
  else expect(Math.abs(size!.width-baseline)).toBeLessThan(2);
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
