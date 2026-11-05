import {test,expect} from "./export-test";
test("global sourced payment count does not collapse to zero after choosing local deployment",async({page})=>{
 await page.goto("/siai?lang=zh");
 const payments=page.locator(".siai-pay-choices");
 const read=async()=>payments.locator("button").allTextContents();
 const before=await read();
 await page.getByRole("button",{name:/本地部署\s+\d+/}).click();
 await expect(page.locator(".siai-ability-line").getByRole("button",{name:/本地部署/})).toHaveAttribute("aria-pressed","true");
 expect(await read()).toEqual(before);
 await expect(page.locator(".siai-cost-category-link")).toBeVisible();
 await page.locator(".siai-cost-category-link").click();
 await expect(page.locator("#siai-cost-estimator")).toHaveAttribute("open","");
});
test("unauthenticated visitors cannot view or mutate owner vendor submissions",async({page})=>{
 const response=await page.request.get("/api/account/siai-review");
 expect(response.status()).toBe(403);
 const body=await response.json();expect(body.error).toBe("FORBIDDEN");
 const rejected=await page.request.post("/api/account/siai-review",{
 headers:{"origin":"https://malicious.example","content-type":"application/json"},
 data:{id:"00000000-0000-4000-a000-000000000001",action:"approve",identityVerifiedByHuman:true}
 });
 expect(rejected.status()).toBe(403);
 await page.goto("/account/siai-review");
 await expect(page.getByText("管理账户验证")).toBeVisible();
 await expect(page.getByText("新增 50 家研究候选（未公开）")).toHaveCount(0);
});
