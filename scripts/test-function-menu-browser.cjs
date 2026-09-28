const assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.TEST_BASE_URL||'http://127.0.0.1:3047';
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try{
  for(const width of [1440,390]){
   const page=await browser.newPage({viewport:{width,height:900}});const errors=[];let payload;
   page.on('pageerror',e=>errors.push(e.message));
   await page.route('**/api/sasi/projects',r=>r.fulfill({json:{project:{id:'11111111-1111-4111-8111-111111111111'}}}));
   await page.route('**/api/sasi/v5/feedback',r=>r.fulfill({json:{ok:true}}));
   await page.route('**/api/sasi/byok/video**',r=>{
    if(r.request().method()==='GET')return r.fulfill({json:{enabled:true,connected:true,profiles:[{id:'fixture',resolution:'1080p'}]}});
    payload=r.request().postDataJSON();return r.fulfill({json:{task:{id:'test',estimated_fen:100}}});
   });
   await page.goto(base+'/sasi/drama',{waitUntil:'networkidle'});
   await page.getByRole('button',{name:'添加资料与功能'}).click();
   const menu=page.getByRole('region',{name:'添加资料与功能'});
   await menu.getByRole('checkbox',{name:/人物与场景一致/}).check();
   await menu.getByRole('checkbox',{name:/镜头设计/}).check();
   assert.equal(await menu.getByRole('checkbox',{checked:true}).count(),2);
   const box=await menu.boundingBox();assert.ok(box.x>=0&&box.x+box.width<=width+1&&box.y>=0,'menu inside viewport');
   await page.screenshot({path:`_local/function-menu-${width}.png`,fullPage:true});
   await page.keyboard.press('Escape');assert.equal(await menu.count(),0);
   await page.getByLabel('创作需求').fill('雨夜，一个女孩撑伞走过街头，霓虹倒映在积水中。');
   await page.getByRole('checkbox',{name:/我拥有相关素材/}).check();
   await page.getByRole('button',{name:'生成视频',exact:true}).click();
   await page.getByRole('button',{name:'确认 ¥1.00'}).waitFor();
   assert.deepEqual(payload.functions,['continuity','shots']);
   await page.getByRole('button',{name:'移除镜头设计'}).click();
   assert.equal(await page.getByRole('button',{name:'确认 ¥1.00'}).count(),0,'changing methods invalidates quote');
   await page.getByRole('button',{name:'添加资料与功能'}).click();
   const chooser=page.waitForEvent('filechooser');
   await menu.getByRole('button',{name:/添加照片和文件/}).click();
   assert.equal((await chooser).isMultiple(),true);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),false);
   assert.deepEqual(errors,[]);await page.close();
  }
  console.log('PASS: desktop/mobile menu, multiple selection, Escape, file picker, request payload and quote invalidation. Supplier APIs mocked; no paid generation.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
