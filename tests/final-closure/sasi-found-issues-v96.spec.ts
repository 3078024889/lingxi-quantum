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

test("image generation shows the quoted size and actual delivered dimensions",async({page})=>{
 let confirmed=false;
 await page.route("**/api/sasi/byok/image",route=>{
  if(route.request().method()==="GET")return route.fulfill({json:{profile:{model:"seedream-test",size:"2K",estimatedFen:20},tasks:[]}});
  const body=route.request().postDataJSON();
  if(body.action==="quote")return route.fulfill({status:201,json:{task:{id:"88888888-8888-4888-8888-888888888888",state:"quoted",estimated_fen:20},billingCurrency:"USD"}});
  confirmed=true;
  return route.fulfill({json:{task:{id:"88888888-8888-4888-8888-888888888888",state:"succeeded",output:{imageUrl:"/api/sasi/generated-assets/88888888-8888-4888-8888-888888888888",width:2048,height:2048,aiGenerated:true}}}});
 });
 await page.route("**/api/sasi/generated-assets/*",route=>route.fulfill({status:200,contentType:"image/png",body:Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=","base64")}));
 await page.goto("/sasi?mode=image&lang=en");
 await page.getByPlaceholder("Ask SASI").fill("A celestial landscape");
 await page.locator('input[type="checkbox"]').check();
 await page.getByPlaceholder("Ask SASI").press("Enter");
 await expect(page.getByRole("button",{name:/Confirm/})).toBeVisible({timeout:15000});
 await page.getByRole("button",{name:/Confirm/}).click();
 await expect(page.getByText(/2K/).last()).toBeVisible({timeout:15000});
 await expect(page.getByText("2048 × 2048px")).toBeVisible();
 expect(confirmed).toBe(true);
});

test("URL promotion enters the real drama generation workflow, not a text-as-video fallback",async({page})=>{
 await page.route("**/api/tools/promotion-source",route=>route.fulfill({json:{
  url:"https://example.com/product",html:"<html><head><title>Product</title></head><body><h1>Product</h1><p>A useful product.</p></body></html>"
 }}));
 await page.goto("/tools/url-to-video?lang=en");
 await page.getByLabel("Website or product URL").fill("https://example.com/product");
 await page.getByRole("button",{name:"Read page"}).click();
 await expect(page.getByRole("heading",{name:"Product",exact:true})).toBeVisible();
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
