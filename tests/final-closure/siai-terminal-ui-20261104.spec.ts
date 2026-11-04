import {test,expect} from './export-test';

// Real browser assertions; generated design mockups are never used as catalog data.
test('compact verified rows, two synchronized horizontal tracks and natural wheel scroll',async({page,isMobile})=>{
 test.setTimeout(120000);
 await page.goto('/siai');
 const rows=page.locator('.siai-home-table tbody tr.siai-home-tr');
 await expect(rows).toHaveCount(62);
 const first=rows.first();
 await expect(first.locator('.siai-brand-name')).toContainText('Microsoft Copilot');
 await expect(first.locator('.siai-brand-logo')).toBeVisible();
 await expect(first.locator('.siai-identity-line')).toContainText(['Microsoft','1975']);
 await expect(first.locator('.siai-identity-line a.siai-source-compact').first()).toHaveAttribute('href',/^https:\/\//);
 const height=await first.evaluate(el=>el.getBoundingClientRect().height);
 expect(height).toBeLessThan(250);
 await expect(page.locator('.siai-home-table-flow')).toBeVisible();
 await expect(page.getByLabel('每页显示')).toHaveValue('100');
 const top=page.locator('.siai-home-top-scroll'),bottom=page.locator('.siai-home-bottom-scroll'),table=page.locator('.siai-home-table-scroll');
 await expect(top).toBeVisible();
 await expect(bottom).toBeAttached();
 await top.evaluate((el:HTMLElement)=>{el.scrollLeft=180;el.dispatchEvent(new Event('scroll'));});
 await expect.poll(()=>table.evaluate((el:HTMLElement)=>el.scrollLeft)).toBeGreaterThan(140);
 await expect.poll(()=>bottom.evaluate((el:HTMLElement)=>el.scrollLeft)).toBeGreaterThan(140);
 await bottom.evaluate((el:HTMLElement)=>{el.scrollLeft=260;el.dispatchEvent(new Event('scroll'));});
 await expect.poll(()=>table.evaluate((el:HTMLElement)=>el.scrollLeft)).toBeGreaterThan(240);
 // Wheel scrolling over the expanded table must move the page rather than trap the pointer.
 await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
 const rect=await table.boundingBox();
 expect(rect).not.toBeNull();
 await page.mouse.move(Math.min(rect!.x+150,page.viewportSize()!.width-30),Math.min(Math.max(rect!.y+30,100),page.viewportSize()!.height-70));
 const before=await page.evaluate(()=>scrollY);
 await page.mouse.wheel(0,520);
 await expect.poll(()=>page.evaluate(()=>scrollY)).toBeGreaterThan(before+100);
 await page.evaluate(()=>window.scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'}));
 await expect(page.locator('.lx11-footer-legal')).toBeInViewport({ratio:0.25});
 const full=page.locator('.siai-home-fullscreen');
 const toggle=page.getByRole('button',{name:/全屏查看榜单|Expand rankings|全画面表示|전체 화면|Plein écran|Vollbild|Pantalla completa|Tela cheia|عرض كامل/}).first();
 await toggle.evaluate((el:HTMLElement)=>el.scrollIntoView({block:'center'}));
 await toggle.click();
 await expect(full).toBeVisible();
 expect(await page.evaluate(()=>getComputedStyle(document.body).overflowY)).not.toBe('hidden');
 await page.keyboard.press('Escape');
 await expect(full).toHaveCount(0);
 // On mobile, maintain touch-readable company metadata; in desktop, capture the actual table.
 await test.info().attach(isMobile?'ranking-mobile.png':'ranking-desktop.png',{body:await page.locator('.siai-ranking-data').screenshot({timeout:30000}),contentType:'image/png'});
});

test('real cost formulas remain interactive in three panels, then six search cards and SaaS footer',async({page,isMobile})=>{
 test.setTimeout(150000);
 await page.goto('/siai');
 const cost=page.locator('#siai-cost-calculator');
 await cost.locator(':scope > summary').click();
 const panels=cost.locator('.siai-cost-grid');
 await expect(panels).toHaveCount(1);
 await expect(cost.locator('.siai-cost-guide li')).toHaveCount(3);
 const params=cost.locator('.lxCostFields input[type="number"]');
 await expect(params).not.toHaveCount(0);
 const prior=await cost.locator('.siai-cost-results').innerText();
 const count=cost.locator('.siai-cost-settings input[type="number"]').nth(1);
 await count.fill('7');
 await expect.poll(async()=>cost.locator('.siai-cost-results').innerText()).not.toBe(prior);
 if(!isMobile){
  const grid=await panels.evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').filter(Boolean).length);
  expect(grid).toBe(3);
 }
 await test.info().attach(isMobile?'cost-mobile.png':'cost-desktop.png',{body:await cost.screenshot({timeout:30000}),contentType:'image/png'});
 await cost.getByRole('button',{name:/短剧生成|Short film/}).click();
 await expect(cost.locator('.siai-cost-settings')).toBeVisible();
 await cost.getByRole('button',{name:/程序接口 API|Developer API/}).click();
 await expect(cost.locator('.siai-cost-grid')).toHaveCount(1);
 await expect(cost.locator('.siai-cost-results')).toBeVisible();
 const discovery=page.locator('[data-siai-search-intents="ranking"]');
 await expect(discovery.locator('.siai-discovery-card')).toHaveCount(6);
 await expect(discovery.locator('a[href="/siai#siai-cost-calculator"]')).toHaveCount(1);
 await test.info().attach(isMobile?'seo-mobile.png':'seo-desktop.png',{body:await discovery.screenshot({timeout:30000}),contentType:'image/png'});
 const footer=page.locator('footer.lx11-footer');
 await expect(footer.locator('.lx11-footer-grid>nav')).toHaveCount(4);
 await expect(footer.locator('.lx-footer-tool-pills>a')).toHaveCount(8);
 await expect(footer.locator('.lx-footer-search-list li')).toHaveCount(6);
 await expect(footer.locator('.lx-footer-qr-row img')).toHaveCount(2);
 await expect(footer.locator('.lx-footer-language select')).toHaveValue('zh');
 await test.info().attach(isMobile?'footer-mobile.png':'footer-desktop.png',{body:await footer.screenshot({timeout:30000}),contentType:'image/png'});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2)).toBe(true);
});
