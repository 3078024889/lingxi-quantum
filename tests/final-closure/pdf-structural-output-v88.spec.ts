import {test,expect,type Page} from 'playwright/test';
import {PDFDocument,PDFName,PDFDict,PDFRawStream,rgb} from 'pdf-lib';
import fs from 'node:fs/promises';
import sharp from 'sharp';
async function source(){const d=await PDFDocument.create();for(let i=0;i<2;i++){const p=d.addPage([400,300]);p.drawRectangle({x:10,y:10,width:60,height:40,color:rgb(1,.2,.1)});p.drawText('Original page '+(i+1),{x:40,y:180,size:20})}return Buffer.from(await d.save())}
async function upload(page:Page,slug:string,buffer:Buffer){await page.goto(`/tools/${slug}?lang=en`);const input=page.locator('input[type=file]').first();await expect(input).toBeEnabled();await input.setInputFiles({name:'source.pdf',mimeType:'application/pdf',buffer})}
async function download(page:Page){const button=page.getByRole('button',{name:'Save file',exact:true}).first();await expect(button).toBeVisible({timeout:15000});const pending=page.waitForEvent('download');await button.click();return fs.readFile((await (await pending).path())!)}
test('pdf-rasterize: every resolution preserves the physical page size',async({page})=>{
 await upload(page,'pdf-rasterize',await source());const control=page.locator('[data-tool-workbench] select');
 for(const scale of ['1','1.5','2']){await control.selectOption(scale);await page.getByRole('button',{name:'Process',exact:true}).click();const pdf=await PDFDocument.load(await download(page));expect(pdf.getPages().map(p=>p.getSize())).toEqual([{width:400,height:300},{width:400,height:300}]);}
});
for(const name of ['proof.txt','input.pdf'])test(`pdf-attachments: add, inspect and remove ${name} without losing the result`,async({page})=>{
 test.setTimeout(90000);await upload(page,'pdf-attachments',await source());await page.getByRole('button',{name:'Inspect PDF',exact:true}).click();
 await page.getByLabel('Choose a file to attach',{exact:true}).setInputFiles({name,mimeType:'text/plain',buffer:Buffer.from('Attachment payload 123')});await page.getByRole('button',{name:'Add attachment',exact:true}).click();
 await expect(page.getByRole('button',{name:'Save file',exact:true})).toBeVisible({timeout:15000});const added=await download(page);const pdf=await PDFDocument.load(added);expect(pdf.getPageCount()).toBe(2);expect(pdf.catalog.has(PDFName.of('Names'))).toBe(true);
 await page.getByLabel('Attachment key to remove',{exact:true}).fill(name);await page.getByRole('button',{name:'Remove attachment',exact:true}).click();const removed=await PDFDocument.load(await download(page));const names=removed.catalog.lookupMaybe(PDFName.of('Names'),PDFDict);const embedded=names?.lookupMaybe(PDFName.of('EmbeddedFiles'),PDFDict);expect(embedded?.toString()||'').not.toContain(name);
});
test('pdf-page-size: all four paper sizes are applied to every page',async({page})=>{
 await upload(page,'pdf-page-size',await source());const sizes={A4:[595.28,841.89],A3:[841.89,1190.55],Letter:[612,792],Legal:[612,1008]};
 for(const [name,[width,height]]of Object.entries(sizes)){await page.locator('[data-tool-workbench] select').selectOption(name);await page.getByRole('button',{name:'Process',exact:true}).click();const doc=await PDFDocument.load(await download(page));for(const p of doc.getPages()){expect(p.getWidth()).toBeCloseTo(width,0);expect(p.getHeight()).toBeCloseTo(height,0)}}
});
test('pdf-remove-annotations: real annotation dictionaries disappear and page contents remain',async({page})=>{
 const d=await PDFDocument.load(await source());d.getPage(0).node.set(PDFName.of('Annots'),d.context.obj([d.context.register(d.context.obj({Type:'Annot',Subtype:'Text',Rect:[10,10,30,30],Contents:'Private note'}))]));
 await upload(page,'pdf-remove-annotations',Buffer.from(await d.save()));await page.getByRole('button',{name:'Process',exact:true}).click();const out=await PDFDocument.load(await download(page));expect(out.getPageCount()).toBe(2);for(const p of out.getPages()){expect(p.node.has(PDFName.of('Annots'))).toBe(false);expect(p.node.Contents()).toBeTruthy()}
});
test('pdf-grayscale: downloaded image streams really have equal RGB channels',async({page})=>{
 await upload(page,'pdf-grayscale',await source());await page.getByRole('button',{name:'Process',exact:true}).click();const d=await PDFDocument.load(await download(page));expect(d.getPageCount()).toBe(2);let count=0;
 for(const [,object]of d.context.enumerateIndirectObjects()){if(object instanceof PDFRawStream&&object.dict.get(PDFName.of('Subtype'))===PDFName.of('Image')){const stats=await sharp(Buffer.from(object.contents)).stats();for(const channel of stats.channels.slice(1,3))expect(channel.mean).toBeCloseTo(stats.channels[0].mean,1);count++}}expect(count).toBe(2);
});
test('pdf-viewer-preferences: every layout/open-mode and all toggles survive readback',async({page})=>{
 await upload(page,'pdf-viewer-preferences',await source());const area=page.locator('[data-tool-workbench]'),selects=area.locator('select');
 for(let index=0;index<await selects.count();index++){
  const select=selects.nth(index),values=await select.locator('option').evaluateAll(rows=>rows.map(row=>(row as HTMLOptionElement).value));
  for(const value of values){await select.selectOption(value);await page.getByRole('button',{name:'Process',exact:true}).click();const d=await PDFDocument.load(await download(page));expect(d.catalog.get(PDFName.of(index===0?'PageLayout':'PageMode'))?.toString()).toBe('/'+value)}
 }
 const toggles=area.locator('input[type=checkbox]');for(let i=0;i<await toggles.count();i++)await toggles.nth(i).setChecked(i>=2);
 await page.getByRole('button',{name:'Process',exact:true}).click();const d=await PDFDocument.load(await download(page));const prefs=d.catalog.lookup(PDFName.of('ViewerPreferences'),PDFDict);expect(prefs.get(PDFName.of('HideToolbar'))?.toString()).toBe('true');expect(prefs.get(PDFName.of('Direction'))?.toString()).toBe('/R2L');
});
test('pdf-web-optimize: qpdf produces a real linearized PDF with unchanged page dimensions',async({page})=>{
 test.setTimeout(90000);await upload(page,'pdf-web-optimize',await source());await page.getByRole('button',{name:'Process',exact:true}).click();const bytes=await download(page);expect(bytes.subarray(0,1024).toString('latin1')).toContain('/Linearized');expect((await PDFDocument.load(bytes)).getPageCount()).toBe(2);
});
test('failed qpdf initialization releases its worker and a subsequent click retries successfully',async({page})=>{
 await page.addInitScript(()=>{const Native=window.Worker;(window as any).__qpdfWorkers=[];window.Worker=class extends Native{record:{url:string;active:boolean};constructor(url:string|URL,options?:WorkerOptions){super(url,options);this.record={url:String(url),active:true};(window as any).__qpdfWorkers.push(this.record)}terminate(){this.record.active=false;super.terminate()}}});
 await page.route('**/media/qpdf-*/qpdf.js',route=>route.fulfill({status:404,body:'missing'}));await upload(page,'pdf-web-optimize',await source());await page.getByRole('button',{name:'Process',exact:true}).click();await expect(page.locator('main').getByRole('alert')).toContainText('could not be processed');expect(await page.evaluate(()=>(window as any).__qpdfWorkers.filter((row:any)=>row.url.includes('/media/qpdf-')&&row.active).length)).toBe(0);
 await page.unroute('**/media/qpdf-*/qpdf.js');await page.getByRole('button',{name:'Process',exact:true}).click();expect((await download(page)).subarray(0,1024).toString('latin1')).toContain('/Linearized');
});
test('pdf-protect / pdf-unlock: actual encrypted output rejects reading and the correct password restores every page',async({page})=>{
 test.setTimeout(90000);await upload(page,'pdf-protect',await source());await page.getByLabel('Open password',{exact:true}).fill('Test-Strong-123');await page.getByLabel('Confirm open password',{exact:true}).fill('Test-Strong-123');await page.getByRole('button',{name:'Process',exact:true}).click();const protectedBytes=await download(page);await expect(PDFDocument.load(protectedBytes)).rejects.toThrow();
 await upload(page,'pdf-unlock',protectedBytes);await page.getByLabel('Current password',{exact:true}).fill('Test-Strong-123');await page.getByRole('button',{name:'Process',exact:true}).click();const opened=await PDFDocument.load(await download(page));expect(opened.getPageCount()).toBe(2);expect(opened.isEncrypted).toBe(false);
});
for(const slug of ['pdf-inspect','pdf-bookmarks'])test(`${slug}: real page count, Unicode attachments and nested bookmark destinations`,async({page})=>{
 const d=await PDFDocument.load(await source());await d.attach(new Uint8Array([1,2,3]),'notes.txt');await d.flush();const dest=d.context.obj([d.getPage(1).ref,PDFName.of('Fit')]);const chapter=d.context.obj({Title:'Chapter two',Dest:dest});
 // Titles are PDF text strings rather than PDF names.
 const {PDFString}=await import('pdf-lib');chapter.set(PDFName.of('Title'),PDFString.of('Chapter two'));d.catalog.set(PDFName.of('Outlines'),d.context.obj({First:d.context.register(chapter)}));
 await page.route('**/media/qpdf-*/**',route=>route.abort());await upload(page,slug,Buffer.from(await d.save()));await page.getByRole('button',{name:'Inspect PDF',exact:true}).click();
 const area=page.locator('[data-tool-workbench]');if(slug==='pdf-bookmarks'){await expect(area).toContainText('Chapter two');await expect(area).toContainText('· 2')}else{await expect(area).toContainText('Pages');await expect(area.getByText('2',{exact:true})).toBeVisible();await expect(area.getByText('1',{exact:true})).toHaveCount(2)}
});
test('pdf-permissions: selected restrictions are encoded in the real encryption dictionary',async({page})=>{
 test.setTimeout(90000);await upload(page,'pdf-permissions',await source());await page.getByLabel(/^Owner password/).fill('owner-test');
 for(const print of ['none','low','full'])for(const modify of ['none','form','annotate','assembly','all']){
  await page.getByRole('combobox',{name:'Allow printing',exact:true}).selectOption(print);await page.getByRole('combobox',{name:'Allow changes',exact:true}).selectOption(modify);const copying=modify==='all';await page.getByLabel('Allow copying text and images',{exact:true}).setChecked(copying);await page.getByRole('button',{name:'Process',exact:true}).click();const d=await PDFDocument.load(await download(page),{ignoreEncryption:true});const encryption=d.context.lookup(d.context.trailerInfo.Encrypt,PDFDict);const permissions=Number(encryption.get(PDFName.of('P'))?.toString());expect(Boolean(permissions&4)).toBe(print!=='none');expect(Boolean(permissions&2048)).toBe(print==='full');expect(Boolean(permissions&8)).toBe(modify==='all');expect(Boolean(permissions&16)).toBe(copying);
 }
});
