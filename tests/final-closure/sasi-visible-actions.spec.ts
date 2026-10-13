import {test,expect} from 'playwright/test';
import {creationMethod} from '../../lib/sasi/creation-methods';
import {inferUnifiedSasiIntent} from '../../lib/sasi/core/unified-intent';
test('one natural-language router covers all public SASI capabilities',()=>{
 expect(inferUnifiedSasiIntent('帮我构建一个官网')).toBe('website');
 expect(inferUnifiedSasiIntent('生成一部100集短剧')).toBe('drama');
 expect(inferUnifiedSasiIntent('生成一张宇宙封面图')).toBe('image');
 expect(inferUnifiedSasiIntent('把这本书活化成可以对话的智能体')).toBe('book');
 expect(inferUnifiedSasiIntent('研究这些论文并给出证据')).toBe('research');
 expect(inferUnifiedSasiIntent('教我这一章并出练习题')).toBe('learning');
 expect(inferUnifiedSasiIntent('你好，聊聊天')).toBe('chat');
});
test('empty selections preserve automatic creative methods',()=>{expect(creationMethod('video',[]).ids).toEqual(expect.arrayContaining(['continuity','shots']));expect(creationMethod('website',[]).ids).toEqual(expect.arrayContaining(['website','mobile']));expect(creationMethod('image',[]).ids).toEqual(expect.arrayContaining(['image','continuity']));});
for(const lang of ['zh','en','ja','ko','fr','de','es','pt','ar'])test('one SASI composer and simple attachment menu '+lang,async({page})=>{await page.goto('/sasi?lang='+lang);await expect(page.locator('main textarea')).toHaveCount(1);await expect(page.locator('[data-sasi-task-toolbar]')).toHaveCount(0);await page.locator('button[aria-controls],button[aria-expanded]').filter({hasText:'＋'}).click();await expect(page.locator('main a[href="/sasi/connections"]')).toBeVisible();await expect(page.locator('main input[type="checkbox"]')).toHaveCount(0);expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);});
for(const exhausted of [true,false])test('quota exhaustion is distinguished from service unavailability '+exhausted,async({page})=>{await page.route('**/api/sasi/experience/text',route=>route.fulfill({json:{state:'needs-connection',experienceExhausted:exhausted}}));await page.route('**/api/sasi/byok/text',route=>route.fulfill({status:409,json:{error:'CONNECTION_REQUIRED'}}));await page.goto('/sasi?mode=chat&lang=zh');await page.locator('textarea').fill('你好');await page.locator('textarea').press('Enter');if(exhausted)await expect(page.getByRole('status')).toContainText('今日免费额度已用完');else await expect(page.getByRole('status')).not.toContainText('今日免费额度已用完');await expect(page.locator('main a[href^="/sasi/connections?next="]').last()).toBeVisible();});
test('completed story planning requests a video connection without a quota error',async({page})=>{
 const productionId='99999999-9999-4999-8999-999999999999';
 await page.route('**/api/sasi/projects',route=>route.fulfill({json:{project:{id:'88888888-8888-4888-8888-888888888888'}}}));
 await page.route('**/api/sasi/byok/video*',route=>route.fulfill({json:{connected:false,profiles:[],tasks:[]}}));
 await page.route(/\/api\/sasi\/drama\/series(?:\?|$)/,route=>route.fulfill({json:route.request().method()==='POST'?{id:productionId,state:'planning'}:{state:'ready',readyEpisodes:20,shots:[{episode:1,duration:8,prompt:'A traveler enters the village.',assetIds:[]}]}}));
 await page.goto('/sasi?mode=drama&lang=zh');
 const studio=page.locator('[data-sasi-task="drama"]');await expect(studio).toBeVisible();
 await studio.locator('textarea').fill('生成20集短剧');await studio.locator('textarea').press('Enter');
 await expect(page.getByRole('status').filter({hasText:'生成视频需要连接支持视频生成的智能服务'})).toBeVisible();
 await expect(page.getByText('今日免费额度已用完',{exact:true})).toHaveCount(0);
 await expect(studio.locator('a[href^="/sasi/connections?next="]')).toBeVisible();
 await studio.locator('button[aria-expanded]').click();await expect(studio.locator('[role="region"] input[type="checkbox"]')).toHaveCount(0);
});
