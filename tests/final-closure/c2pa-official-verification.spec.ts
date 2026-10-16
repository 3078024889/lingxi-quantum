import {test,expect} from "./export-test";
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const manifest=JSON.parse(readFileSync('tests/fixtures/c2pa-official/manifest.json','utf8'));
function fixture(name:string){const entry=manifest.files.find((item:{name:string;sha256:string})=>item.name===name);if(!entry)throw Error('Unknown official fixture');const bytes=readFileSync('tests/fixtures/c2pa-official/'+name);expect(createHash('sha256').update(bytes).digest('hex')).toBe(entry.sha256);return bytes;}



test("official signed C2PA JPEG receives an actual SDK verification state",async({page})=>{
 test.setTimeout(90000);
 const file=fixture('CA.jpg');
 expect(file.length).toBeGreaterThan(100);
 await page.goto("/tools/ai-image-check");
 await expect(page.locator('input[type="file"]')).toBeEnabled({timeout:15000});
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
 await expect(page.locator('input[type="file"]')).toBeEnabled({timeout:15000});
 await page.locator('input[type="file"]').setInputFiles({name:"unsigned.png",mimeType:"image/png",buffer:png});
 await page.getByRole("button",{name:/开始检查|Start checking/}).click();
 const section=page.locator("[data-c2pa-verification]");
 await expect(section).toHaveAttribute("data-c2pa-verification","absent",{timeout:60000});
 await expect(section).toContainText(/这份文件没有可读取的来源签名|No readable origin signature/);
});


for(const [filename,expected] of [["video1.mp4","signed"],["video1_no_manifest.mp4","unsigned"]] as const){
 test(`C2PA MP4 ${expected} specimen is verified via media tool`,async({page,request})=>{
  test.setTimeout(90000);
  const file=fixture(filename);
  await page.goto("/tools/ai-video-audio-check");
  await expect(page.locator('input[type="file"]')).toBeEnabled({timeout:15000});
 await page.locator('input[type="file"]').setInputFiles({name:filename,mimeType:"video/mp4",buffer:file});
  await page.getByRole("button",{name:/开始检查|Start checking/}).click();
  const section=page.locator("[data-c2pa-verification]");
  await expect(section).toHaveAttribute("data-c2pa-verification",expected==="signed"?/^(trusted|valid|untrusted)$/:"absent",{timeout:60000});
 });
}

test("altered signed image does not retain a valid or trusted provenance verdict",async({page,request})=>{
 test.setTimeout(90000);
 const original=fixture('CA.jpg');
 const modified=Buffer.from(original);
 modified[modified.length-40]^=0x01;
 await page.goto("/tools/ai-image-check");
 await expect(page.locator('input[type="file"]')).toBeEnabled({timeout:15000});
 await page.locator('input[type="file"]').setInputFiles({name:"tampered-signed.jpg",mimeType:"image/jpeg",buffer:modified});
 await page.getByRole("button",{name:/开始检查|Start checking/}).click();
 const section=page.locator("[data-c2pa-verification]");
 await expect(section).toHaveAttribute("data-c2pa-verification","invalid",{timeout:60000});
});
