import {test,expect,type Page} from './export-test';
import sharp from 'sharp';
import fs from 'node:fs/promises';
async function save(page:Page,index=0){const wait=page.waitForEvent('download');await page.getByRole('button',{name:'Save file',exact:true}).nth(index).click();return fs.readFile((await (await wait).path())!)}
async function upload(page:Page,name:string,buffer:Buffer){const input=page.locator('[data-tool-workbench] input[type=file]').first();await expect(input).toBeEnabled();await input.setInputFiles({name,mimeType:'application/octet-stream',buffer})}
for(const kind of ['bmp','ico'])test(`${kind}-to-png decodes a real ${kind} fixture and exports actual PNG pixels`,async({page})=>{
 let buffer:Buffer;const width=32,height=24;
 if(kind==='bmp'){const stride=Math.ceil(width*3/4)*4;buffer=Buffer.alloc(54+stride*height);buffer.write('BM');buffer.writeUInt32LE(buffer.length,2);buffer.writeUInt32LE(54,10);buffer.writeUInt32LE(40,14);buffer.writeInt32LE(width,18);buffer.writeInt32LE(height,22);buffer.writeUInt16LE(1,26);buffer.writeUInt16LE(24,28);for(let y=0;y<height;y++)for(let x=0;x<width;x++)buffer[54+y*stride+x*3+2]=255}
 else{const png=await sharp({create:{width,height,channels:3,background:'red'}}).png().toBuffer();buffer=Buffer.alloc(22+png.length);buffer.writeUInt16LE(1,2);buffer.writeUInt16LE(1,4);buffer[6]=width;buffer[7]=height;buffer.writeUInt16LE(1,10);buffer.writeUInt16LE(32,12);buffer.writeUInt32LE(png.length,14);buffer.writeUInt32LE(22,18);png.copy(buffer,22)}
 await page.goto(`/tools/${kind}-to-png?lang=en`);await upload(page,`fixture.${kind}`,buffer);await page.locator('[data-tool-workbench] button:visible:enabled').filter({hasNotText:/^(Remove|Clear|Choose file)$/}).last().click();const out=await sharp(await save(page)).removeAlpha().raw().toBuffer({resolveWithObject:true});expect([out.info.width,out.info.height]).toEqual([width,height]);expect(out.data[0]).toBeGreaterThan(240);expect(out.data[1]).toBeLessThan(10);
});
test('file-type-detector recognizes real PNG magic despite a misleading extension',async({page})=>{
 await page.goto('/tools/file-type-detector?lang=en');await upload(page,'misleading.txt',await sharp({create:{width:10,height:10,channels:3,background:'red'}}).png().toBuffer());await page.locator('[data-tool-workbench] button:visible:enabled').filter({hasNotText:/^(Remove|Clear|Choose file)$/}).last().click();await expect(page.locator('[data-tool-workbench]')).toContainText('PNG');await expect(page.locator('[data-tool-workbench]')).toContainText('does not match');
});
test('text-diff reports changed lines and retains unchanged Unicode text',async({page})=>{
 await page.goto('/tools/text-diff?lang=en');const area=page.locator('[data-tool-workbench]');await area.locator('textarea').nth(0).fill('相同\nold');await area.locator('textarea').nth(1).fill('相同\nnew');await area.getByRole('button',{name:'Run',exact:true}).click();await expect(area.locator('textarea[readonly]')).toHaveValue('  相同\n- old\n+ new');
});
test('subtitle-tools downloads SRT VTT and TXT with shifted timing and Unicode text',async({page})=>{
 await page.goto('/tools/subtitle-tools?lang=en');const area=page.locator('[data-tool-workbench]');await area.locator('textarea').fill('1\n00:00:01,000 --> 00:00:02,000\nHello 世界\n');await area.getByRole('spinbutton',{name:'Global shift (ms)',exact:true}).fill('500');await area.getByRole('button',{name:/Create SRT/}).click();await expect(page.getByRole('button',{name:'Save file',exact:true})).toHaveCount(3);const outputs=[];for(let n=0;n<3;n++)outputs.push((await save(page,n)).toString('utf8'));expect(outputs.some(t=>t.includes('00:00:01,500 --> 00:00:02,500'))).toBe(true);expect(outputs.some(t=>t.includes('00:00:01.500 --> 00:00:02.500'))).toBe(true);expect(outputs.every(t=>t.includes('Hello 世界'))).toBe(true);
});
test('timestamp-converter gives the same actual ISO time for all four integer units',async({page})=>{
 await page.goto('/tools/timestamp-converter?lang=en');const area=page.locator('[data-tool-workbench]'),input=area.locator('input').first();for(const [unit,value]of [['s','1'],['ms','1000'],['us','1000000'],['ns','1000000000']]){await area.getByRole('combobox').first().selectOption(unit);await input.fill(value);await expect(area).toContainText('1970-01-01T00:00:01.000Z')}
});

test('subtitle timing edits invalidate old files and rounded timestamps carry into the next minute',async({page})=>{
 await page.goto('/tools/subtitle-tools?lang=en');const area=page.locator('[data-tool-workbench]');
 await area.locator('textarea').fill('1\n00:00:59,999 --> 00:01:01,000\nHello 世界\n');
 const run=area.getByRole('button',{name:/Create SRT/});await run.click();await expect(page.getByRole('button',{name:'Save file',exact:true})).toHaveCount(3);
 const numbers=area.locator('input[type=number]');
 for(const [index,value] of [[0,'500'],[1,'1.00001'],[2,'24'],[3,'25']] as const){await numbers.nth(index).fill(value);await expect(page.getByRole('button',{name:'Save file',exact:true})).toHaveCount(0);await run.click();await expect(page.getByRole('button',{name:'Save file',exact:true})).toHaveCount(3)}
 await area.locator('input[type=checkbox]').uncheck();await expect(page.getByRole('button',{name:'Save file',exact:true})).toHaveCount(0);
 await numbers.nth(0).fill('0');await numbers.nth(2).fill('0');await numbers.nth(3).fill('0');await run.click();
 expect((await save(page,0)).toString('utf8')).toContain('00:01:00,000 --> 00:01:01,001');
 expect((await save(page,1)).toString('utf8')).toContain('00:01:00.000 --> 00:01:01.001');
});
