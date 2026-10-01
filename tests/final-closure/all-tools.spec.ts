import {test,expect} from "playwright/test";
import {GLOBAL_TOOL_CATALOG,SEO_LOCALES} from "../../lib/seo/global-seo";

test.describe("all public tool routes",()=>{
 for(const tool of GLOBAL_TOOL_CATALOG){
  test(`${tool.slug} renders`,async({page})=>{
   const r=await page.goto(`/tools/${tool.slug}`,{waitUntil:"domcontentloaded"});
   expect(r).not.toBeNull();expect(r!.status()).toBeGreaterThanOrEqual(200);expect(r!.status()).toBeLessThan(400);
   await expect(page.locator("body")).toBeVisible();
   const text=await page.locator("body").innerText();
   expect(text).not.toMatch(/Internal Server Error|Application error/i);
  });
 }
});

test("nine language tool hubs expose correct html language and direction",async({page})=>{
 for(const [locale,meta] of Object.entries(SEO_LOCALES)){
  const route=locale==="zh"?"/tools":`/${locale}/tools`;
  const r=await page.goto(route,{waitUntil:"domcontentloaded"});
  expect(r?.status(),route).toBeLessThan(400);
  const html=page.locator("html");
  await expect(html,`${route} lang`).toHaveAttribute("lang",meta.hreflang);
  await expect(html,`${route} dir`).toHaveAttribute("dir",meta.dir);
 }
});
