import fs from 'node:fs';
import {test,expect} from './export-test';
import {parseAutomaticVideoPlan} from '../../lib/sasi/automatic-video-plan';

test('automatic planning rejects invalid duration and oversized episodes',()=>{
 const shot={episode:1,duration:8,prompt:'A character enters a sunlit room.',assetIds:[]};
 expect(parseAutomaticVideoPlan(JSON.stringify({title:'Story',shots:[shot]})).shots).toHaveLength(1);
 for(const shots of [[{...shot,duration:5}],[{...shot,assetIds:['injected']}],Array(25).fill(shot),[{...shot,episode:31}]])expect(()=>parseAutomaticVideoPlan(JSON.stringify({title:'Story',shots}))).toThrow();
 expect(()=>parseAutomaticVideoPlan(JSON.stringify({title:'Story',shots:[shot]}),'生成20集短剧')).toThrow();
 expect(parseAutomaticVideoPlan(JSON.stringify({title:'20 episodes',shots:Array.from({length:20},(_,i)=>({...shot,episode:i+1}))})).shots).toHaveLength(20);
});

test('user can explicitly prepare on-device intelligence from the add menu',async({page})=>{
 await page.addInitScript(()=>{
  let ready=false;
  Object.defineProperty(globalThis,'LanguageModel',{configurable:true,value:{
   availability:async()=>ready?'available':'downloadable',
   create:async(options:any)=>{
    const listener={addEventListener:(name:string,cb:(event:{loaded:number})=>void)=>{if(name==='downloadprogress'){cb({loaded:.4});cb({loaded:1})}}};
    options?.monitor?.(listener);ready=true;
    return{prompt:async(input:string)=>'Local reply: '+input,destroy(){}};
   }
  }});
 });
 await page.route('**/api/sasi/experience/text',route=>route.fulfill({json:{state:'answer',answer:'Seed reply'}}));
 await page.goto('/sasi?lang=en');
 await page.getByPlaceholder('Tell SASI what you want to do…').fill('Hello SASI');
 await page.getByPlaceholder('Tell SASI what you want to do…').press('Enter');
 await expect(page.locator('[data-sasi-role="assistant"]')).toContainText('Seed reply');
 await page.locator('button[aria-controls],button[aria-expanded]').filter({hasText:'＋'}).click();
 await expect(page.getByText('Use on this device',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Enable',exact:true}).click();
 await expect(page.getByText('Ready on this device',{exact:true})).toBeVisible();
});

test('ready browser intelligence answers ordinary chat before cloud pool',async({page})=>{
 let requests=0;
 await page.addInitScript(()=>{
  localStorage.setItem('lx-sasi-local-text-enabled','1');
  Object.defineProperty(globalThis,'LanguageModel',{configurable:true,value:{
   availability:async()=> 'available',
   create:async()=>({prompt:async(input:string)=>'Local reply: '+input,destroy(){}})
  }});
 });
 await page.route('**/api/sasi/experience/text',route=>{requests++;return route.fulfill({json:{state:'answer',answer:'Cloud fallback'}})});
 await page.goto('/sasi?mode=chat&lang=en');
 await page.locator('textarea').fill('Hello SASI');
 await page.locator('textarea').press('Enter');
 await expect(page.locator('[data-sasi-role="assistant"]')).toContainText('Local reply: Hello SASI');
 expect(requests).toBe(0);
});

test('one send from unified entry receives a configured response (mock service)',async({page})=>{
 let requests=0;
 await page.route('**/api/sasi/experience/text',route=>{requests++;expect(route.request().postDataJSON().allowConnected).toBe(false);return route.fulfill({json:{state:'answer',answer:'A response from the configured service.'}})});
 await page.goto('/sasi?lang=en');await page.getByPlaceholder('Tell SASI what you want to do…').fill('Hello SASI');await page.getByPlaceholder('Tell SASI what you want to do…').press('Enter');
 await expect(page.locator('[data-sasi-role="assistant"]')).toContainText('configured service');expect(requests).toBe(1);
});

for(const merge of [false,true])test('short drama server-delivered '+(merge?'composed episode':'episodes')+', confirmation before batch submission',async({page})=>{
 test.setTimeout(90000);
 const pid='33333333-3333-4333-8333-333333333333',batchId='66666666-6666-4666-8666-666666666666',productionId='77777777-7777-4777-8777-777777777777';
 const ids=['44444444-4444-4444-8444-444444444444','55555555-5555-4555-8555-555555555555'];let confirms=0,individualSubmits=0;
 const episodes=merge?1:2,shots=ids.map((_,i)=>({episode:merge?1:i+1,duration:8,prompt:'Same traveler explores a mysterious village.',assetIds:[]}));
 const tasks=ids.map((id,i)=>({id,state:'quoted',estimated_fen:20,request:{episode:merge?1:i+1,shotIndex:i,batchId,batchShotCount:2,billingCurrency:'USD'}}));
 await page.route('**/api/sasi/projects',route=>route.fulfill({json:{project:{id:pid}}}));
 await page.route(/\/api\/sasi\/drama\/series(?:\?|$)/,route=>route.fulfill({json:route.request().method()==='POST'?{id:productionId,state:'planning'}:{state:'ready',readyEpisodes:episodes,shots}}));
 await page.route('**/api/sasi/byok/video*',route=>{
  if(route.request().method()==='GET')return route.fulfill({json:{connected:true,profiles:[{id:'profile',resolution:'1080p'}],tasks:[]}});
  const body=route.request().postDataJSON();if(body.action==='quote-series'){expect(body.shots).toHaveLength(2);return route.fulfill({json:{batchId,tasks}})}
  individualSubmits++;return route.fulfill({status:409,json:{error:'UNEXPECTED_DIRECT_SUBMISSION'}});
 });
 await page.route('**/api/sasi/drama/batch',route=>{confirms++;expect(route.request().postDataJSON()).toEqual({batchId,expectedTotalMinor:40,currency:'USD',acceptSupplierBilling:true});return route.fulfill({json:{taskIds:ids}})});
 const films=ids.slice(0,episodes).map((id,i)=>({episode:i+1,url:'/api/sasi/generated-assets/'+id}));
 await page.route('**/api/sasi/drama/delivery?*',route=>route.fulfill({json:{state:'complete',expectedEpisodes:episodes,films}}));
 const source=Buffer.from(fs.readFileSync('tests/fixtures/sasi-video-4s.mp4.base64','utf8'),'base64');
 await page.route('**/api/sasi/generated-assets/*',route=>route.fulfill({contentType:'video/mp4',body:source}));
 await page.goto('/sasi?mode=drama&lang=en');const studio=page.locator('[data-sasi-task="drama"]');await expect(studio).toBeVisible();
 await studio.locator('textarea').fill('Make '+episodes+' episodes about a time traveler.');await studio.locator('input[type="checkbox"]').last().check();await studio.locator('textarea').press('Enter');
 await expect(studio.getByText('Storyboards ready: '+episodes+'/'+episodes+' episodes. Progress is saved.')).toBeVisible();
 await studio.locator('textarea').press('Enter');await expect(page.getByRole('button',{name:/Confirm \$0.40/})).toBeVisible();expect(confirms).toBe(0);
 await page.getByRole('button',{name:/Confirm \$0.40/}).click();await expect(page.locator('[data-sasi-result-kind="video"]')).toHaveCount(episodes);
 for(const film of films)await expect(page.locator('video[src="'+film.url+'"]')).toBeVisible();
 expect(confirms).toBe(1);expect(individualSubmits).toBe(0);
});
