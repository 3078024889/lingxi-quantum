import {test,expect} from 'playwright/test';
test.beforeEach(async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('lx-public-upgrade:web-cn-upgrade-20261108','closed'));
});

for (const width of [1920,1440,390]) {
 test(`homepage artwork and aligned white windows at ${width}px`,async({page})=>{
  test.setTimeout(90000);
  await page.setViewportSize({width,height:width===390?844:1080});
  await page.goto('/?lang=zh');
  await expect(page.locator('#lx-home-hero-title')).toBeVisible({timeout:60000});
  const hero=page.locator('.lx-home-hero-art img');
  await expect.poll(()=>hero.evaluate((el:HTMLImageElement)=>el.complete&&el.naturalWidth>0)).toBe(true);
  const result=await page.evaluate(()=>{
   const rects=[...document.querySelectorAll('.lx-home-hero-section,.lx-home-growth-stack,.lx-home-directory,.lx-seo-answers')].map(e=>{const r=e.getBoundingClientRect();return {left:r.left,right:r.right};});
   const root=document.querySelector('.lx-home-reference')!;
   return {rects,background:getComputedStyle(root).backgroundColor,overflow:document.documentElement.scrollWidth>innerWidth+1};
  });
  expect(result.background).toBe('rgb(255, 255, 255)');
  expect(result.overflow).toBe(false);
  for(const rect of result.rects){expect(Math.abs(rect.left-result.rects[0].left)).toBeLessThanOrEqual(1);expect(Math.abs(rect.right-result.rects[0].right)).toBeLessThanOrEqual(1);}
  if(width>=1024)expect(await page.locator('[data-home-sidebar]').evaluate(el=>getComputedStyle(el).backgroundImage)).toBe('none');
  const globe=page.locator('.lx-home-distribution-globe img');
  await globe.scrollIntoViewIfNeeded();
  await expect.poll(()=>globe.evaluate((el:HTMLImageElement)=>el.complete&&el.naturalWidth>0)).toBe(true);
  await expect(page.locator('.lx-home-distribution-heading svg')).toHaveCount(0);
  await expect(page.locator('.lx-seo-question')).toHaveCount(16);
  const directory=page.locator('.lx-home-directory');
  await directory.locator('summary').click();
  await expect(directory).toHaveAttribute('open','');
  await directory.locator('summary').click();
  await expect(directory).not.toHaveAttribute('open','');
  await page.screenshot({path:`artifacts/home-white-glass-${width}.png`,fullPage:true});
 });
}
