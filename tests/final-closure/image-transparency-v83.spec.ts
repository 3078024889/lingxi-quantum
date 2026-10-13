import {test,expect} from 'playwright/test';
import {readFile} from 'node:fs/promises';

for(const [slug,format,output] of [['remove-exif','image/png','image/png'],['remove-exif','image/webp','image/webp'],['webp-to-jpg','image/webp','image/png']] as const){
 test(slug+' preserves alpha and pixel dimensions for '+format+' → '+output,async({page})=>{
  await page.goto('/tools/'+slug+'?lang=en');
  const base64=await page.evaluate(type=>{const canvas=document.createElement('canvas');canvas.width=32;canvas.height=24;const context=canvas.getContext('2d')!;context.fillStyle='rgba(255,0,0,0.5)';context.fillRect(8,6,16,12);return canvas.toDataURL(type,1).split(',')[1]},format);
  const upload=page.locator('input[type=file]').first();await expect(upload).toBeEnabled({timeout:15000});await upload.setInputFiles({name:'alpha.'+(format==='image/png'?'png':'webp'),mimeType:format,buffer:Buffer.from(base64,'base64')});
  if(slug==='webp-to-jpg')await page.getByRole('combobox',{name:'Output format',exact:true}).selectOption('png');
  const process=page.getByRole('button',{name:/^(Convert ·|Process now)/});await process.click();
  const pending=page.waitForEvent('download');await page.getByRole('button',{name:'Save file',exact:true}).first().click();const download=await pending;expect(await download.failure()).toBeNull();expect(download.suggestedFilename()).toMatch(output==='image/png'?/\.png$/:/\.webp$/);const bytes=await readFile((await download.path())!);
  const image=await page.evaluate(async({base64,type})=>{const image=new Image();image.src='data:'+type+';base64,'+base64;await image.decode();const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;const context=canvas.getContext('2d')!;context.drawImage(image,0,0);return{width:image.width,height:image.height,corner:[...context.getImageData(0,0,1,1).data],center:[...context.getImageData(16,12,1,1).data]};},{base64:bytes.toString('base64'),type:output});
  expect(image.width).toBe(32);expect(image.height).toBe(24);expect(image.corner[3]).toBe(0);expect(image.center[3]).toBeGreaterThanOrEqual(126);expect(image.center[3]).toBeLessThanOrEqual(130);expect(image.center[0]).toBeGreaterThan(245);expect(image.center[1]).toBeLessThan(10);
 });
}
