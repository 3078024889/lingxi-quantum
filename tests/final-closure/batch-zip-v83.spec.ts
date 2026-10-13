import {test,expect} from 'playwright/test';
import {readFile} from 'node:fs/promises';
import JSZip from 'jszip';

test('batch images retain incremental uploads, handle thin images and ZIP every colliding output',async({page})=>{
 await page.goto('/tools/batch-image?lang=en');
 const inputs=[];
 for(const [name,type,color] of [['photo.png','image/png','#ff0000'],['photo.webp','image/webp','#00ff00'],['photo-2.png','image/png','#0000ff']]){
  const base64=await page.evaluate(({type,color})=>{const canvas=document.createElement('canvas');canvas.width=2000;canvas.height=1;const ctx=canvas.getContext('2d')!;ctx.fillStyle=color;ctx.fillRect(0,0,2000,1);return canvas.toDataURL(type,1).split(',')[1]},{type,color});inputs.push({name,mimeType:type,buffer:Buffer.from(base64,'base64')});
 }
 const upload=page.locator('input[type=file]').first();await expect(upload).toBeEnabled({timeout:15000});await upload.setInputFiles(inputs.slice(0,1));await upload.setInputFiles(inputs.slice(1));
 const width=page.getByRole('spinbutton',{name:'Max width px',exact:true});await width.fill('');await expect(width).toHaveValue('');await width.pressSequentially('356');await width.press('Tab');await expect(width).toHaveValue('356');
 await page.getByRole('button',{name:'Process batch',exact:true}).click();await expect(page.getByRole('button',{name:'Save file',exact:true})).toHaveCount(3);
 const pending=page.waitForEvent('download');await page.getByRole('button',{name:'Download ZIP',exact:true}).click();const download=await pending;expect(await download.failure()).toBeNull();const zip=await JSZip.loadAsync(await readFile((await download.path())!));const names=Object.keys(zip.files);expect(names).toHaveLength(3);expect(new Set(names.map(name=>name.toLowerCase())).size).toBe(3);
 const colors=[];
 for(const name of names){const base64=await zip.file(name)!.async('base64');const image=await page.evaluate(async base64=>{const image=new Image();image.src='data:image/jpeg;base64,'+base64;await image.decode();const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;const ctx=canvas.getContext('2d')!;ctx.drawImage(image,0,0);return{w:image.width,h:image.height,pixel:[...ctx.getImageData(100,0,1,1).data]};},base64);expect(image.w).toBe(356);expect(image.h).toBe(1);colors.push(image.pixel.indexOf(Math.max(...image.pixel.slice(0,3))))}
 expect(colors.sort()).toEqual([0,1,2]);
});
