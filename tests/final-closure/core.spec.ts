import {test,expect} from "playwright/test";
const routes=["/","/tools","/sasi","/products","/account","/about","/privacy","/terms"];
for(const route of routes)test(`core ${route}`,async({page})=>{const r=await page.goto(route,{waitUntil:"domcontentloaded"});expect(r,"response").not.toBeNull();expect(r!.status()).toBeLessThan(500);await expect(page.locator("body")).toBeVisible();const text=await page.locator("body").innerText();expect(text).not.toMatch(/Internal Server Error/i);});
test("retired public copy absent",async({page})=>{for(const route of["/","/tools","/sasi"]){await page.goto(route,{waitUntil:"domcontentloaded"});const text=await page.locator("body").innerText();expect(text).not.toMatch(/潜意识重塑|场域精测|意识显化|一念显化|生命图谱/);}});
