import {test,expect} from "./export-test";
import sharp from "sharp";
import fs from "node:fs/promises";

const image=async(width:number,height:number,format:"png"|"jpeg")=>sharp({create:{width,height,channels:3,background:"#be4537"}}).toFormat(format).toBuffer();

test("conversion shows actual input/output previews, touch slider, truthful size change and saved JPEG",async({page})=>{
 await page.goto("/tools/png-to-jpg?lang=en");
 const zone=page.locator("[data-tool-workbench]");
 const original=await image(240,120,"png");
 await zone.locator('input[type="file"]').first().setInputFiles({name:"scene.png",mimeType:"image/png",buffer:original});
 await expect(zone.getByTestId("image-before-after")).toHaveCount(0);
 await zone.getByRole("button",{name:/^Convert ·/}).click();
 const compare=zone.getByTestId("image-before-after");
 await expect(compare).toBeVisible();
 const before=compare.getByTestId("image-compare-before");
 const after=compare.getByTestId("image-compare-after");
 await expect(before).toHaveAttribute("src",/^blob:/);
 await expect(after).toHaveAttribute("src",/^blob:/);
 await expect.poll(()=>after.evaluate((el:HTMLImageElement)=>el.naturalWidth)).toBe(240);
 await expect(compare).toContainText("scene.png");
 const range=compare.getByTestId("image-compare-slider");
 await range.evaluate((node:HTMLInputElement)=>{const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,"value")?.set;if(!setter)throw Error("RANGE_SETTER_MISSING");setter.call(node,"75");node.dispatchEvent(new Event("input",{bubbles:true}));node.dispatchEvent(new Event("change",{bubbles:true}))});
 await expect(range).toHaveValue("75");
 await expect(before.locator("..")).toHaveAttribute("style",/25%/);
 const action=zone.getByTestId("result-file-actions").first();
 const pending=page.waitForEvent("download");
 await action.getByRole("button",{name:"Save file"}).click();
 const saved=await pending;
 const content=await fs.readFile((await saved.path())!);
 const meta=await sharp(content).metadata();
 expect(meta.format).toBe("jpeg");expect([meta.width,meta.height]).toEqual([240,120]);
 const delta=(content.length-original.length)/original.length*100;
 await expect(compare.getByTestId("image-compare-size-change")).toHaveText((delta>0?"+":"")+delta.toFixed(1)+"%");
});

test("batch image conversion switches preview independently without changing file downloads",async({page})=>{
 await page.goto("/tools/jpg-to-png?lang=en");
 const zone=page.locator("[data-tool-workbench]");
 const first=await image(80,60,"jpeg"),second=await image(120,90,"jpeg");
 await zone.locator('input[type="file"]').first().setInputFiles([
  {name:"first.jpg",mimeType:"image/jpeg",buffer:first},
  {name:"second.jpg",mimeType:"image/jpeg",buffer:second},
 ]);
 await zone.getByRole("button",{name:/^Convert ·/}).click();
 const compare=zone.getByTestId("image-before-after");
 await expect(compare).toContainText("first.jpg");
 await expect(compare.getByTestId("image-compare-position")).toHaveText("1 of 2");
 await compare.getByRole("button",{name:"Next"}).click();
 await expect(compare).toContainText("second.jpg");
 await expect(compare.getByTestId("image-compare-position")).toHaveText("2 of 2");
 await expect.poll(()=>compare.getByTestId("image-compare-after").evaluate((el:HTMLImageElement)=>el.naturalWidth)).toBe(120);
 await expect(zone.getByTestId("result-file-actions")).toHaveCount(2);
});

test("local image compression presents output comparison and preserves exported image bytes",async({page})=>{
 await page.goto("/tools/compress-image-to-100kb?lang=en");
 const zone=page.locator("[data-tool-workbench]");
 const original=await image(300,180,"png");
 await zone.locator('input[type="file"]').first().setInputFiles({name:"compress-me.png",mimeType:"image/png",buffer:original});
 await zone.getByRole("button",{name:"Process now"}).click();
 const compare=zone.getByTestId("image-before-after");
 await expect(compare).toBeVisible();
 await expect(compare.getByTestId("image-compare-after")).toHaveAttribute("src",/^blob:/);
 const pending=page.waitForEvent("download");
 await zone.getByTestId("result-file-actions").getByRole("button",{name:"Save file"}).click();
 const saved=await pending;
 const bytes=await fs.readFile((await saved.path())!);
 expect((await sharp(bytes).metadata()).format).toBe("jpeg");
 expect(bytes.length).toBeLessThanOrEqual(100*1024);
});
