import {test,expect} from 'playwright/test';
import JSZip from 'jszip';
import {readFile} from 'node:fs/promises';

async function archive(files:Record<string,string>){const zip=new JSZip();for(const [name,text] of Object.entries(files))zip.file(name,text);return zip.generateAsync({type:'nodebuffer',compression:'DEFLATE'})}
const cases:{slug:string;ext:string;files:Record<string,string>;expected:string}[]=[
 {slug:'xlsx-to-csv',ext:'xlsx',files:{'xl/worksheets/sheet1.xml':'<worksheet><sheetData><row r="1"><c><v>12</v></c><c><v>34</v></c></row><row r="2"/><row r="3"><c r="A3"/><c r="B3"><v>56</v></c></row><row r="4"><c r="A4" t="inlineStr"><is><t>&#x1F30D; &amp;quot;</t></is></c></row></sheetData></worksheet>'},expected:'12,34\r\n\r\n,56\r\n🌍 &quot;'},
 {slug:'pptx-to-txt',ext:'pptx',files:{'ppt/slides/slide1.xml':'<p:sld xmlns:p="urn:p" xmlns:a="urn:a"><a:t>你好 🌍</a:t></p:sld>'},expected:'# Slide 1\n你好 🌍'},
 {slug:'odt-to-txt',ext:'odt',files:{'content.xml':'<office:document xmlns:office="urn:o" xmlns:text="urn:t"><text:p>你好 🌍</text:p><text:p>第二段</text:p></office:document>'},expected:'你好 🌍\n第二段'},
 {slug:'epub-to-txt',ext:'epub',files:{'META-INF/container.xml':'<container><rootfiles><rootfile full-path="book/package.opf"/></rootfiles></container>','book/package.opf':'<package><manifest><item id="second" href="a.html"/><item id="first" href="z.html#section"/></manifest><spine><itemref idref="first"/><itemref idref="second"/></spine></package>','book/a.html':'<html><body>第二章</body></html>','book/z.html':'<html><body><p>第一章 🌍</p><script>wrong text</script></body></html>'},expected:'第一章 🌍\n\n第二章'},
];
test('XLSX empty shared-string item preserves later indexes and downloaded values',async({page})=>{
 await page.goto('/tools/xlsx-to-csv?lang=en');await page.locator('input[type=file]').first().setInputFiles({name:'shared.xlsx',mimeType:'application/octet-stream',buffer:await archive({'xl/sharedStrings.xml':'<sst><si/><si><t>Expected</t></si></sst>','xl/worksheets/sheet1.xml':'<worksheet><row r="1"><c r="A1" t="s"><v>1</v></c></row></worksheet>'})});await page.getByRole('button',{name:'Process now',exact:true}).click();const pending=page.waitForEvent('download');await page.getByRole('button',{name:'Save file',exact:true}).first().click();const download=await pending;expect(await download.failure()).toBeNull();expect((await readFile((await download.path())!,'utf8')).replace(/^\uFEFF/,'')).toBe('Expected');
});
for(const item of cases)test(`${item.slug}: real bounded archive produces the complete downloadable text`,async({page})=>{
 await page.goto(`/tools/${item.slug}?lang=en`);
 const input=page.locator('input[type=file]').first();await expect(input).toBeEnabled({timeout:20000});await input.setInputFiles({name:'fixture.'+item.ext,mimeType:'application/octet-stream',buffer:await archive(item.files)});
 await page.getByRole('button',{name:item.ext==='epub'||item.ext==='odt'?'Process':'Process now',exact:true}).click();
 const pending=page.waitForEvent('download');await page.getByRole('button',{name:'Save file',exact:true}).first().click();const download=await pending;expect(await download.failure()).toBeNull();const output=await readFile((await download.path())!,'utf8');expect(output.replace(/^\uFEFF/,'')).toBe(item.expected);
});
test('XLSX invalid columns show an error without generating a misleading result',async({page})=>{
 await page.goto('/tools/xlsx-to-csv?lang=en');await page.locator('input[type=file]').first().setInputFiles({name:'hostile.xlsx',mimeType:'application/octet-stream',buffer:await archive({'xl/worksheets/sheet1.xml':'<worksheet><row r="1"><c r="ZZZZZZZZZZ1"><v>1</v></c></row></worksheet>'})});await page.getByRole('button',{name:'Process now',exact:true}).click();await expect(page.getByText('Could not finish this time',{exact:true})).toBeVisible();await expect(page.getByText('Check the file format, size and integrity, then try again.',{exact:true})).toBeVisible();await expect(page.getByRole('button',{name:'Save file',exact:true})).toHaveCount(0);
});
