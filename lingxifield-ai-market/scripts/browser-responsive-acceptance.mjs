import assert from 'node:assert/strict';
import {chromium,devices} from 'playwright';

const origin=process.env.AI_MARKET_BASE_URL||'http://127.0.0.1:3302';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const failures=[];
async function run(label,fn){try{await fn();console.log('PASS '+label)}catch(err){failures.push(label+' '+err.message);console.error('FAIL '+label+' '+err.stack)}}
async function goto(page,url){
 await page.goto(origin+url,{waitUntil:'domcontentloaded',timeout:45000});
 await page.locator('#tools-list').waitFor({timeout:30000});
}
await run('Mobile 390px Chinese drawer open, auto-close and overlay',async()=>{
 const context=await browser.newContext({...devices['iPhone 13'],browserName:undefined,viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 const page=await context.newPage();await goto(page,'/zh/ai');
 const toggle=page.locator('.lxMobileCategoriesButton');
 assert.ok(await toggle.isVisible());assert.equal(await toggle.getAttribute('aria-expanded'),'false');
 await toggle.click();
 assert.equal(await toggle.getAttribute('aria-expanded'),'true');
 assert.ok(await page.locator('#market-category-sidebar').isVisible());
 await page.waitForTimeout(320); // allow the 230ms CSS slide transition to settle
 const sidebar=await page.locator('#market-category-sidebar').boundingBox();
 assert.ok(sidebar&&sidebar.x>=-2&&sidebar.x+sidebar.width<=392,'drawer inside 390px viewport');
 await page.locator('#market-category-sidebar > button').first().click();
 assert.equal(await toggle.getAttribute('aria-expanded'),'false');
 await toggle.click();await page.locator('.lxCategoryBackdrop').click({position:{x:350,y:400}});
 assert.equal(await toggle.getAttribute('aria-expanded'),'false');
 await context.close();
});
await run('Mobile 768px landscape and swipe-safe table',async()=>{
 const context=await browser.newContext({viewport:{width:768,height:1024},hasTouch:true,isMobile:true});
 const page=await context.newPage();await goto(page,'/en/ai');
 assert.ok(await page.locator('.lxMobileCategoriesButton').isVisible());
 assert.ok(await page.locator('.marketOverviewViewport').isVisible());
 const width=await page.locator('main').evaluate(el=>el.getBoundingClientRect().width);
 assert.ok(width<=770,'main fits 768px viewport');
 await context.close();
});
await run('Arabic mobile RTL drawer opens from right and Escape closes',async()=>{
 const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
 const page=await context.newPage();await goto(page,'/ar/ai');
 assert.equal(await page.locator('.app').getAttribute('dir'),'rtl');
 const toggle=page.locator('.lxMobileCategoriesButton');await toggle.click();
 await page.waitForTimeout(320);
 const box=await page.locator('#market-category-sidebar').boundingBox();
 assert.ok(box&&box.x>45&&box.x+box.width<393,'RTL starts from right: '+JSON.stringify(box));
 await page.keyboard.press('Escape');
 assert.equal(await toggle.getAttribute('aria-expanded'),'false');
 await context.close();
});
await run('Right-side help drawer opens without layout space on phone and desktop',async()=>{
 for(const width of [390,1440]){
  const context=await browser.newContext({viewport:{width,height:900},hasTouch:width<900,isMobile:width<900});
  const page=await context.newPage();await goto(page,'/en/ai');
  const drawer=page.locator('#market-help-sidebar'),toggle=page.locator('.lxRightPanelToggle');
  assert.ok(await toggle.isVisible());
  assert.equal(await drawer.isVisible(),false);
  await toggle.click();
  assert.equal(await toggle.getAttribute('aria-expanded'),'true');
  assert.ok(await drawer.isVisible());
  assert.ok(await drawer.locator('#compare').isVisible());
  const rect=await drawer.boundingBox();
  assert.ok(rect&&rect.x>=0&&rect.x+rect.width<=width+2);
  await page.keyboard.press('Escape');
  assert.equal(await toggle.getAttribute('aria-expanded'),'false');
  assert.equal(await drawer.isVisible(),false);
  await context.close();
 }
});
await run('Desktop 1440px category collapse expands content and reopens',async()=>{
 const context=await browser.newContext({viewport:{width:1440,height:900}});
 const page=await context.newPage();await goto(page,'/zh/ai');
 const toggle=page.locator('.lxDesktopCategoriesButton');
 assert.ok(await toggle.isVisible());
 const before=(await page.locator('.central').boundingBox()).width;
 await toggle.click();assert.equal(await toggle.getAttribute('aria-expanded'),'false');
 const after=(await page.locator('.central').boundingBox()).width;
 assert.ok(after>before+100,'central expands by removing sidebar: '+before+' -> '+after);
 await toggle.click();assert.equal(await toggle.getAttribute('aria-expanded'),'true');
 await context.close();
});
await run('Tablet+desktop 3 browser widths have no empty dedicated right column',async()=>{
 for(const width of [1024,1600,1920]){
  const context=await browser.newContext({viewport:{width,height:980}});
  const page=await context.newPage();await goto(page,'/en/ai');
  const aside=page.locator('.rightAside');
  assert.equal(await aside.isVisible(),false,'no empty right column at '+width);
  const viewport=await page.locator('.central').boundingBox();
  assert.ok(viewport.width>Math.min(700,width*.65),'main content takes the wide screen at '+width);
  await context.close();
 }
});
await browser.close();
if(failures.length){console.error(JSON.stringify({failed:failures.length,failures},null,2));process.exit(1)}
console.log('BROWSER_RESPONSIVE_ACCEPTANCE=PASS');
