import {test,expect} from "playwright/test";

const FIXTURE="https://raw.githubusercontent.com/contentauth/c2pa-rs/main/sdk/tests/fixtures/CA.jpg";
test("official signed C2PA JPEG receives an actual SDK verification state",async({page,request})=>{
 test.setTimeout(90000);
 const response=await request.get(FIXTURE,{timeout:30000,maxRetries:2});
 expect(response.ok(),`Unable to download the CAI signed JPEG specimen: HTTP ${response.status()}`).toBeTruthy();
 const file=await response.body();
 expect(file.length).toBeGreaterThan(100);
 await page.goto("/tools/ai-image-check");
 await page.locator('input[type="file"]').setInputFiles({name:"signed-c2pa.jpg",mimeType:"image/jpeg",buffer:file});
 await page.getByRole("button",{name:/开始检查|Start checking/}).click();
 const section=page.locator("[data-c2pa-verification]");
 await expect(section).toBeVisible();
 await expect(section).toHaveAttribute("data-c2pa-verification",/^(trusted|valid|untrusted)$/,{timeout:60000});
 // A valid signed fixture may be untrusted by production trust lists, but it must never be accepted as cryptographically invalid.
 await expect(section).not.toHaveAttribute("data-c2pa-verification","absent");
 await expect(section).not.toHaveAttribute("data-c2pa-verification","unavailable");
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

const MP4_BASE="https://raw.githubusercontent.com/contentauth/c2pa-rs/main/sdk/tests/fixtures/";
for(const [filename,expected] of [["video1.mp4","signed"],["video1_no_manifest.mp4","unsigned"]] as const){
 test(`C2PA MP4 ${expected} specimen is verified via media tool`,async({page,request})=>{
  test.setTimeout(90000);
  const response=await request.get(MP4_BASE+filename,{timeout:30000,maxRetries:2});
  expect(response.ok(),`Official C2PA MP4 specimen unavailable: HTTP ${response.status()}`).toBeTruthy();
  await page.goto("/tools/ai-video-audio-check");
  await page.locator('input[type="file"]').setInputFiles({name:filename,mimeType:"video/mp4",buffer:await response.body()});
  await page.getByRole("button",{name:/开始检查|Start checking/}).click();
  const section=page.locator("[data-c2pa-verification]");
  await expect(section).toHaveAttribute("data-c2pa-verification",expected==="signed"?/^(trusted|valid|untrusted)$/:"absent",{timeout:60000});
 });
}

test("altered signed image does not retain a valid or trusted provenance verdict",async({page,request})=>{
 test.setTimeout(90000);
 const response=await request.get(FIXTURE,{timeout:30000,maxRetries:2});
 expect(response.ok()).toBeTruthy();
 const original=await response.body();
 const modified=Buffer.from(original);
 modified[modified.length-40]^=0x01;
 await page.goto("/tools/ai-image-check");
 await page.locator('input[type="file"]').setInputFiles({name:"tampered-signed.jpg",mimeType:"image/jpeg",buffer:modified});
 await page.getByRole("button",{name:/开始检查|Start checking/}).click();
 const section=page.locator("[data-c2pa-verification]");
 await expect(section).toHaveAttribute("data-c2pa-verification","invalid",{timeout:60000});
});
