import {test,expect} from './export-test';

test('global footer displays the same complete content on home, SIAI, SASI and tools',async({page})=>{
 test.setTimeout(180000);
 let original='';
 for(const path of ['/','/siai','/sasi','/tools']){
  await page.goto(path,{waitUntil:'domcontentloaded'});
  const footer=page.locator('footer.lx11-footer');
  await expect(footer).toBeAttached({timeout:30000});
  const overview=footer.locator('.lx-footer-unified');
  await expect(overview.getByRole('heading',{name:/全球 SIAI 工具平台 · 核心优势/})).toHaveCount(1);
  await expect(overview.locator('.lx-footer-market li')).toHaveCount(5);
  await expect(overview.locator('.lx-footer-tool-pills a')).toHaveCount(8);
  await expect(overview.locator('.lx-footer-search-list li')).toHaveCount(6);
  await expect(overview).toContainText('API Token调用费用估算与模型成本对比');
  await expect(footer).toContainText('PDF 工具');
  await expect(footer).toContainText('视频工具');
  await expect(footer).toContainText('灵犀场 LINGXIFIELD');
  await expect(footer).not.toContainText('AI 工具先比清楚，再决定用哪一个');
  await expect(footer.locator('.lx11-footer-social')).toBeAttached();
  await expect(footer.locator('.lx-footer-qr-row img')).toHaveCount(2);
  await expect(footer.locator('.lx11-footer-legal')).toBeAttached();
  const text=await overview.innerText();
  if(!original)original=text;
  else expect(text).toBe(original);
 }
});

test('footer search links point to ranked answers; layout has no horizontal overflow',async({page,isMobile})=>{
 test.setTimeout(120000);
 await page.goto('/siai');
 const overview=page.locator('.lx-footer-unified');
 await expect(overview).toBeAttached({timeout:30000});
 const links=overview.locator('.lx-footer-search-list li a');
 await expect(links).toHaveCount(6);
 const targets=['/siai#siai-search-ranking-0','/siai#siai-ranking-data','/siai#siai-filter-panel','/siai#siai-cost-calculator','/tools?q=PDF','/tools'];
 for(let i=0;i<6;i++)await expect(links.nth(i)).toHaveAttribute('href',targets[i]);
 const state=await overview.evaluate(el=>({
  columns:getComputedStyle(el.querySelector('.lx-footer-unified-columns')!).gridTemplateColumns,
  scrollWidth:el.scrollWidth,
  clientWidth:el.clientWidth,
  hasEmoji:el.textContent?.includes('💎')&&el.textContent?.includes('🧰')&&el.textContent?.includes('🎬')
 }));
 expect(state.scrollWidth).toBeLessThanOrEqual(state.clientWidth+2);
 expect(state.hasEmoji).toBeTruthy();
 if(isMobile)expect(state.columns.split(' ').length).toBe(1);
});
