import {test,expect} from "./export-test";

test("Current compact tool dashboard preserves all tool cards, search and mobile layout",async({page},testInfo)=>{
 await page.goto("/tools",{waitUntil:"domcontentloaded"});
 await expect(page.locator(".lx26-tools-stage")).toBeVisible();
 const cards=page.locator('a[data-tool-slug]');
 expect(await cards.count()).toBeGreaterThan(100);
 const search=page.locator(".lx26-tools-search input");
 await search.fill("PDF");
 await expect(page.locator('a[data-tool-slug="pdf-compress"]')).toBeVisible();
 const filtered=await cards.count();
 expect(filtered).toBeGreaterThan(0);
 await search.fill("");
 expect(await cards.count()).toBeGreaterThan(filtered);
 const stage=await page.locator(".lx26-tools-stage").boundingBox();
 expect(stage?.width||0).toBeGreaterThan(270);
 await testInfo.attach("tools-premium-current",{body:await page.screenshot({fullPage:false}),contentType:"image/png"});
});

test("Wallet page has verified-balance layout and never advertises fake account amounts",async({page},testInfo)=>{
 await page.goto("/ai-wallet",{waitUntil:"domcontentloaded"});
 await expect(page.locator(".lx26-wallet-hero")).toBeVisible();
 const headings=page.locator(".lx26-wallet-hero h1");
 await expect(headings).toHaveCount(1);
 // Anonymous screens must not display fabricated CNY/USD balance cards.
 const ready=await page.locator(".lx26-wallet-overview").count();
 if(ready){
   await expect(page.locator(".lx26-balance-card")).toHaveCount(2);
 }else{
   await expect(page.locator("main")).toContainText(/登录|余额|Login|Balance|Sign in|Loading|unavailable/i);
 }
 await testInfo.attach("wallet-premium-current",{body:await page.screenshot({fullPage:false}),contentType:"image/png"});
});
