import{test,expect}from'./export-test';
import{readFile}from'node:fs/promises';
import sharp from'sharp';
for(const kb of[20,50])test(`complex large image really fits ${kb}KB after resizing`,async({page})=>{
 test.setTimeout(60000);
 await page.goto(`/tools/compress-image-to-${kb}kb?lang=en`);
 const png=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=2200;c.height=1467;const ctx=c.getContext('2d')!,im=ctx.createImageData(c.width,c.height);let seed=12345;for(let i=0;i<im.data.length;i+=4){seed=(Math.imul(seed,1664525)+1013904223)>>>0;im.data[i]=seed&255;im.data[i+1]=(seed>>>8)&255;im.data[i+2]=(seed>>>16)&255;im.data[i+3]=255}ctx.putImageData(im,0,0);return c.toDataURL().split(',')[1]});
 const input=page.locator('input[type=file]').first();await expect(input).toBeEnabled();
 await input.setInputFiles({name:'detailed-large.png',mimeType:'image/png',buffer:Buffer.from(png,'base64')});
 await page.getByRole('button',{name:'Process now',exact:true}).click();
 const pending=page.waitForEvent('download');await page.getByRole('button',{name:'Save file',exact:true}).click();
 const saved=await pending;expect(await saved.failure()).toBeNull();const bytes=await readFile((await saved.path())!);
 expect(bytes.length).toBeLessThanOrEqual(kb*1024);
 const decoded=await sharp(bytes).metadata();expect(decoded.format).toBe('jpeg');expect(decoded.width).toBeGreaterThan(0);expect(decoded.height).toBeGreaterThan(0);
 expect(decoded.width!/decoded.height!).toBeCloseTo(2200/1467,1);
});
