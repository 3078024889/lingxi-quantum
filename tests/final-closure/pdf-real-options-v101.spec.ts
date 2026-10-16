import{test,expect}from'./export-test';
import{PDFDocument}from'pdf-lib';
import{readFile}from'node:fs/promises';
import{PDFName,PDFString,PDFDict}from'pdf-lib';

for(const[slug,button]of[['pdf-page-numbers','Add PDF page numbers'],['pdf-crop','Crop PDF']]as const)test(`${slug}: changing a numeric option removes the old export`,async({page})=>{
 const source=await PDFDocument.create();source.addPage([400,600]);
 await page.goto(`/tools/${slug}?lang=en`);const input=page.locator('input[type=file]').first();await expect(input).toBeEnabled();
 await input.setInputFiles({name:'options.pdf',mimeType:'application/pdf',buffer:Buffer.from(await source.save())});
 const area=page.locator('[data-tool-workbench]');await area.getByRole('button',{name:button,exact:true}).click();
 await expect(area.getByRole('button',{name:'Save file',exact:true})).toBeVisible();await area.getByRole('spinbutton').fill('40');
 await expect(area.getByRole('button',{name:'Save file',exact:true})).toHaveCount(0);
 await area.getByRole('button',{name:button,exact:true}).click();const pending=page.waitForEvent('download');await area.getByRole('button',{name:'Save file',exact:true}).click();
 const output=await PDFDocument.load(await readFile((await(await pending).path())!));expect(output.getPageCount()).toBe(1);
 if(slug==='pdf-crop')expect(output.getPage(0).getCropBox()).toMatchObject({x:40,y:40,width:320,height:520});
});

test('PDF watermark text, size and opacity changes each invalidate the old export',async({page})=>{
 const source=await PDFDocument.create();source.addPage();await page.goto('/tools/pdf-watermark?lang=en');const input=page.locator('input[type=file]').first();await expect(input).toBeEnabled();
 await input.setInputFiles({name:'watermark.pdf',mimeType:'application/pdf',buffer:Buffer.from(await source.save())});const area=page.locator('[data-tool-workbench]');
 for(const[field,value]of[['input:not([type])','NEW WATERMARK'],['input[type=number]','30'],['input[type=range]','0.5']]){
  await area.getByRole('button',{name:'Add PDF watermark',exact:true}).click();await expect(area.getByRole('button',{name:'Save file',exact:true})).toBeVisible();
  await area.locator(field).fill(value);await expect(area.getByRole('button',{name:'Save file',exact:true})).toHaveCount(0);
 }
});

test('flattened form keeps appearances and valid links without dangling annotation references',async({page})=>{
 const doc=await PDFDocument.create(),p=doc.addPage(),field=doc.getForm().createTextField('name');field.setText('AUDIT CUSTOMER');field.addToPage(p,{x:20,y:400,width:200,height:30});
 const link=doc.context.register(doc.context.obj({Type:'Annot',Subtype:'Link',Rect:[0,0,100,20],A:{Type:'Action',S:'URI',URI:PDFString.of('https://example.com')}}));p.node.Annots()!.push(link);
 await page.goto('/tools/pdf-flatten?lang=en');const input=page.locator('input[type=file]').first();await expect(input).toBeEnabled();await input.setInputFiles({name:'form.pdf',mimeType:'application/pdf',buffer:Buffer.from(await doc.save())});
 await page.getByRole('button',{name:'Flatten PDF',exact:true}).click();const pending=page.waitForEvent('download');await page.getByRole('button',{name:'Save file',exact:true}).click();
 const output=await PDFDocument.load(await readFile((await(await pending).path())!));expect(output.getForm().getFields()).toHaveLength(0);const annotations=output.getPage(0).node.Annots()!;expect(annotations.size()).toBe(1);
 expect(output.context.lookup(annotations.get(0),PDFDict).get(PDFName.of('Subtype'))!.toString()).toBe('/Link');
});

test('PDF basic rejects partially invalid ranges without delivering a silently reduced file',async({page})=>{
 const pdf=await PDFDocument.create();pdf.addPage();pdf.addPage();
 await page.goto('/tools/pdf-merge-split?lang=en');
 const input=page.locator('input[type=file]').first();await expect(input).toBeEnabled();
 await input.setInputFiles({name:'pages.pdf',mimeType:'application/pdf',buffer:Buffer.from(await pdf.save())});
 for(const range of ['1,bad','1-2.5','1-9','0,1']){
  await page.getByPlaceholder('1-3,5,8-10').fill(range);
  await page.getByRole('button',{name:'Extract pages',exact:true}).click();
  await expect(page.locator('[data-tool-workbench]').getByRole('alert')).toContainText('Enter valid pages');
  await expect(page.getByRole('button',{name:'Save file',exact:true})).toHaveCount(0);
 }
});

test('legacy image-to-PDF preserves language and exposes only the canonical entry',async({page})=>{
 await page.goto('/tools/image-to-pdf-pro?lang=ar');
 await expect(page).toHaveURL(/\/tools\/image-to-pdf\?lang=ar$/);
 await expect(page.locator('html')).toHaveAttribute('data-lang','ar');
 await expect(page.locator('html')).toHaveAttribute('dir','rtl');
 await page.goto('/tools?lang=en');
 await expect(page.locator('a[href="/tools/image-to-pdf"]')).toHaveCount(1);
 await expect(page.locator('a[href="/tools/image-to-pdf-pro"]')).toHaveCount(0);
});

for(const[size,w,h]of [['a4',841.89,595.28],['letter',792,612]]as const)test(`image PDF ${size} landscape retains source pixels and selected paper dimensions`,async({page})=>{
 await page.goto('/tools/image-to-pdf?lang=en');
 const input=page.locator('input[type=file]').first();await expect(input).toBeEnabled();
 const b64=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=37;c.height=23;return c.toDataURL().split(',')[1]});
 await input.setInputFiles({name:'own-fixture.png',mimeType:'image/png',buffer:Buffer.from(b64,'base64')});
 await page.getByRole('combobox',{name:'Page size',exact:true}).selectOption(size);
 await page.getByRole('combobox',{name:'Orientation',exact:true}).selectOption('landscape');
 await page.getByRole('combobox',{name:'Margin',exact:true}).selectOption('big');
 await page.getByRole('button',{name:'Create PDF',exact:true}).click();
 const pending=page.waitForEvent('download');await page.getByRole('button',{name:'Save file',exact:true}).click();
 const saved=await pending;expect(await saved.failure()).toBeNull();
 const doc=await PDFDocument.load(await readFile((await saved.path())!));
 expect(doc.getPageCount()).toBe(1);expect(doc.getPage(0).getWidth()).toBeCloseTo(w,2);expect(doc.getPage(0).getHeight()).toBeCloseTo(h,2);
 await expect(page.locator('main')).not.toContainText('pageSize');
 await page.getByRole('combobox',{name:'Margin',exact:true}).selectOption('small');
 await expect(page.getByRole('button',{name:'Save file',exact:true})).toHaveCount(0);
});

test('PDF page edits invalidate the previous download and preserve reordered source pages',async({page})=>{
 const source=await PDFDocument.create();source.addPage([111,300]);source.addPage([222,300]);
 await page.goto('/tools/pdf-pages?lang=en');const input=page.locator('input[type=file]').first();await expect(input).toBeEnabled();
 await input.setInputFiles({name:'different-pages.pdf',mimeType:'application/pdf',buffer:Buffer.from(await source.save())});
 await page.getByRole('button',{name:'Move down',exact:true}).first().click();
 await page.getByRole('button',{name:'Rotate page',exact:true}).first().click();
 await page.getByRole('button',{name:'Preview',exact:true}).click();
 const pending=page.waitForEvent('download');await page.getByRole('button',{name:'Save file',exact:true}).click();
 const saved=await pending;const pdf=await PDFDocument.load(await readFile((await saved.path())!));
 expect(pdf.getPages().map(p=>p.getWidth())).toEqual([222,111]);
 expect(pdf.getPages().map(p=>p.getRotation().angle)).toEqual([90,0]);
 await page.getByRole('button',{name:'Move up',exact:true}).last().click();
 await expect(page.getByRole('button',{name:'Save file',exact:true})).toHaveCount(0);
 await page.getByRole('button',{name:'Preview',exact:true}).click();
 await expect(page.getByRole('button',{name:'Save file',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Clear pages',exact:true}).click();
 await expect(page.getByRole('button',{name:'Save file',exact:true})).toHaveCount(0);
 await expect(page.getByRole('button',{name:'Preview',exact:true})).toBeDisabled();
});
