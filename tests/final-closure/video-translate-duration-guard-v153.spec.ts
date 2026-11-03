import {test,expect} from "./export-test";
import {readFile} from "node:fs/promises";
import {mediaDurationCopy} from "../../lib/tools/media/duration-copy";

test("nine-language media pricing feedback is present for loading and invalid footage",()=>{
 for(const lang of ["zh","en","ja","ko","fr","de","es","pt","ar"]){
  expect(mediaDurationCopy(lang,"loading").length).toBeGreaterThan(10);
  expect(mediaDurationCopy(lang,"invalid").length).toBeGreaterThan(15);
 }
});

test("paid video translation requires actual video duration and invalidates stale quotes on replacement",async({page})=>{
 await page.goto("/tools/video-translate?lang=en");
 const input=page.locator('input[type="file"]').first();
 await expect(input).toBeEnabled({timeout:15000});
 const video=Buffer.from((await readFile("tests/fixtures/sasi-video-4s.mp4.base64","utf8")).trim(),"base64");
 expect(video.length).toBeGreaterThan(1024);
 await input.setInputFiles({name:"measured.mp4",mimeType:"video/mp4",buffer:video});
 const checkout=page.getByTestId("video-translate-checkout");
 await expect(checkout).toBeVisible({timeout:30000});
 await expect(page.getByText(/1 × 1 = 1/)).toBeVisible();
 // This multi-file tool intentionally APPENDS new uploads. Remove the previous
 // input with the actual UI before testing a replacement, preventing stale
 // files from being included in the new paid quote.
 await page.locator("main").getByRole("button",{name:"Remove",exact:true}).first().click();
 await expect(checkout).toHaveCount(0);
 await input.setInputFiles({name:"corrupt.mp4",mimeType:"video/mp4",buffer:Buffer.from("invalid-video-stream")});
 await expect(checkout).toHaveCount(0);
 await expect(page.getByRole("alert").filter({hasText:"Unable to read the video duration"}).first()).toBeVisible({timeout:15000});
 await page.locator("main").getByRole("button",{name:"Remove",exact:true}).first().click();
 await expect(page.getByText(/corrupt\.mp4/)).toHaveCount(0);
 await input.setInputFiles({name:"recovered.mp4",mimeType:"video/mp4",buffer:video});
 await expect(checkout).toBeVisible({timeout:30000});
 await expect(page.getByText(/1 × 1 = 1/)).toBeVisible();
 await expect(page.locator("main").getByRole("button",{name:"Remove",exact:true})).toHaveCount(1);
});

test("changing video translation source or mode rejects the previous quote even at the same price and duration",async({page})=>{
 test.setTimeout(90000);
 const issued:any[]=[];
 await page.route("**/api/tools/quote",async route=>{
  if(route.request().method()!=="POST")return route.fulfill({status:404,json:{error:"LOCAL_QUOTE_ONLY"}});
  const body=route.request().postDataJSON();
  issued.push(body);
  return route.fulfill({json:{
   id:"safe-quote-"+issued.length,tool_id:"video-translate",quantity:body.quantity,
   unit_name:"minute",amount_rmb:1.5,amount_usd:1.5,
   currency:body.currency,display_amount:1.5,display_currency:body.currency,
   metadata:body.metadata,expires_at:new Date(Date.now()+3600000).toISOString()
  }});
 });
 await page.goto("/tools/video-translate?lang=en");
 const video=Buffer.from((await readFile("tests/fixtures/sasi-video-4s.mp4.base64","utf8")).trim(),"base64");
 await page.locator('input[type="file"]').first().setInputFiles({name:"real.mp4",mimeType:"video/mp4",buffer:video});
 const panel=page.getByTestId("video-translate-checkout");
 await expect(panel).toBeVisible({timeout:30000});
 await panel.getByRole("button").first().click();
 await expect(panel.getByRole("button",{name:"Confirm & pay",exact:true})).toBeVisible();
 expect(issued).toHaveLength(1);
 const first=issued[0].metadata;
 expect(first.draftId).toBeTruthy();
 expect(first.source).toBe("auto");
 await page.locator("main select").first().selectOption("ja");
 await expect(panel.getByRole("button",{name:"Confirm & pay",exact:true})).toHaveCount(0);
 await panel.getByRole("button").first().click();
 await expect.poll(()=>issued.length).toBe(2);
 expect(issued[1].metadata.source).toBe("ja");
 expect(issued[1].metadata.draftId).not.toBe(first.draftId);
 expect(issued[1].quantity).toBe(issued[0].quantity);
 await page.locator("main select").nth(1).selectOption("dub");
 await expect(panel.getByRole("button",{name:"Confirm & pay",exact:true})).toHaveCount(0);
 await panel.getByRole("button").first().click();
 await expect.poll(()=>issued.length).toBe(3);
 expect(issued[2].metadata.mode).toBe("dub");
 expect(issued[2].metadata.draftId).not.toBe(issued[1].metadata.draftId);
});
