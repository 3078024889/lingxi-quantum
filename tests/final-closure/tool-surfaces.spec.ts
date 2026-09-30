import{test,expect}from"@playwright/test";
const tools=["food-calorie","id-photo-ai","pdf-compress","pdf-merge-split","pdf-ocr","pdf-redact","ocr","temp-mail","burn-after-read","video-watermark-remover","subtitle-translate","privacy-cleaner","qr-safe-reader"];
for(const slug of tools)test(`tool surface ${slug}`,async({page})=>{const r=await page.goto(`/tools/${slug}`);expect(r?.status()).toBeLessThan(500);expect((await page.locator("body").innerText()).length).toBeGreaterThan(30)});
