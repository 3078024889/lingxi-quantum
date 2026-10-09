import {test,expect} from "playwright/test";

const FIXTURE="https://spec.c2pa.org/public-testfiles/image/jpeg/adobe-20220124-C.jpg";
test("official signed C2PA JPEG receives an actual SDK verification state",async({page,request})=>{
 test.setTimeout(90000);
 const response=await request.get(FIXTURE,{timeout:30000,maxRetries:2});
 expect(response.ok()).toBeTruthy();
 const file=await response.body();
 expect(file.length).toBeGreaterThan(100);
 await page.goto("/tools/ai-image-check");
 await page.locator('input[type="file"]').setInputFiles({name:"signed-c2pa.jpg",mimeType:"image/jpeg",buffer:file});
 await page.getByRole("button",{name:/开始检查|Start checking/}).click();
 const section=page.locator("[data-c2pa-verification]");
 await expect(section).toBeVisible();
 await expect(section).toHaveAttribute("data-c2pa-verification",/^(trusted|valid|invalid)$/,{timeout:60000});
 // The verifier must reach a cryptographic result, not silently treat signed content as unsigned.
 await expect(section).not.toHaveAttribute("data-c2pa-verification","absent");
});

test("unsigned local PNG never reports a verified C2PA signature",async({page})=>{
 test.setTimeout(90000);
 // Standard valid 1x1 PNG without any C2PA manifest.
 const png=Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/rfoAAAAASUVORK5CYII=","base64");
 await page.goto("/tools/ai-image-check");
 await page.locator('input[type="file"]').setInputFiles({name:"unsigned.png",mimeType:"image/png",buffer:png});
 await page.getByRole("button",{name:/开始检查|Start checking/}).click();
 const section=page.locator("[data-c2pa-verification]");
 await expect(section).toHaveAttribute("data-c2pa-verification","absent",{timeout:60000});
 await expect(section).toContainText(/未找到 C2PA|No C2PA/);
});
