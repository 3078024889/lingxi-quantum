import {test,expect} from "playwright/test";

test("external host can embed reviewed SIAI widget without iframe or cookies",async({page,request})=>{
 // Third-party origin simulation: intercept network to the canonical widget domain
 // and serve the current local application, without modifying production DNS.
 await page.route("https://lingxifield.com/**",async route=>{
  const u=new URL(route.request().url());
  const res=await request.get(u.pathname+u.search);
  const type=u.pathname.endsWith(".js")?"application/javascript":
   u.pathname.endsWith(".svg")?"image/svg+xml":"application/json";
  await route.fulfill({status:res.status(),contentType:type,headers:{
   "Access-Control-Allow-Origin":"*",
   "Cache-Control":"no-store"
  },body:await res.body()});
 });
 await page.setContent('<!doctype html><html lang="en"><body><main><script src="https://lingxifield.com/widgets/lingxifield-v1.js" data-lx-widget="siai" data-lang="en" data-partner="integration-test"></script></main></body></html>');
 const host=page.locator('[data-lingxifield-embed="siai"]');
 await expect(host.locator('input[type="search"]')).toBeVisible();
 await expect(host.locator(".item").first()).toBeVisible();
 const text=await host.locator(".item").first().innerText();
 expect(text.length).toBeGreaterThan(3);
 await host.locator('input[type="search"]').fill("something-that-will-not-match-92837");
 await expect(host.locator(".item")).toHaveCount(0);
 const destination=host.locator("a.cta");
 await expect(destination).toHaveAttribute("href",/utm_source=partner_widget/);
 await expect(destination).toHaveAttribute("href",/utm_content=integration-test/);
});


test("WordPress bundled local JS calls only the fixed HTTPS LINGXIFIELD data API",async({page,request})=>{
 // Simulates a third-party WordPress host whose executable JS is bundled locally.
 // Cross-origin network access is limited to the read-only first-party JSON API.
 await page.route("https://blog.example.test/**",async route=>{
  const js=await request.get("/widgets/lingxifield-v1.js");
  await route.fulfill({status:js.status(),contentType:"application/javascript",body:await js.body()});
 });
 await page.route("https://lingxifield.com/api/public/siai-widget",async route=>{
  const res=await request.get("/api/public/siai-widget");
  await route.fulfill({status:res.status(),contentType:"application/json",
   headers:{"Access-Control-Allow-Origin":"*","Cache-Control":"no-store"},body:await res.body()});
 });
 await page.setContent('<!doctype html><html lang="en"><body><script defer src="https://blog.example.test/wp-content/plugins/lingxifield-widgets/assets/lingxifield-v1.js" data-api-origin="https://lingxifield.com" data-lx-widget="siai" data-partner="wordpress-test"></script></body></html>');
 const host=page.locator('[data-lingxifield-embed="siai"]');
 await expect(host.locator('input[type="search"]')).toBeVisible();
 await expect(host.locator(".item").first()).toBeVisible();
 await expect(host.locator("a.cta")).toHaveAttribute("href",/utm_content=wordpress-test/);
});
