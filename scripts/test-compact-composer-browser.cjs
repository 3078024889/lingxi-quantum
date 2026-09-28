const assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.TEST_BASE_URL||'http://127.0.0.1:3050';
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 for(const width of [1920,390]){
  const page=await browser.newPage({viewport:{width,height:950}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  for(const route of ['/sasi/drama','/sasi/build']){
   await page.goto(base+route,{waitUntil:'networkidle'});
   const field=page.locator('main textarea').first();await field.waitFor();
   await field.fill('为这张图片制作一段广告视频');
   const short=await field.boundingBox();assert.ok(short.height<=60,'short input must remain compact');
   const panel=await field.evaluate(el=>({width:el.parentElement.getBoundingClientRect().width,height:el.parentElement.getBoundingClientRect().height}));
   if(width===1920)assert.ok(panel.width>=950,'desktop composer must be wide');
   assert.ok(panel.height<=185,'empty composer must not be tall');
   await field.fill(Array(30).fill('请根据我提供的资料制作，保留所有重要细节。').join('\n'));
   await page.waitForTimeout(100);assert.ok((await field.boundingBox()).height<=218);
   await field.fill('写下想法，开始创作');await page.waitForTimeout(100);assert.ok((await field.boundingBox()).height<=60);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),false);
   await page.screenshot({path:`_local/compact-${route.endsWith('drama')?'drama':'build'}-${width}.png`,fullPage:false});
  }
  assert.deepEqual(errors,[]);await page.close();
 }
 console.log('PASS: wide desktop composer, compact mobile toolbar, growth/shrink, both creation pages and no browser runtime errors. No generation called.');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
