import {test,expect} from './export-test';

for(const width of [1680,390]) {
 test(`afternoon homepage is readable, complete and fits ${width}px`,async({page})=>{
  test.setTimeout(90000);
  await page.setViewportSize({width,height:width===390?844:945});
  await page.goto('/?lang=zh');
  const title=page.locator('#lx-home-hero-title');
  await expect(title).toBeVisible({timeout:60000});
  const appearance=await title.evaluate(el=>{
   const c=getComputedStyle(el),copy=el.closest('.lx-home-hero-copy')!,grid=el.closest('.lx-home-hero-grid')!;
   return {textFill:c.webkitTextFillColor,color:c.color,fontSize:parseFloat(c.fontSize),copyLayer:Number(getComputedStyle(copy).zIndex),veilLayer:Number(getComputedStyle(grid,'::after').zIndex)};
  });
  expect(appearance.textFill).not.toBe('rgba(0, 0, 0, 0)');
  expect(appearance.color).not.toBe('rgb(255, 255, 255)');
  expect(appearance.fontSize).toBeGreaterThanOrEqual(30);
  expect(appearance.copyLayer).toBeGreaterThan(appearance.veilLayer);
  const image=page.locator('.lx-home-hero-art img');
  await expect.poll(()=>image.evaluate((el:HTMLImageElement)=>el.complete&&el.naturalWidth>0)).toBe(true);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  await expect(page.locator('.lx-home-feature-card')).toHaveCount(6);
  await expect(page.locator('.lx-home-growth-card')).toHaveCount(6);
  await expect(page.locator('.lx-home-siai-category-card')).toHaveCount(6);
  await expect(page.locator('.lx-seo-question')).toHaveCount(16);
  await expect(page.locator('#lx-seo-market,#lx-seo-tools,.lx-home-faq-aside')).toHaveCount(0);
  await page.screenshot({path:`artifacts/afternoon-home-${width}.png`,fullPage:true});
 });
 test(`account without a session offers real sign-in on ${width}px`,async({page,context})=>{
  test.setTimeout(90000);
  await context.clearCookies();
  await page.setViewportSize({width,height:844});
  await page.goto('/account?lang=zh');
  const form=page.locator('form[action="/account/auth"]');
  await expect(form).toBeVisible({timeout:60000});
  await expect(form.locator('input[name="email"]')).toBeVisible();
  await expect(form.locator('input[name="password"]')).toBeVisible();
  await expect(page.getByText('账户状态暂时无法读取',{exact:true})).toHaveCount(0);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  await page.screenshot({path:`artifacts/afternoon-account-${width}.png`,fullPage:false});
 });
}
