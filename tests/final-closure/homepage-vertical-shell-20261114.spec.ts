import {test,expect} from "playwright/test";

test("homepage follows the approved vertical-shell reference in desktop and mobile",async({page},testInfo)=>{
  test.setTimeout(90000);
  const mobile=testInfo.project.name==="mobile-chromium";
  await page.setViewportSize(mobile?{width:390,height:844}:{width:1440,height:1000});
  const response=await page.goto("/",{waitUntil:"domcontentloaded"});
  expect(response?.status()).toBe(200);
  await expect(page.locator("[data-home-nav]")).toHaveCount(0);
  await expect(page.locator(".lx-home-reference")).toBeVisible();
  await expect(page.locator(".lx-home-hero-section h1")).toContainText("全球智能服务与实用工具平台");
  const art=page.locator(".lx-home-hero-art img");
  await expect(art).toBeVisible();
  await expect.poll(()=>art.evaluate((img:HTMLImageElement)=>img.naturalWidth)).toBeGreaterThan(1000);
  await expect(page.locator(".lx-home-feature-card")).toHaveCount(6);
  await expect(page.locator(".lx-home-growth-card")).toHaveCount(6);
  await expect(page.locator(".lx-seo-question")).toHaveCount(14);
  await expect(page.getByText("ToolPass 工具包会员")).toBeVisible();
  await expect(page.getByText("全球 AI 厂商与产品合作")).toBeVisible();
  if(mobile){
    await expect(page.locator(".lx11-mobile")).toBeVisible();
    await expect(page.locator(".lx11-sidebar:not(.lx11-drawer)")).toBeHidden();
  }else{
    await expect(page.locator(".lx11-sidebar:not(.lx11-drawer)")).toBeVisible();
    await expect(page.locator(".lx11-topbar")).toBeVisible();
  }
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2)).toBe(true);
  await testInfo.attach(mobile?"homepage-mobile-reference":"homepage-desktop-reference",{body:await page.screenshot({fullPage:true}),contentType:"image/png"});
});
