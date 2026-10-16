import {test,expect,type Page} from './export-test';
import fs from 'node:fs/promises';

async function source(page:Page){
 await page.goto('/tools/resize-image?lang=en');
 const png=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=20;c.height=10;const x=c.getContext('2d')!;x.fillStyle='#ff0000';x.fillRect(0,0,20,10);return c.toDataURL('image/png').split(',')[1]});
 const input=page.locator('input[type=file]').first();await expect(input).toBeEnabled();
 await input.setInputFiles({name:'small.png',mimeType:'image/png',buffer:Buffer.from(png,'base64')});
 await expect(page.getByText('Source 20×10',{exact:true})).toBeVisible();
 await expect(page.locator('aside img[src^="blob:"]')).toBeVisible();
}
test('editing resize parameters reuses previews and clearing releases source URLs',async({page})=>{
 await page.addInitScript(()=>{const state={created:[] as string[],revoked:[] as string[]};(window as any).__urlsV79=state;const create=URL.createObjectURL.bind(URL),revoke=URL.revokeObjectURL.bind(URL);URL.createObjectURL=blob=>{const url=create(blob);if(blob instanceof File)state.created.push(url);return url};URL.revokeObjectURL=url=>{state.revoked.push(url);revoke(url)}});
 await source(page);const preview=await page.locator('aside img[src^="blob:"]').getAttribute('src');
 const before=await page.evaluate(()=>(window as any).__urlsV79.created.length);
 for(const width of ['356','400','512','800','356'])await page.getByLabel('Width px',{exact:true}).fill(width);
 expect(await page.locator('aside img[src^="blob:"]').getAttribute('src')).toBe(preview);
 expect(await page.evaluate(()=>(window as any).__urlsV79.created.length)).toBe(before);
 await page.getByRole('button',{name:'Clear',exact:true}).click();
 await expect.poll(()=>page.evaluate(()=>(window as any).__urlsV79.revoked)).toContain(preview);
});
test('no enlargement stretch exports real source-sized pixels inside the target canvas',async({page})=>{
 await source(page);await page.getByRole('button',{name:'Free',exact:true}).click();
 await page.getByLabel('Width px',{exact:true}).fill('100');await page.getByLabel('Height px',{exact:true}).fill('100');
 await page.getByRole('button',{name:/^Stretch/}).click();await page.getByLabel('Allow enlargement',{exact:true}).uncheck();await page.locator('select').filter({has:page.locator('option[value="image/png"]')}).selectOption('image/png');
 await page.getByRole('button',{name:/^Process 1 image/}).click();
 await expect(page.getByText('Processed 1 image(s) at 100×100.',{exact:true})).toBeVisible();
 const pending=page.waitForEvent('download');await page.getByRole('button',{name:/^(Save file|Save)$/}).first().click();const download=await pending;
 const bytes=await fs.readFile((await download.path())!);
 const pixels=await page.evaluate(async base64=>{const b=await createImageBitmap(await (await fetch('data:image/png;base64,'+base64)).blob());const c=document.createElement('canvas');c.width=b.width;c.height=b.height;const x=c.getContext('2d')!;x.drawImage(b,0,0);const at=(p:number,q:number)=>Array.from(x.getImageData(p,q,1,1).data);const out={width:b.width,height:b.height,corner:at(0,0),center:at(50,50),outside:at(39,45)};b.close();return out},bytes.toString('base64'));
 expect(pixels).toEqual({width:100,height:100,corner:[0,0,0,0],center:[255,0,0,255],outside:[0,0,0,0]});
});
test('linked limits retain portrait aspect ratio and oversized output fails clearly',async({page})=>{
 await source(page);await page.getByRole('button',{name:'3:4 Portrait',exact:true}).click();await page.getByLabel('Width px',{exact:true}).fill('16384');await page.getByLabel('Width px',{exact:true}).press('Tab');
 await expect(page.getByLabel('Width px',{exact:true})).toHaveValue('12288');await expect(page.getByLabel('Height px',{exact:true})).toHaveValue('16384');
 await page.getByRole('button',{name:/^Process 1 image/}).click();await expect(page.locator('p[role="alert"]')).toContainText('Dimensions are too large or invalid');
 await expect(page.getByRole('button',{name:/^(Save file|Save)$/})).toHaveCount(0);
});
test('appending batch files keeps the selected dimensions and the first preview',async({page})=>{
 await source(page);await page.getByLabel('Width px',{exact:true}).fill('356');await page.getByLabel('Width px',{exact:true}).press('Tab');const original=await page.locator('aside img[src^="blob:"]').getAttribute('src');
 const bytes=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=40;c.height=20;return c.toDataURL('image/png').split(',')[1]});await page.locator('input[type=file]').first().setInputFiles({name:'second.png',mimeType:'image/png',buffer:Buffer.from(bytes,'base64')});
 await page.evaluate(()=>new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve()))));
 await expect(page.getByLabel('Width px',{exact:true})).toHaveValue('356');await expect(page.getByLabel('Height px',{exact:true})).toHaveValue('267');expect(await page.locator('aside img[src^="blob:"]').getAttribute('src')).toBe(original);
});
