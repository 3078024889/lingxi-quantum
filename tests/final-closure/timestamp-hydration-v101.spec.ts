import {test,expect} from "./export-test";

test("timestamp converter hydrates without runtime-generated SSR text mismatch",async({page})=>{
 const runtimeErrors:string[]=[];
 page.on("pageerror",error=>runtimeErrors.push(error.message));
 await page.setViewportSize({width:375,height:812});
 const response=await page.goto("/tools/timestamp-converter?lang=en",{waitUntil:"domcontentloaded"});
 expect(response?.status()).toBe(200);
 const field=page.locator("[data-tool-workbench] input").first();
 await expect(field).toBeVisible();
 await expect.poll(async()=>field.inputValue()).toMatch(/^\d{10,11}$/);
 await field.fill("0");
 await expect(page.getByText("1970-01-01T00:00:00.000Z",{exact:true}).first()).toBeVisible();
 expect(runtimeErrors.filter(s=>/hydration|React error #418|Minified React error #418/.test(s))).toEqual([]);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
});
