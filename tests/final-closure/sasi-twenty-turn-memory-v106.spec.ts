import {test,expect} from "./export-test";

test("SASI restores 25 existing chat turns and sends the newest 20 to the model",async({page})=>{
 test.setTimeout(90000);
 const uuid=(n:number)=>"00000000-0000-4000-8000-"+String(n).padStart(12,"0");
 const ownerId=uuid(1),threadId=uuid(2);
 const messages=Array.from({length:25},(_,i)=>[
  {id:uuid(100+i),role:"user",content:"User turn "+i,created_at:new Date(2026,0,1,0,i).toISOString()},
  {id:uuid(200+i),parent_id:uuid(100+i),role:"assistant",content:"Assistant answer "+i,created_at:new Date(2026,0,1,0,i,10).toISOString()}
 ]).flat();
 let captured:any=null;
 await page.route(/\/api\/sasi\/conversations(?:\/workspace)?(?:\?|$)/,route=>{
  if(route.request().method()==="POST")return route.fulfill({json:{ok:true,threadId}});
  return route.fulfill({json:{ownerId,threadId,threads:[{id:threadId,title:"Long story"}],workspace:{mode:"chat",chatOpened:true},messages}});
 });
 await page.route("**/api/sasi/experience/text",route=>{
  captured=route.request().postDataJSON();
  return route.fulfill({status:200,headers:{"content-type":"text/event-stream; charset=utf-8"},body:'event: done\ndata: {"state":"answer","answer":"I remember the story."}\n\n'});
 });
 await page.goto("/sasi?mode=chat&lang=en&threadId="+threadId);
 await expect(page.getByText("Assistant answer 24")).toBeVisible();
 await page.locator("textarea").last().fill("Continue this serialized story from the previous chapter.");
 await page.locator("textarea").last().press("Enter");
 await expect.poll(()=>captured?.history?.length,{timeout:30000}).toBe(40);
 expect(captured.history[0]).toEqual({role:"user",content:"User turn 5"});
 expect(captured.history[1]).toEqual({role:"assistant",content:"Assistant answer 5"});
 expect(captured.history.at(-1)).toEqual({role:"assistant",content:"Assistant answer 24"});
 expect(captured.history.every((row:any)=>row.role==="user"||row.role==="assistant")).toBe(true);
 expect(JSON.stringify(captured.history).length).toBeLessThan(60000);
});
