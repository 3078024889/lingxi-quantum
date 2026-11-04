import {test,expect} from './export-test';

test('SIAI opens on actual ranked data, not six search cards; compact table stays navigable',async({page})=>{
 test.setTimeout(90000);
 await page.goto('/siai');
 const table=page.locator('.siai-home-table-scroll');
 const rankingSearch=page.locator('[data-siai-search-intents="ranking"]');
 await expect(table).toBeVisible({timeout:30000});
 await expect(table.locator('tbody tr.siai-home-tr')).not.toHaveCount(0);
 await expect(rankingSearch).toHaveCount(1);
 const layout=await page.evaluate(()=>{
  const table=document.querySelector('.siai-home-table-scroll')!;
  const discovery=document.querySelector('[data-siai-search-intents="ranking"]')!;
  const footer=document.querySelector('.lx11-footer')!;
  const rect=table.getBoundingClientRect();
  return {tableY:rect.top,windowH:innerHeight,tableWidth:table.scrollWidth,tableViewport:table.clientWidth,tableBeforeSearch:!!(table.compareDocumentPosition(discovery)&Node.DOCUMENT_POSITION_FOLLOWING),searchBeforeFooter:!!(discovery.compareDocumentPosition(footer)&Node.DOCUMENT_POSITION_FOLLOWING),footerSearchDuplicate:footer.querySelectorAll('nav[aria-label*="排行榜搜索入口"]').length};
 });
 expect(layout.tableBeforeSearch).toBe(true);
 expect(layout.searchBeforeFooter).toBe(true);
 expect(layout.tableY).toBeLessThan(layout.windowH);
 expect(layout.tableWidth).toBeGreaterThan(layout.tableViewport);
 expect(layout.tableWidth).toBeLessThanOrEqual(1750);
 expect(layout.footerSearchDuplicate).toBe(0);
 await expect(page.locator('.siai-home-cost-accordion')).toHaveCount(1);
 const hasTableBeforeCost=await page.evaluate(()=>{
  const table=document.querySelector('.siai-home-table-scroll')!;
  const cost=document.querySelector('.siai-home-cost-accordion')!;
  return !!(table.compareDocumentPosition(cost)&Node.DOCUMENT_POSITION_FOLLOWING);
 });
 expect(hasTableBeforeCost).toBe(true);
 const top=page.locator('.siai-home-top-scroll');
 await top.evaluate((el:HTMLElement)=>{el.scrollLeft=220});
 await expect.poll(()=>table.evaluate((el:HTMLElement)=>el.scrollLeft)).toBeGreaterThan(150);
});

test('SIAI ranking fullscreen view expands to viewport and exits without losing filters',async({page})=>{
 test.setTimeout(90000);
 await page.goto('/siai');
 const toggle=page.getByRole('button',{name:/全屏查看榜单|Expand rankings|全画面表示|전체 화면|Plein écran|Vollbild|Pantalla completa|Tela cheia|عرض كامل/}).first();
 await expect(toggle).toBeVisible({timeout:30000});
 await toggle.click();
 const main=page.locator('.siai-home-fullscreen');
 await expect(main).toBeVisible();
 await expect(page.locator('body')).toHaveCSS('overflow','hidden');
 const rect=await main.boundingBox();
 expect(rect?.x).toBeLessThan(2);
 expect(rect?.width).toBeGreaterThan(300);
 await page.keyboard.press('Escape');
 await expect(main).toHaveCount(0);
 await expect(page.locator('.siai-home-table-scroll')).toBeVisible();
});

test('desktop sidebar can collapse and restore; mobile remains drawer-based',async({page,isMobile})=>{
 test.setTimeout(90000);
 await page.goto('/siai');
 const toggle=page.locator('.lx11-desktop-side-toggle');
 if(isMobile){await expect(toggle).toBeHidden();return}
 await expect(toggle).toBeVisible();
 const initial=await page.locator('html').getAttribute('data-lx-sidebar');
 await toggle.click();
 await expect(page.locator('html')).toHaveAttribute('data-lx-sidebar',initial==='closed'?'open':'closed');
 await toggle.click();
 await expect(page.locator('html')).toHaveAttribute('data-lx-sidebar',initial||'open');
});
