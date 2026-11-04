import {test,expect} from './export-test';

test('global footer displays the same complete content on home, SIAI, SASI and tools',async({page})=>{
 test.setTimeout(180000);
 let original='';
 for(const path of ['/','/siai','/sasi','/tools']){
  await page.goto(path,{waitUntil:'domcontentloaded'});
  const footer=page.locator('footer.lx11-footer');
  await expect(footer).toBeAttached({timeout:30000});
  const overview=footer.locator('.lx-footer-unified');
  await expect(overview.getByRole('heading',{name:'🌍 全球SIAI排行榜｜全球SI AI工具行情平台'})).toHaveCount(1);
  await expect(overview.locator('.lx-footer-market li')).toHaveCount(7);
  await expect(overview.locator('.lx-footer-v3-toolstrip>a')).toHaveCount(6);
  await expect(overview.locator('.lx-footer-search-list li')).toHaveCount(6);
  await expect(overview).toContainText('API Token调用费用估算与模型成本对比');
  await expect(overview).toContainText('临时邮箱、阅后即焚、隐私清理、文件加密。');
  await expect(overview).toContainText('食物卡路里识别');
  await expect(footer.locator('.lx-footer-v3-sasi')).toHaveCount(1);
  await expect(footer).not.toContainText('AI 工具先比清楚，再决定用哪一个');
  await expect(footer.locator('.lx-footer-brand-social')).toBeAttached();
  await expect(footer.locator('.lx-footer-v4-qr-grid img')).toHaveCount(4);
  await expect(footer.locator('.lx-footer-v4-miniapp-actions button')).toHaveCount(2);
  await expect(footer.locator('.lx-footer-wechat-extra')).toHaveCount(0);
  await expect(footer.locator('.lx-footer-miniapp-code')).toHaveCount(0);
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
 for(let i=0;i<6;i++)await expect(links.nth(i)).toHaveAttribute('href','/siai#siai-search-ranking-'+i);
 const state=await overview.evaluate(el=>({
  columns:getComputedStyle(el.querySelector('.lx-footer-unified-columns')!).gridTemplateColumns,
  scrollWidth:el.scrollWidth,
  clientWidth:el.clientWidth,
  hasEmoji:el.textContent?.includes('🌍')&&el.textContent?.includes('🧰')&&el.textContent?.includes('🎬')
 }));
 expect(state.scrollWidth).toBeLessThanOrEqual(state.clientWidth+2);
 expect(state.hasEmoji).toBeTruthy();
 if(isMobile)expect(state.columns.split(' ').length).toBe(1);
});
