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


test("APNG marker after a 1 MiB ancillary PNG chunk is still rejected before decoding",async({page})=>{
 test.setTimeout(90000);
 // Build a two-frame APNG with valid PNG CRCs and a large tEXt chunk.
 // The animation control block is deliberately placed beyond the 1 MiB preview.
 const crc32=(data:Buffer)=>{
  let crc=0xffffffff;
  for(const byte of data){
   crc^=byte;
   for(let bit=0;bit<8;bit++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);
  }
  return (crc^0xffffffff)>>>0;
 };
 const chunk=(tag:string,data:Buffer)=>{
  const name=Buffer.from(tag,"ascii");
  const length=Buffer.alloc(4);length.writeUInt32BE(data.length);
  const crc=Buffer.alloc(4);crc.writeUInt32BE(crc32(Buffer.concat([name,data])));
  return Buffer.concat([length,name,data,crc]);
 };
 const chunks=(png:Buffer)=>{
  const out:{tag:string;data:Buffer}[]=[];
  for(let i=8;i+12<=png.length;){
   const size=png.readUInt32BE(i);
   out.push({tag:png.toString("ascii",i+4,i+8),data:png.subarray(i+8,i+8+size)});
   i+=size+12;
  }
  return out;
 };
 const frameControl=(seq:number)=>{
  const data=Buffer.alloc(26);
  data.writeUInt32BE(seq,0);data.writeUInt32BE(18,4);data.writeUInt32BE(18,8);
  data.writeUInt16BE(1,20);data.writeUInt16BE(10,22);
  return data;
 };
 const frame0=chunks(await sharp({create:{width:18,height:18,channels:4,background:"#ff1100"}}).png().toBuffer());
 const frame1=chunks(await sharp({create:{width:18,height:18,channels:4,background:"#0011ff"}}).png().toBuffer());
 const idats=(items:typeof frame0)=>Buffer.concat(items.filter(c=>c.tag==="IDAT").map(c=>c.data));
 const actl=Buffer.alloc(8);actl.writeUInt32BE(2,0);
 const seq2=Buffer.alloc(4);seq2.writeUInt32BE(2,0);
 const apng=Buffer.concat([
  Buffer.from([137,80,78,71,13,10,26,10]),
  chunk("IHDR",frame0.find(c=>c.tag==="IHDR")!.data),
  chunk("tEXt",Buffer.concat([Buffer.from("Comment\0"),Buffer.alloc(1024*1024+128,120)])),
  chunk("acTL",actl),
  chunk("fcTL",frameControl(0)),
  chunk("IDAT",idats(frame0)),
  chunk("fcTL",frameControl(1)),
  chunk("fdAT",Buffer.concat([seq2,idats(frame1)])),
  chunk("IEND",Buffer.alloc(0))
 ]);
 expect(apng.indexOf(Buffer.from("acTL"))).toBeGreaterThan(1024*1024);
 const input=await ready(page);
 await input.setInputFiles({name:"two-frame-large-metadata.png",mimeType:"image/png",buffer:apng});
 await page.getByRole("button",{name:"Process batch",exact:true}).click();
 await expect(page.locator('section[aria-label="Failed files"]')).toContainText("animated image");
 await expect(page.getByRole("button",{name:"Save file",exact:true})).toHaveCount(0);
});

test("Malformed PNG chunk lengths fail closed without entering browser decode",async({page})=>{
 const input=await ready(page);
 const broken=Buffer.from(await sharp({create:{width:12,height:12,channels:3,background:"#ffffff"}}).png().toBuffer());
 // Next chunk after the 25-byte IHDR begins at offset 33.
 broken.writeUInt32BE(0x7fffffff,33);
 await input.setInputFiles({name:"invalid-chunk.png",mimeType:"image/png",buffer:broken});
 await page.getByRole("button",{name:"Process batch",exact:true}).click();
 await expect(page.locator('section[aria-label="Failed files"]')).toContainText("Could not read or convert");
 await expect(page.getByRole("button",{name:"Save file",exact:true})).toHaveCount(0);
});


test("Batch usage records partial completion and export attempts without file content",async({page})=>{
 test.setTimeout(90000);
 const events:Array<{eventType:string;metadata:Record<string,number>}>=[];
 await page.addInitScript(()=>{Object.defineProperty(navigator,"userAgent",{value:"UsageTestBrowser"});sessionStorage.removeItem("lx-analytics-test")});
 await page.route("**/api/tools/analytics/track",async route=>{
  const data=route.request().postDataJSON();events.push(data);
  await route.fulfill({status:200,contentType:"application/json",body:'{"ok":true}'});
 });
 const input=await ready(page);
 const png=await sharp({create:{width:20,height:20,channels:3,background:"red"}}).png().toBuffer();
 await input.setInputFiles([{name:"private-photo.png",mimeType:"image/png",buffer:png},{name:"private-broken.png",mimeType:"image/png",buffer:Buffer.from("broken")}]);
 await page.getByRole("button",{name:"Process batch",exact:true}).click();
 await expect(page.getByRole("button",{name:"Save file",exact:true})).toHaveCount(1);
 const download=page.waitForEvent("download");
 await page.getByRole("button",{name:"Save file",exact:true}).click();await download;
 await expect.poll(()=>events.map(e=>e.eventType)).toContain("export_clicked");
 const complete=events.filter(e=>e.eventType==="process_completed");
 expect(complete).toHaveLength(1);expect(complete[0].metadata.file_count).toBe(1);expect(complete[0].metadata.failed_count).toBe(1);
 expect(events.filter(e=>e.eventType==="process_started")).toHaveLength(1);
 expect(JSON.stringify(events)).not.toContain("private-");
 expect(events.some(e=>e.eventType==="export_paid")).toBe(false);
});
