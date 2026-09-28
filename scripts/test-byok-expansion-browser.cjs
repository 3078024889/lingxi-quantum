// Flow tests use intercepted supplier APIs; no paid generation occurs.
const assert=require('node:assert/strict');const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.TEST_BASE_URL||'http://127.0.0.1:3043';
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const page=await browser.newPage({viewport:{width:390,height:844}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const id='11111111-1111-4111-8111-111111111111';let tasks=[],actions=[];
 await page.route('**/api/sasi/projects',r=>r.fulfill({json:{projects:[{id,title:'Flow test',kind:'drama'}]}}));
 await page.route('**/api/sasi/byok/video**',async r=>{if(r.request().method()==='POST'){const b=r.request().postDataJSON();actions.push(b.action);
  if(b.action==='quote-series')tasks=b.shots.map((s,i)=>({id:'shot-'+i,state:'quoted',estimated_fen:s.duration*10,expires_at:new Date(Date.now()+600000).toISOString(),request:{...s,batchId:'batch1',batchShotCount:b.shots.length,shotIndex:i}}));
  if(b.action==='confirm'){assert.equal(b.acceptSupplierBilling,true);tasks.find(t=>t.id===b.taskId).state='queued';return r.fulfill({json:{state:'queued'}});}return r.fulfill({json:{tasks}});
 }return r.fulfill({json:{enabled:true,connected:true,profile:{model:'fixture',resolution:'720p',maxDuration:12},profiles:[{id:'p1',model:'fixture',resolution:'720p',maxDuration:12}],tasks,assets:[]}});});
 await page.goto(base+'/sasi/drama',{waitUntil:'networkidle'});await page.getByLabel('保存到项目').selectOption(id);
 await page.getByLabel('多集分镜').fill('1 | 5 | camera follows the red boat across the river\n2 | 8 | camera follows the same boat arriving on shore');
 await page.getByRole('button',{name:'整理并检查镜头'}).click();await page.getByText('我拥有素材使用权，同意标记 AI 生成',{exact:true}).click();await page.getByRole('button',{name:'查看每集费用'}).click();
 await page.getByText('第 1 集：1 镜 · 5 秒 · 预估 ¥0.50',{exact:true}).waitFor();await page.getByText('第 2 集：1 镜 · 8 秒 · 预估 ¥0.80',{exact:true}).waitFor();assert.deepEqual(actions,['quote-series']);
 await page.getByRole('button',{name:/同意剩余 2 镜/}).click();await page.getByText('本批镜头已提交，可以查询进度。',{exact:true}).waitFor();assert.deepEqual(actions,['quote-series','confirm','confirm']);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),false);await page.screenshot({path:'.codex-series-mobile.png',fullPage:true});
 let textCalls=[];await page.route('**/api/sasi/byok/text',async r=>{const b=r.request().postDataJSON();textCalls.push(b.action);return r.fulfill({json:{task:{id:'text1',state:b.action==='quote'?'quoted':'succeeded',estimated_fen:3,expires_at:new Date(Date.now()+600000).toISOString(),...(b.action==='confirm'?{output:{answer:'fixture site',website:{title:'My site',html:'<!doctype html><html><body><h1>My test site</h1><script>window.top.hacked=true</script><img src="https://bad.example/track"><form action="https://bad.example"></form></body></html>'}}}:{})}}});});
 await page.goto(base+'/sasi/build',{waitUntil:'networkidle'});await page.getByLabel('创作需求').fill('为手工陶艺工作室生成一个作品展示网站');await page.getByRole('button',{name:'查看本次费用'}).click();await page.getByRole('button',{name:'同意此预算并生成'}).waitFor();assert.deepEqual(textCalls,['quote']);await page.getByRole('button',{name:'同意此预算并生成'}).click();
 const frame=page.locator('iframe[title="网站预览"]');await frame.waitFor();assert.equal(await frame.getAttribute('sandbox'),'');const source=await frame.getAttribute('srcdoc');assert.ok(!source.includes('<script>'));assert.ok(!source.includes('<form'));assert.ok(!source.includes('src="https://bad.example'));
 const download=page.waitForEvent('download');await page.getByRole('button',{name:'下载网站文件'}).click();assert.equal((await download).suggestedFilename(),'sasi-website.zip');
 await page.goto(base+'/share/20260928',{waitUntil:'networkidle'});assert.match(await page.locator('meta[name="twitter:image"]').getAttribute('content'),/20260928/);
 assert.deepEqual(errors,[]);console.log('PASS: episode budget, explicit consent, sequential submission, mobile layout, sandboxed site artifact ZIP, fresh share metadata. Supplier responses are fixtures.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
