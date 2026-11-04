import {test,expect} from './export-test';

test('SIAI shares selected comparisons and restores them with a clipboard fallback',async({page})=>{
 test.setTimeout(90000);
 await page.addInitScript(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw new Error('Clipboard unavailable')}}}));
 await page.goto('/siai?lang=zh&token=do-not-share');
 const rows=page.locator('tr.siai-home-tr');
 await expect(rows).toHaveCount(62,{timeout:30000});
 await rows.nth(0).getByRole('button',{name:'加入对比',exact:true}).click();
 await rows.nth(1).getByRole('button',{name:'加入对比',exact:true}).click();
 await page.getByRole('button',{name:'分享当前筛选与对比',exact:true}).click();
 const input=page.getByRole('textbox',{name:'分享链接',exact:true});
 await expect(input).toBeVisible();
 const url=await input.inputValue(),shared=new URL(url);
 expect(shared.searchParams.get('compare')?.split(',')).toHaveLength(2);
 expect(shared.searchParams.has('token')).toBe(false);
 await page.goto(shared.pathname+shared.search);
 await expect(page.locator('.siai-compare-section')).toBeVisible();
 await expect(page.locator('.siai-compare-section thead th')).toHaveCount(3);
 await expect(page.locator('.siai-compare-selected')).toHaveCount(2);
});

test('SIAI restores valid task filters and copies only public selection parameters',async({page})=>{
 test.setTimeout(90000);
 await page.addInitScript(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async(value:string)=>{(window as any).__siaiCopied=value;}}}));
 await page.goto('/siai?lang=zh&task=image&compare=unknown&token=do-not-share');
 await expect(page.getByRole('button',{name:/^图片生成\s+\d+$/})).toHaveAttribute('aria-pressed','true');
 await expect(page.locator('.siai-compare-section')).toHaveCount(0);
 await page.getByRole('button',{name:'分享当前筛选与对比',exact:true}).click();
 await expect(page.getByRole('status').filter({hasText:'链接已复制'})).toBeVisible();
 const copied=await page.evaluate(()=>(window as any).__siaiCopied as string);
 expect(new URL(copied).searchParams.get('task')).toBe('image');
 expect(copied).not.toContain('token');
});

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
 expect(layout.tableWidth).toBeLessThanOrEqual(1950);
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
 expect(await page.locator('body').evaluate(el=>el.style.overflow)).not.toBe('hidden');
 const rect=await main.boundingBox();
 expect(rect?.width).toBeGreaterThanOrEqual((page.viewportSize()?.width||0)-36);
 const pageHeight=await page.evaluate(()=>document.documentElement.scrollHeight);
 expect(pageHeight).toBeGreaterThan((page.viewportSize()?.height||0)+700);
 await page.evaluate(()=>window.scrollTo(0,document.documentElement.scrollHeight));
 await expect(page.locator('footer.lx11-footer')).toBeVisible();
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

test('SIAI restores sourced company facts on every row and preserves original records',async({page,isMobile})=>{
 test.setTimeout(90000);
 await page.goto('/siai');
 const rows=page.locator('.siai-home-table tbody tr.siai-home-tr');
 await expect(rows).toHaveCount(62);
 const first=rows.first();
 await expect(first.locator('.siai-home-identity')).toContainText('Microsoft');
 for(const text of ['公司名称','主要创始人','是否上市','成立时间','资料更新日期'])await expect(first.locator('.siai-home-identity')).toContainText(text);
 await expect(first.locator('.siai-brand-mark img')).toHaveAttribute('src',/^\/siai-brand-icons\//);
 const iconLoaded=await first.locator('.siai-brand-mark img').evaluate((img:HTMLImageElement)=>img.complete&&img.naturalWidth>0);
 expect(iconLoaded).toBe(true);
 await expect(first.locator('.siai-home-identity')).not.toContainText('内容补充中');
 await expect(first.locator('.siai-home-identity a.siai-source').first()).toHaveAttribute('href',/^https:\/\//);
 const table=page.locator('.siai-home-table-flow');
 await expect(table).toBeVisible();
 const noInnerVerticalScroll=await table.evaluate((el:HTMLElement)=>el.scrollHeight-el.clientHeight<=3);
 expect(noInnerVerticalScroll).toBe(true);
 const horizontal=await table.evaluate((el:HTMLElement)=>({
  overflowX:getComputedStyle(el).overflowX,scrollWidth:el.scrollWidth,clientWidth:el.clientWidth
 }));
 expect(horizontal.overflowX).toBe(isMobile?'auto':'hidden');
 if(isMobile)expect(horizontal.scrollWidth).toBeGreaterThan(horizontal.clientWidth+300);
 expect(await page.evaluate(()=>document.documentElement.scrollHeight>window.innerHeight*2)).toBe(true);
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
 await grip.evaluate((el:HTMLElement)=>{
  const r=el.getBoundingClientRect();
  window.scrollBy({top:r.top-window.innerHeight/2,behavior:'instant'});
 });
 const rect=await grip.boundingBox();
 expect(rect).not.toBeNull();
 const viewport=page.viewportSize();
 expect(viewport).not.toBeNull();
 const centerX=rect!.x+rect!.width/2,centerY=rect!.y+rect!.height/2;
 expect(centerY+110).toBeLessThan(viewport!.height);
 expect(centerY).toBeGreaterThan(60);
 await page.mouse.move(centerX,centerY);
 await page.mouse.down();
 await page.mouse.move(centerX,centerY+105,{steps:9});
 await page.mouse.up();
 const resized=await table.evaluate((el:HTMLElement)=>({height:el.clientHeight,style:el.style.height,computed:getComputedStyle(el).height}));
 console.log('SIAI_PANEL_DRAG',resized);
 await expect.poll(()=>table.evaluate((el:HTMLElement)=>el.clientHeight)).toBeGreaterThan(before+70);
 await grip.focus();
 await page.keyboard.press('ArrowUp');
 await expect.poll(()=>table.evaluate((el:HTMLElement)=>el.clientHeight)).toBeLessThan(before+106);
 await page.getByRole('button',{name:'整页展开'}).click();
 await expect(table).toHaveClass(/siai-home-table-flow/);
 await expect(grip).toHaveCount(0);
 const flow=await table.evaluate((el:HTMLElement)=>({overflowY:getComputedStyle(el).overflowY,height:el.scrollHeight-el.clientHeight}));
 expect(flow.height).toBeLessThanOrEqual(3);
});
