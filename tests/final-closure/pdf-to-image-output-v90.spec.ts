import {test,expect} from './export-test';
import {PDFDocument,rgb} from 'pdf-lib';
import JSZip from 'jszip';
import sharp from 'sharp';
import fs from 'node:fs/promises';
test('pdf-to-jpg actual JPG PNG ZIP exports preserve selected page dimensions at every scale',async({page})=>{
 test.setTimeout(90000);const d=await PDFDocument.create();d.addPage([200,300]).drawRectangle({x:0,y:0,width:200,height:300,color:rgb(1,0,0)});d.addPage([300,200]).drawRectangle({x:0,y:0,width:300,height:200,color:rgb(0,0,1)});await page.goto('/tools/pdf-to-jpg?lang=en');await page.locator('input[type=file]').setInputFiles({name:'pages.pdf',mimeType:'application/pdf',buffer:Buffer.from(await d.save())});await expect(page.getByRole('button',{name:'Convert',exact:true})).toBeEnabled();await page.getByLabel('Pages',{exact:true}).fill('2');
 for(const format of ['jpeg','png'])for(const scale of ['1','1.5','2','3']){await page.getByRole('combobox',{name:/^Format/}).selectOption(format);await page.getByRole('combobox',{name:/^Scale/}).selectOption(scale);await page.getByRole('spinbutton',{name:'JPG',exact:true}).fill(format==='jpeg'&&scale==='1'?'0.4':'1');const waiting=page.waitForEvent('download');await page.getByRole('button',{name:'Convert',exact:true}).click();const zip=await JSZip.loadAsync(await fs.readFile((await (await waiting).path())!)),names=Object.keys(zip.files).filter(name=>!zip.files[name].dir);expect(names).toEqual([`page-002.${format==='jpeg'?'jpg':'png'}`]);const image=await sharp(await zip.file(names[0])!.async('nodebuffer')).removeAlpha().raw().toBuffer({resolveWithObject:true});expect([image.info.width,image.info.height]).toEqual([300*Number(scale),200*Number(scale)]);expect(image.data[2]).toBeGreaterThan(240);expect(image.data[0]).toBeLessThan(10)}
 await page.getByLabel('Pages',{exact:true}).fill('invalid');await page.getByRole('button',{name:'Convert',exact:true}).click();await expect(page.locator('[data-tool-workbench]').getByRole('alert')).toContainText('INVALID_RANGE');await page.getByLabel('Pages',{exact:true}).fill('1-2');const waiting=page.waitForEvent('download');await page.getByRole('button',{name:'Convert',exact:true}).click();const zip=await JSZip.loadAsync(await fs.readFile((await (await waiting).path())!));expect(Object.keys(zip.files).filter(name=>!zip.files[name].dir)).toHaveLength(2);
});

test('pdf-to-jpg invalidates old downloadable ZIP after any export setting changes',async({page})=>{
 test.setTimeout(90000);
 const doc=await PDFDocument.create();
 doc.addPage([100,120]).drawRectangle({x:0,y:0,width:100,height:120,color:rgb(1,0,0)});
 await page.goto('/tools/pdf-to-jpg?lang=en');
 await page.locator('input[type=file]').setInputFiles({name:'source.pdf',mimeType:'application/pdf',buffer:Buffer.from(await doc.save())});
 const convert=page.getByRole('button',{name:'Convert',exact:true});
 await expect(convert).toBeEnabled({timeout:30000});
 async function finish(){
  const pending=page.waitForEvent('download');
  await convert.click();
  const download=await pending;
  expect(await download.failure()).toBeNull();
  const archive=await JSZip.loadAsync(await fs.readFile((await download.path())!));
  expect(Object.keys(archive.files).filter(name=>!archive.files[name].dir)).toHaveLength(1);
  await expect(page.getByTestId('result-file-actions')).toHaveCount(1);
 }
 await finish();
 await page.getByLabel('Pages',{exact:true}).fill('1');
 await expect(page.getByTestId('result-file-actions')).toHaveCount(0);
 await finish();
 await page.getByRole('combobox',{name:/^Format/}).selectOption('png');
 await expect(page.getByTestId('result-file-actions')).toHaveCount(0);
 await finish();
 await page.getByRole('combobox',{name:/^Scale/}).selectOption('2');
 await expect(page.getByTestId('result-file-actions')).toHaveCount(0);
 await finish();
 await page.getByRole('spinbutton',{name:'JPG',exact:true}).fill('0.6');
 await expect(page.getByTestId('result-file-actions')).toHaveCount(0);
});
