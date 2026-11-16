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
 await expect(heroArtwork).toHaveAttribute('src','/images/global-scene-20261114.webp');
 const heroColumns=await page.getByTestId('seller-workspace-hero').evaluate(el=>getComputedStyle(el).gridTemplateColumns.trim().split(/\s+/).length);
 expect(heroColumns).toBe(2);
 expect(await heroArtwork.evaluate((img:HTMLImageElement)=>img.complete&&img.naturalWidth>0)).toBe(true);
 const joinArtwork=page.getByTestId('seller-join-artwork');
 if(await joinArtwork.count()){
  await expect(joinArtwork).toBeVisible();
  await expect(joinArtwork).toHaveAttribute('data-art-kind','seller');
  expect(await joinArtwork.evaluate(el=>getComputedStyle(el).backgroundImage)).toContain('afternoon-icons-20261114.png');
  expect((await page.request.get('/images/sasi/afternoon-icons-20261114.png')).ok()).toBe(true);
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

test('SASI marketplace uses compact MQL5-style product tiles and keeps publishing on seller route',async({page})=>{
 test.setTimeout(60000);
 await page.setViewportSize({width:1680,height:960});
 await page.goto('/sasi?lang=zh');
 const grid=page.locator('[class*="SasiOpenMarketplace_products"]');
 await expect(grid).toHaveCount(1,{timeout:30000});
 const columns=await grid.evaluate(el=>getComputedStyle(el).gridTemplateColumns.trim().split(/\s+/).length);
 expect(columns).toBeGreaterThanOrEqual(7);
 await expect(page.locator('#sasi-seller-studio')).toHaveCount(0);
 await expect(page.locator('[class*="SasiOpenMarketplace_launchStudio"]')).toHaveCount(0);
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

test('pending seller can save a private product draft before seller approval',async({page})=>{
 test.setTimeout(60000);
 const sellerId='11111111-1111-4111-8111-111111111111';
 let draft:Record<string,unknown>|null=null,created=0;
 await page.route('**/api/sasi/marketplace/seller',route=>route.request().method()==='GET'
  ?route.fulfill({json:{profile:{user_id:sellerId,display_name:'Pending Studio',status:'pending_review',kyc_status:'pending'}}})
  :route.continue());
 await page.route('**/api/sasi/marketplace/listings**',async route=>{
  const request=route.request(),url=new URL(request.url());
  if(request.method()==='POST'){
   const body=request.postDataJSON();
   expect(body.title).toBe('待审核卖家测试 EA');
   draft={id:'22222222-2222-4222-8222-222222222222',seller_id:sellerId,title:String(body.title),description:String(body.description??''),category:String(body.category),price_cny_minor:Number(body.priceCnyMinor),price_usd_minor:Number(body.priceUsdMinor),status:'draft',scan_status:'unscanned',created_at:'2026-11-16T00:00:00.000Z'};
   created++;
   return route.fulfill({status:201,json:{item:draft}});
  }
  if(request.method()==='GET'&&url.searchParams.get('mode')==='mine')
   return route.fulfill({json:{items:draft?[draft]:[],counts:{published:0,pending:0}}});
  return route.fulfill({json:{items:[]}});
 });
 await page.route('**/api/sasi/marketplace/payouts',route=>route.fulfill({json:{balances:{CNY:{grossMinor:0},USD:{grossMinor:0}}}}));
 await page.route('**/api/sasi/marketplace/my-media**',route=>route.fulfill({json:{counts:{},items:{}}}));
 await page.goto('/sasi/seller?lang=zh');
 await expect(page.getByText('卖家资料待审核')).toBeVisible({timeout:30000});
 await page.locator('#listing-editor input').first().fill('待审核卖家测试 EA');
 const save=page.getByRole('button',{name:'保存商品草稿',exact:true});
 await expect(save).toBeEnabled();
 await save.click();
 await expect.poll(()=>created).toBe(1);
 await expect(page.getByText('当前草稿：待审核卖家测试 EA')).toBeVisible({timeout:15000});
 await expect(page.getByTestId('seller-upload-grid').locator('input[type=file]').first()).toBeEnabled();
});
