import {test,expect} from './export-test';

test('footer QR cards are two-by-two, real and compact on desktop and mobile',async({page,isMobile})=>{
 test.setTimeout(150000);
 const platform=isMobile?'mobile':'desktop';
 await page.goto('/siai?lang=zh',{waitUntil:'domcontentloaded'});
 const footer=page.locator('footer.lx-footer-v4');
 const nav=footer.locator('.lx-footer-v4-nav');
 const contact=footer.locator('.lx-footer-v4-contact');
 await expect(nav).toBeVisible({timeout:30000});
 await nav.scrollIntoViewIfNeeded();
 const cards=contact.locator('.lx-footer-v4-qr-card');
 const images=cards.locator('img');
 await expect(cards).toHaveCount(4);
 await expect(contact.locator('.lx-footer-v4-miniapp-actions button')).toHaveCount(2);
 for(let i=0;i<4;i++)await images.nth(i).scrollIntoViewIfNeeded();
 await expect.poll(()=>images.evaluateAll(nodes=>nodes.every(node=>{
  const img=node as HTMLImageElement;
  return img.complete&&img.naturalWidth>0&&img.naturalHeight>0;
 })),{timeout:25000}).toBe(true);
 const rects=await cards.evaluateAll(nodes=>nodes.map(node=>{
  const b=node.getBoundingClientRect();
  return {x:b.x,y:b.y,w:b.width,h:b.height};
 }));
 expect(Math.abs(rects[0].y-rects[1].y)).toBeLessThan(5);
 expect(Math.abs(rects[2].y-rects[3].y)).toBeLessThan(5);
 expect(rects[2].y).toBeGreaterThan(rects[0].y+rects[0].h-10);
 expect(rects[1].x).toBeGreaterThan(rects[0].x);
 const info=await nav.evaluate(el=>{
  const c=el.querySelector('.lx-footer-v4-contact')!;
  return {
   columns:getComputedStyle(el).gridTemplateColumns.trim().split(/\s+/).length,
   max:Math.round(el.scrollWidth-el.clientWidth),
   contactHeight:Math.round(c.getBoundingClientRect().height),
   footerHeight:Math.round(el.getBoundingClientRect().height)
  };
 });
 expect(info.max).toBeLessThanOrEqual(2);
 expect(info.contactHeight).toBeLessThan(470);
 if(isMobile)expect(info.columns).toBeLessThanOrEqual(2);
 else if(await page.evaluate(()=>innerWidth>1390))expect(info.columns).toBe(6);
 await nav.screenshot({path:'test-results/footer-v4-qr-nav-'+platform+'.png',animations:'disabled'});
});

test('mini-program command copy actually reaches the clipboard, no tall raw-code tail',async({page})=>{
 test.setTimeout(90000);
 await page.context().grantPermissions(['clipboard-read','clipboard-write']);
 await page.goto('/siai?lang=zh',{waitUntil:'domcontentloaded'});
 const footer=page.locator('footer.lx-footer-v4');
 const actions=footer.locator('.lx-footer-v4-miniapp-actions button');
 await expect(actions).toHaveCount(2);
 await expect(footer.locator('.lx-footer-miniapp-code')).toHaveCount(0);
 await expect(footer.locator('.lx-footer-wechat-extra')).toHaveCount(0);
 await actions.first().scrollIntoViewIfNeeded();
 await actions.first().click();
 await expect(actions.first()).toContainText('已复制');
 expect(await page.evaluate(()=>navigator.clipboard.readText())).toBe('#小程序://灵犀场/ktKRUjMRoEcPEsE');
 await actions.nth(1).click();
 await expect(actions.nth(1)).toContainText('已复制');
 expect(await page.evaluate(()=>navigator.clipboard.readText())).toBe('#小程序://10临时邮箱/p8AACkYNods09Rl');
});

test('footer contact links and QR targets do not become fake mini-app QR codes',async({page})=>{
 await page.goto('/siai?lang=zh',{waitUntil:'domcontentloaded'});
 const cards=page.locator('.lx-footer-v4-contact .lx-footer-v4-qr-card');
 await expect(cards.nth(0).locator('img')).toHaveAttribute('src',/lingxifield-wechat-service-qr/);
 await expect(cards.nth(1)).toHaveAttribute('href',/weixin\.qq\.com\/r\/mp\/oycQCBfEPUpCrVNr93Kx/);
 await expect(cards.nth(2).locator('img')).toHaveAttribute('src',/miniapp-qrcode/);
 await expect(cards.nth(3)).toHaveAttribute('href',/weixin\.qq\.com\/r\/mp\/_yAoMCzEYnEdrWhT93Xp/);
 await expect(page.locator('.lx-footer-brand-social a')).toHaveCount(10);
 await expect(page.locator('.lx11-footer-logo img')).toHaveAttribute('src',/lingxifield-logo/);
});
