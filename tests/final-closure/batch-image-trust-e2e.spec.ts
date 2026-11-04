import {test,expect,type Page} from "./export-test";
import {readFile} from "node:fs/promises";
import sharp from "sharp";
import JSZip from "jszip";

async function ready(page:Page,lang="en"){
 await page.goto("/tools/batch-image?lang="+lang);
 const input=page.locator('input[type="file"]').first();
 await expect(input).toBeEnabled({timeout:15000});
 return input;
}
async function download(page:Page,name:RegExp){
 const event=page.waitForEvent("download");
 await page.getByRole("button",{name:"Download ZIP",exact:true}).click();
 const d=await event;
 expect(d.suggestedFilename()).toMatch(name);
 expect(await d.failure()).toBeNull();
 return readFile((await d.path())!);
}

test("Batch JPG exports unique real filenames, keeps successful images despite corrupted input and ZIP reopens",async({page})=>{
 test.setTimeout(90000);
 const input=await ready(page);
 const red=await sharp({create:{width:220,height:100,channels:3,background:{r:252,g:0,b:0}}}).png().toBuffer();
 const blue=await sharp({create:{width:80,height:60,channels:3,background:{r:0,g:0,b:250}}}).webp({quality:100}).toBuffer();
 await input.setInputFiles([
  {name:"photo.png",mimeType:"image/png",buffer:red},
  {name:"photo.webp",mimeType:"image/webp",buffer:blue},
  {name:"broken.png",mimeType:"image/png",buffer:Buffer.from("not an image","utf8")}
 ]);
 await page.getByRole("button",{name:"Process batch",exact:true}).click();
 const save=page.getByRole("button",{name:"Save file",exact:true});
 await expect(save).toHaveCount(2,{timeout:25000});
 await expect(page.locator('section[aria-label="Failed files"]')).toContainText("broken.png");
 const bytes=await download(page,/\.zip$/);
 const zip=await JSZip.loadAsync(bytes);
 const names=Object.keys(zip.files).filter(x=>!zip.files[x].dir).sort();
 expect(names).toEqual(["photo-2.jpg","photo.jpg"]);
 const a=await sharp(await zip.file("photo.jpg")!.async("nodebuffer")).removeAlpha().raw().toBuffer({resolveWithObject:true});
 const b=await sharp(await zip.file("photo-2.jpg")!.async("nodebuffer")).removeAlpha().raw().toBuffer({resolveWithObject:true});
 expect([a.info.width,a.info.height,b.info.width,b.info.height]).toEqual([220,100,80,60]);
 expect(a.data[0]).toBeGreaterThan(230);
 expect(a.data[2]).toBeLessThan(20);
 expect(b.data[0]).toBeLessThan(20);
 expect(b.data[2]).toBeGreaterThan(225);
 await page.getByRole("button",{name:"1080 px",exact:true}).click();
 await expect(save).toHaveCount(0);
 await expect(page.locator('section[aria-label="Failed files"]')).toHaveCount(0);
});

test("PNG batch keeps transparent pixels and hides irrelevant quality selector",async({page})=>{
 test.setTimeout(90000);
 const input=await ready(page);
 const b=await sharp({create:{width:24,height:18,channels:4,background:{r:255,g:0,b:0,alpha:0}}})
  .composite([{input:await sharp({create:{width:8,height:8,channels:4,background:{r:20,g:240,b:30,alpha:1}}}).png().toBuffer(),left:8,top:5}]).png().toBuffer();
 await input.setInputFiles({name:"transparent.png",mimeType:"image/png",buffer:b});
 await page.getByRole("combobox",{name:"Output format",exact:true}).selectOption("image/png");
 await expect(page.getByRole("combobox",{name:"Image quality",exact:true})).toHaveCount(0);
 await page.getByRole("button",{name:"Process batch",exact:true}).click();
 const pending=page.waitForEvent("download");
 await page.getByRole("button",{name:"Save file",exact:true}).first().click();
 const d=await pending;
 expect(d.suggestedFilename()).toBe("transparent.png");
 const pixels=sharp(await readFile((await d.path())!));
 const meta=await pixels.metadata();
 expect([meta.width,meta.height,meta.format]).toEqual([24,18,"png"]);
 const raw=await pixels.ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const at=(x:number,y:number)=>[...raw.data.subarray((y*24+x)*4,(y*24+x)*4+4)];
 expect(at(0,0)[3]).toBe(0);
 expect(at(10,8)[1]).toBeGreaterThan(220);
 expect(at(10,8)[3]).toBe(255);
 await page.getByRole("combobox",{name:"Output format",exact:true}).selectOption("image/webp");
 await expect(page.getByRole("combobox",{name:"Image quality",exact:true})).toBeVisible();
 await expect(page.getByRole("button",{name:"Save file",exact:true})).toHaveCount(0);
});

test("Animated GIF rejected at upload and spoofed GIF bytes refused even when renamed .png",async({page})=>{
 const input=await ready(page);
 const gif=await sharp({create:{width:12,height:12,channels:3,background:"#a20000"}}).gif().toBuffer();
 await input.setInputFiles({name:"moving.gif",mimeType:"image/gif",buffer:gif});
 await expect(page.locator("[data-tool-workbench] p[role=alert]")).toContainText("moving.gif");
 await expect(page.getByRole("button",{name:"Process batch",exact:true})).toBeDisabled();
 await input.setInputFiles({name:"fake.png",mimeType:"image/png",buffer:gif});
 await expect(page.getByRole("button",{name:"Process batch",exact:true})).toBeEnabled();
 await page.getByRole("button",{name:"Process batch",exact:true}).click();
 await expect(page.locator('section[aria-label="Failed files"]')).toContainText("not a supported static");
 await expect(page.getByRole("button",{name:"Save file",exact:true})).toHaveCount(0);
});

test("Batch processes images after editing custom width and all nine locale titles appear",async({page})=>{
 test.setTimeout(90000);
 const input=await ready(page);
 const src=await sharp({create:{width:2000,height:1,channels:3,background:"#bb2277"}}).png().toBuffer();
 await input.setInputFiles({name:"thin.png",mimeType:"image/png",buffer:src});
 const width=page.getByRole("spinbutton",{name:"Max width px",exact:true});
 await width.fill("356");
 await width.press("Tab");
 await expect(width).toHaveValue("356");
 await page.getByRole("button",{name:"Process batch",exact:true}).click();
 const pending=page.waitForEvent("download");
 await page.getByRole("button",{name:"Save file",exact:true}).first().click();
 const out=await pending;
 const meta=await sharp(await readFile((await out.path())!)).metadata();
 expect([meta.width,meta.height,meta.format]).toEqual([356,1,"jpeg"]);
 const translations=[
  ["zh","批量图片处理"],["en","Batch Image Processing"],["ja","画像をまとめて変換"],
  ["ko","이미지 일괄 변환"],["fr","Traitement d’images par lot"],
  ["de","Bilder stapelweise verarbeiten"],["es","Procesar imágenes por lotes"],
  ["pt","Processamento de imagens em lote"],["ar","معالجة الصور دفعة واحدة"]
 ];
 for(const [lang,label] of translations){
  await page.goto("/tools/batch-image?lang="+lang);
  await expect(page.getByRole("heading",{name:label,exact:true})).toBeVisible({timeout:15000});
 }
});


test("Actual animated WebP frames are rejected without silently exporting only one frame",async({page})=>{
 test.setTimeout(90000);
 const input=await ready(page);
 const a=await sharp({create:{width:18,height:18,channels:4,background:"#ff1100"}}).png().toBuffer();
 const b=await sharp({create:{width:18,height:18,channels:4,background:"#0011ff"}}).png().toBuffer();
 const animated=await sharp([a,b],{join:{animated:true}}).webp({delay:[100,100],loop:0}).toBuffer();
 expect((await sharp(animated,{animated:true}).metadata()).pages).toBe(2);
 await input.setInputFiles({name:"moving.webp",mimeType:"image/webp",buffer:animated});
 await page.getByRole("button",{name:"Process batch",exact:true}).click();
 await expect(page.locator('section[aria-label="Failed files"]')).toContainText("animated image");
 await expect(page.getByRole("button",{name:"Save file",exact:true})).toHaveCount(0);
});

test("Oversized PNG dimensions are rejected from the header before unsafe browser decoding",async({page})=>{
 test.setTimeout(90000);
 const input=await ready(page);
 const png=Buffer.from(await sharp({create:{width:20,height:20,channels:3,background:"#ffffff"}}).png().toBuffer());
 png.writeUInt32BE(20000,16); // oversized IHDR; decoding this untrusted file must never start
 await input.setInputFiles({name:"huge.png",mimeType:"image/png",buffer:png});
 await page.getByRole("button",{name:"Process batch",exact:true}).click();
 await expect(page.locator('section[aria-label="Failed files"]')).toContainText("dimensions are too large");
 await expect(page.getByRole("button",{name:"Save file",exact:true})).toHaveCount(0);
});
