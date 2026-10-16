import {test,expect as baseExpect} from './export-test';
import fs from 'node:fs';
const expect=baseExpect.configure({timeout:15000});

test('creation and connection round trip preserve the same conversation and project',async({page})=>{
 test.setTimeout(90000);
 const ownerId='11111111-1111-4111-8111-111111111111',threadId='22222222-2222-4222-8222-222222222222';
 let workspace:any={mode:'chat',chatOpened:true};
 const messages=[{id:'33333333-3333-4333-8333-333333333333',role:'user',content:'生成短剧50集，每集1分钟，16:9'},
 {id:'44444444-4444-4444-8444-444444444444',parent_id:'33333333-3333-4333-8333-333333333333',role:'assistant',content:'保留这个故事：艾瑟来到伊利亚，人物和世界继续演变。',state:'complete'}];
 await page.route(/\/api\/sasi\/conversations(?:\/workspace)?(?:\?|$)/,async route=>{
  if(route.request().method()==='POST'){
   const body=route.request().postDataJSON();if(route.request().url().includes('/workspace'))workspace=body.workspace;
   await route.fulfill({json:{ok:true,threadId}});return;
  }
  await route.fulfill({json:{ownerId,threadId,threads:[{id:threadId,title:'伊利亚短剧'}],workspace,messages}});
 });
 await page.route('**/api/sasi/projects',route=>route.fulfill({json:{project:{id:'55555555-5555-4555-8555-555555555555'}}}));
 await page.route('**/api/sasi/byok/video**',route=>route.fulfill({json:{connected:false,profiles:[],tasks:[]}}));
 await page.route(/\/api\/sasi\/drama\/series(?:\?|$)/,route=>route.fulfill({json:route.request().method()==='POST'?{id:'66666666-6666-4666-8666-666666666666',state:'planning'}:{state:'ready',readyEpisodes:50,shots:[{episode:1,duration:12,prompt:'Continuing the approved story.',assetIds:[]}]}}));
 await page.route('**/api/sasi/connections',route=>route.fulfill({json:{connections:[]}}));
 await page.goto('/sasi?mode=chat',{waitUntil:'domcontentloaded'});
 await expect(page.getByText('保留这个故事：艾瑟来到伊利亚，人物和世界继续演变。')).toBeVisible();
 await page.getByRole('button',{name:/继续制作|Continue creating/}).click();
 await expect(page.locator('[data-sasi-continuation-history]')).toContainText('保留这个故事');
 await expect.poll(()=>workspace.mode).toBe('drama');
 const connection=page.locator('a[href^="/sasi/connections?next="]').first();
 await expect(connection).toBeVisible();
 await connection.click();
 await expect(page.getByRole('link',{name:/返回创作|Return to creation/})).toBeVisible();
 await page.getByRole('link',{name:/返回创作|Return to creation/}).click();
 await expect(page.locator('[data-sasi-continuation-history]')).toContainText('保留这个故事');
 await page.reload({waitUntil:'domcontentloaded'});
 await expect(page.locator('[data-sasi-continuation-history]')).toContainText('生成短剧50集');
});

test('a background film resumes from saved delivery without submitting or charging again',async({page})=>{
 test.setTimeout(90000);
 const threadId='22222222-2222-4222-8222-222222222222',projectId='55555555-5555-4555-8555-555555555555',batchId='66666666-6666-4666-8666-666666666666';
 const films=[{episode:1,url:'/api/sasi/generated-assets/77777777-7777-4777-8777-777777777777'}];
 let mutations=0;
 await page.route(/\/api\/sasi\/conversations(?:\/workspace)?(?:\?|$)/,route=>route.fulfill({json:route.request().method()==='POST'?{ok:true}:{ownerId:'11111111-1111-4111-8111-111111111111',threadId,threads:[{id:threadId,title:'正在生成的短剧'}],messages:[],workspace:{mode:'drama',projectId,initialPrompt:'继续既有短剧',creation:{drama:{projectId,prompt:'继续既有短剧',activeBatch:{batchId,taskIds:['88888888-8888-4888-8888-888888888888']},ratio:'16:9',resolution:'1080p'}}}}}));
 await page.route('**/api/sasi/byok/video**',route=>{
  if(route.request().method()==='POST')mutations++;
  return route.fulfill({json:{connected:false,profiles:[],tasks:[]}});
 });
 await page.route('**/api/sasi/drama/batch',route=>{mutations++;return route.fulfill({json:{error:'UNEXPECTED_RESUBMISSION'},status:409})});
 await page.route('**/api/sasi/drama/delivery?**',route=>route.fulfill({json:{state:'complete',expectedEpisodes:1,films}}));
 await page.route('**/api/sasi/generated-assets/*',route=>route.fulfill({contentType:'video/mp4',body:Buffer.from(fs.readFileSync('tests/fixtures/sasi-video-4s.mp4.base64','utf8'),'base64')}));
 await page.goto('/sasi?mode=drama&threadId='+threadId,{waitUntil:'domcontentloaded'});
 const result=page.locator('video[src="'+films[0].url+'"]');
 await expect(result).toBeVisible();
 await page.reload({waitUntil:'domcontentloaded'});
 await expect(result).toBeVisible();
 expect(mutations).toBe(0);
});

test('a deliberate new conversation remains empty after refresh and keeps previous history selectable',async({page})=>{
 test.setTimeout(90000);
 const ownerId='11111111-1111-4111-8111-111111111111',threadId='22222222-2222-4222-8222-222222222222';
 await page.route(/\/api\/sasi\/conversations(?:\?|$)/,route=>{
  const fresh=new URL(route.request().url()).searchParams.get('fresh')==='1';
  return route.fulfill({json:{ownerId,threadId:fresh?null:threadId,workspace:{mode:'chat',chatOpened:true},threads:[{id:threadId,title:'原有故事'}],messages:fresh?[]:[{id:'u',role:'user',content:'原有故事内容'},{id:'a',parent_id:'u',role:'assistant',content:'上一段对话的回答',state:'complete'}]}});
 });
 await page.route('**/api/sasi/conversations/workspace',route=>route.fulfill({json:{ok:true}}));
 await page.goto('/sasi?mode=chat',{waitUntil:'domcontentloaded'});
 await expect(page.getByText('上一段对话的回答')).toBeVisible();
 await page.getByRole('button',{name:/^(新对话|New chat)$/}).click();
 await expect(page).toHaveURL(/fresh=1/);
 await page.reload({waitUntil:'domcontentloaded'});
 await expect(page.locator('#sasi-chat-thread')).toBeVisible();
 await expect(page.getByText('上一段对话的回答')).toHaveCount(0);
 await page.locator('#sasi-chat-thread').selectOption(threadId);
 await expect(page.getByText('上一段对话的回答')).toBeVisible();
 await expect(page).not.toHaveURL(/fresh=1/);
});
