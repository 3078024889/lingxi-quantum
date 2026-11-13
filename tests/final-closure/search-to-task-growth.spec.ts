import {test,expect} from "playwright/test";

test("homepage search sends a concrete PDF task to its tool without exposing the original query",async({page})=>{
 test.setTimeout(90000);
 await page.goto("/");
 const form=page.locator(".lx11-prompt");
 await expect(form.locator("textarea")).toBeVisible();
 await form.locator("textarea").fill("PDF压缩?utm_source=secret_private_token");
 await form.locator("button").click();
 await expect(page).toHaveURL(/\/tools\/pdf-compress\?lang=(zh|en|ja|ko|fr|de|es|pt|ar)$/);
 expect(page.url()).not.toContain("secret_private_token");
 await expect(page.locator("h1").first()).toBeVisible();
});

test("homepage has three distinctive SIAI task paths; cost tool opens from a deep link",async({page})=>{
 test.setTimeout(90000);
 await page.goto("/");
 const home=page.locator('[data-siai-search-intents="home"]');
 await expect(home).toBeVisible();
 await expect(home.locator("article")).toHaveCount(3);
 const paths=await home.locator("article a").evaluateAll(nodes=>nodes.map(n=>n.getAttribute("href")));
 expect(paths).toEqual([
  "/siai?intent=cost#siai-cost-estimator",
  "/siai#siai-market",
  "/siai?intent=free#siai-market"
 ]);
 await home.locator('a[href*="intent=cost"]').click();
 await expect(page).toHaveURL(/\/siai\?intent=cost#siai-cost-estimator$/);
 await expect(page.locator("#siai-cost-estimator")).toBeVisible();
 await expect(page.locator("#siai-cost-estimator")).toHaveAttribute("open","");
});
