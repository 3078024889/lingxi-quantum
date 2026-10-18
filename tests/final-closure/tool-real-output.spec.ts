import {test,expect,type Page} from './export-test';
import {readFile} from 'node:fs/promises';
import {PDFDocument,PDFName,PDFDict,degrees} from 'pdf-lib';

test('file-type report detects a misleading extension without claiming a downloadable file exists',async({page})=>{
 await page.goto('/tools/file-type-detector?lang=en');
 const input=page.locator('input[type=file]').first();await expect(input).toBeEnabled();
 const png=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=20;c.height=20;return c.toDataURL().split(',')[1]});
 await input.setInputFiles({name:'pretends-to-be-text.txt',mimeType:'text/plain',buffer:Buffer.from(png,'base64')});
 await page.getByRole('button',{name:'Process now',exact:true}).click();
 const result=page.locator('[data-tool-workbench]');
 await expect(result).toContainText('Detected: PNG image. The filename does not match the file type.');
 await expect(result).not.toContainText('Ready. You can save the file.');
 await expect(result.getByRole('button',{name:'Save file',exact:true})).toHaveCount(0);
});

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
 await expect(page.locator('input[type=file]').first()).toBeEnabled({timeout:15000});
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
 await expect(page.locator('input[type=file]').first()).toBeEnabled({timeout:15000});
 await page.locator('input[type=file]').first().setInputFiles(files);
 await page.getByRole('button',{name:'Process now',exact:true}).click();
 const pdf=await PDFDocument.load(await saveOutput(page));
 expect(pdf.getPages().map(p=>p.getWidth())).toEqual([123,456]);
 expect(pdf.getPages().map(p=>p.getHeight())).toEqual([200,200]);
 await page.getByRole('button',{name:'Move down',exact:true}).first().click();await expect(page.getByRole('button',{name:'Save file',exact:true})).toHaveCount(0);
 await page.getByRole('button',{name:'Process now',exact:true}).click();const reordered=await PDFDocument.load(await saveOutput(page));expect(reordered.getPages().map(p=>p.getWidth())).toEqual([456,123]);
 await page.getByRole('button',{name:'Clear',exact:true}).click();await expect(page.getByRole('button',{name:'Save file',exact:true})).toHaveCount(0);await expect(page.getByRole('button',{name:'Process now',exact:true})).toBeDisabled();
});

for(const [slug,inputType,outputType] of [['jpg-to-png','image/jpeg','image/png'],['webp-to-jpg','image/webp','image/jpeg']] as const)test(`${slug} downloads a decodable image and preserves its dimensions`,async({page})=>{
 await page.goto(`/tools/${slug}?lang=en`);
 const input=await page.evaluate(type=>{const c=document.createElement('canvas');c.width=31;c.height=17;const ctx=c.getContext('2d')!;ctx.fillStyle='#e03070';ctx.fillRect(0,0,31,17);return c.toDataURL(type).split(',')[1]},inputType);
 await expect(page.locator('input[type=file]').first()).toBeEnabled({timeout:15000});
 await page.locator('input[type=file]').first().setInputFiles({name:'sample.'+(inputType==='image/jpeg'?'jpg':'webp'),mimeType:inputType,buffer:Buffer.from(input,'base64')});
 await page.getByRole('button',{name:/^Convert ·/}).click();const output=await saveOutput(page);
 if(outputType==='image/png')expect([...output.subarray(0,8)]).toEqual([137,80,78,71,13,10,26,10]);else expect([...output.subarray(0,3)]).toEqual([255,216,255]);
 const decoded=await page.evaluate(async({type,base64})=>{const image=new Image();image.src=`data:${type};base64,${base64}`;await image.decode();const c=document.createElement('canvas');c.width=image.width;c.height=image.height;const ctx=c.getContext('2d')!;ctx.drawImage(image,0,0);return{width:image.width,height:image.height,pixel:[...ctx.getImageData(15,8,1,1).data]};},{type:outputType,base64:output.toString('base64')});
 expect(decoded.width).toBe(31);expect(decoded.height).toBe(17);expect(decoded.pixel[0]).toBeGreaterThan(200);expect(decoded.pixel[1]).toBeLessThan(80);expect(decoded.pixel[3]).toBe(255);
});

test('image to PDF preserves pixel dimensions, page aspect ratio and embeds the image',async({page})=>{
 await page.goto('/tools/image-to-pdf?lang=en');
 const png=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=37;c.height=23;const ctx=c.getContext('2d')!;ctx.fillStyle='red';ctx.fillRect(0,0,37,23);return c.toDataURL('image/png').split(',')[1]});
 await expect(page.locator('input[type=file]').first()).toBeEnabled({timeout:15000});
 await page.locator('input[type=file]').first().setInputFiles({name:'image.png',mimeType:'image/png',buffer:Buffer.from(png,'base64')});await page.getByRole('combobox',{name:'Page size',exact:true}).selectOption('fit');await page.getByRole('button',{name:/^(Create PDF|Process now)$/}).click();
 const pdf=await PDFDocument.load(await saveOutput(page));expect(pdf.getPageCount()).toBe(1);const outputPage=pdf.getPage(0);expect(outputPage.getWidth()/outputPage.getHeight()).toBeCloseTo(37/23,8);const images=outputPage.node.Resources()!.lookup(PDFName.of('XObject'),PDFDict);expect(images.keys().length).toBeGreaterThan(0);const image=pdf.context.lookup(images.values()[0]) as any;expect(image.dict.get(PDFName.of('Width')).asNumber()).toBe(37);expect(image.dict.get(PDFName.of('Height')).asNumber()).toBe(23);
});

for(const preset of ['high','balanced','small'])test('PDF compression preserves physical mixed page sizes: '+preset,async({page})=>{
 const input=await PDFDocument.create();input.addPage([180,260]);input.addPage([420,300]);input.addPage([200,320]).setRotation(degrees(90));
 await page.goto('/tools/compress-pdf?lang=en');await page.locator('[data-tool-workbench] input[type=file]').setInputFiles({name:'mixed.pdf',mimeType:'application/pdf',buffer:Buffer.from(await input.save())});
 const choices=page.locator('[data-tool-workbench]').getByRole('combobox');await expect(choices).toHaveCount(1);await choices.selectOption(preset);await page.getByRole('button',{name:'Process now',exact:true}).click();
 const doc=await PDFDocument.load(await saveOutput(page));expect(doc.getPageCount()).toBe(3);for(const [i,[w,h]] of [[180,260],[420,300],[320,200]].entries()){expect(doc.getPages()[i].getWidth()).toBeCloseTo(w,2);expect(doc.getPages()[i].getHeight()).toBeCloseTo(h,2)}
 await choices.selectOption(preset==='small'?'high':'small');await expect(page.getByRole('button',{name:'Save file',exact:true})).toHaveCount(0);
});

test('advanced PDF compression retires the previous file when quality changes',async({page})=>{
 const input=await PDFDocument.create();input.addPage([180,260]);await page.goto('/tools/pdf-compress?lang=en');await page.locator('[data-tool-workbench] input[type=file]').setInputFiles({name:'page.pdf',mimeType:'application/pdf',buffer:Buffer.from(await input.save())});
 await page.getByRole('button',{name:'Compress PDF',exact:true}).click();await expect(page.getByRole('button',{name:'Save file',exact:true})).toBeVisible();await page.getByRole('button',{name:'Strong',exact:true}).click();await expect(page.getByRole('button',{name:'Save file',exact:true})).toHaveCount(0);
});
