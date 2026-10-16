import {test,expect,type Page} from './export-test';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {PDFDocument,StandardFonts,PDFName,PDFDict,PDFArray,PDFRawStream,decodePDFRawStream} from 'pdf-lib';
import JSZip from 'jszip';
import ExcelJS from 'exceljs';
import sharp from 'sharp';

async function upload(page:Page,name:string,buffer:Buffer,index=0){
 const types:Record<string,string>={png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',jfif:'image/jpeg',avif:'image/avif',gif:'image/gif',pdf:'application/pdf',csv:'text/csv',ics:'text/calendar',vcf:'text/vcard'};
 const field=page.locator('input[type=file]').nth(index);await expect(field).toBeEnabled();await field.setInputFiles({name,mimeType:types[name.split('.').pop()!]||'application/octet-stream',buffer});
}
async function download(page:Page){const waiting=page.waitForEvent('download');await page.getByRole('button',{name:'Save file',exact:true}).first().click();const file=await waiting;expect(await file.failure()).toBeNull();return readFile((await file.path())!);}
async function pdf(){const doc=await PDFDocument.create();doc.setTitle('Private title');doc.setAuthor('Private author');const font=await doc.embedFont(StandardFonts.Helvetica);for(let i=0;i<3;i++){const page=doc.addPage([400+i*10,500]);page.drawText('Original page '+(i+1),{x:40,y:250,font,size:16});}return Buffer.from(await doc.save());}
async function zip(files:Record<string,string>){const z=new JSZip();for(const [name,value]of Object.entries(files))z.file(name,value);return z.generateAsync({type:'nodebuffer'});}

test('pdf-crop: real page boxes preserve content dimensions and excessive crop returns no result',async({page})=>{
 await page.goto('/tools/pdf-crop?lang=en');await upload(page,'source.pdf',await pdf());const field=page.locator('input[type=number]').first();await field.fill('25');await page.getByRole('button',{name:'Crop PDF',exact:true}).click();const doc=await PDFDocument.load(await download(page));expect(doc.getPages().map(p=>p.getCropBox())).toEqual([350,360,370].map(width=>({x:25,y:25,width,height:450})));expect(doc.getPages().map(p=>p.getWidth())).toEqual([400,410,420]);await field.fill('250');await page.getByRole('button',{name:'Crop PDF',exact:true}).click();await expect(page.locator('[data-tool-workbench]').getByRole('alert')).toHaveText('Crop margin must be less than half of each page’s width and height.');await expect(page.getByRole('button',{name:'Save file',exact:true})).toHaveCount(0);
});
for(const unsupported of [false,true])test(`pdf-flatten: ${unsupported?'missing unsupported appearance is an explicit failure':'real form becomes non-editable with its original appearance retained'}`,async({page})=>{
 const source=await PDFDocument.create(),p=source.addPage([400,500]),field=source.getForm().createTextField('name');field.addToPage(p,{x:40,y:100,width:200,height:30});field.setText(unsupported?'内部资料':'Original field value');if(unsupported)field.acroField.getWidgets()[0].dict.delete(PDFName.of('AP'));const bytes=await source.save({updateFieldAppearances:!unsupported});await page.goto('/tools/pdf-flatten?lang=en');await upload(page,'form.pdf',Buffer.from(bytes));await page.getByRole('button',{name:'Flatten PDF',exact:true}).click();if(unsupported){await expect(page.locator('[data-tool-workbench]').getByRole('alert')).toContainText('WinAnsi cannot encode');await expect(page.getByRole('button',{name:'Save file',exact:true})).toHaveCount(0);return;}const result=await PDFDocument.load(await download(page));expect(result.getForm().getFields()).toHaveLength(0);const appearances=result.getPage(0).node.Resources()!.lookup(PDFName.of('XObject'),PDFDict);const text=appearances.keys().map(key=>Buffer.from(decodePDFRawStream(appearances.lookup(key) as PDFRawStream).decode()).toString('latin1')).join('');expect(text.toLowerCase()).toContain(Buffer.from('Original field value').toString('hex'));
});

test('csv-to-xlsx: quoted fields, Unicode, empty cells and large integer spelling survive the downloaded workbook',async({page})=>{
 await page.goto('/tools/csv-to-xlsx?lang=en');await upload(page,'table.csv',Buffer.from('name,value,note\r\n汉字,9007199254740993,"a,b"\r\nblank,,"say ""hello"""'));
 await page.getByRole('button',{name:'Process now',exact:true}).click();const wb=new ExcelJS.Workbook();await wb.xlsx.load(await download(page) as any);const sheet=wb.worksheets[0];expect(sheet.getCell('A2').value).toBe('汉字');expect(String(sheet.getCell('B2').value)).toBe('9007199254740993');expect(sheet.getCell('C2').value).toBe('a,b');expect(sheet.getCell('C3').value).toBe('say "hello"');expect(sheet.getCell('B3').value??'').toBe('');
});
test('docx-to-txt: actual ZIP paragraphs and numeric Unicode references are downloadable',async({page})=>{
 await page.goto('/tools/docx-to-txt?lang=en');await upload(page,'sample.docx',await zip({'word/document.xml':'<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>汉字 &#x1F30D;</w:t></w:r></w:p><w:p><w:r><w:t>Second</w:t></w:r></w:p></w:body></w:document>'}));await page.getByRole('button',{name:'Process now',exact:true}).click();expect((await download(page)).toString()).toBe('汉字 🌍\nSecond');
});
test('md5-sha256: both actual hashes match the independent Node implementation',async({page})=>{
 const input=Buffer.from('汉字 🌍\n');await page.goto('/tools/md5-sha256?lang=en');await upload(page,'hash.txt',input);await page.getByRole('button',{name:'Process now',exact:true}).click();for(const algorithm of ['md5','sha256'])await expect(page.getByText(createHash(algorithm).update(input).digest('hex'),{exact:true})).toBeVisible();
});
for(const same of [true,false])test(`file-compare: actual byte comparison ${same?'identical':'different'} files`,async({page})=>{
 await page.goto('/tools/file-compare?lang=en');await page.locator('input[type=file]').first().setInputFiles([{name:'a.txt',mimeType:'text/plain',buffer:Buffer.from('abc')},{name:'b.txt',mimeType:'text/plain',buffer:Buffer.from(same?'abc':'abd')}]);await page.getByRole('button',{name:'Process now',exact:true}).click();await expect(page.getByText(same?'The two files are identical.':'The two files differ.',{exact:true})).toBeVisible();
});
for(const size of [20,50,100,200,500])test(`compress-image-to-${size}kb: output really decodes and meets the target`,async({page})=>{
 await page.goto(`/tools/compress-image-to-${size}kb?lang=en`);await upload(page,'photo.png',await sharp({create:{width:600,height:400,channels:3,background:'#cc2266'}}).png().toBuffer());await page.getByRole('button',{name:'Process now',exact:true}).click();const output=await download(page);expect(output.length).toBeLessThanOrEqual(size*1024);const info=await sharp(output).metadata();expect(info.width).toBeGreaterThan(0);expect(info.height).toBeGreaterThan(0);
});
for(const [slug,extension,format]of [['avif-to-jpg','avif','avif'],['jfif-to-jpg','jfif','jpeg'],['gif-to-jpg','gif','gif']] as const)test(`${slug}: real source format and three selectable export formats`,async({page})=>{
 test.setTimeout(60000);await page.goto(`/tools/${slug}?lang=en`);const source=await sharp({create:{width:19,height:13,channels:4,background:'#e0206080'}}).toFormat(format).toBuffer();await upload(page,'source.'+extension,source);
 for(const mime of ['image/jpeg','image/png','image/webp']){await page.locator('select').filter({has:page.locator('option[value="image/jpeg"]')}).selectOption(mime);await page.getByRole('button',{name:'Convert',exact:true}).click();const output=await download(page);const info=await sharp(output).metadata();expect(info.width).toBe(19);expect(info.height).toBe(13);expect(info.format).toBe(mime==='image/jpeg'?'jpeg':mime.slice(6));}
});
for(const [slug,button]of [['pdf-flatten','Flatten PDF'],['pdf-to-text','PDF to text'],['pdf-to-markdown','PDF to Markdown']] as const)test(`${slug}: downloadable result preserves original pages or text`,async({page})=>{
 await page.goto(`/tools/${slug}?lang=en`);await upload(page,'source.pdf',await pdf());await page.getByRole('button',{name:button,exact:true}).click();const output=await download(page);if(slug==='pdf-flatten')expect((await PDFDocument.load(output)).getPageCount()).toBe(3);else for(let i=1;i<=3;i++)expect(output.toString()).toContain('Original page '+i);
});
for(const [slug,label]of [['pdf-watermark','Watermark text'],['pdf-header-footer','Header text'],['pdf-bates-numbering','Number prefix']] as const)test(`${slug}: Chinese and emoji annotation produces a real PDF without destroying its original content`,async({page})=>{
 await page.goto(`/tools/${slug}?lang=en`);await upload(page,'source.pdf',await pdf());await page.getByRole('textbox',{name:label,exact:true}).fill('内部资料 🌍');await page.getByRole('button',{name:slug==='pdf-watermark'?'Add PDF watermark':'Process',exact:true}).click();const output=await download(page);const doc=await PDFDocument.load(output);expect(doc.getPageCount()).toBe(3);expect(doc.getPages().map(p=>p.getWidth())).toEqual([400,410,420]);for(const [index,p] of doc.getPages().entries()){const contents=p.node.Contents();const streams=contents instanceof PDFArray?contents.asArray().map(ref=>doc.context.lookup(ref)):[contents];const original=streams.filter((stream):stream is PDFRawStream=>stream instanceof PDFRawStream).map(stream=>Buffer.from(decodePDFRawStream(stream).decode()).toString('latin1')).join('');expect(original.toLowerCase()).toContain(Buffer.from('Original page '+(index+1)).toString('hex'));const x=p.node.Resources()?.lookupMaybe(PDFName.of('XObject'),PDFDict);expect(x?.keys().length??0).toBeGreaterThan(0);}
});
test('pdf-pages-per-sheet: all four paper-layout choices produce the correct page count',async({page})=>{
 test.setTimeout(60000);await page.goto('/tools/pdf-pages-per-sheet?lang=en');await upload(page,'source.pdf',await pdf());for(const n of [2,4,6,9]){await page.locator('select').filter({has:page.locator('option[value="9"]')}).selectOption(String(n));await page.getByRole('button',{name:'Process',exact:true}).click();expect((await PDFDocument.load(await download(page))).getPageCount()).toBe(Math.ceil(3/n));}
});
test('pdf-remove-metadata: author/title are removed while original page boxes remain',async({page})=>{
 await page.goto('/tools/pdf-remove-metadata?lang=en');await upload(page,'source.pdf',await pdf());await page.getByRole('button',{name:'Process',exact:true}).click();const doc=await PDFDocument.load(await download(page));expect(doc.getAuthor()??'').toBe('');expect(doc.getTitle()??'').toBe('');expect(doc.getPages().map(p=>p.getWidth())).toEqual([400,410,420]);
});
for(const [slug,extension,source,expected]of [
 ['ics-to-csv','ics','BEGIN:VCALENDAR\r\nVERSION:2.0\r\nBEGIN:VEVENT\r\nSUMMARY:Team\\, review\r\nDTSTART;TZID=Asia/Shanghai:20261014T100000\r\nDESCRIPTION:Line 1\\nLine 2\r\n with folded text\r\nBEGIN:VALARM\r\nDESCRIPTION:Alarm text\r\nEND:VALARM\r\nEND:VEVENT\r\nEND:VCALENDAR',['Team, review','Line 1\nLine 2with folded text']],
 ['vcf-to-csv','vcf','BEGIN:VCARD\r\nVERSION:3.0\r\nFN:张三\\, Jr\r\nORG:Company\\; A;Research\r\nitem1.EMAIL:a@example.com\r\nTEL;TYPE=HOME:123\r\nTEL;TYPE=CELL:456\r\nEND:VCARD',['张三, Jr','Company; A / Research','a@example.com','123 | 456']],
] as const)test(`${slug}: folded, escaped, grouped and nested properties preserve their actual values`,async({page})=>{
 await page.goto(`/tools/${slug}?lang=en`);await upload(page,'source.'+extension,Buffer.from(source));await page.getByRole('button',{name:'Process',exact:true}).click();const text=(await download(page)).toString();for(const value of expected)expect(text).toContain('"'+value+'"');if(extension==='ics')expect(text).not.toContain('Alarm text');
});
