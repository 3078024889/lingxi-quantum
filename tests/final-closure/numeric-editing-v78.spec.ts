import {test, expect} from './export-test';
import fs from 'node:fs/promises';
import {PDFDocument} from 'pdf-lib';

for(const [slug,count] of [['batch-image',2],['number-base-converter',2],['cron-parser',1],['long-image',2],['uuid-generator',1],['pdf-watermark',1],['pdf-page-numbers',1],['pdf-crop',1],['pdf-bates-numbering',2],['subtitle-tools',4],['loop-video',1],['video-toolkit',1],['compress-image',2],['pdf-to-jpg',1],['temp-mail',1]] as const){
 test(`${slug}: every numeric field accepts deletion and replacement`,async({page})=>{
  test.setTimeout(90000);
  await page.goto('/tools/'+slug+'?lang=en',{waitUntil:'domcontentloaded'});
  const inputs=page.locator('input[type=number]');
  await expect(inputs).toHaveCount(count);
  for(let i=0;i<count;i++){
   const input=inputs.nth(i);
   const bounds=await input.evaluate((e:HTMLInputElement)=>({min:e.min,max:e.max}));
   const min=bounds.min?Number(bounds.min):0,max=bounds.max?Number(bounds.max):10000;
   const replacement=max<=1?'0.75':String(Math.min(max,Math.max(min,356)));
   await input.fill('');await expect(input).toHaveValue('');
   await input.pressSequentially(replacement);await expect(input).toHaveValue(replacement);
   await input.press('Tab');await expect(input).toHaveValue(replacement);
  }
 });
}

test('food portions and nutrition-label numbers accept empty and replacement drafts',async({page})=>{
 test.setTimeout(90000);
 await page.goto('/tools/food-calorie?lang=en',{waitUntil:'domcontentloaded'});
 await page.locator('section nav.grid button').nth(2).click();
 await page.getByText(/^(按包装营养表添加|Add from nutrition label)$/).click();
 const fields=page.locator('input[inputmode=decimal]');
 await expect(fields).toHaveCount(5);
 for(let i=0;i<5;i++){
  await fields.nth(i).fill('1');await fields.nth(i).fill('');await expect(fields.nth(i)).toHaveValue('');
  await fields.nth(i).pressSequentially('35.6');await fields.nth(i).press('Tab');await expect(fields.nth(i)).toHaveValue('35.6');
 }
});

for(const slug of ['pdf-editor','e-sign-pdf','pdf-redact'])test(`${slug}: uploaded-document page and overlay inputs remain editable`,async({page})=>{
 test.setTimeout(120000);
 const pdf=await PDFDocument.create();pdf.addPage([200,280]);pdf.addPage([200,280]);
 await page.goto('/tools/'+slug+'?lang=en',{waitUntil:'domcontentloaded'});
 await expect(page.locator('input[type=file]').first()).toBeEnabled({timeout:30000});
 await page.locator('input[type=file]').first().setInputFiles({name:'two-pages.pdf',mimeType:'application/pdf',buffer:Buffer.from(await pdf.save())});
 const pageNumber=slug==='pdf-redact'?page.locator('input[type=number]').first():page.getByTestId('pdf-page-number-input');
 await expect(pageNumber).toBeVisible({timeout:45000});
 await pageNumber.fill('');await expect(pageNumber).toHaveValue('');
 await pageNumber.pressSequentially('2');await pageNumber.press('Tab');await expect(pageNumber).toHaveValue('2');
 if(slug==='pdf-redact')return;
 const png=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=32;c.height=24;c.getContext('2d')!.fillRect(0,0,32,24);return c.toDataURL('image/png').split(',')[1]});
 await expect(page.locator('input[type=file][accept="image/*"]').first()).toBeEnabled({timeout:15000});
 await page.locator('input[type=file][accept="image/*"]').first().setInputFiles({name:'overlay.png',mimeType:'image/png',buffer:Buffer.from(png,'base64')});
 const fields=page.locator('input[type=number]');await expect(fields).toHaveCount(5);
 for(let i=0;i<5;i++){await fields.nth(i).fill('');await expect(fields.nth(i)).toHaveValue('');await fields.nth(i).pressSequentially('10');await fields.nth(i).press('Tab');await expect(fields.nth(i)).toHaveValue('10');}
});

test('video trim start, duration and FPS accept empty intermediate values',async({page})=>{
 await page.goto('/tools/video-toolkit',{waitUntil:'domcontentloaded'});
 await page.getByRole('button',{name:/^(截取|Trim)$/}).click();
 const fields=page.locator('input[type=number]');await expect(fields).toHaveCount(3);
 for(let i=0;i<3;i++){await fields.nth(i).fill('');await expect(fields.nth(i)).toHaveValue('');await fields.nth(i).pressSequentially('12');await fields.nth(i).press('Tab');await expect(fields.nth(i)).toHaveValue('12');}
});

test('image dimensions can be erased and replaced without a forced leading one', async ({page}) => {
  await page.goto('/tools/resize-image?lang=en');
  const png = await page.evaluate(() => {
    const canvas = document.createElement('canvas'); canvas.width=32; canvas.height=24;
    canvas.getContext('2d')!.fillRect(0,0,32,24);
    return canvas.toDataURL('image/png').split(',')[1];
  });
  await expect(page.locator('input[type=file]').first()).toBeEnabled({timeout:15000});
 await page.locator('input[type=file]').first().setInputFiles({name:'source.png',mimeType:'image/png',buffer:Buffer.from(png,'base64')});
  const fields=page.locator('input[type=number]');
  await expect(fields).toHaveCount(2);
  await fields.first().fill('1');
  await fields.first().fill('');
  await expect(fields.first()).toHaveValue('');
  await fields.first().pressSequentially('356');
  await expect(fields.first()).toHaveValue('356');
  await fields.first().press('Tab');
  await expect(fields.first()).toHaveValue('356');
  await fields.nth(1).fill('');
  await expect(fields.nth(1)).toHaveValue('');
  await fields.nth(1).pressSequentially('267');
  await fields.nth(1).press('Tab');
  await expect(fields.nth(1)).toHaveValue('267');
  await page.getByRole('button',{name:/^(处理 1 张图片|Process 1 image)/}).click();
  await expect(page.getByText(/(已按 356×267|Processed 1 image\(s\) at 356×267)/)).toBeVisible();
  const result=page.locator('dl').filter({has:page.locator('dt',{hasText:'width'})});
  await expect(result.locator('dd').filter({hasText:/^356$/})).toHaveCount(1);
  const downloadPromise=page.waitForEvent('download');
  await page.getByRole('button',{name:/^(保存文件|保存|Save file|Save)$/}).first().click();
  const download=await downloadPromise;
  const output=await fs.readFile((await download.path())!);
  const dimensions=await page.evaluate(async base64=>{
    const response=await fetch('data:image/jpeg;base64,'+base64);
    const bitmap=await createImageBitmap(await response.blob());
    const result={width:bitmap.width,height:bitmap.height};bitmap.close();return result;
  },output.toString('base64'));
  expect(dimensions).toEqual({width:356,height:267});
});
