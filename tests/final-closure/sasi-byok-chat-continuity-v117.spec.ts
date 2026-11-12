import {test,expect} from "./export-test";

test("SASI BYOK chat carries successful context to the next quote, not a new conversation",async({page})=>{
 const first="11111111-1111-4111-8111-111111111111";
 const second="22222222-2222-4222-8222-222222222222";
 const quoted:Array<Record<string,unknown>>=[];
 await page.route("**/api/sasi/byok/text",async route=>{
  if(route.request().method()==="GET")return route.fulfill({json:{tasks:[]}});
  const payload=route.request().postDataJSON() as Record<string,unknown>;
  if(payload.action==="quote"){
   quoted.push(payload);
   return route.fulfill({json:{billingCurrency:"USD",task:{id:quoted.length===1?first:second,state:"quoted",estimated_fen:30,expires_at:"2030-01-01T00:00:00Z"}}});
  }
  return route.fulfill({json:{task:{id:payload.taskId,state:"succeeded",output:{answer:payload.taskId===first?"The name is Bluebird.":"Bluebird is the name."}}}});
 });
 await page.goto("/sasi/chat?lang=en");
 const editor=page.getByRole("textbox",{name:"创作需求"});
 await editor.fill("Remember the name Bluebird.");
 await page.getByRole("button",{name:"准备生成"}).click();
 await expect(page.getByText("本次预估 $0.30。",{exact:false})).toBeVisible();
 expect(quoted[0]).not.toHaveProperty("previousId");
 await page.getByRole("button",{name:"确认并生成"}).click();
 await expect(page.getByTestId("sasi-byok-chat-turn")).toHaveCount(1);
 await expect(page.getByTestId("sasi-byok-chat-transcript")).toContainText("The name is Bluebird.");
 await editor.fill("What was the name?");
 await page.getByRole("button",{name:"准备生成"}).click();
 expect(quoted[1].previousId).toBe(first);
 await page.getByRole("button",{name:"确认并生成"}).click();
 await expect(page.getByTestId("sasi-byok-chat-turn")).toHaveCount(2);
 await page.getByRole("button",{name:"新对话"}).click();
 await expect(page.getByTestId("sasi-byok-chat-turn")).toHaveCount(0);
 await editor.fill("New story, no old context.");
 await page.getByRole("button",{name:"准备生成"}).click();
 expect(quoted[2]).not.toHaveProperty("previousId");
});

test("SASI BYOK restores an owned saved chat chain and continues from the newest successful task",async({page})=>{
 const first="11111111-1111-4111-8111-111111111111";
 const second="22222222-2222-4222-8222-222222222222";
 let quoted:Record<string,unknown>|null=null;
 await page.route("**/api/sasi/byok/text",route=>{
  if(route.request().method()==="GET")return route.fulfill({json:{tasks:[
   {id:second,state:"succeeded",mode:"chat",previousId:first,question:"What name?",output:{answer:"Bluebird."}},
   {id:first,state:"succeeded",mode:"chat",previousId:null,question:"Remember Bluebird.",output:{answer:"I will remember Bluebird."}},
   {id:"33333333-3333-4333-8333-333333333333",state:"succeeded",mode:"website",question:"Website",output:{answer:"Site built."}}
  ]}});
  const body=route.request().postDataJSON();
  if(body.action==="quote"){quoted=body;return route.fulfill({json:{billingCurrency:"USD",task:{id:"44444444-4444-4444-8444-444444444444",state:"quoted",estimated_fen:10,expires_at:"2030-01-01T00:00:00Z"}}})}
  return route.fulfill({json:{error:"UNEXPECTED_CONFIRM"},status:409});
 });
 await page.goto("/sasi/chat?lang=en");
 await expect(page.getByTestId("sasi-byok-chat-turn")).toHaveCount(2);
 await expect(page.getByTestId("sasi-byok-chat-transcript")).toContainText("Bluebird.");
 await expect(page.getByTestId("sasi-byok-chat-transcript")).not.toContainText("Site built.");
 await page.reload();
 await expect(page.getByTestId("sasi-byok-chat-turn")).toHaveCount(2);
 await page.getByRole("textbox",{name:"创作需求"}).fill("Tell me the remembered name once more.");
 await page.getByRole("button",{name:"准备生成"}).click();
 expect(quoted?.previousId).toBe(second);
});
