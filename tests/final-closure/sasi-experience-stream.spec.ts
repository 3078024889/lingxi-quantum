import {test,expect} from "playwright/test";
test("SASI streams assistant tokens and only stores the completed response",async({page})=>{
 let saved:any=null;
 await page.route("**/api/sasi/conversations",route=>{
  if(route.request().method()==="GET")return route.fulfill({status:401,json:{error:"AUTH_REQUIRED"}});
  saved=route.request().postDataJSON();return route.fulfill({json:{ok:true}});
 });
 await page.route("**/api/sasi/experience/text",route=>route.fulfill({
  status:200,headers:{"content-type":"text/event-stream; charset=utf-8"},
  body:'event: start\ndata: {"state":"working"}\n\n'+'event: delta\ndata: {"text":"First "}\n\n'+'event: delta\ndata: {"text":"answer"}\n\n'+'event: done\ndata: {"state":"answer","answer":"First answer","experienceExhausted":false}\n\n'
 }));
 await page.goto("/sasi?mode=chat&lang=en");
 await page.locator("textarea").fill("Give me an answer");
 await page.locator("textarea").press("Enter");
 await expect(page.locator('[data-sasi-role="assistant"]')).toContainText("First answer");
 await expect.poll(()=>saved?.answer).toBe("First answer");
});
test("SASI replaces interrupted model text when a backup succeeds",async({page})=>{
 await page.route("**/api/sasi/conversations",route=>route.fulfill({status:401,json:{error:"AUTH_REQUIRED"}}));
 await page.route("**/api/sasi/experience/text",route=>route.fulfill({
  status:200,headers:{"content-type":"text/event-stream; charset=utf-8"},
  body:'event: delta\ndata: {"text":"Bad start"}\n\n'+'event: reset\ndata: {}\n\n'+'event: delta\ndata: {"text":"Good answer"}\n\n'+'event: done\ndata: {"state":"answer","answer":"Good answer"}\n\n'
 }));
 await page.goto("/sasi?mode=chat&lang=en");
 await page.locator("textarea").fill("Continue");
 await page.locator("textarea").press("Enter");
 await expect(page.locator('[data-sasi-role="assistant"]')).toContainText("Good answer");
 await expect(page.locator('[data-sasi-role="assistant"]')).not.toContainText("Bad start");
});
