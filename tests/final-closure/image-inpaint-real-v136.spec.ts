import {test,expect,type Page} from "./export-test";
import sharp from "sharp";
import fs from "node:fs/promises";

async function sample(){
 const width=180,height=120;
 const base=await sharp({create:{width,height,channels:3,background:"#ffffff"}}).png().toBuffer();
 return sharp(base).composite([{input:{create:{width:20,height:12,channels:3,background:"#e11d48"}},left:132,top:90}]).png().toBuffer();
}
async function isolatePaid(page:Page,slug:string,quantity:number){
 const id="11111111-1111-4111-8111-111111111111";
 let quoteCalls=0,paymentCalls=0,quote:Record<string,unknown>={};
 await page.addInitScript(()=>{window.open=()=>({} as Window)});
 await page.route("**/api/tools/quote",route=>{
  quoteCalls++;const b=route.request().postDataJSON();
  expect(b.toolId).toBe(slug);expect(b.quantity).toBe(quantity);
  quote={id,tool_id:slug,quantity,unit_name:"image",currency:b.currency,display_currency:b.currency,display_amount:quantity,amount_rmb:quantity,amount_usd:quantity,expires_at:new Date(Date.now()+3_600_000).toISOString(),metadata:b.metadata};
  return route.fulfill({json:quote});
 });
 await page.route("**/api/tools/pay/status**",route=>route.fulfill({json:{paid:true,quote,grant:{}}}));
 await page.route("**/api/tools/pay/create",route=>{paymentCalls++;return route.fulfill({status:403,json:{error:"NO_REAL_PAYMENTS"}})});
 return {quotes:()=>quoteCalls,payments:()=>paymentCalls};
}
for(const variant of [
 {slug:"image-watermark-remover",batch:false,quantity:1},
 {slug:"batch-image-watermark-remover",batch:true,quantity:2}
] as const){
 test(variant.slug+": local inpaint changes real synthetic pixels and preserves dimensions after isolated paid authorization and downloaded PNG",async({page})=>{
  test.setTimeout(125000);
  const tracker=await isolatePaid(page,variant.slug,variant.quantity);
  await page.goto("/tools/"+variant.slug+"?lang=en");
  const input=page.locator('main input[type="file"]').first();
  const image=await sample(),uploads=[{name:"owned-1.png",mimeType:"image/png",buffer:image}];
  if(variant.batch)uploads.push({name:"owned-2.png",mimeType:"image/png",buffer:image});
  await input.setInputFiles(uploads);
  if(!variant.batch)await page.getByRole("button",{name:"Quick box",exact:true}).click();
  const start=page.getByRole("button",{name:"See price",exact:true});
  await expect(start).toBeVisible({timeout:15000});
  await start.click();
  await page.getByRole("button",{name:"Confirm & pay",exact:true}).click();
  await page.evaluate(()=>window.dispatchEvent(new Event("pageshow")));
  const results=page.getByTestId("result-file-actions");
  await expect(results).toHaveCount(variant.quantity,{timeout:90000});
  for(let n=0;n<variant.quantity;n++){
   const pending=page.waitForEvent("download");
   await results.nth(n).getByRole("button",{name:"Save result",exact:true}).click();
   const saved=await pending;
   expect(await saved.failure()).toBeNull();
   expect(saved.suggestedFilename()).toMatch(/^clean-owned-\\d\\.png$/);
   const output=await fs.readFile((await saved.path())!);
   const metadata=await sharp(output).metadata();
   expect([metadata.format,metadata.width,metadata.height]).toEqual(["png",180,120]);
   const before=await sharp(image).removeAlpha().raw().toBuffer(),after=await sharp(output).removeAlpha().raw().toBuffer();
   const index=(96*180+140)*3;
   expect(before[index]).toBeGreaterThan(before[index+1]+40);
   expect(after[index+1]).toBeGreaterThan(before[index+1]+80);
   const corner=(10*180+10)*3;expect(Array.from(after.subarray(corner,corner+3))).toEqual(Array.from(before.subarray(corner,corner+3)));
  }
  expect(tracker.quotes()).toBe(1);
  expect(tracker.payments()).toBe(0);
 });
}
