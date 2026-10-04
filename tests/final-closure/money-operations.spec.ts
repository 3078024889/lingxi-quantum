import {test,expect,type Page} from 'playwright/test';
const id='00000000-0000-4000-8000-000000000001';
const draft={id,order_id:'o',provider:'wechat',currency:'CNY',provider_currency:'CNY',amount_minor:100,provider_amount_minor:100,status:'requested',submission_confirmed_at:null,provider_status:null,failure_code:null,created_at:'2026-10-03T08:00:00Z',completed_at:null};
async function base(page:Page){
 await page.route('**/api/preferences/currency',r=>r.fulfill({json:{recommendedCurrency:'CNY'}}));
 await page.route('**/api/account/money-admin',r=>r.fulfill({status:403,json:{error:'FORBIDDEN'}}));
 await page.route('**/api/money/summary',r=>r.fulfill({json:{balances:{CNY:{availableMinor:900,refundableMinor:900,refundHoldMinor:100},USD:{availableMinor:1000,refundableMinor:1000,refundHoldMinor:0}},withdrawals:[]}}));
 await page.route('**/api/account/withdrawals',r=>r.fulfill({json:{orders:[],withdrawals:[]}}));
 await page.route('**/api/account/withdrawals/legacy',r=>r.fulfill({json:{items:[]}}));
}
for(const currency of ['CNY','USD'])test(currency+' compact amount selector and one payment action',async({page},testInfo)=>{
 await base(page);await page.goto('/sasi/pricing?currency='+currency+'&lang=zh#topup');const box=page.locator('fieldset');await expect(box.getByRole('radio')).toHaveCount(9);await box.locator('label').nth(2).click();await expect(box.getByRole('radio').nth(2)).toBeChecked();const link=page.getByTestId('topup-checkout');await expect(link).toHaveCount(1);await expect(link).toContainText('50.00');await expect(link).toHaveAttribute('href',currency==='CNY'?/checkout[?]productId=.*50/:/checkout-usd[?]productId=.*50/);await expect(box.getByRole('button')).toHaveCount(0);await box.scrollIntoViewIfNeeded();await page.screenshot({path:testInfo.outputPath('topup-'+currency+'.png')});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
test('cancel draft restores history state and sends only own request ID',async({page})=>{
 await base(page);let state={...draft},cancelBody:any;
 await page.route('**/api/account/withdrawals',r=>r.fulfill({json:{orders:[],withdrawals:[state]}}));
 await page.route('**/api/account/withdrawals/cancel',async r=>{cancelBody=r.request().postDataJSON();state={...state,status:'cancelled'};await r.fulfill({json:{ok:true,status:'cancelled'}})});
 await page.goto('/sasi/pricing?currency=CNY&lang=zh#withdrawal-records');page.on('dialog',d=>d.accept());await page.getByRole('button',{name:'取消提现',exact:true}).click();await expect(page.locator('#withdrawal-'+id)).toContainText('已取消');expect(cancelBody).toEqual({requestId:id});await expect(page.getByRole('button',{name:'确认退款',exact:true})).toHaveCount(0);
});
test('explicit refund confirmation submits once and removes cancellation',async({page})=>{
 await base(page);let state={...draft} as any,body:any;
 await page.route('**/api/account/withdrawals',r=>r.fulfill({json:{orders:[],withdrawals:[state]}}));
 await page.route('**/api/account/withdrawals/refresh',async r=>{body=r.request().postDataJSON();state={...state,status:'processing',submission_confirmed_at:'2026-10-03'};await r.fulfill({json:{ok:true,status:'processing'}})});
 await page.goto('/sasi/pricing?currency=CNY&lang=zh#withdrawal-records');page.on('dialog',d=>d.accept());await page.getByRole('button',{name:'确认退款',exact:true}).click();expect(body).toEqual({withdrawalId:id,confirmSubmission:true});await expect(page.getByRole('button',{name:'取消提现',exact:true})).toHaveCount(0);
});
test('cancellation race shows next step and keeps processing funds reserved',async({page})=>{
 await base(page);await page.route('**/api/account/withdrawals',r=>r.fulfill({json:{orders:[],withdrawals:[draft]}}));await page.route('**/api/account/withdrawals/cancel',r=>r.fulfill({status:409,json:{error:'CANCELLATION_NOT_AVAILABLE'}}));await page.goto('/sasi/pricing?currency=CNY&lang=zh#withdrawal-records');page.on('dialog',d=>d.accept());await page.getByRole('button',{name:'取消提现',exact:true}).click();await expect(page.getByRole('status').filter({hasText:'请刷新记录'})).toBeVisible();
});
test('admin shows channel funds, queued notices and mail retry',async({page})=>{
 await base(page);await page.unroute('**/api/account/money-admin');let sends=0;await page.route('**/api/account/money-admin',r=>{if(r.request().method()==='POST'){sends++;return r.fulfill({json:{sent:0,configured:false}})}return r.fulfill({json:{stats:{channels:[{provider:'wechat',provider_currency:'CNY',active_count:1,pending_minor:100,funds_required_minor:100,awaiting_confirmation:0}],notices_pending:1},withdrawals:[{...draft,status:'processing',submission_confirmed_at:'2026-10-03',failure_code:'PROVIDER_FUNDS_REQUIRED'}],notices:[{id:'n',event_type:'PROVIDER_FUNDS_REQUIRED',status:'failed',attempt_count:1}],notifyEmail:'business@lingxifield.com',emailConfigured:false}})});
 await page.goto('/account/money-admin?lang=zh');await expect(page.getByText('business@lingxifield.com',{exact:false})).toBeVisible();await expect(page.getByRole('heading',{name:'微信支付 · CNY'})).toBeVisible();await expect(page.getByRole('heading',{name:'支付宝 · CNY'})).toBeVisible();await expect(page.getByRole('heading',{name:'PayPal · USD'})).toBeVisible();await page.getByRole('button',{name:'重试发送提醒'}).click();await expect(page.getByRole('status')).toContainText('申请仍保留');expect(sends).toBe(1);
});
test('non-admin receives login instruction and no financial records',async({page})=>{await base(page);await page.goto('/account/money-admin?lang=zh');await expect(page.getByRole('alert').filter({hasText:'管理员邮箱'})).toContainText('管理员邮箱');await expect(page.getByText('需要补资金的退款金额')).toHaveCount(0)});

test('earlier refund can be cancelled with legacy request kind',async({page})=>{await base(page);let body:any,done=false;await page.route('**/api/account/withdrawals/legacy',r=>r.fulfill({json:{items:done?[]:[{id,order_id:'o',amount_fen:100,status:'requested',created_at:'2026-10-03'}]}}));await page.route('**/api/account/withdrawals/cancel',r=>{body=r.request().postDataJSON();done=true;return r.fulfill({json:{ok:true,status:'cancelled'}})});await page.goto('/sasi/pricing?currency=CNY&lang=zh#withdrawal-records');page.on('dialog',d=>d.accept());await page.getByRole('button',{name:'取消退款',exact:true}).click();expect(body).toEqual({requestId:id,kind:'legacy'});await expect(page.getByRole('button',{name:'取消退款',exact:true})).toHaveCount(0)});

for(const currency of ['CNY','USD'])test(currency+' balance page keeps eligible orders and history in the selected wallet',async({page})=>{
 await base(page);
 const usd={...draft,id:'usd-request',order_id:'usd-order',currency:'USD',provider:'paypal',provider_currency:'USD'};
 await page.route('**/api/account/withdrawals',r=>r.fulfill({json:{orders:[{id:'cny-order',product_id:'sasi-balance-10',provider:'wechat',amount_rmb:10,refundable_minor:500,created_at:draft.created_at},{id:'usd-order',product_id:'sasi-usd-balance-10',provider:'paypal',amount_usd:10,refundable_minor:800,created_at:draft.created_at}],withdrawals:[draft,usd]}}));
 await page.goto('/sasi/pricing?currency='+currency+'&lang=zh#withdrawal-records');
 await expect(page.locator('#withdrawal-'+(currency==='CNY'?id:'usd-request'))).toBeVisible();
 await expect(page.locator('#withdrawal-'+(currency==='CNY'?'usd-request':id))).toHaveCount(0);
 await expect(page.locator('.lx11-link[href="/ai-wallet"]').first()).toHaveClass(/is-active/);
 await expect(page.locator('.lx11-link[href="/sasi"]').first()).not.toHaveClass(/is-active/);
 await expect(page.locator('.lx-v40-mobile-bottom a[href="/account"]')).toHaveClass(/is-active/);
 await page.getByRole('tab',{name:'提现',exact:true}).click();
 await expect(page.getByRole('textbox',{name:'提现金额',exact:true})).toHaveCount(1);
 await expect(page.getByRole('textbox',{name:'提现金额',exact:true})).toHaveValue(currency==='CNY'?'5':'8');
});

test('four finance tabs show one panel, support keyboard and retain the withdrawal amount',async({page},testInfo)=>{
 await base(page);
 await page.route('**/api/account/withdrawals',r=>r.fulfill({json:{orders:[{id:'cny-order',product_id:'sasi-balance-10',provider:'wechat',amount_rmb:10,refundable_minor:500,created_at:draft.created_at}],withdrawals:[draft]}}));
 await page.goto('/sasi/pricing?currency=CNY&lang=zh');
 await expect(page.getByRole('tab')).toHaveCount(4);
 await expect(page.getByRole('tab',{name:'账户总览',exact:true})).toHaveAttribute('aria-selected','true');
 await expect(page.getByRole('tabpanel')).toHaveCount(1);
 await expect(page.getByTestId('balance-topup')).toBeHidden();
 await page.screenshot({path:testInfo.outputPath('balance-overview.png')});
 await page.getByRole('tab',{name:'账户总览',exact:true}).focus();await page.keyboard.press('End');
 await expect(page.getByRole('tab',{name:'退款记录',exact:true})).toBeFocused();
 await expect(page.getByRole('tabpanel')).toHaveCount(1);
 await expect(page.locator('#withdrawal-'+id)).toBeVisible();
 await page.getByRole('tab',{name:'提现',exact:true}).click();await page.getByRole('textbox',{name:'提现金额',exact:true}).fill('2');
 await page.screenshot({path:testInfo.outputPath('balance-withdrawal.png')});
 await page.getByRole('tab',{name:'充值',exact:true}).click();await expect(page.getByTestId('balance-topup')).toBeVisible();
 await expect(page.getByRole('tabpanel')).toHaveCount(1);await page.getByRole('tab',{name:'提现',exact:true}).click();
 await expect(page.getByRole('textbox',{name:'提现金额',exact:true})).toHaveValue('2');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
