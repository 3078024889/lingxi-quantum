import {test,expect} from 'playwright/test';

test('no-enlargement preview reflects the retained source size',async({page})=>{
 await page.goto('/tools/resize-image?lang=en');const image=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=20;c.height=10;return c.toDataURL('image/png').split(',')[1]});const upload=page.locator('input[type=file]').first();await expect(upload).toBeEnabled();await upload.setInputFiles({name:'small.png',mimeType:'image/png',buffer:Buffer.from(image,'base64')});
 await expect(page.getByText('Source 20×10',{exact:true})).toBeVisible();await page.getByRole('button',{name:'Free',exact:true}).click();await page.getByLabel('Width px',{exact:true}).fill('100');await page.getByLabel('Height px',{exact:true}).fill('100');await page.getByRole('button',{name:/^Stretch/}).click();await page.getByLabel('Allow enlargement',{exact:true}).uncheck();
 const preview=page.locator('aside img[src^="blob:"]');expect(await preview.evaluate(img=>({width:(img as HTMLElement).style.width,height:(img as HTMLElement).style.height}))).toEqual({width:'20%',height:'10%'});
 await page.getByLabel('Allow enlargement',{exact:true}).check();expect(await preview.evaluate(img=>(img as HTMLElement).style.width)).toBe('');
});
