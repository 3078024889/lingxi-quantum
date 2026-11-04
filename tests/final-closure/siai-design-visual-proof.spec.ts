import {test,expect} from './export-test';

test('SIAI four production DOM screenshots: compact sourced ranking, live estimator, six cards, footer layers',async({page,isMobile})=>{
 test.setTimeout(180000);
 const platform=isMobile?'mobile':'desktop';
 await page.goto('/siai',{waitUntil:'domcontentloaded'});
 const table=page.locator('.siai-ranking-data');
 await expect(table).toBeVisible({timeout:30000});
 const rows=page.locator('.siai-home-table tbody tr.siai-home-tr');
 await expect(rows).toHaveCount(62);
 await expect(page.locator('.siai-home-table-scroll')).toHaveClass(/siai-home-table-flow/);
 const filterOptions=page.locator('.siai-home-four-filters .siai-filter-line').last().locator('.siai-filter-options');
 const sortLabel=page.locator('.siai-home-four-filters .siai-sort-label');
 const filterBox=await filterOptions.boundingBox(),sortBox=await sortLabel.boundingBox();
 expect(filterBox).not.toBeNull();
 expect(sortBox).not.toBeNull();
 const verticalOverlap=Math.max(0,Math.min(filterBox!.y+filterBox!.height,sortBox!.y+sortBox!.height)-Math.max(filterBox!.y,sortBox!.y));
 const horizontalOverlap=Math.max(0,Math.min(filterBox!.x+filterBox!.width,sortBox!.x+sortBox!.width)-Math.max(filterBox!.x,sortBox!.x));
 expect(horizontalOverlap*verticalOverlap).toBeLessThan(4);
 await expect(page.locator('.siai-brand-mark').first()).toBeVisible();
 // Eagerly decode every mapped local brand image; visible containers alone do not prove a logo loaded.
 const logos=await page.locator('.siai-home-table tbody .siai-brand-mark img').evaluateAll(async nodes=>Promise.all(nodes.map(async node=>{
  const img=node as HTMLImageElement;
  img.loading='eager';
  try{await img.decode();}catch{}
  return {src:img.getAttribute('src')||'',ok:img.complete&&img.naturalWidth>0&&img.naturalHeight>0};
 })));
 expect(logos.length).toBeGreaterThanOrEqual(40);
 expect(logos.filter(l=>!l.ok||!l.src.startsWith('/siai-brand-icons/'))).toEqual([]);
 await expect(page.locator('.siai-home-bottom-track')).toBeVisible();
 await expect(page.locator('.siai-home-identity').first()).not.toContainText('内容补充中');
 await expect(page.locator('.siai-home-identity').first()).not.toContainText('官网资料补充中');
 await expect(page.locator('.siai-home-identity').first()).not.toContainText('尚无可靠资料');
 const tableWidth=await page.locator('.siai-home-table-scroll .siai-home-table').evaluate((el:HTMLElement)=>el.scrollWidth);
 expect(tableWidth).toBeGreaterThan(1750);
 const top=page.locator('.siai-home-top-scroll'), bottom=page.locator('.siai-home-bottom-track');
 await top.evaluate((el:HTMLElement)=>el.scrollLeft=180);
 await expect.poll(()=>bottom.evaluate((el:HTMLElement)=>el.scrollLeft)).toBeGreaterThan(150);
 await bottom.evaluate((el:HTMLElement)=>el.scrollLeft=75);
 await expect.poll(()=>top.evaluate((el:HTMLElement)=>el.scrollLeft)).toBeLessThan(110);
 await top.evaluate((el:HTMLElement)=>el.scrollLeft=0);
 // The actual table header must remain visible even when the document scrolls
 // beyond the first row; do not make visitors drag a nested vertical scrollbar.
 await page.evaluate(()=>{
  const grid=document.querySelector('.siai-home-table-scroll') as HTMLElement;
  window.scrollTo({top:window.scrollY+grid.getBoundingClientRect().top+340,behavior:'instant'});
 });
 await expect(page.locator('.siai-floating-header')).toHaveAttribute('data-sticky-active','true');
 const pinned=await page.locator('.siai-floating-viewport').boundingBox();
 expect(pinned?.y).toBeGreaterThanOrEqual(isMobile?80:90);
 expect(pinned?.y).toBeLessThan(160);
 await top.evaluate((el:HTMLElement)=>el.scrollLeft=180);
 await expect.poll(()=>page.locator('.siai-floating-header .siai-home-table').evaluate((el:HTMLElement)=>el.style.transform)).toContain('-180px');
 await top.evaluate((el:HTMLElement)=>el.scrollLeft=0);
 await table.locator('.siai-home-top-track').scrollIntoViewIfNeeded();
 await page.screenshot({path:'test-results/siai-1-ranking-'+platform+'.png',animations:'disabled'});
 const accordion=page.locator('.siai-home-cost-accordion');
 await accordion.locator('summary').click();
 await expect(accordion).toHaveAttribute('open','');
 const cost=accordion.locator('.lxCostEstimate');
 await expect(cost).toBeVisible();
 await expect(cost.locator('.lxCostFields')).toBeVisible();
 await expect(cost.locator('.lxCostResult')).toBeVisible();
 await expect(cost.locator('.lxCostAside')).toBeVisible();
 // Billing display must follow the shared currency selector, never infer it from Chinese/English.
 const currencyPicker=page.locator('select[aria-label="支付币种"]:visible').first();
 await expect(currencyPicker).toBeVisible();
 await currencyPicker.selectOption('CNY');
 await expect(cost.locator('.lxCostDisclaimer')).toContainText('CNY');
 await currencyPicker.selectOption('USD');
 await expect(cost.locator('.lxCostDisclaimer')).toContainText('USD');
 await currencyPicker.selectOption('CNY');
 await cost.screenshot({path:'test-results/siai-2-estimator-'+platform+'.png',animations:'disabled'});
 const seo=page.locator('[data-siai-search-intents="ranking"]');
 await expect(seo.locator('.siai-discovery-card')).toHaveCount(6);
 await seo.screenshot({path:'test-results/siai-3-seo-'+platform+'.png',animations:'disabled'});
 const footer=page.locator('footer.lx11-footer');
 await expect(footer).toBeVisible();
 await expect(footer.locator('.lx11-footer-grid>nav')).toHaveCount(4);
 const discoveryLinks=footer.locator('.lx11-footer-grid>nav').first().locator('a[href*="#siai-search-ranking-"]');
 await expect(discoveryLinks).toHaveCount(4);
 for(let i=0;i<4;i++)await expect(discoveryLinks.nth(i)).toHaveAttribute('href',"/siai#siai-search-ranking-"+i);
 await expect(footer.locator('.lx-footer-search-list li')).toHaveCount(6);
 await expect(footer.locator('.lx-footer-v3-toolstrip>a')).toHaveCount(6);
 await expect(footer.locator('.lx-footer-v3-contact .lx-footer-qr-row img')).toHaveCount(2);
 await expect(footer.locator('.lx-footer-unified-secondary')).toHaveCount(0);
 await expect(footer.locator('.lx-footer-unified-close')).toHaveCount(0);
 await expect(footer.locator('.lx-footer-tool-chips a')).toHaveCount(8);
 await footer.locator('.lx11-footer-grid').screenshot({path:'test-results/siai-4-footer-nav-'+platform+'.png',animations:'disabled'});
 await footer.locator('.lx-footer-unified').screenshot({path:'test-results/siai-5-footer-information-'+platform+'.png',animations:'disabled'});
 await page.evaluate(()=>window.scrollTo(0,document.documentElement.scrollHeight));
 await expect(footer.locator('.lx11-footer-legal')).toBeVisible();
});
