import {test,expect} from 'playwright/test';

const home='#siai-market';
const rows='.siai-home-tr';

test.beforeEach(async ({page})=>{
 await page.goto('/',{waitUntil:'domcontentloaded'});
 await expect(page.locator(home)).toBeVisible();
 await expect(page.locator(rows)).toHaveCount(32);
});

test('task search filters the actual 32 product rows and safely handles no results',async({page})=>{
 const search=page.locator('.siai-home-search input');
 await expect(search).toBeVisible();
 await search.fill('ComfyUI');
 const filtered=await page.locator(rows).count();
 expect(filtered).toBeGreaterThan(0);
 expect(filtered).toBeLessThan(32);
 await expect(page.locator(rows).first()).toContainText('ComfyUI');
 await search.fill('this-siai-product-does-not-exist-974189');
 await expect(page.locator(rows)).toHaveCount(0);
 await expect(page.locator('.siai-home-empty')).toBeVisible();
 await search.clear();
 await expect(page.locator(rows)).toHaveCount(32);
});

test('source-linked product details open inline and close without losing catalog',async({page})=>{
 const first=page.locator(rows).first();
 const control=first.locator('button[aria-expanded]');
 await expect(control).toHaveAttribute('aria-expanded','false');
 await control.click();
 await expect(control).toHaveAttribute('aria-expanded','true');
 await expect(page.locator('.siai-home-expanded-row')).toHaveCount(1);
 const detail=page.locator('.siai-home-detail');
 await expect(detail.locator('h2')).toBeVisible();
 await expect(detail.locator('dl > div')).toHaveCount(6);
 const official=detail.locator('.siai-home-sources a');
 expect(await official.count()).toBeGreaterThan(0);
 const links=await official.evaluateAll(nodes=>nodes.map(n=>(n as HTMLAnchorElement).href));
 expect(links.every(href=>href.startsWith('https://'))).toBe(true);
 await detail.locator('button').first().click();
 await expect(page.locator('.siai-home-expanded-row')).toHaveCount(0);
 await expect(page.locator(rows)).toHaveCount(32);
});

test('compare two independently selected products, then remove one without losing the other',async({page})=>{
 const all=page.locator(rows);
 const firstName=(await all.nth(0).locator('.siai-home-identity strong').first().innerText()).trim();
 const secondName=(await all.nth(1).locator('.siai-home-identity strong').first().innerText()).trim();
 await all.nth(0).locator('button[aria-pressed]').click();
 await all.nth(1).locator('button[aria-pressed]').click();
 const bar=page.locator('.siai-compare-toolbar');
 await expect(bar).toBeVisible();
 await expect(bar).toContainText(firstName);
 await expect(bar).toContainText(secondName);
 await bar.locator(':scope > button').first().click();
 const table=page.locator('#siai-comparison');
 await expect(table).toBeVisible();
 await expect(table.locator('thead th')).toHaveCount(3);
 await expect(table).toContainText(firstName);
 await expect(table).toContainText(secondName);
 await bar.locator('button[aria-label]').filter({hasText:firstName}).first().click();
 await expect(bar).not.toContainText(firstName);
 await expect(bar).toContainText(secondName);
 await expect(page.locator(rows)).toHaveCount(32);
});

test('all nine languages switch the actual ranking interface, Arabic flips reading direction',async({page},testInfo)=>{
 test.skip(testInfo.project.name!=='desktop-chromium','Language selector is in a desktop sidebar; mobile uses account menu');
 const select=page.locator('aside.lx11-sidebar:not(.lx11-drawer) select.lx11-lang-select:has(option[value="ar"])');
 await expect(select).toBeVisible();
 const main=page.locator(home);
 const langs=['zh','en','ja','ko','fr','de','es','pt','ar'];
 for(const lang of langs){
  await select.selectOption(lang);
  await expect(select).toHaveValue(lang);
  await expect(main).toHaveAttribute('dir',lang==='ar'?'rtl':'ltr');
  const h=main.locator('h1');
  await expect(h).toBeVisible();
  expect((await h.innerText()).trim().length).toBeGreaterThan(4);
  await expect(page.locator(rows)).toHaveCount(32);
 }
 await select.selectOption('en');
 await expect(main.locator('h1')).toHaveText('Global SIAI Rankings');
});

test('mobile: all four facet rows remain present, table scrolls and inline details are operable',async({page},testInfo)=>{
 test.skip(testInfo.project.name!=='mobile-chromium','Mobile-only real viewport test');
 await expect(page.locator('.siai-filter-line')).toHaveCount(4);
 const scroll=page.locator('.siai-home-table-scroll');
 const dimensions=await scroll.evaluate(el=>({width:el.clientWidth,content:el.scrollWidth}));
 expect(dimensions.content).toBeGreaterThan(dimensions.width);
 const left=await scroll.evaluate(el=>{el.scrollLeft=500;return el.scrollLeft});
 expect(left).toBeGreaterThan(0);
 await page.locator(rows).first().locator('button[aria-expanded]').click();
 await expect(page.locator('.siai-home-detail')).toBeVisible();
 await expect(page.locator('.siai-home-expanded-row')).toHaveCount(1);
});


test('all 32 product pages show three factual deliverables, six visible answers and first-party references',async({page},info)=>{
 test.skip(info.project.name!=='desktop-chromium','One exhaustive catalog crawl on desktop, mobile gets separate layout test');
 test.setTimeout(180_000);
 const ids=[
  'anthropic-sdk-python','chatgpt','claude','comfyui','deepseek','dify','elevenlabs','fasterwhisper',
  'gemini','grok','langchain','llamacpp','llamaindex','lovable','luma','midjourney','n8n','ollama',
  'openwebui','openai-python','perplexity','replit','runway','automatic1111','suno','transformers',
  'vllm','whisper','qwen','jimeng','kling','doubao'
 ];
 for(const id of ids){
  const response=await page.goto('/siai/zh/'+id,{waitUntil:'domcontentloaded'});
  expect(response?.status(),id+': route status').toBe(200);
  await expect(page.locator('.siai-answer-lead h2'),id+': actual task answer').toBeVisible();
  await expect(page.locator('.siai-capability-card'),id+': evidence-backed features').toHaveCount(3);
  await expect(page.locator('.siai-direct-answers-grid article'),id+': direct six answers').toHaveCount(6);
  await expect(page.locator('.siai-start-steps li'),id+': beginner action steps').toHaveCount(3);
  const urls=await page.locator('.siai-capability-card a').evaluateAll(nodes=>
   nodes.map(el=>(el as HTMLAnchorElement).href));
  expect(urls.length,id+': missing feature links').toBe(3);
  expect(urls.every(url=>url.startsWith('https://')),id+': unsafe evidence source').toBe(true);
 }
});

test('nine language product routes show native answer, six localized facts and Arabic RTL',async({page},info)=>{
 test.skip(info.project.name!=='desktop-chromium','One nine-language deep route sweep');
 test.setTimeout(90_000);
 for(const lang of ['zh','en','ja','ko','fr','de','es','pt','ar']){
  const response=await page.goto('/siai/'+lang+'/runway',{waitUntil:'domcontentloaded'});
  expect(response?.status()).toBe(200);
  const pageBody=page.locator('.siai-detail-page');
  await expect(pageBody).toHaveAttribute('dir',lang==='ar'?'rtl':'ltr');
  await expect(page.locator('.siai-answer-lead')).toBeVisible();
  await expect(page.locator('.siai-capability-card')).toHaveCount(3);
  await expect(page.locator('.siai-direct-answers-grid article')).toHaveCount(6);
  await expect(page.locator('.siai-start-steps li')).toHaveCount(3);
 }
});

test('mobile real product page retains the source cards and answers without horizontal overflow',async({page},info)=>{
 test.skip(info.project.name!=='mobile-chromium','Actual Pixel 7 layout only');
 const response=await page.goto('/siai/zh/midjourney',{waitUntil:'domcontentloaded'});
 expect(response?.status()).toBe(200);
 await expect(page.locator('.siai-capability-card')).toHaveCount(3);
 await expect(page.locator('.siai-direct-answers-grid article')).toHaveCount(6);
 const size=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,visible:window.innerWidth}));
 expect(size.scroll).toBeLessThanOrEqual(size.visible+3);
});
