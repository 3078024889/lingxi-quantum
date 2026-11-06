import {test,expect} from "./export-test";
import fs from "node:fs/promises";
import sharp from "sharp";

const conversions=[
 {slug:"png-to-jpg",input:"png",sourceMime:"image/png",expected:"jpeg",width:43,height:27},
 {slug:"jpg-to-png",input:"jpeg",sourceMime:"image/jpeg",expected:"png",width:55,height:31},
 {slug:"webp-to-jpg",input:"webp",sourceMime:"image/webp",expected:"jpeg",width:61,height:35},
] as const;

for(const item of conversions)test(`image ${item.slug}: upload, convert, download and independently decode pixels`,async({page})=>{
 await page.goto(`/tools/${item.slug}?lang=en`);
 const area=page.locator("[data-tool-workbench]");
 const sample=sharp({create:{width:item.width,height:item.height,channels:3,background:"#9f6832"}});
 const bytes=await sample.toFormat(item.input).toBuffer();
 await area.locator('input[type="file"]').first().setInputFiles({name:`fixture.${item.input==="jpeg"?"jpg":item.input}`,mimeType:item.sourceMime,buffer:bytes});
 await area.getByRole("button",{name:/^Convert(?: ·|$)/}).click();
 const actions=area.getByTestId("result-file-actions");
 await expect(actions).toBeVisible({timeout:30000});
 const waiting=page.waitForEvent("download");await actions.getByRole("button",{name:"Save file"}).click();
 const dl=await waiting;expect(await dl.failure()).toBeNull();
 const file=await fs.readFile((await dl.path())!);
 const meta=await sharp(file).metadata();
 expect(meta.format).toBe(item.expected);
 expect(meta.width).toBe(item.width);expect(meta.height).toBe(item.height);
 const pixel=await sharp(file).extract({left:0,top:0,width:1,height:1}).removeAlpha().raw().toBuffer();
 expect(pixel[0]).toBeGreaterThan(70);
 expect(pixel[1]).toBeGreaterThan(50);
 expect(pixel[2]).toBeGreaterThan(20);
 expect(dl.suggestedFilename().endsWith(item.expected==="jpeg"?".jpg":".png")).toBe(true);
});

const caps=[
 ["compress-image-to-20kb",20],
 ["compress-image-to-50kb",50],
 ["compress-image-to-100kb",100],
 ["compress-image-to-200kb",200],
 ["compress-image-to-500kb",500],
] as const;

for(const [slug,capKB]of caps)test(`image ${slug}: real JPEG download remains readable and meets an achievable cap`,async({page})=>{
 const src=await sharp({create:{width:161,height:109,channels:3,background:"#3281af"}}).png().toBuffer();
 await page.goto(`/tools/${slug}?lang=en`);
 const area=page.locator("[data-tool-workbench]");
 await area.locator('input[type="file"]').first().setInputFiles({name:"source.png",mimeType:"image/png",buffer:src});
 await area.getByRole("button",{name:"Process now"}).click();
 const actions=area.getByTestId("result-file-actions");
 await expect(actions).toBeVisible({timeout:30000});
 const waiting=page.waitForEvent("download");await actions.getByRole("button",{name:"Save file"}).click();
 const dl=await waiting;const bytes=await fs.readFile((await dl.path())!);
 expect(await dl.failure()).toBeNull();
 expect(bytes.length).toBeLessThanOrEqual(capKB*1024);
 const meta=await sharp(bytes).metadata();
 expect(meta.format).toBe("jpeg");
 expect(meta.width).toBeGreaterThan(0);expect(meta.height).toBeGreaterThan(0);
});

test("image converter rejects incompatible uploaded formats before processing",async({page})=>{
 await page.goto("/tools/jpg-to-png?lang=en");
 const area=page.locator("[data-tool-workbench]");
 const bytes=await sharp({create:{width:20,height:20,channels:3,background:"white"}}).png().toBuffer();
 await area.locator('input[type="file"]').first().setInputFiles({name:"wrong.png",mimeType:"image/png",buffer:bytes});
 await expect(area.getByRole("alert")).toBeVisible();
 await expect(area.getByRole("button",{name:/^Convert(?: ·|$)/})).toBeDisabled();
});
