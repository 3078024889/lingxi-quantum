import {test,expect} from "playwright/test";
import {SEO_LOCALES} from "../../lib/seo/global-seo";
import {publicToolSurface} from '../../lib/tools/public-surface';

test.describe("all public tool routes",()=>{
 for(const tool of publicToolSurface()){
  test(`${tool.slug} renders and its initial numeric controls accept replacement`,async({page},testInfo)=>{
   const r=await page.goto(`/tools/${tool.slug}`,{waitUntil:"domcontentloaded"});
   expect(r).not.toBeNull();expect(r!.status()).toBeGreaterThanOrEqual(200);expect(r!.status()).toBeLessThan(400);
   await expect(page.locator("body")).toBeVisible();
   const text=await page.locator("body").innerText();
   expect(text).not.toMatch(/Internal Server Error|Application error/i);
   const numbers=page.locator('input[type=number]:visible:not([disabled]):not([readonly]),input[inputmode=numeric]:visible:not([disabled]):not([readonly]),input[inputmode=decimal]:visible:not([disabled]):not([readonly])');
   for(let index=0;index<await numbers.count();index++){
    const field=numbers.nth(index);
    const bounds=await field.evaluate((element:HTMLInputElement)=>({min:element.min,max:element.max}));
    const min=bounds.min?Number(bounds.min):0,max=bounds.max?Number(bounds.max):10000;
    const replacement=String(max<=1?Math.min(max,Math.max(min,.75)):Math.min(max,Math.max(min,356)));
    await field.fill('');await expect(field).toHaveValue('');await field.pressSequentially(replacement);await expect(field).toHaveValue(replacement);await field.press('Tab');await expect(field).toHaveValue(replacement);
   }
   await testInfo.attach('initial-tool-controls',{body:JSON.stringify({slug:tool.slug,numericFields:await numbers.count(),controls:await page.locator('input,select,textarea').evaluateAll(elements=>elements.map(element=>({tag:element.tagName,type:element.getAttribute('type'),accept:element.getAttribute('accept'),readonly:element.hasAttribute('readonly'),min:element.getAttribute('min'),max:element.getAttribute('max')})))},null,2),contentType:'application/json'});
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
