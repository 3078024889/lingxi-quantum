import {test,expect} from 'playwright/test';
const id='33333333-3333-4333-8333-333333333333';
async function setup(page:any,currency='CNY'){
 await page.addInitScript(()=>{(window as any).__wxjs_environment='miniprogram';(window as any).wx={miniProgram:{navigateTo:({url,success}:any)=>{(window as any).__rechargeDestination=url;success()}}}});
 await page.route('**/api/tools/quote?*',(route:any)=>route.fulfill({json:{id,tool_id:'pdf-editor',quantity:1,unit_name:'page',currency,display_currency:currency,display_amount:2.5}}));
 await page.route('**/api/tools/pay/status?*',(route:any)=>route.fulfill({json:{paid:false}}));
 await page.route('**/api/pay/providers',()=>{throw Error('Native balance checkout must not initialize external providers')});
}
for(const currency of ['CNY','USD'])test('Mini Program '+currency+' tool balance checkout completes and returns to its tool',async({page})=>{
 await setup(page,currency);let charges=0;
 await page.route('**/api/tools/pay/create',route=>{expect(route.request().postDataJSON()).toMatchObject({quoteId:id,provider:'balance'});charges++;return route.fulfill({json:{ok:true,paid:true}})});
 await page.route('**/tools/temp-mail',route=>route.fulfill({contentType:'text/html',body:'<html><body>Returned to the requested tool</body></html>'}));
 await page.goto('/tools/pay?lang=zh&quoteId='+id+'&return=%2Ftools%2Ftemp-mail&code=unused&state=unused');
 await expect(page.getByRole('button',{name:'余额支付',exact:true})).toBeVisible();
 await expect(page.getByRole('button',{name:'微信',exact:true})).toHaveCount(0);
 await page.getByRole('button',{name:'余额支付',exact:true}).click();await expect(page).toHaveURL(/\/tools\/temp-mail$/);expect(charges).toBe(1);
});
test('Mini insufficient balance preserves quote and opens the native recharge page',async({page})=>{
 await setup(page);await page.route('**/api/tools/pay/create',route=>route.fulfill({status:402,json:{error:'SASI_BALANCE_INSUFFICIENT'}}));
 await page.goto('/tools/pay?lang=zh&quoteId='+id);await page.getByRole('button',{name:'余额支付',exact:true}).click();await expect(page.getByRole('alert').filter({hasText:'余额不足'})).toContainText('余额不足');
 await page.getByRole('button',{name:'余额不足？打开账户充值',exact:true}).click();await expect.poll(()=>page.evaluate(()=>(window as any).__rechargeDestination)).toBe('/pages/balance/index');await expect(page).toHaveURL(new RegExp(id));
});
test('Mini unauthenticated quote has a login link retaining the quote and tool return',async({page})=>{
 await setup(page);await page.route('**/api/tools/quote?*',route=>route.fulfill({status:401,json:{error:'请先登录'}}));
 await page.goto('/tools/pay?lang=zh&quoteId='+id+'&return=%2Ftools%2Ftemp-mail');const link=page.getByRole('link',{name:'登录后继续支付',exact:true});await expect(link).toBeVisible();const destination=new URL((await link.getAttribute('href'))!,'https://lingxifield.cn');const next=destination.searchParams.get('next')!;expect(next).toContain(id);expect(new URL(next,'https://lingxifield.cn').searchParams.get('return')).toBe('/tools/temp-mail');await expect(page.getByRole('button',{name:'余额支付',exact:true})).toHaveCount(0);
});
test('Paused mailbox sales make no new payment and recover an already paid batch (isolated adapters)',async({page})=>{
 await setup(page);let charges=0,batches=0,quotes=0;
 await page.addInitScript(({quote})=>{sessionStorage.setItem('lingxifield:temp-mail-batch-quote',quote);sessionStorage.setItem('lingxifield:temp-mail-batch-count','50')},{quote:id});
 const mailbox={id:'44444444-4444-4444-8444-444444444444',address:'isolated-preview@example.test',expiresAt:new Date(Date.now()+600000).toISOString()};
 await page.route('**/api/tools/temp-mail/recover',route=>route.fulfill({json:{box:null}}));
 await page.route('**/api/tools/temp-mail/mine',route=>route.fulfill({json:{mailboxes:[]}}));
 await page.route('**/api/tools/temp-mail/inbox?*',route=>route.fulfill({json:{messages:[],expiresAt:mailbox.expiresAt}}));
 await page.route('**/api/tools/quote',route=>{quotes++;return route.fulfill({status:503,json:{error:'TEMP_MAIL_BATCH_VALIDATION_REQUIRED'}})});
 await page.route('**/api/tools/pay/status?*',route=>route.fulfill({json:{paid:true}}));
 await page.route('**/api/tools/pay/create',route=>{charges++;return route.fulfill({status:503,json:{error:'TEMP_MAIL_BATCH_VALIDATION_REQUIRED'}})});
 await page.route('**/api/tools/temp-mail/batch',route=>{expect(route.request().postDataJSON()).toEqual({quoteId:id,count:50});batches++;return route.fulfill({json:{mailboxes:[mailbox]}})});
 await page.goto('/tools/temp-mail?mini=1&lang=zh');await expect(page.getByRole('button',{name:'批量生成暂未开放',exact:true})).toBeDisabled();await expect(page.getByText(mailbox.address,{exact:true})).toBeVisible();expect(quotes).toBe(0);expect(charges).toBe(0);expect(batches).toBe(1);
});
