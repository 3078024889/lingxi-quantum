import {test,expect} from "playwright/test";

for(const theme of ["light","dark"]){
 test(`Homepage, marketplace and seller workspace render in ${theme} mode`,async({page},testInfo)=>{
  test.setTimeout(120000);
  await page.addInitScript(value=>localStorage.setItem("lx-theme",value),theme);
  for(const path of ["/","/sasi","/sasi/seller"]){
   const response=await page.goto(path,{waitUntil:"domcontentloaded"});
   expect(response?.status()).toBe(200);
   await expect(page.locator("html")).toHaveAttribute("data-theme",theme);
   if(path==="/"){
    await expect(page.locator(".lx-home-hero-art")).toBeVisible();
    await expect(page.locator(".lx-home-feature-strip")).toHaveCount(1);
    await expect(page.getByTestId("home-siai-categories").locator(".lx-home-siai-category-card")).toHaveCount(6);
    await expect(page.locator("[data-home-sidebar]")).toHaveCount(1);
    await expect(page.locator(".lx-seo-question")).toHaveCount(16);
    await page.getByTestId("home-task-search").locator("input").fill("AI视频生成模型");
    await page.getByTestId("home-task-search").getByRole("button").click();
    await expect(page).toHaveURL(/\/siai\?/);
    await page.goto("/",{waitUntil:"domcontentloaded"});
   }else if(path==="/sasi"){
    const hero=page.getByTestId("sasi-transparent-hero");
    await expect(hero).toBeVisible();
    const image=hero.locator("img");
    await expect.poll(()=>image.evaluate((element:HTMLImageElement)=>element.naturalWidth)).toBeGreaterThan(0);
   }else{
    await expect(page.getByRole("heading",{name:/卖家工作台|Seller workspace/})).toBeVisible();
    await expect(page.locator("#listing-editor")).toBeVisible();
  await expect(page.getByTestId("seller-upload-grid")).toBeVisible();
  await expect(page.getByTestId("seller-upload-tile")).toHaveCount(3);
  await expect(page.getByTestId("seller-upload-grid")).toContainText("授权或许可文件");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content",/noindex/);
   }
   if(theme==="dark"){
    const contrast=await page.locator(".lx11-link.is-active").first().evaluate(element=>{
     const style=getComputedStyle(element);
     const rgb=(value:string)=>value.match(/rgba?\(([^)]+)\)/)![1].split(",").slice(0,3).map(Number);
     const light=(values:number[])=>values.map(value=>{const s=value/255;return s<=.04045?s/12.92:((s+.055)/1.055)**2.4}).reduce((sum,value,index)=>sum+value*[.2126,.7152,.0722][index],0);
     const a=light(rgb(style.color)),b=light(rgb(style.backgroundImage!=="none"?style.backgroundImage:style.backgroundColor));
     return (Math.max(a,b)+.05)/(Math.min(a,b)+.05);
    });
    expect(contrast).toBeGreaterThanOrEqual(4.5);
    if(path==="/sasi/seller")expect(await page.locator("main h2").first().evaluate(element=>getComputedStyle(element).color)).not.toBe("rgb(16, 24, 45)");
   }
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2)).toBe(true);
   await testInfo.attach(`${path.replaceAll("/","-")||"home"}-${theme}`,{body:await page.screenshot({fullPage:true}),contentType:"image/png"});
  }
 });
}

test("Password generation works locally after access approval with length validation",async({page})=>{
 await page.route("**/api/tools/access",async route=>{
  const request=route.request().postDataJSON();
  expect(request.toolSlug).toBe("password-generator");
  expect(Object.keys(request).sort()).toEqual(["requestId","toolSlug","units"]);
  await route.fulfill({json:{ok:true,requestId:request.requestId}});
 });
 await page.goto("/tools/password-generator",{waitUntil:"domcontentloaded"});
 const workbench=page.locator("[data-tool-workbench]");
 const length=workbench.getByRole("spinbutton");
 const generate=workbench.getByRole("button",{name:/生成密码|Generate password/});
 await generate.click();
 await expect(workbench.locator('input[readonly]')).toHaveValue(/^.{20}$/);
 await length.fill("128");
 await generate.click();
 await expect(workbench.locator('input[readonly]')).toHaveValue(/^.{128}$/);
 await length.fill("7");
 await expect(generate).toBeDisabled();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2)).toBe(true);
});
