import {test,expect,type Page} from './export-test';
import JSZip from 'jszip';
import {readFile} from 'node:fs/promises';
import {presentationParts,presentationText,odtParts,odtText,R} from './document-reading-fixtures';

async function archive(parts:Record<string,string>){const zip=new JSZip();for(const [name,value]of Object.entries(parts))zip.file(name,value);return zip.generateAsync({type:'nodebuffer'})}
async function upload(page:Page,parts:Record<string,string>,ext:string){await page.locator('input[type=file]').first().setInputFiles({name:'reading.'+ext,mimeType:'application/octet-stream',buffer:await archive(parts)})}
async function download(page:Page){const [file]=await Promise.all([page.waitForEvent('download'),page.getByRole('button',{name:'Save file',exact:true}).first().click()]);expect(await file.failure()).toBeNull();return readFile((await file.path())!,'utf8')}

test('PPTX download follows relationship order, preserves split runs and ignores orphan slides',async({page},info)=>{
 await page.goto('/tools/pptx-to-txt?lang=en');await upload(page,presentationParts,'pptx');await page.getByRole('button',{name:'Process now',exact:true}).click();
 const text=await download(page);expect(text).toBe(presentationText);
 await info.attach('input-reordered.pptx',{body:await archive(presentationParts),contentType:'application/vnd.openxmlformats-officedocument.presentationml.presentation'});
 await info.attach('downloaded.txt',{body:text,contentType:'text/plain'});
});
for(const issue of ['missing slide','missing relationship','external relationship','malformed XML'])test(`PPTX ${issue} blocks partial delivery and recovers after replacement`,async({page})=>{
 const broken={...presentationParts};
 if(issue==='missing slide')delete broken['ppt/slides/second slide.xml'];
 if(issue==='missing relationship')broken['ppt/presentation.xml']=broken['ppt/presentation.xml'].replace('rel:id="second"','rel:id="unknown"');
 if(issue==='external relationship')broken['ppt/_rels/presentation.xml.rels']=`<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="second" Type="${R}/slide" TargetMode="External" Target="https://example.com/slide.xml"/></Relationships>`;
 if(issue==='malformed XML')broken['ppt/presentation.xml']='<unclosed>';
 await page.goto('/tools/pptx-to-txt?lang=en');await upload(page,broken,'pptx');await page.getByRole('button',{name:'Process now',exact:true}).click();
 await expect(page.getByText('Could not finish this time',{exact:true})).toBeVisible();await expect(page.getByRole('button',{name:'Save file',exact:true})).toHaveCount(0);
 await page.getByRole('button',{name:'Remove',exact:true}).click();await upload(page,presentationParts,'pptx');await page.getByRole('button',{name:'Process now',exact:true}).click();expect(await download(page)).toBe(presentationText);
});
test('ODT actual download keeps counted spaces, tab, line break, heading and Unicode',async({page},info)=>{
 await page.goto('/tools/odt-to-txt?lang=en');await upload(page,odtParts,'odt');await page.getByRole('button',{name:'Process',exact:true}).click();const text=await download(page);expect(text).toBe(odtText);
 await info.attach('input-whitespace.odt',{body:await archive(odtParts),contentType:'application/vnd.oasis.opendocument.text'});await info.attach('downloaded.txt',{body:text,contentType:'text/plain'});
});
for(const raw of ['<unclosed>',odtParts['content.xml'].replace('txt:c="3"','txt:c="1000000000"')])test(`ODT rejects invalid content ${raw.startsWith('<unclosed>')?'XML':'space count'} without a result`,async({page})=>{
 await page.goto('/tools/odt-to-txt?lang=en');await upload(page,{...odtParts,'content.xml':raw},'odt');await page.getByRole('button',{name:'Process',exact:true}).click();await expect(page.getByRole('alert')).toContainText('Check the file format, size and integrity, then try again.');await expect(page.getByRole('alert')).not.toContainText('ODT_');await expect(page.getByRole('button',{name:'Save file',exact:true})).toHaveCount(0);
});
for(const kind of ['ics','vcf'])test(`${kind} incomplete record shows a useful error and replacement recovers`,async({page})=>{
 const broken=kind==='ics'?'BEGIN:VCALENDAR\r\nBEGIN:VEVENT\r\nSUMMARY:Unfinished\r\n':'BEGIN:VCARD\r\nVERSION:3.0\r\nFN:Unfinished\r\n';
 const valid=kind==='ics'?'BEGIN:VCALENDAR\r\nBEGIN:VEVENT\r\nSUMMARY:会议\\,测试\r\nDTSTART:20261018T010000Z\r\nEND:VEVENT\r\nEND:VCALENDAR\r\n':'BEGIN:VCARD\r\nVERSION:3.0\r\nFN:张三\\,同事\r\nTEL:+8613800000000\r\nEND:VCARD\r\n';
 await page.goto(`/tools/${kind}-to-csv?lang=en`);
 await page.locator('input[type=file]').first().setInputFiles({name:'broken.'+kind,mimeType:'text/plain',buffer:Buffer.from(broken)});await page.getByRole('button',{name:'Process',exact:true}).click();
 await expect(page.getByRole('alert')).toContainText('Check the file format, size and integrity, then try again.');await expect(page.getByRole('alert')).not.toContainText('NO_COMPLETE_CONTENT_RECORDS');await expect(page.getByRole('button',{name:'Save file',exact:true})).toHaveCount(0);
 await page.getByRole('button',{name:'Remove',exact:true}).click();await expect(page.getByRole('alert')).toHaveCount(0);
 await page.locator('input[type=file]').first().setInputFiles({name:'valid.'+kind,mimeType:'text/plain',buffer:Buffer.from(valid)});await page.getByRole('button',{name:'Process',exact:true}).click();expect(await download(page)).toContain(kind==='ics'?'会议,测试':'张三,同事');
});
