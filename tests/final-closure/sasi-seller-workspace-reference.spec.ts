import {test,expect} from './export-test';

test('seller navigation opens the reference seller workspace with real business metrics',async({page})=>{
 test.setTimeout(90000);
 await page.setViewportSize({width:1680,height:960});
 await page.goto('/sasi?lang=zh');
 const sellerLink=page.locator('a[href="/sasi/seller"]:visible').first();
 await expect(sellerLink).toBeVisible({timeout:30000});
 await expect(sellerLink).toHaveAttribute('href','/sasi/seller');
 await sellerLink.click();
 await expect(page).toHaveURL(/\/sasi\/seller/);
 const hero=page.getByTestId('seller-workspace-hero');
 await expect(hero).toBeVisible({timeout:30000});
 await expect(hero.getByRole('heading',{name:'卖家工作台'})).toBeVisible({timeout:30000});
 const heroArtwork=page.getByTestId('seller-hero-artwork');
 await expect(heroArtwork).toBeVisible();
 await expect(heroArtwork).toHaveAttribute('src','/images/sasi/sasi-market-hero-lingxifield.png');
 const heroColumns=await page.getByTestId('seller-workspace-hero').evaluate(el=>getComputedStyle(el).gridTemplateColumns.trim().split(/\s+/).length);
 expect(heroColumns).toBe(2);
 expect(await heroArtwork.evaluate((img:HTMLImageElement)=>img.complete&&img.naturalWidth>0)).toBe(true);
 const joinArtwork=page.getByTestId('seller-join-artwork');
 if(await joinArtwork.count()){
  await expect(joinArtwork).toBeVisible();
  await expect(joinArtwork).toHaveAttribute('src','/images/global-scene-20261114.webp');
  expect(await joinArtwork.evaluate((img:HTMLImageElement)=>img.complete&&img.naturalWidth>0)).toBe(true);
 }
 await expect(page.getByTestId('seller-metrics').locator(':scope > div')).toHaveCount(4);
 await expect(page.getByRole('heading',{name:'发布新软件'})).toBeVisible();
 await expect(page.getByTestId('seller-upload-grid').getByText('授权或许可文件',{exact:true})).toBeVisible();
 await expect(page.getByTestId('seller-license-file-input')).toHaveAttribute('accept',/\.pdf.*\.txt.*\.png/);
 const grid=page.getByTestId('seller-workspace-grid');
 const columns=await grid.evaluate(el=>getComputedStyle(el).gridTemplateColumns.trim().split(/\s+/).length);
 expect(columns).toBe(3);
 await page.screenshot({path:'artifacts/sasi-seller-workspace-desktop.png',fullPage:false});
});

test('seller workspace collapses cleanly on mobile without overflowing its main grid',async({page})=>{
 test.setTimeout(90000);
 await page.setViewportSize({width:390,height:844});
 await page.goto('/sasi/seller?lang=zh');
 const hero=page.getByTestId('seller-workspace-hero');
 await expect(hero).toBeVisible({timeout:30000});
 await expect(hero.getByRole('heading',{name:'卖家工作台'})).toBeVisible({timeout:30000});
 const heroColumns=await hero.evaluate(el=>getComputedStyle(el).gridTemplateColumns.trim().split(/\s+/).length);
 expect(heroColumns).toBe(1);
 const grid=page.getByTestId('seller-workspace-grid');
 const layout=await grid.evaluate(el=>({columns:getComputedStyle(el).gridTemplateColumns.trim().split(/\s+/).length,scrollWidth:el.scrollWidth,clientWidth:el.clientWidth}));
 expect(layout.columns).toBe(1);
 expect(layout.scrollWidth).toBeLessThanOrEqual(layout.clientWidth+2);
 await page.screenshot({path:'artifacts/sasi-seller-workspace-mobile.png',fullPage:false});
});
