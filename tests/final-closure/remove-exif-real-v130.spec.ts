import {test,expect} from "./export-test";
import sharp from "sharp";
import fs from "node:fs/promises";

const cases=[{format:"jpeg",ext:"jpg",mime:"image/jpeg"},{format:"png",ext:"png",mime:"image/png"}] as const;

for(const item of cases){
 test(`remove-exif: real ${item.format} with camera EXIF exports decoded pixels without EXIF`,async({page})=>{
  const original=await sharp({create:{width:67,height:33,channels:3,background:"#b44c22"}})
   .withExif({IFD0:{Make:"LINGXI_TEST_CAMERA",Model:"PRIVATE_DEVICE"}})
   .toFormat(item.format).toBuffer();
  const inputMeta=await sharp(original).metadata();
  expect(inputMeta.exif?.length).toBeGreaterThan(0);
  expect(original.includes(Buffer.from("PRIVATE_DEVICE"))).toBe(true);

  await page.goto("/tools/remove-exif?lang=en");
  const workbench=page.locator("[data-tool-workbench]");
  await workbench.locator('input[type="file"]').first().setInputFiles({
   name:`private.${item.ext}`,mimeType:item.mime,buffer:original
  });
  await workbench.getByRole("button",{name:"Process now",exact:true}).click();
  const action=workbench.getByTestId("result-file-actions").first();
  await expect(action).toBeVisible({timeout:30000});
  const downloading=page.waitForEvent("download");
  await action.getByRole("button",{name:"Save file",exact:true}).click();
  const downloaded=await downloading;
  expect(await downloaded.failure()).toBeNull();
  const exported=await fs.readFile((await downloaded.path())!);
  expect(exported.includes(Buffer.from("PRIVATE_DEVICE"))).toBe(false);
  const outMeta=await sharp(exported).metadata();
  expect(outMeta.exif).toBeUndefined();
  expect([outMeta.format,outMeta.width,outMeta.height]).toEqual([item.format,67,33]);
  const pixel=await sharp(exported).extract({left:30,top:15,width:1,height:1}).removeAlpha().raw().toBuffer();
  expect(Math.abs(pixel[0]-180)).toBeLessThan(22);
  expect(Math.abs(pixel[1]-76)).toBeLessThan(22);
  expect(Math.abs(pixel[2]-34)).toBeLessThan(22);
 });
}
