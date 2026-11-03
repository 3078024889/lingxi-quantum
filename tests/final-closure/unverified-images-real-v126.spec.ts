import {test,expect} from "./export-test";
import type {Page} from "playwright";
import sharp from "sharp";
import fs from "node:fs/promises";
import QRCode from "qrcode";

const area=(page:Page)=>page.locator("[data-tool-workbench]");
async function sample(w:number,h:number,color:string,format:"png"|"jpeg"|"gif"|"avif"){
 return sharp({create:{width:w,height:h,channels:3,background:color}}).toFormat(format).toBuffer();
}
async function take(page:Page,index=0){
 const el=area(page).getByTestId("result-file-actions").nth(index);
 await expect(el).toBeVisible({timeout:45000});
 const ready=page.waitForEvent("download");
 await el.getByRole("button",{name:"Save file",exact:true}).click();
 const dl=await ready;
 expect(await dl.failure()).toBeNull();
 return {name:dl.suggestedFilename(),data:await fs.readFile((await dl.path())!)};
}
async function rare(page:Page,slug:string,bytes:Buffer,name:string,mime:string,target:string,w:number,h:number){
 await page.goto(`/tools/${slug}?lang=en`);
 await area(page).locator('input[type="file"]').first().setInputFiles({name,mimeType:mime,buffer:bytes});
 await area(page).getByRole("button",{name:/Convert|开始转换/}).last().click();
 const dl=await take(page);
 const decoded=await sharp(dl.data).metadata();
 expect(decoded.format).toBe(target);
 expect([decoded.width,decoded.height]).toEqual([w,h]);
 return dl;
}
function bmp24(width:number,height:number){
 const stride=(width*3+3)&~3,px=54+stride*height,buf=Buffer.alloc(px);
 buf.write("BM",0);buf.writeUInt32LE(px,2);buf.writeUInt32LE(54,10);buf.writeUInt32LE(40,14);
 buf.writeInt32LE(width,18);buf.writeInt32LE(height,22);buf.writeUInt16LE(1,26);buf.writeUInt16LE(24,28);
 buf.writeUInt32LE(stride*height,34);
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){const p=54+y*stride+x*3;buf[p]=18;buf[p+1]=84;buf[p+2]=223;}
 return buf;
}

test("jfif-to-jpg: actual JPEG/JFIF pixel decoder produces valid JPEG and changing target clears old file",async({page})=>{
 await rare(page,"jfif-to-jpg",await sample(49,27,"#d05237","jpeg"),"from-camera.jfif","image/jpeg","jpeg",49,27);
 await area(page).getByRole("combobox").first().selectOption("image/png");
 await expect(area(page).getByTestId("result-file-actions")).toHaveCount(0);
 await area(page).getByRole("button",{name:/Convert|开始转换/}).last().click();
 expect((await sharp((await take(page)).data).metadata()).format).toBe("png");
});

test("gif-to-jpg: real GIF first-frame converts to decoded JPEG",async({page})=>{
 await rare(page,"gif-to-jpg",await sample(37,22,"#ef3344","gif"),"loop.gif","image/gif","jpeg",37,22);
});

test("bmp-to-png: 24bit Windows bitmap color and dimensions survive native browser conversion",async({page})=>{
 const saved=await rare(page,"bmp-to-png",bmp24(35,19),"pixel.bmp","image/bmp","png",35,19);
 const pixel=await sharp(saved.data).extract({left:3,top:4,width:1,height:1}).removeAlpha().raw().toBuffer();
 expect(pixel[0]).toBeGreaterThan(190);expect(pixel[1]).toBeGreaterThan(50);expect(pixel[2]).toBeLessThan(50);
});

test("avif-to-jpg: true AVIF input decoded into valid JPEG bytes",async({page})=>{
 const image=await sample(36,24,"#378cbd","avif");
 await rare(page,"avif-to-jpg",image,"picture.avif","image/avif","jpeg",36,24);
});

test("svg-to-png: safe vector SVG honors 2x scale, active script SVG is rejected",async({page})=>{
 await page.goto("/tools/svg-to-png?lang=en");
 const safe='<svg xmlns="http://www.w3.org/2000/svg" width="31" height="20"><rect width="31" height="20" fill="#f12355"/></svg>';
 const upload=area(page).locator('input[type="file"]').first();
 await upload.setInputFiles({name:"vector.svg",mimeType:"image/svg+xml",buffer:Buffer.from(safe)});
 await area(page).getByRole("button",{name:"Convert to PNG",exact:true}).click();
 const saved=await take(page);
 const info=await sharp(saved.data).metadata();
 expect(info.format).toBe("png");expect([info.width,info.height]).toEqual([62,40]);
 await area(page).getByRole("combobox").first().selectOption("3");
 await expect(area(page).getByTestId("result-file-actions")).toHaveCount(0);
 await upload.setInputFiles({name:"unsafe.svg",mimeType:"image/svg+xml",buffer:Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>')});
 await area(page).getByRole("button",{name:"Convert to PNG",exact:true}).click();
 await expect(area(page).getByRole("alert")).toContainText("external resources, scripts");
 await expect(area(page).getByTestId("result-file-actions")).toHaveCount(0);
});

test("batch-image: actual two-source image resize outputs independently decodable JPEGs",async({page})=>{
 const one=await sample(100,70,"#d03422","png"),two=await sample(60,40,"#4277cc","png");
 await page.goto("/tools/batch-image?lang=en");
 await area(page).locator('input[type="file"]').first().setInputFiles([
  {name:"one.png",mimeType:"image/png",buffer:one},
  {name:"two.png",mimeType:"image/png",buffer:two}
 ]);
 await area(page).getByRole("spinbutton").first().fill("50");
 await area(page).getByRole("button",{name:"Process batch",exact:true}).click();
 await expect(area(page).getByTestId("result-file-actions")).toHaveCount(2,{timeout:30000});
 const a=await take(page,0),b=await take(page,1);
 const m1=await sharp(a.data).metadata(),m2=await sharp(b.data).metadata();
 expect([m1.format,m1.width,m1.height]).toEqual(["jpeg",50,35]);
 expect(m2.format).toBe("jpeg");expect(m2.width).toBe(50);
 await area(page).getByRole("spinbutton").first().fill("30");
 await expect(area(page).getByTestId("result-file-actions")).toHaveCount(0);
});

test("long-image: real two-image vertical PNG stitching has correct height and visible colored pixels",async({page})=>{
 const one=await sample(40,20,"#f13344","png"),two=await sample(30,35,"#328ecc","png");
 await page.goto("/tools/long-image?lang=en");
 await area(page).locator('input[type="file"]').first().setInputFiles([
  {name:"top.png",mimeType:"image/png",buffer:one},
  {name:"bottom.png",mimeType:"image/png",buffer:two}
 ]);
 await area(page).getByRole("spinbutton").first().fill("10");
 await area(page).getByRole("combobox",{name:"Output format"}).selectOption("image/png");
 await area(page).getByRole("button",{name:"Create long image",exact:true}).click();
 const saved=await take(page);const info=await sharp(saved.data).metadata();
 expect(info.format).toBe("png");expect([info.width,info.height]).toEqual([40,65]);
 const pixelTop=await sharp(saved.data).extract({left:15,top:8,width:1,height:1}).removeAlpha().raw().toBuffer();
 const pixelBottom=await sharp(saved.data).extract({left:15,top:47,width:1,height:1}).removeAlpha().raw().toBuffer();
 expect(pixelTop[0]).toBeGreaterThan(pixelTop[2]);expect(pixelBottom[2]).toBeGreaterThan(pixelBottom[0]);
});

test("qr-safe-reader: safe QR payload is shown for review and blank source fails without auto navigation",async({page})=>{
 const payload="https://example.com/search?q="+encodeURIComponent("宇宙");
 const qr=await QRCode.toBuffer(payload,{width:340,margin:4,errorCorrectionLevel:"H"});
 const blank=await sample(160,160,"#ffffff","png");
 await page.goto("/tools/qr-safe-reader?lang=en");
 const files=area(page).locator('input[type="file"]').first();
 await files.setInputFiles([
  {name:"safe.png",mimeType:"image/png",buffer:qr},
  {name:"blank.png",mimeType:"image/png",buffer:blank}
 ]);
 await area(page).getByRole("button",{name:"Read 2 images",exact:true}).click();
 await expect(area(page)).toContainText(payload,{timeout:30000});
 await expect(area(page)).toContainText("No QR code found");
 await expect(page).toHaveURL(/\/tools\/qr-safe-reader/);
 await expect(area(page).getByRole("link",{name:/Open after review/})).toHaveAttribute("href",payload);
});
