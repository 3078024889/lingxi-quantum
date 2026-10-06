import {test,expect,type Page} from 'playwright/test';
import {connectionPageCopy} from '../../lib/sasi/connection-page-copy';
import type {LingxiLang} from '../../lib/lingxi-i18n';
for(const lang of ['zh','en','ja','ko','fr','de','es','pt','ar'] as LingxiLang[])test('connection page service groups and responsive layout '+lang,async({page,isMobile})=>{
 await page.goto('/sasi/connections?lang='+lang);const c=connectionPageCopy(lang);
 const services=page.locator('[data-connection-services]'),details=page.locator('[data-connection-details]');
 await expect(services.getByRole('button')).toHaveCount(10);
 await expect(services.getByRole('heading',{name:c.platforms,exact:true})).toBeVisible();
 await services.getByRole('button',{name:/OpenRouter/}).click();await expect(details.getByRole('heading',{name:'OpenRouter',exact:true})).toBeVisible();
 await expect(details).toContainText(c.text);await expect(details).not.toContainText(c.video);
 await services.getByRole('button',{name:/Luma AI/}).click();await expect(details).toContainText(c.luma);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
 await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
 const left=await services.boundingBox(),right=await details.boundingBox();expect(left).not.toBeNull();expect(right).not.toBeNull();
 if(isMobile)expect(right!.y).toBeGreaterThan(left!.y+left!.height-2);else{expect(Math.abs(left!.y-right!.y)).toBeLessThan(2);expect(Math.abs(left!.x-right!.x)).toBeGreaterThan(250)}
 expect(await page.locator('main main').count()).toBe(0);
});
async function signedInFixture(page:Page){
 // Replace only the serialized server prop in the test document; no real account or provider calls.
 await page.route('**/sasi/connections?*',async route=>{if(!route.request().isNavigationRequest())return route.continue();const r=await route.fetch();let body=await r.text();const before=body;body=body.replace(/accountEmail\\":null/g,'accountEmail\\":\\"test@example.invalid\\"');expect(body).not.toBe(before);await route.fulfill({response:r,body});});
 await page.route('**/api/sasi/connections',route=>route.fulfill({json:{connections:[]}}));
 await page.goto('/sasi/connections?lang=zh');await expect(page.getByRole('textbox',{name:'连接密钥'})).toBeVisible();
}
test('connection defaults, save and check, switch clears key, and delete (mock services)',async({page})=>{
 await signedInFixture(page);const key=page.getByRole('textbox',{name:'连接密钥'});await key.fill('mock-provider-key-123');
 await page.locator('[data-connection-services]').getByRole('button',{name:/OpenRouter/}).click();await expect(key).toHaveValue('');
 const payloads:unknown[]=[];
 await page.route('**/api/sasi/connections',route=>{if(route.request().method()==='POST'){payloads.push(route.request().postDataJSON());return route.fulfill({status:201,json:{keyHint:'mock…123'}})}return route.fulfill({json:{connections:[]}})});
 await page.route('**/api/sasi/connections/test',route=>route.fulfill({json:{healthStatus:'healthy',model:'openai/test-model'}}));
 await key.fill('mock-openrouter-key-123');await page.getByRole('button',{name:'保存并检查',exact:true}).click();
 await expect(page.locator('[data-connection-services]').getByRole('button',{name:/OpenRouter/})).toContainText('已连接');
 expect(payloads).toEqual([{provider:'openrouter',apiKey:'mock-openrouter-key-123'}]);await expect(key).toHaveCount(0);
 await expect(page.locator('[data-connection-details]')).not.toContainText('mock-openrouter-key-123');
 page.once('dialog',dialog=>dialog.accept());await page.route('**/api/sasi/connections?provider=openrouter',route=>route.fulfill({json:{ok:true}}));await page.getByRole('button',{name:'删除连接',exact:true}).click();await expect(key).toHaveValue('');
});
test('other service requires an address and model before saving',async({page})=>{
 await signedInFixture(page);await page.locator('[data-connection-services]').getByRole('button',{name:/添加其他服务/}).click();
 await page.getByRole('textbox',{name:'连接密钥'}).fill('mock-compatible-key-123');const save=page.getByRole('button',{name:'保存并检查',exact:true});await expect(save).toBeDisabled();
 await page.getByLabel('服务地址',{exact:true}).fill('https://service.example/v1');await expect(save).toBeDisabled();await page.getByLabel('模型名称',{exact:true}).fill('example-model');await expect(save).toBeEnabled();
});
