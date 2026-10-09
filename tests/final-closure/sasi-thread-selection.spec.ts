import {test,expect} from "playwright/test";
const A="11111111-1111-4111-8111-111111111111";
const B="22222222-2222-4222-8222-222222222222";
const threads=[{id:A,title:"Morning plan"},{id:B,title:"Yesterday's writing"}];
function messages(title:string){return [
 {id:"33333333-3333-4333-8333-333333333333",role:"user",content:title,parent_id:null},
 {id:"44444444-4444-4444-8444-444444444444",role:"assistant",content:"Saved answer to "+title,parent_id:"33333333-3333-4333-8333-333333333333"}
]}
test("SASI can reopen an older thread and preserve its context for follow-up",async({page})=>{
 let historyCalls:string[]=[];
 await page.route("**/api/sasi/conversations*",route=>{
  const url=new URL(route.request().url());historyCalls.push(url.searchParams.get("threadId")||"latest");
  const selected=url.searchParams.get("threadId")===B?B:A;
  return route.fulfill({json:{threadId:selected,threads,messages:messages(selected===A?"Morning plan":"Yesterday's writing")}});
 });
 let payload:any;
 await page.route("**/api/sasi/experience/text",route=>{payload=route.request().postDataJSON();return route.fulfill({json:{state:"answer",answer:"Continued earlier discussion."}})});
 await page.goto("/sasi?mode=chat&lang=en");
 await expect(page.getByText("Saved answer to Morning plan")).toBeVisible();
 await page.getByLabel("Choose conversation").selectOption(B);
 await expect(page.getByText("Saved answer to Yesterday's writing")).toBeVisible();
 await expect(page.getByText("Saved answer to Morning plan")).toHaveCount(0);
 await page.locator("textarea").fill("Continue the writing please.");
 await page.locator("textarea").press("Enter");
 await expect(page.getByText("Continued earlier discussion.")).toBeVisible();
 expect(payload.history).toEqual(expect.arrayContaining([{role:"user",content:"Yesterday's writing"},{role:"assistant",content:"Saved answer to Yesterday's writing"}]));
 expect(historyCalls).toContain(B);
});
test("new SASI conversation clears previous turns without deleting saved threads",async({page})=>{
 await page.route("**/api/sasi/conversations*",route=>route.fulfill({json:{threadId:A,threads,messages:messages("Morning plan")}}));
 await page.goto("/sasi?mode=chat&lang=en");
 await expect(page.getByText("Saved answer to Morning plan")).toBeVisible();
 await page.getByRole("button",{name:"New chat"}).click();
 await expect(page.getByText("Saved answer to Morning plan")).toHaveCount(0);
 await expect(page.getByLabel("Choose conversation")).toHaveValue("");
 await expect(page.getByRole("option",{name:"Morning plan"})).toHaveCount(1);
});
