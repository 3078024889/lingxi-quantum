import {test,expect} from "./export-test";
import sharp from "sharp";
import {readFile} from "node:fs/promises";

test("Screenshot redaction: exported PNG truly overwrites sensitive pixels and removes source metadata",async({page})=>{
 test.setTimeout(90000);
 const original=await sharp({create:{width:200,height:140,channels:3,background:"#ffffff"}})
  .jpeg().withExif({IFD0:{Make:"PRIVATE_CAMERA_SIGNATURE"}}).toBuffer();
 await page.goto("/tools/screenshot-redact?lang=en");
 const input=page.locator('input[type="file"]').first();
 await expect(input).toBeEnabled({timeout:15000});
 await input.setInputFiles({name:"private.jpg",mimeType:"image/jpeg",buffer:original});
 const image=page.locator("[data-redaction-surface] img");
 await expect(image).toBeVisible({timeout:15000});
 await expect.poll(()=>image.evaluate(el=>(el as HTMLImageElement).naturalWidth),{timeout:15000}).toBe(200);
 await page.getByRole("button",{name:"Draw redaction",exact:true}).click();
 const surface=page.locator("[data-redaction-surface]");
 await expect(surface).toHaveAttribute("data-mode","draw");
 const bound=await surface.boundingBox();if(!bound)throw Error("IMAGE_SURFACE_NOT_FOUND");
 await page.mouse.move(bound.x+bound.width*.15,bound.y+bound.height*.20);
 await page.mouse.down();
 await page.mouse.move(bound.x+bound.width*.70,bound.y+bound.height*.65,{steps:8});
 await page.mouse.up();
 await expect(surface).toHaveAttribute("data-mode","scroll");
 await expect(surface.locator("[data-redaction-box]")).toHaveCount(1);
 await page.getByRole("button",{name:"Export redacted image",exact:true}).click();
 const button=page.getByRole("button",{name:"Save file",exact:true});
 await expect(button).toBeVisible({timeout:30000});
 const waiting=page.waitForEvent("download");
 await button.click();
 const file=await waiting;
 expect(file.suggestedFilename()).toBe("redacted-private.png");
 const bytes=await readFile((await file.path())!);
 const decoded=sharp(bytes);
 const metadata=await decoded.metadata();
 expect(metadata.format).toBe("png");
 expect([metadata.width,metadata.height]).toEqual([200,140]);
 expect(metadata.exif).toBeUndefined();
 const imageData=await decoded.ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const at=(x:number,y:number)=>{
  const i=(y*imageData.info.width+x)*imageData.info.channels;
  return [...imageData.data.subarray(i,i+4)];
 };
 expect(at(100,70)).toEqual([0,0,0,255]);
 expect(at(10,10).slice(0,3).every(v=>v>235)).toBe(true);
});

test("Screenshot redaction rejects animated GIF and SVG instead of silently flattening or processing them",async({page})=>{
 await page.goto("/tools/screenshot-redact?lang=en");
 const input=page.locator('input[type="file"]').first();
 await expect(input).toBeEnabled({timeout:15000});
 const gif=await sharp({create:{width:12,height:12,channels:3,background:"#ff0000"}}).gif().toBuffer();
 await input.setInputFiles({name:"animated.gif",mimeType:"image/gif",buffer:gif});
 await expect(page.locator("[data-tool-workbench] p[role=alert]")).toContainText("animated.gif");
 await expect(page.getByRole("button",{name:"Export redacted image",exact:true})).toBeDisabled();
 const svg=Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><text y="15">PRIVATE</text></svg>');
 await input.setInputFiles({name:"vector.svg",mimeType:"image/svg+xml",buffer:svg});
 await expect(page.locator("[data-tool-workbench] p[role=alert]")).toContainText("vector.svg");
 await expect(page.getByRole("button",{name:"Export redacted image",exact:true})).toBeDisabled();
});


test("Screenshot redaction blocks spoofed animated bytes and preserves a fail-closed export gate",async({page})=>{
 test.setTimeout(90000);
 await page.goto("/tools/screenshot-redact?lang=en");
 const input=page.locator('input[type="file"]').first();
 await expect(input).toBeEnabled({timeout:20000});
 const gif=await sharp({create:{width:18,height:18,channels:3,background:"#fa2000"}}).gif().toBuffer();
 // The name and MIME falsely claim PNG. The actual bytes still identify GIF.
 await input.setInputFiles({name:"spoofed.png",mimeType:"image/png",buffer:gif});
 await expect(page.locator("[data-tool-workbench] p[role=alert]")).toContainText("Animated or mislabeled files",{timeout:20000});
 await expect(page.locator("[data-redaction-surface]")).toHaveCount(0);
 await expect(page.getByRole("button",{name:"Export redacted image",exact:true})).toBeDisabled();
 const a=await sharp({create:{width:18,height:18,channels:4,background:"#ff0000"}}).png().toBuffer();
 const b=await sharp({create:{width:18,height:18,channels:4,background:"#0000ff"}}).png().toBuffer();
 const animated=await sharp([a,b],{join:{animated:true}}).webp({delay:[100,100],loop:0}).toBuffer();
 expect((await sharp(animated,{animated:true}).metadata()).pages).toBe(2);
 await input.setInputFiles({name:"moving.webp",mimeType:"image/webp",buffer:animated});
 await expect(page.locator("[data-tool-workbench] p[role=alert]")).toContainText("Animated or mislabeled files",{timeout:20000});
 await expect(page.locator("[data-redaction-surface]")).toHaveCount(0);
 await expect(page.getByRole("button",{name:"Export redacted image",exact:true})).toBeDisabled();
});
