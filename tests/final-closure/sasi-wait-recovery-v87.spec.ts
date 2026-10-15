import {test,expect} from './export-test';

for(const action of ['cancel','timeout'] as const)test(`free SASI ${action} clears waiting, keeps the question and retries without paid generation`,async({page})=>{
 let release!:()=>void,paid=0,requests=0;const stalled=new Promise<void>(resolve=>{release=resolve});
 await page.route('**/api/sasi/conversations**',route=>route.fulfill({status:401,json:{error:'AUTH_REQUIRED'}}));
 await page.route('**/api/sasi/byok/**',route=>{if(route.request().method()==='POST')paid++;return route.fulfill({status:401,json:{error:'AUTH_REQUIRED'}})});
 await page.route('**/api/sasi/experience/text',async route=>{
  requests++;if(requests===1){await stalled;await route.abort().catch(()=>{});return}
  await route.fulfill({headers:{'content-type':'text/event-stream'},body:'event: done\ndata: {"state":"answer","answer":"Complete retry answer"}\n\n'});
 });
 try{
  await page.goto('/sasi?mode=chat&lang=en');await page.locator('textarea').fill('Write a short script without paid generation');
  await page.clock.install();await page.locator('textarea').press('Enter');await expect(page.getByRole('button',{name:'Stop waiting',exact:true})).toBeVisible();
  if(action==='cancel')await page.getByRole('button',{name:'Stop waiting',exact:true}).click();else await page.clock.fastForward(31_000);
  await expect(page.getByText(action==='cancel'?'Stopped waiting. Your question is preserved and can be retried.':'No complete answer arrived. Check your connection and retry; your question is preserved.',{exact:true})).toBeVisible();
  await expect(page.getByRole('button',{name:'Stop waiting',exact:true})).toHaveCount(0);await expect(page.locator('textarea')).toHaveValue('Write a short script without paid generation');expect(paid).toBe(0);
  release();await page.locator('textarea').press('Enter');await expect(page.locator('[data-sasi-role="assistant"]')).toContainText('Complete retry answer');expect(paid).toBe(0);
 }finally{release()}
});

test('an incomplete free answer is not left on screen or saved as finished',async({page})=>{
 let saved=0;await page.route('**/api/sasi/conversations**',route=>{if(route.request().method()==='POST')saved++;return route.fulfill({status:401,json:{error:'AUTH_REQUIRED'}})});
 await page.route('**/api/sasi/experience/text',route=>route.fulfill({headers:{'content-type':'text/event-stream'},body:'event: delta\ndata: {"text":"Unfinished fragment"}\n\n'}));
 await page.goto('/sasi?mode=chat&lang=en');await page.locator('textarea').fill('Please answer');await page.locator('textarea').press('Enter');
 await expect(page.getByText('No complete answer arrived. Check your connection and retry; your question is preserved.',{exact:true})).toBeVisible();await expect(page.locator('[data-sasi-streaming]')).toHaveCount(0);await expect(page.locator('[data-sasi-role="assistant"]')).toHaveCount(0);expect(saved).toBe(0);
});
