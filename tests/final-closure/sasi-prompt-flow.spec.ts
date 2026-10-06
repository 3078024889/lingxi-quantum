import fs from 'node:fs';
import {test,expect} from 'playwright/test';
import {parseAutomaticVideoPlan} from '../../lib/sasi/automatic-video-plan';

test('automatic planning rejects invalid duration and oversized episodes',()=>{
 const shot={episode:1,duration:8,prompt:'A character enters a sunlit room.',assetIds:[]};
 expect(parseAutomaticVideoPlan(JSON.stringify({title:'Story',shots:[shot]})).shots).toHaveLength(1);
 for(const shots of [[{...shot,duration:5}],[{...shot,assetIds:['injected']}],Array(25).fill(shot),[{...shot,episode:31}]])expect(()=>parseAutomaticVideoPlan(JSON.stringify({title:'Story',shots}))).toThrow();
 expect(()=>parseAutomaticVideoPlan(JSON.stringify({title:'Story',shots:[shot]}),'生成20集短剧')).toThrow();
 expect(parseAutomaticVideoPlan(JSON.stringify({title:'20 episodes',shots:Array.from({length:20},(_,i)=>({...shot,episode:i+1}))})).shots).toHaveLength(20);
});

test('one send from unified entry receives a configured response (mock service)',async({page})=>{
 let requests=0;
 await page.route('**/api/sasi/experience/text',route=>{requests++;expect(route.request().postDataJSON().allowConnected).toBe(false);return route.fulfill({json:{state:'answer',answer:'A response from the configured service.'}})});
 await page.goto('/sasi?lang=en');await page.getByPlaceholder('Tell SASI what you want to do…').fill('Hello SASI');await page.getByPlaceholder('Tell SASI what you want to do…').press('Enter');
 await expect(page.locator('[data-sasi-role="assistant"]')).toContainText('configured service');expect(requests).toBe(1);
});

for(const merge of [false,true])test('short drama automatic '+(merge?'real MP4 composition':'episode delivery')+', confirmation before submit',async({page})=>{
 test.setTimeout(180000);
 const pid='33333333-3333-4333-8333-333333333333',ids=['44444444-4444-4444-8444-444444444444','55555555-5555-4555-8555-555555555555'];let confirms=0,finished=false;
 const shots=ids.map((_,i)=>({episode:merge?1:i+1,duration:8,prompt:'Same traveler explores a mysterious village.',assetIds:[]}));
 const tasks=ids.map((id,i)=>({id,state:'quoted',estimated_fen:20,request:{episode:merge?1:i+1,shotIndex:i,batchId:'batch',batchShotCount:2,billingCurrency:'USD'},output:{videoUrl:'https://video.example/'+id+'.mp4'}}));
 if(merge){const source=Buffer.from(fs.readFileSync('tests/fixtures/sasi-video-4s.mp4.base64','utf8').trim(),'base64');await page.route('**/api/sasi/video-file?*',route=>{const start=Number(new URL(route.request().url()).searchParams.get('start')||0),end=Math.min(start+3*1024*1024,source.length);return route.fulfill({status:206,headers:{'content-range':`bytes ${start}-${end-1}/${source.length}`,'content-type':'application/octet-stream'},body:source.subarray(start,end)})});}
 await page.route('**/api/sasi/projects',route=>route.fulfill({json:{project:{id:pid}}}));
 await page.route('**/api/sasi/drama/plan',route=>route.fulfill({json:{state:'answer',plan:{title:'Two episodes',shots}}}));
 await page.route('**/api/sasi/byok/video*',async route=>{
  if(route.request().method()==='GET')return route.fulfill({json:{connected:true,profiles:[{id:'profile',resolution:'1080p'}],tasks:confirms?tasks.map(t=>({...t,state:'succeeded'})):[]}});
  const body=route.request().postDataJSON();if(body.action==='quote-series'){expect(body.shots).toHaveLength(2);return route.fulfill({json:{tasks}})}
  if(body.action==='confirm'){confirms++;finished=confirms===2;return route.fulfill({json:{state:'queued'}})}
  return route.fulfill({json:{state:finished?'succeeded':'running'}});
 });
 await page.goto('/sasi?mode=drama&lang=en');await page.locator('[data-sasi-task="drama"] input[type="checkbox"]').last().check();await page.locator('[data-sasi-task="drama"] textarea').fill('Make a two episode drama about a time traveler.');await page.locator('[data-sasi-task="drama"] textarea').press('Enter');
 await expect(page.getByRole('button',{name:/Confirm \$0.40/})).toBeVisible();expect(confirms).toBe(0);
 await expect(page.locator('a[href^="/sasi/series"]')).toHaveCount(0);await expect(page.locator('a[href="/sasi/assemble"]')).toHaveCount(0);
 await page.getByRole('button',{name:/Confirm \$0.40/}).click();await expect(page.locator('[data-sasi-result-kind="video"]')).toHaveCount(merge?1:2,{timeout:150000});if(merge){const video=page.locator('video');await expect(video).toHaveAttribute('src',/^blob:/);await expect.poll(()=>video.evaluate((el:HTMLVideoElement)=>el.duration),{timeout:10000}).toBeGreaterThan(0);}expect(confirms).toBe(2);
});
