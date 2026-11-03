import {test,expect} from "./export-test";
import sharp from "sharp";

// Real browser uploads and decoding. Payment and the photo model are not
// mocked on success: these cases verify fail-closed billing before delivery.
async function image(width:number,height:number){
 return sharp({create:{width,height,channels:3,background:{r:205,g:218,b:229}}}).png().toBuffer();
}
for(const item of [
 {name:"undersized-image",width:400,height:500,forceModelFailure:false},
 {name:"unavailable-local-model",width:720,height:900,forceModelFailure:true}
]){
 test(`id-photo-ai: ${item.name} cannot display or sell a false HD result`,async({page})=>{
  test.setTimeout(110000);
  if(item.forceModelFailure){
   await page.route("**/models/id-photo/modnet.onnx",route=>route.fulfill({status:503,body:"ISOLATED_UNAVAILABLE_MODEL"}));
  }
  await page.goto("/tools/id-photo-ai?lang=en");
  const input=page.locator('input[type="file"]').first();
  await expect(input).toBeEnabled();
  await input.setInputFiles({name:"id-photo.png",mimeType:"image/png",buffer:await image(item.width,item.height)});
  const start=page.getByRole("button",{name:/free.*preview|generate.*preview|免费生成预览/i}).first();
  await expect(start).toBeEnabled();
  await start.click();
  await expect(page.getByRole("alert")).toBeVisible({timeout:85000});
  await expect(page.getByText("证件照预览已生成")).toHaveCount(0);
  await expect(page.locator('[data-testid="paid-export-start"]')).toHaveCount(0);
  await expect(page.getByRole("button",{name:/free.*preview|generate.*preview|免费生成预览/i}).first()).toBeEnabled();
 });
}
