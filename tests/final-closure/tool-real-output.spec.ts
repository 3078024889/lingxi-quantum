import {test,expect,type Page} from 'playwright/test';
import {readFile} from 'node:fs/promises';
import {PDFDocument,PDFName,PDFDict} from 'pdf-lib';

for(const [slug,input,expected] of [
 ['remove-duplicate-lines','first\r\nsecond\r\nfirst','first\nsecond'],
 ['remove-empty-lines','first\n  \nsecond\n','first\nsecond'],
 ['base64-encode-decode','汉字 🌍',Buffer.from('汉字 🌍').toString('base64')],
 ['url-encode-decode','汉字 & 🌍',encodeURIComponent('汉字 & 🌍')],
])test(`${slug} processes real Unicode input and preserves the source`,async({page})=>{
 await page.goto(`/tools/${slug}?lang=en`);
 await page.getByRole('textbox',{name:'Input text',exact:true}).fill(input);
 await page.getByRole('button',{name:'Start processing',exact:true}).click();
 await expect(page.getByRole('textbox',{name:'Result',exact:true})).toHaveValue(expected);
 await expect(page.getByRole('textbox',{name:'Input text',exact:true})).toHaveValue(input.replace(/\r\n/g,'\n'));
 if(slug.endsWith('encode-decode')){
  await page.getByRole('combobox',{name:'Direction'}).selectOption('decode');
  await page.getByRole('textbox',{name:'Input text',exact:true}).fill(expected);
  await page.getByRole('button',{name:'Start processing',exact:true}).click();
  await expect(page.getByRole('textbox',{name:'Result',exact:true})).toHaveValue(input);
 }
});

async function saveOutput(page:Page){
 const pending=page.waitForEvent('download');
 await page.getByRole('button',{name:'Save file',exact:true}).first().click();
 const download=await pending;expect(await download.failure()).toBeNull();
 const path=await download.path();expect(path).toBeTruthy();return readFile(path!);
}

test('PNG to JPG produces a downloadable image with dimensions and white transparency',async({page})=>{
 await page.goto('/tools/png-to-jpg?lang=en');
 const png=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=16;c.height=12;return c.toDataURL('image/png').split(',')[1]});
 await page.locator('input[type=file]').first().setInputFiles({name:'transparent.png',mimeType:'image/png',buffer:Buffer.from(png,'base64')});
 await page.getByRole('button',{name:/^Convert ·/}).click();
 const output=await saveOutput(page);expect([...output.subarray(0,3)]).toEqual([255,216,255]);
 const pixels=await page.evaluate(async base64=>{const image=new Image();image.src='data:image/jpeg;base64,'+base64;await image.decode();const c=document.createElement('canvas');c.width=image.width;c.height=image.height;const ctx=c.getContext('2d')!;ctx.drawImage(image,0,0);return {width:image.width,height:image.height,pixel:[...ctx.getImageData(8,6,1,1).data]};},output.toString('base64'));
 expect(pixels).toEqual({width:16,height:12,pixel:[255,255,255,255]});
});

test('PDF merge downloads both pages in input order with original page boxes',async({page})=>{
 const files=[];
 for(const width of [123,456]){const pdf=await PDFDocument.create();pdf.addPage([width,200]);files.push({name:`${width}.pdf`,mimeType:'application/pdf',buffer:Buffer.from(await pdf.save())})}
 await page.goto('/tools/merge-pdf?lang=en');
 await page.locator('input[type=file]').first().setInputFiles(files);
 await page.getByRole('button',{name:'Process now',exact:true}).click();
 const pdf=await PDFDocument.load(await saveOutput(page));
 expect(pdf.getPages().map(p=>p.getWidth())).toEqual([123,456]);
 expect(pdf.getPages().map(p=>p.getHeight())).toEqual([200,200]);
});

for(const [slug,inputType,outputType] of [['jpg-to-png','image/jpeg','image/png'],['webp-to-jpg','image/webp','image/jpeg']] as const)test(`${slug} downloads a decodable image and preserves its dimensions`,async({page})=>{
 await page.goto(`/tools/${slug}?lang=en`);
 const input=await page.evaluate(type=>{const c=document.createElement('canvas');c.width=31;c.height=17;const ctx=c.getContext('2d')!;ctx.fillStyle='#e03070';ctx.fillRect(0,0,31,17);return c.toDataURL(type).split(',')[1]},inputType);
 await page.locator('input[type=file]').first().setInputFiles({name:'sample.'+(inputType==='image/jpeg'?'jpg':'webp'),mimeType:inputType,buffer:Buffer.from(input,'base64')});
 await page.getByRole('button',{name:/^Convert ·/}).click();const output=await saveOutput(page);
 if(outputType==='image/png')expect([...output.subarray(0,8)]).toEqual([137,80,78,71,13,10,26,10]);else expect([...output.subarray(0,3)]).toEqual([255,216,255]);
 const decoded=await page.evaluate(async({type,base64})=>{const image=new Image();image.src=`data:${type};base64,${base64}`;await image.decode();const c=document.createElement('canvas');c.width=image.width;c.height=image.height;const ctx=c.getContext('2d')!;ctx.drawImage(image,0,0);return{width:image.width,height:image.height,pixel:[...ctx.getImageData(15,8,1,1).data]};},{type:outputType,base64:output.toString('base64')});
 expect(decoded.width).toBe(31);expect(decoded.height).toBe(17);expect(decoded.pixel[0]).toBeGreaterThan(200);expect(decoded.pixel[1]).toBeLessThan(80);expect(decoded.pixel[3]).toBe(255);
});

test('image to PDF preserves pixel dimensions, page aspect ratio and embeds the image',async({page})=>{
 await page.goto('/tools/image-to-pdf?lang=en');
 const png=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=37;c.height=23;const ctx=c.getContext('2d')!;ctx.fillStyle='red';ctx.fillRect(0,0,37,23);return c.toDataURL('image/png').split(',')[1]});
 await page.locator('input[type=file]').first().setInputFiles({name:'image.png',mimeType:'image/png',buffer:Buffer.from(png,'base64')});await page.getByRole('button',{name:'Process now',exact:true}).click();
 const pdf=await PDFDocument.load(await saveOutput(page));expect(pdf.getPageCount()).toBe(1);const outputPage=pdf.getPage(0);expect(outputPage.getWidth()/outputPage.getHeight()).toBeCloseTo(37/23,8);const images=outputPage.node.Resources()!.lookup(PDFName.of('XObject'),PDFDict);expect(images.keys().length).toBeGreaterThan(0);const image=pdf.context.lookup(images.values()[0]) as any;expect(image.dict.get(PDFName.of('Width')).asNumber()).toBe(37);expect(image.dict.get(PDFName.of('Height')).asNumber()).toBe(23);
});
