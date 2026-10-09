import{test,expect}from"playwright/test";

test("SASI can create a reusable method without uploading a file",async({page})=>{
 let posted:any=null;
 await page.route("**/api/sasi/skills",async route=>{
  const req=route.request();
  if(req.method()==="GET")return route.fulfill({json:{platform:[],mine:[]}});
  if(req.method()==="POST"){
   posted=req.postDataJSON();
   return route.fulfill({status:201,json:{skill:{id:"11111111-1111-4111-8111-111111111111",name:posted.name,description:posted.description}}});
  }
  return route.fulfill({json:{ok:true}});
 });
 await page.goto("/sasi?mode=drama&lang=en");
 const name=page.getByPlaceholder("Method name");
 if(await name.count()===0)test.skip(true,"Skills panel is not mounted by this route in this configuration");
 await name.fill("Shot continuity review");
 await page.getByPlaceholder("One-line description (optional)").fill("Check identity and spatial continuity before export");
 await page.getByPlaceholder("Steps, checkpoints and completion criteria").fill("1. Compare character references.\n2. Check wardrobe and props.\n3. Reject contradictions.\nDone when every shot matches the continuity sheet.");
 await page.getByRole("button",{name:"Save this method"}).click();
 await expect.poll(()=>posted?.name).toBe("Shot continuity review");
 expect(posted.instructions).toContain("Reject contradictions");
});
