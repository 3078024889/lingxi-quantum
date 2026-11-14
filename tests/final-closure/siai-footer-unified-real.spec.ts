import {test,expect} from './export-test';

test('global footer displays the same complete content on home, SIAI, SASI and tools',async({page})=>{
 test.setTimeout(180000);
 let original='';
 for(const path of ['/','/siai','/sasi','/tools']){
  await page.goto(path,{waitUntil:'domcontentloaded'});
  const footer=page.locator('footer.lx11-footer');
  await expect(footer).toBeAttached({timeout:30000});
  const directory=footer.locator("details.lx-footer-directory");
  const compact=await directory.count()>0;
  if(compact)await directory.locator("summary").click();
  const overview=footer.locator('.lx-footer-unified');
  await expect(overview.getByRole('heading',{name:'🌍 全球SIAI排行榜｜全球SI AI工具行情平台'})).toHaveCount(1);
  await expect(overview.locator('.lx-footer-market li')).toHaveCount(7);
  await expect(overview.locator('.lx-footer-v3-toolstrip>a')).toHaveCount(6);
  await expect(overview.locator('.lx-footer-search-list li')).toHaveCount(6);
  await expect(overview).toContainText('API Token调用费用估算与模型成本对比');
  await expect(overview).toContainText('临时邮箱、阅后即焚、隐私清理、文件加密。');
  await expect(overview).toContainText('食物卡路里识别');
  await expect(footer.locator('.lx-footer-v3-sasi')).toHaveCount(compact?0:1);
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


test('footer QQ groups copy real numbers and Telegram links remain correct on every main surface',async({page,isMobile})=>{
 test.setTimeout(150000);
 await page.addInitScript(()=>{
  (window as any).__footerCopiedQQ=[];
  Object.defineProperty(navigator,'clipboard',{configurable:true,value:{
   writeText:async(value:string)=>{(window as any).__footerCopiedQQ.push(value);}
  }});
 });
 for(const route of ['/siai?lang=zh','/sasi?lang=zh','/tools?lang=zh']){
  await page.goto(route,{waitUntil:'domcontentloaded'});
  const footer=page.locator('footer.lx11-footer');
  const brand=footer.locator('.lx11-footer-brand');
  const groups=brand.locator('.lx-footer-v4-groups');
  await expect(groups).toBeVisible({timeout:30000});
  await expect(groups.getByRole('heading',{name:'群组'})).toBeVisible();
  await expect(groups.getByText('QQ 群',{exact:true})).toBeVisible();
  for(const number of ['1072178710','1074475201']){
   const button=groups.getByRole('button',{name:'复制群号 '+number});
   await expect(button).toBeVisible();
   await button.click();
   await expect.poll(()=>page.evaluate(()=>(window as any).__footerCopiedQQ.at(-1))).toBe(number);
   await expect(button.locator('.lx-footer-v4-group-copy')).toHaveText('✓');
  }
  const telegram=groups.getByRole('link',{name:/Telegram.*globalsiai/});
  await expect(telegram).toHaveAttribute('href','https://t.me/globalsiai');
  await expect(telegram).toHaveAttribute('target','_blank');
  await expect(telegram).toHaveAttribute('rel',/noopener/);
  await expect(brand.locator('.lx-footer-brand-social a')).toHaveCount(10);
  await expect(footer.locator('.lx-footer-v4-qr-grid img')).toHaveCount(4);
  await expect(footer.locator('.lx-footer-v4-miniapp-actions button')).toHaveCount(2);
  const layout=await groups.evaluate(el=>{
   const r=el.getBoundingClientRect(),parent=el.closest('.lx11-footer-brand')!.getBoundingClientRect();
   return {width:r.width,inside:r.left>=parent.left-2&&r.right<=parent.right+2,overflow:el.scrollWidth-el.clientWidth};
  });
  expect(layout.inside).toBe(true);
  expect(layout.overflow).toBeLessThanOrEqual(2);
  if(isMobile)expect(layout.width).toBeLessThanOrEqual(page.viewportSize()!.width);
 }
});
