import {test,expect} from "playwright/test";

test("SASI immediately displays the sent question before a slow answer",async({page})=>{
 await page.route("**/api/sasi/conversations",route=>route.fulfill({status:401,json:{error:"AUTH_REQUIRED"}}));
 await page.route("**/api/sasi/experience/text",async route=>{
  await new Promise(resolve=>setTimeout(resolve,1500));
  return route.fulfill({status:200,json:{state:"answer",answer:"A considered reply."}});
 });
 await page.goto("/sasi?mode=chat&lang=en");
 const textarea=page.locator("textarea");
 await textarea.fill("Help plan my Bluebird short drama");
 await textarea.press("Enter");
 await expect(page.locator("[data-sasi-pending-turn]")).toContainText("Help plan my Bluebird short drama");
 await expect(page.locator("[data-sasi-pending-turn]")).toContainText("Thinking");
 await expect(page.locator("[data-sasi-pending-turn]")).toHaveCount(0,{timeout:12000});
 await expect(page.locator('[data-sasi-role="assistant"]')).toContainText("A considered reply.");
 await expect(page.locator('[data-sasi-role="assistant"]')).toHaveCount(1);
});

test("SASI preserves a draft when upstream service returns no answer",async({page})=>{
 await page.route("**/api/sasi/conversations",route=>route.fulfill({status:401,json:{error:"AUTH_REQUIRED"}}));
 await page.route("**/api/sasi/experience/text",async route=>{await new Promise(resolve=>setTimeout(resolve,750));return route.fulfill({status:200,json:{state:"needs-connection",needsConnection:true}})});
 await page.route("**/api/sasi/byok/text",async route=>{await new Promise(resolve=>setTimeout(resolve,250));return route.fulfill({status:400,json:{error:"CONNECTION_REQUIRED"}})});
 await page.goto("/sasi?mode=chat&lang=en");
 const textarea=page.locator("textarea");
 await textarea.fill("Please remember this unfinished project");
 await textarea.press("Enter");
 await expect(page.locator("[data-sasi-pending-turn]")).toContainText("Please remember this unfinished project");
 await expect(page.locator("[data-sasi-pending-turn]")).toHaveCount(0,{timeout:12000});
 await expect(textarea).toHaveValue("Please remember this unfinished project");
});
