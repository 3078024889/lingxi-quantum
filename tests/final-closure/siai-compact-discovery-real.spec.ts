import {test,expect} from './export-test';

test('SIAI first screen uses two compact capability and payment lanes while retaining real 62 rows',async({page})=>{
 await page.goto('/siai?lang=zh');
 const rows=page.locator('tr.siai-home-tr');
 await expect(rows).toHaveCount(62);
 await expect(page.locator('.siai-ability-line')).toBeVisible();
 await expect(page.locator('.siai-payment-line')).toBeVisible();
 await expect(page.locator('.siai-home-four-filters .siai-filter-line')).toHaveCount(2);
 await expect(page.locator('.siai-ability-line .siai-filter-options button')).toHaveCount(8);
 await expect(page.getByRole('button',{name:/图片生成\s+\d+/})).toBeVisible();
 const bounds=await page.evaluate(()=>{
  const table=document.querySelector('.siai-home-table-scroll')!;
  const search=document.querySelector('.siai-home-search')!;
  const filters=document.querySelector('.siai-filter-compact')!;
  return {tableTop:table.getBoundingClientRect().top,filtersHeight:filters.getBoundingClientRect().height,searchHeight:search.getBoundingClientRect().height,viewport:innerHeight};
 });
 expect(bounds.tableTop).toBeLessThan(bounds.viewport);
 expect(bounds.filtersHeight).toBeLessThan(170);
 expect(bounds.searchHeight).toBeLessThan(50);
 await expect(page.locator('.siai-home-top-scroll')).toBeVisible();
 await expect(page.locator('.siai-home-bottom-track')).toBeVisible();
});

test('image creation and generation aliases find image-capable tools without falsely including video-only providers',async({page})=>{
 await page.goto('/siai?lang=zh');
 const input=page.locator('.siai-home-search input');
 await input.fill('图片创作');
 await expect(page.locator('.siai-home-count')).not.toContainText('62');
 const titles=await page.locator('.siai-home-tr .siai-brand-title strong').allTextContents();
 expect(titles.some(x=>x.includes('即梦'))).toBe(true);
 expect(titles.some(x=>x.includes('Midjourney'))).toBe(true);
 await input.fill('图片生成');
 const generated=await page.locator('.siai-home-tr .siai-brand-title strong').allTextContents();
 expect(generated).toEqual(titles);
 await input.fill('能同时做图片和视频的平台');
 const both=await page.locator('.siai-home-tr .siai-brand-title strong').allTextContents();
 expect(both.some(x=>x.includes('即梦'))).toBe(true);
 expect(both.some(x=>x.includes('可灵'))).toBe(true);
 expect(both.every(x=>generated.includes(x))).toBe(true);
});

test('payment counts depend on official evidence; selection and both scrollbars remain functional',async({page})=>{
 await page.goto('/siai?lang=zh');
 const alipay=page.locator('.siai-pay-choices').getByRole('button',{name:/支付宝\s+\d+/});
 const count=Number((await alipay.textContent())?.match(/\d+/)?.[0]||'0');
 expect(count).toBeGreaterThan(0);
 await alipay.click();
 await expect(page.locator('.siai-home-tr')).toHaveCount(count);
 await expect(alipay).toHaveAttribute('aria-pressed','true');
 const top=page.locator('.siai-home-top-scroll');
 const bottom=page.locator('.siai-home-bottom-track');
 await top.evaluate((el:HTMLElement)=>el.scrollLeft=240);
 await expect.poll(()=>bottom.evaluate((el:HTMLElement)=>el.scrollLeft)).toBeGreaterThan(180);
});
