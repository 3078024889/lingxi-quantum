import {test,expect} from "./export-test";
import {readFile} from "node:fs/promises";
// Real browser-side image conversion and downloaded JPEG magic bytes.
// The test fixture is a 1x1 public-domain generated PNG; no user file or paid API.
const png=Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO5+JX8AAAAASUVORK5CYII=","base64");

test("PNG to JPG: upload, convert and save real JPEG bytes",async({page})=>{
 const route=await page.goto("/tools/png-to-jpg",{waitUntil:"domcontentloaded"});
 expect(route?.status()).toBe(200);
 await page.locator('input[type="file"]').first().setInputFiles({name:"fixture.png",mimeType:"image/png",buffer:png});
 const convert=page.getByRole("button",{name:/开始转换|Convert/}).first();
 await expect(convert).toBeEnabled();
 await convert.click();
 const actions=page.getByTestId("result-file-actions").first();
 await expect(actions).toBeVisible({timeout:30000});
 const pending=page.waitForEvent("download",{timeout:30000});
 await actions.locator("button").first().click();
 const download=await pending;
 expect(download.suggestedFilename()).toMatch(/\.jpe?g$/i);
 const bytes=await readFile(await download.path());
 expect(bytes.length).toBeGreaterThan(10);
 expect([...bytes.subarray(0,3)]).toEqual([255,216,255]);
});
