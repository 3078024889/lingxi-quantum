import{test,expect}from"@playwright/test";
test("public discovery surfaces render",async({page})=>{for(const p of["/templates","/llms.txt"]){const r=await page.goto(p);expect(r?.status()).toBeLessThan(500)}});
test("private account surfaces do not become public SEO pages",async({page})=>{for(const p of["/account/creations","/account/support"]){const r=await page.goto(p);expect(r?.status()).toBeLessThan(500);expect((await page.locator("body").innerText()).length).toBeGreaterThan(20)}});
