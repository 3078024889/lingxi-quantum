import {test,expect} from "playwright/test";
const THREAD="aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const USER="bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
test("SASI restores owned conversation pairs and keeps follow-ups in context",async({page})=>{
 const saves:Array<any>=[];
 await page.route("**/api/sasi/conversations",async route=>{
  if(route.request().method()==="GET")return route.fulfill({json:{threadId:THREAD,threads:[{id:THREAD,title:"Earlier task"}],messages:[
   {id:USER,role:"user",content:"Our name is Bluebird.",created_at:"2026-10-08T00:00:00Z"},
   {id:"cccccccc-cccc-4ccc-8ccc-cccccccccccc",parent_id:USER,role:"assistant",content:"I will remember Bluebird.",created_at:"2026-10-08T00:00:01Z"}
  ]}});
  saves.push(route.request().postDataJSON());
  return route.fulfill({status:201,json:{ok:true,threadId:THREAD}});
 });
 let history:any[]=[];
 await page.route("**/api/sasi/experience/text",route=>{
  history=route.request().postDataJSON().history;
  return route.fulfill({json:{state:"answer",answer:"Bluebird is the name."}});
 });
 await page.goto("/sasi?mode=chat&lang=en");
 await expect(page.locator('[data-sasi-role="assistant"]')).toContainText("remember Bluebird");
 await page.locator("textarea").fill("Which name?");
 await page.locator("textarea").press("Enter");
 await expect(page.locator('[data-sasi-role="assistant"]')).toHaveCount(2);
 expect(history).toEqual(expect.arrayContaining([{role:"user",content:"Our name is Bluebird."},{role:"assistant",content:"I will remember Bluebird."}]));
 await expect.poll(()=>saves.length).toBe(1);
 expect(saves[0].threadId).toBe(THREAD);
 expect(saves[0].answer).toBe("Bluebird is the name.");
});

test("SASI keeps visible answer when transcript saving fails",async({page})=>{
 await page.route("**/api/sasi/conversations",route=>route.request().method()==="GET"?route.fulfill({status:401,json:{error:"AUTH_REQUIRED"}}):route.fulfill({status:503,json:{error:"HISTORY_UNAVAILABLE"}}));
 await page.route("**/api/sasi/experience/text",route=>route.fulfill({json:{state:"answer",answer:"Here is your answer."}}));
 await page.goto("/sasi?mode=chat&lang=en");
 await page.locator("textarea").fill("Tell me something useful");
 await page.locator("textarea").press("Enter");
 await expect(page.locator('[data-sasi-role="assistant"]')).toContainText("Here is your answer.");
 await expect(page.getByRole("status")).toContainText("not been saved",{timeout:12000});
});
