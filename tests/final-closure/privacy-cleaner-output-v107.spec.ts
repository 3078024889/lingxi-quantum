import{test,expect}from'./export-test';
import sharp from'sharp';
import{readFile}from'node:fs/promises';
import{PDFDocument}from'pdf-lib';

for(const[format,fallback]of[['webp',false],['png',false],['jpeg',false],['gif',false],['webp',true]]as const)test(`privacy cleanup saves ${format}${fallback?' with simulated PNG encoder fallback':''} with matching filename/bytes and preserves transparency where supported`,async({page})=>{
 const image=sharp({create:{width:29,height:19,channels:4,background:{r:220,g:30,b:60,alpha:0.35}}});
 const buffer=await image.toFormat(format).withExif({IFD0:{Artist:'AUDIT-AUTHOR'}}).toBuffer();
 if(fallback)await page.addInitScript(()=>{
  const original=HTMLCanvasElement.prototype.toBlob;
  HTMLCanvasElement.prototype.toBlob=function(callback,type,quality){return original.call(this,callback,type==='image/webp'?'image/png':type,quality)};
 });
 await page.goto('/tools/privacy-cleaner?lang=en');const input=page.locator('input[type=file]').first();await expect(input).toBeEnabled();
 await input.setInputFiles({name:`source.${format}`,mimeType:`image/${format}`,buffer});
 const area=page.locator('[data-tool-workbench]');await area.getByRole('button',{name:'Scan metadata',exact:true}).click();
 await expect(area).toContainText(`source.${format}`);
 await area.getByRole('button',{name:'Clean & export',exact:true}).click();
 const waiting=page.waitForEvent('download');await area.getByRole('button',{name:'Save file',exact:true}).click();
 const download=await waiting;expect(await download.failure()).toBeNull();
 const bytes=await readFile((await download.path())!),metadata=await sharp(bytes).metadata();
 const expected=fallback?'png':format==='png'||format==='webp'?format:'jpeg',ext=expected==='jpeg'?'jpg':expected;
 expect(download.suggestedFilename()).toBe(`clean-source.${ext}`);expect(metadata.format).toBe(expected);
 expect(metadata.width).toBe(29);expect(metadata.height).toBe(19);
 expect(metadata.exif).toBeUndefined();expect(metadata.xmp).toBeUndefined();expect(metadata.iptc).toBeUndefined();expect(bytes.includes(Buffer.from('AUDIT-AUTHOR'))).toBe(false);
 if(expected==='webp'||expected==='png'){
  expect(metadata.hasAlpha).toBe(true);const alpha=(await sharp(bytes).stats()).channels[3];expect(alpha.min).toBeGreaterThan(0);expect(alpha.max).toBeLessThan(255);
 }
});

test('privacy cleaner retains PDF pages while removing document author metadata',async({page})=>{
 const pdf=await PDFDocument.create();pdf.addPage([200,300]);pdf.addPage([300,400]);pdf.setAuthor('AUDIT-AUTHOR');pdf.setTitle('PRIVATE-TITLE');
 await page.goto('/tools/privacy-cleaner?lang=en');const input=page.locator('input[type=file]').first();await expect(input).toBeEnabled();
 await input.setInputFiles({name:'document.pdf',mimeType:'application/pdf',buffer:Buffer.from(await pdf.save())});
 await page.getByRole('button',{name:'Clean & export',exact:true}).click();const waiting=page.waitForEvent('download');await page.getByRole('button',{name:'Save file',exact:true}).click();
 const download=await waiting;const output=await PDFDocument.load(await readFile((await download.path())!),{updateMetadata:false});
 expect(download.suggestedFilename()).toBe('clean-document.pdf');expect(output.getPageCount()).toBe(2);expect(output.getAuthor()).toBeUndefined();expect(output.getTitle()).toBeUndefined();
});

test('corrupt image shows actionable privacy error and offers no output',async({page})=>{
 await page.goto('/tools/privacy-cleaner?lang=en');const input=page.locator('input[type=file]').first();await expect(input).toBeEnabled();
 await input.setInputFiles({name:'broken.webp',mimeType:'image/webp',buffer:Buffer.from('not an image')});
 await page.getByRole('button',{name:'Clean & export',exact:true}).click();const area=page.locator('[data-tool-workbench]');
 await expect(area.getByRole('alert')).toContainText('This file could not be processed.');await expect(area.getByRole('button',{name:'Save file',exact:true})).toHaveCount(0);
});
