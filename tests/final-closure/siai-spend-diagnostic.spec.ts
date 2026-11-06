import {test,expect} from "playwright/test";

test.describe("free SI/AI spend diagnosis",()=>{
 test("anonymous visitor sees concise entry and local diagnosis",async({page})=>{
  await page.goto("/siai/spend-diagnostic");
  await expect(page.getByRole("heading",{level:1})).toBeVisible();
  await expect(page.getByText("数据只在此浏览器计算")).toBeVisible();
  await page.getByRole("button",{name:"加载演示"}).click();
  await expect(page.getByRole("heading",{name:"诊断结果"})).toBeVisible();
  await expect(page.getByText(/148(?:\.00)?/)).toBeVisible();
  await expect(page.getByText(/99(?:\.00)?/)).toBeVisible();
  await expect(page.getByText(/1,188(?:\.00)?/)).toBeVisible();
  await expect(page.getByRole("link",{name:/找替代方案/})).toBeVisible();
 });
 test("explicit zero future uses, quota shortage and invalid inputs",async({page})=>{
  await page.goto("/siai/spend-diagnostic");
  await page.getByPlaceholder("示例：视频工具A").fill("Creator");
  await page.getByRole("spinbutton",{name:"实际月费"}).fill("29");
  await page.getByRole("spinbutton",{name:"本月使用次数"}).fill("8");
  await page.getByRole("button",{name:/开始诊断/}).click();
  await expect(page.getByText("¥0.00").first()).toBeVisible();
  await page.getByText(/找替代方案 · 下月预计次数/).click();
  await page.getByRole("spinbutton",{name:"下月预计次数"}).fill("30");
  await page.getByRole("spinbutton",{name:"套餐每月可完成次数"}).fill("12");
  await page.getByRole("button",{name:/开始诊断/}).click();
  await expect(page.getByText(/预计额度缺口: 18/)).toBeVisible();
 });
 test("responsive layout is usable at mobile viewport",async({page,isMobile})=>{
  await page.goto("/siai");
  const c=page.getByRole("complementary",{name:"SI/AI 花费诊断"});
  await expect(c).toBeVisible();
  await expect(c.getByRole("link",{name:/免费诊断/})).toBeVisible();
  if(isMobile){
   const r=await c.boundingBox();
   expect(r&&r.width).toBeLessThanOrEqual(page.viewportSize()!.width+1);
  }
 });
 test("English locale provides no Chinese-language hero",async({page})=>{
  await page.goto("/en/siai/spend-diagnostic");
  await expect(page.getByRole("heading",{name:"Are your AI subscriptions worth it?"})).toBeVisible();
  await page.getByRole("button",{name:"Load sample"}).click();
  await expect(page.getByRole("heading",{name:"Your results"})).toBeVisible();
  await expect(page.locator("details").first()).toHaveJSProperty("open",false);
 });
 test("source-backed related options never claim guaranteed lowest price",async({page})=>{
  await page.goto("/siai/spend-diagnostic");
  await page.getByRole("combobox",{name:/你准备做什么/}).selectOption("video");
  await page.getByRole("button",{name:"加载演示"}).click();
  await expect(page.getByRole("heading",{name:"可核验的相关工具"})).toBeVisible();
  await expect(page.getByText(/不代表最便宜、最适合/)).toBeVisible();
  await expect(page.getByRole("link",{name:"查看官方价格"}).first()).toHaveAttribute("href",/^https:\/\//);
 });
});
