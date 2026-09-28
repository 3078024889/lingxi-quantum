// UI contract test with intercepted APIs. This never calls a model or payment provider.
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:3041';
(async () => {
 const browser = await chromium.launch({ headless: true, channel: 'msedge' });
 try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const faults=[];page.on('pageerror', e=>faults.push(e.message));
  const id='11111111-1111-4111-8111-111111111111'; let tasks=[];const actions=[];
  await page.route('**/api/sasi/projects', route=>route.fulfill({json:{projects:[{id,title:'Contract test project',kind:'drama'}]}}));
  await page.route('**/api/sasi/byok/video**', async route=>{
   if(route.request().method()==='POST'){
    const body=route.request().postDataJSON();actions.push(body);
    if(body.action==='quote') tasks=[{id,state:'quoted',estimated_fen:120,expires_at:new Date(Date.now()+600000).toISOString(),request:{prompt:body.prompt,generateAudio:true}}];
    if(body.action==='confirm'){assert.equal(body.acceptSupplierBilling,true);tasks[0].state='queued';}
    return route.fulfill({json:{task:tasks[0]}});
   }
   return route.fulfill({json:{enabled:true,connected:true,profile:{model:'test-fixture',maxDuration:12,generateAudio:true,resolution:'720p'},tasks}});
  });
  await page.goto(`${base}/sasi/drama`,{waitUntil:'networkidle'});
  await page.getByLabel('描述你想看到的画面').fill('在晨光下，一只小猫缓慢走过花园，镜头跟随它向前移动。');
  await page.getByLabel('保存到项目').selectOption(id);
  await page.getByText('我拥有相关素材的使用权，并同意按平台要求标注生成内容。').click();
  await page.getByRole('button',{name:'生成视频',exact:true}).click();
  await page.getByRole('button',{name:'确认费用，开始生成'}).waitFor();
  assert.deepEqual(actions.map(x=>x.action),['quote']);
  await page.getByRole('button',{name:'确认费用，开始生成'}).click();
  await page.getByRole('button',{name:'查询生成结果'}).waitFor();
  assert.deepEqual(actions.map(x=>x.action),['quote','confirm']);
  await page.evaluate(()=>window.scrollTo(0,0));
  await page.screenshot({path:process.env.TEST_SCREENSHOT || '.codex-byok-mobile.png',fullPage:true});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+2),false);
  const closed = await page.request.post(`${base}/api/sasi/jobs`, {data:{}});
  assert.equal(closed.status(),410);
  assert.equal((await closed.json()).error,'VIDEO_BYOK_REQUIRED');
  for(const path of ['/explore','/live-as','/subconscious','/practice','/field-tests','/dream']) {
   assert.equal((await page.request.get(`${base}${path}`)).status(),410,path);
  }
  await page.route('**/api/tools/pricing**',route=>route.fulfill({json:{amount_rmb:1,amount_usd:0.5}}));
  await page.goto(`${base}/tools/food-calorie`,{waitUntil:'networkidle'});
  await page.getByRole('button',{name:/上传图片识别食物/}).click();
  await page.getByText('看图确认食物，再计算营养').waitFor();
  assert.equal(await page.getByRole('button',{name:'支付后识别并生成结果',exact:true}).count(),0);
  assert.deepEqual(faults,[]);
  console.log('BYOK_UI_CONTRACT_PASS; MODEL_GENERATION_NOT_TESTED');
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
