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
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content",/noindex/);
   }
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2)).toBe(true);
   await testInfo.attach(`${path.replaceAll("/","-")||"home"}-${theme}`,{body:await page.screenshot({fullPage:true}),contentType:"image/png"});
  }
 });
}

test("Password generation works locally with length validation",async({page})=>{
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
