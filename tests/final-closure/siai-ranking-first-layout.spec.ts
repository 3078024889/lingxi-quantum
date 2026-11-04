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

test('SIAI restores sourced company facts on every row and preserves original records',async({page})=>{
 test.setTimeout(90000);
 await page.goto('/siai');
 const rows=page.locator('.siai-home-table tbody tr.siai-home-tr');
 await expect(rows).toHaveCount(62);
 const first=rows.first();
 await expect(first.locator('.siai-home-identity')).toContainText('Microsoft');
 await expect(first.locator('.siai-home-identity dt')).toContainText(['公司名称','主要创始人','是否上市','成立时间','资料更新日期']);
 await expect(first.locator('.siai-home-identity a.siai-source').first()).toHaveAttribute('href',/^https:\/\//);
 await expect(page.locator('.siai-home-table-flow')).toBeVisible();
 const noInnerVerticalScroll=await page.locator('.siai-home-table-flow').evaluate((el:HTMLElement)=>el.scrollHeight-el.clientHeight<=3);
 expect(noInnerVerticalScroll).toBe(true);
 await expect(page.getByLabel('每页显示')).toHaveValue('100');
 await first.getByRole('button',{name:'详情'}).click();
 const details=page.locator('.siai-detail-modal');
 await expect(details).toBeVisible();
 await expect(details.locator('dt')).toContainText(['公司名称','主要创始人','是否上市','成立时间','免费额度','真实价格','地区可用','付款方式','代表模型','商用授权']);
 await page.keyboard.press('Escape');
 await expect(details).toHaveCount(0);
});

test('SIAI supports 20/50/100 per-page pagination without losing original data or row numbering',async({page})=>{
 test.setTimeout(90000);
 await page.goto('/siai');
 const rows=page.locator('.siai-home-table tbody tr.siai-home-tr');
 const selector=page.getByLabel('每页显示');
 await selector.selectOption('20');
 await expect(rows).toHaveCount(20);
 await expect(page.locator('.siai-page-controls')).toContainText('共 4');
 await page.getByRole('button',{name:'下一页'}).click();
 await expect(rows).toHaveCount(20);
 await expect(rows.first().locator('td').first()).toHaveText('21');
 await page.getByRole('button',{name:'末页'}).click();
 await expect(rows).toHaveCount(2);
 await expect(rows.last().locator('td').first()).toHaveText('62');
 await selector.selectOption('50');
 await expect(rows).toHaveCount(50);
 await selector.selectOption('100');
 await expect(rows).toHaveCount(62);
});

test('SIAI resizable panel mode is optional; mouse drag and Escape do not trap document scrolling',async({page})=>{
 test.setTimeout(90000);
 await page.goto('/siai');
 const table=page.locator('.siai-home-table-scroll');
 const adjust=page.getByRole('button',{name:'可调高度'});
 await expect(adjust).toBeVisible();
 await adjust.click();
 await expect(table).toHaveClass(/siai-home-table-bounded/);
 const grip=page.getByRole('separator',{name:'拖动调整榜单高度'});
 await expect(grip).toBeVisible();
 const before=await table.evaluate((el:HTMLElement)=>el.clientHeight);
 const rect=await grip.boundingBox();
 expect(rect).not.toBeNull();
 await page.mouse.move(rect!.x+rect!.width/2,rect!.y+rect!.height/2);
 await page.mouse.down();
 await page.mouse.move(rect!.x+rect!.width/2,rect!.y+rect!.height/2+120,{steps:6});
 await page.mouse.up();
 await expect.poll(()=>table.evaluate((el:HTMLElement)=>el.clientHeight)).toBeGreaterThan(before+75);
 await grip.focus();
 await page.keyboard.press('ArrowUp');
 await expect.poll(()=>table.evaluate((el:HTMLElement)=>el.clientHeight)).toBeLessThan(before+120);
 await page.getByRole('button',{name:'整页展开'}).click();
 await expect(table).toHaveClass(/siai-home-table-flow/);
 await expect(grip).toHaveCount(0);
 const flow=await table.evaluate((el:HTMLElement)=>({overflowY:getComputedStyle(el).overflowY,height:el.scrollHeight-clientHeight}));
 expect(flow.height).toBeLessThanOrEqual(3);
});
