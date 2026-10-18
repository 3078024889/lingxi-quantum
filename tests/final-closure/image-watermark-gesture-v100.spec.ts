import{test,expect}from'./export-test';
import sharp from 'sharp';
import fs from 'node:fs/promises';

test('watermark box survives a real stepped mouse drag and scroll mode preserves selection',async({page})=>{
 await page.goto('/tools/image-watermark-remover?lang=en');
 const input=page.locator('[data-tool-workbench] input[type=file]');
 await expect(input).toBeEnabled();
 const png=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=240;c.height=180;const ctx=c.getContext('2d')!;ctx.fillStyle='#ddd';ctx.fillRect(0,0,240,180);return c.toDataURL().split(',')[1]});
 await input.setInputFiles({name:'generated-gesture.png',mimeType:'image/png',buffer:Buffer.from(png,'base64')});
 await page.getByRole('button',{name:'Quick box',exact:true}).click();
 const surface=page.locator('[data-watermark-surface=box]');
 await expect(surface).toHaveAttribute('data-mode','scroll');
 await expect(surface).toHaveCSS('touch-action','auto');
 await page.getByRole('button',{name:'Select watermark',exact:true}).click();
 await expect(surface).toHaveCSS('touch-action','none');
 await surface.scrollIntoViewIfNeeded();
 const b=(await surface.boundingBox())!;
 await page.mouse.move(b.x+b.width*.1,b.y+b.height*.2);
 await page.mouse.down();
 await page.mouse.move(b.x+b.width*.9,b.y+b.height*.8,{steps:12});
 await page.mouse.up();
 const overlay=surface.locator('div').first();
 const selection=await overlay.evaluate(e=>({w:parseFloat(e.style.width),h:parseFloat(e.style.height)}));
 expect(selection.w).toBeCloseTo(80,0);expect(selection.h).toBeCloseTo(60,0);
 await page.getByRole('button',{name:'Scroll page',exact:true}).click();
 await expect(surface).toHaveCSS('touch-action','auto');
 await surface.dispatchEvent('pointerdown',{pointerId:7,button:0,clientX:b.x,clientY:b.y});
 await surface.dispatchEvent('pointermove',{pointerId:7,clientX:b.x+40,clientY:b.y+40});
 expect(await overlay.evaluate(e=>({w:parseFloat(e.style.width),h:parseFloat(e.style.height)}))).toEqual(selection);
 await page.getByRole('button',{name:'Precision brush',exact:true}).click();
 const brush=page.locator('[data-watermark-surface=brush]');
 await expect(brush).toHaveCSS('touch-action','auto');
 await page.getByRole('button',{name:'Select watermark',exact:true}).click();
 await brush.scrollIntoViewIfNeeded();
 const r=(await brush.boundingBox())!;
 await page.mouse.move(r.x+r.width*.1,r.y+r.height*.5);await page.mouse.down();
 await page.mouse.move(r.x+r.width*.9,r.y+r.height*.5,{steps:12});await page.mouse.up();
 const points=await brush.locator('polyline').getAttribute('points');
 expect(points!.split(' ').length).toBeGreaterThan(8);
});

test('actual boxed footer repair removes dense lettering without photo bleed or changing unselected pixels (payment isolated)',async({page})=>{
 const width=80,height=80,input=Buffer.alloc(width*height*4),pixel=(x:number,y:number,rgb:number[])=>input.set([...rgb,255],(y*width+x)*4);
 for(let y=0;y<height;y++)for(let x=0;x<width;x++)pixel(x,y,y<68?[20,30,40]:[255,255,255]);
 for(let y=70;y<=74;y++)for(let x=8;x<=71;x++)pixel(x,y,[70,70,70]);for(const y of [68,69])for(const x of [0,79])pixel(x,y,[90,90,90]);
 const source=await sharp(input,{raw:{width,height,channels:4}}).png().toBuffer();let metadata:unknown;
 await page.route('**/api/tools/quote**',r=>{const body=r.request().postDataJSON();metadata=body.metadata;return r.fulfill({json:{id:'isolated-footer',tool_id:'image-watermark-remover',quantity:1,unit_name:'image',amount_rmb:1,amount_usd:1,display_amount:1,display_currency:body.currency,currency:body.currency,metadata}})});
 await page.route('**/api/tools/pay/**',r=>r.request().method()==='GET'?r.fulfill({json:{paid:true,quote:{tool_id:'image-watermark-remover',quantity:1,metadata}}}):r.abort());
 await page.goto('/tools/image-watermark-remover?lang=en');await page.locator('input[type=file]').setInputFiles({name:'dense-footer.png',mimeType:'image/png',buffer:source});
 await page.getByRole('button',{name:'Quick box',exact:true}).click();await page.getByRole('button',{name:'Select watermark',exact:true}).click();const surface=page.locator('[data-watermark-surface=box]');await surface.scrollIntoViewIfNeeded();const bounds=(await surface.boundingBox())!;
 await page.mouse.move(bounds.x+.25,bounds.y+bounds.height*.85);await page.mouse.down();await page.mouse.move(bounds.x+bounds.width-.25,bounds.y+bounds.height-.25,{steps:12});await page.mouse.up();
 await page.getByRole('button',{name:'See price',exact:true}).click();await expect(page.getByRole('button',{name:'Confirm & pay',exact:true})).toBeVisible();await page.evaluate(()=>window.dispatchEvent(new Event('pageshow')));
 const save=page.getByRole('button',{name:'Save result',exact:true});await expect(save).toBeVisible();const [download]=await Promise.all([page.waitForEvent('download'),save.click()]);const bytes=await fs.readFile((await download.path())!);const output=await sharp(bytes).ensureAlpha().raw().toBuffer({resolveWithObject:true});expect([output.info.width,output.info.height]).toEqual([width,height]);
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){const i=(y*width+x)*4;expect([...output.data.subarray(i,i+4)]).toEqual(y>=68?[255,255,255,255]:[...input.subarray(i,i+4)])}
 await test.info().attach('source-footer',{body:source,contentType:'image/png'});await test.info().attach('saved-clean-footer',{body:bytes,contentType:'image/png'});
});
