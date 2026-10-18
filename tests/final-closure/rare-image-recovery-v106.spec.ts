import{test,expect}from'./export-test';
import sharp from'sharp';
import{readFile}from'node:fs/promises';

for(const slug of['gif-to-jpg','avif-to-jpg','bmp-to-png','ico-to-png','jfif-to-jpg'])test(`${slug}: corrupt image fails without leaking its decoder URL`,async({page})=>{
 await page.goto(`/tools/${slug}?lang=en`);
 const input=page.locator('input[type=file]').first();await expect(input).toBeEnabled();
 await page.evaluate(()=>{
  const active=new Set<string>(),create=URL.createObjectURL.bind(URL),revoke=URL.revokeObjectURL.bind(URL);
  Object.assign(window,{decoderUrls:active});
  URL.createObjectURL=blob=>{const url=create(blob);active.add(url);return url};
  URL.revokeObjectURL=url=>{active.delete(url);revoke(url)};
 });
 await input.setInputFiles({name:`corrupt.${slug.split('-')[0]}`,mimeType:'image/gif',buffer:Buffer.from('not an image')});
 const area=page.locator('[data-tool-workbench]');
 await expect.poll(()=>page.evaluate(()=>(window as any).decoderUrls.size)).toBe(1);
 for(let attempt=0;attempt<3;attempt++){
  await area.getByRole('button',{name:'Convert',exact:true}).click();
  await expect(area.getByRole('alert')).toContainText('This image could not be converted.');
  await expect(area.getByRole('button',{name:'Convert',exact:true})).toBeEnabled();
  await expect.poll(()=>page.evaluate(()=>(window as any).decoderUrls.size)).toBe(1);
  await expect(area.getByRole('button',{name:'Save file',exact:true})).toHaveCount(0);
 }
 await area.getByRole('button',{name:'Remove',exact:true}).click();
 await expect.poll(()=>page.evaluate(()=>(window as any).decoderUrls.size)).toBe(0);
 const png=await sharp({create:{width:13,height:17,channels:3,background:'#ef9032'}}).png().toBuffer();
 await input.setInputFiles({name:'recovery.png',mimeType:'image/png',buffer:png});
 await area.getByRole('button',{name:'Convert',exact:true}).click();
 await expect(area.getByRole('button',{name:'Save file',exact:true})).toBeVisible();
 const pending=page.waitForEvent('download');await area.getByRole('button',{name:'Save file',exact:true}).click();
 const download=await pending;expect(await download.failure()).toBeNull();
 const output=await sharp(await readFile((await download.path())!)).metadata();
 expect(output.format).toBe(slug.endsWith('png')?'png':'jpeg');expect(output.width).toBe(13);expect(output.height).toBe(17);
 await area.getByRole('combobox').selectOption('image/webp');
 await expect(area.getByRole('button',{name:'Save file',exact:true})).toHaveCount(0);
 await area.getByRole('button',{name:'Convert',exact:true}).click();
 await expect(area.getByRole('button',{name:'Save file',exact:true})).toBeVisible();
 await area.locator('input[type=range]').fill('0.5');
 await expect(area.getByRole('button',{name:'Save file',exact:true})).toHaveCount(0);
});
