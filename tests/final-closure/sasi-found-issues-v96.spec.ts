import{test,expect}from"./export-test";

test("image entry exposes configured resolution and aspect ratio before generation",async({page})=>{
 await page.route("**/api/sasi/byok/image",route=>{
  if(route.request().method()==="GET")return route.fulfill({json:{profile:{model:"seedream-test",size:"2K",estimatedFen:20},tasks:[]}});
  return route.fulfill({json:{error:"NOT_USED"}});
 });
 await page.goto("/sasi?mode=image&lang=en");
 await expect(page.getByText(/Resolution.*2K/)).toBeVisible({timeout:15000});
 await expect(page.locator("select").last()).toBeVisible();
 await expect(page.getByRole("option",{name:"9:16"})).toBeAttached();
});

test("URL promotion enters the real drama generation workflow, not a text-as-video fallback",async({page})=>{
 await page.route("**/api/tools/promotion-source",route=>route.fulfill({json:{
  url:"https://example.com/product",html:"<html><head><title>Product</title></head><body><h1>Product</h1><p>A useful product.</p></body></html>"
 }}));
 await page.goto("/tools/url-to-video?lang=en");
 await page.getByLabel("Website or product URL").fill("https://example.com/product");
 await page.getByRole("button",{name:"Read page"}).click();
 await expect(page.getByText("Product",{exact:true})).toBeVisible();
 await page.getByRole("button",{name:"Review and continue in SASI"}).click();
 await expect(page).toHaveURL(/\/sasi\?.*mode=drama/);
 await expect(page.locator('[data-sasi-task="drama"]')).toBeVisible({timeout:15000});
 await expect(page.locator('[data-sasi-result-kind="video"]')).toHaveCount(0);
});

test("tool hub has one canonical image-to-PDF entry",async({page})=>{
 await page.goto("/tools?lang=en");
 await expect(page.locator('a[href="/tools/image-to-pdf"]')).toHaveCount(1);
 await expect(page.locator('a[href="/tools/image-to-pdf-pro"]')).toHaveCount(0);
});

test("media upload shows a local preview immediately",async({page})=>{
 await page.goto("/tools/video-transcription?lang=en");
 const input=page.locator('input[type="file"]').first();
 await expect(input).toBeEnabled({timeout:15000});
 await input.setInputFiles({name:"preview.mp4",mimeType:"video/mp4",buffer:Buffer.from("not-a-real-video")});
 await expect(page.locator('video')).toBeVisible({timeout:5000});
});
