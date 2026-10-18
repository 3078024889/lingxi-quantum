import {test,expect} from './export-test';
import {readFile} from 'node:fs/promises';

test('UUID count can be erased and replaced; TXT contains the actual generated UUIDs',async({page})=>{
 await page.goto('/tools/uuid-generator?lang=en');
 const count=page.getByRole('spinbutton',{name:'Count',exact:true});await count.fill('');await expect(count).toHaveValue('');await count.pressSequentially('356');await count.press('Tab');await expect(count).toHaveValue('356');
 await page.getByRole('button',{name:'Generate',exact:true}).click();const text=await page.getByRole('textbox',{name:'Generated identifiers',exact:true}).inputValue();const ids=text.split('\n');expect(ids).toHaveLength(356);expect(new Set(ids).size).toBe(356);for(const id of ids)expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
 const downloadPromise=page.waitForEvent('download');await page.getByRole('button',{name:'Download TXT',exact:true}).click();const download=await downloadPromise;expect(download.suggestedFilename()).toBe('lingxifield-uuid.txt');expect(await download.failure()).toBeNull();expect(await readFile((await download.path())!,'utf8')).toBe(text+'\n');
 await count.fill('3');await expect(page.getByRole('textbox',{name:'Generated identifiers',exact:true})).toHaveCount(0);await expect(page.getByRole('button',{name:'Download TXT',exact:true})).toHaveCount(0);
 await page.getByRole('button',{name:'Generate',exact:true}).click();expect((await page.getByRole('textbox',{name:'Generated identifiers',exact:true}).inputValue()).split('\n')).toHaveLength(3);
});
test('ULIDs preserve generation order in a fixed millisecond and across repeated batches',async({page})=>{
 await page.goto('/tools/uuid-generator?lang=en');await page.evaluate(()=>{Date.now=()=>1700000000000});await page.getByRole('combobox',{name:'Type',exact:true}).selectOption('ulid');await page.getByRole('spinbutton',{name:'Count',exact:true}).fill('100');
 await page.getByRole('button',{name:'Generate',exact:true}).click();const first=(await page.getByRole('textbox',{name:'Generated identifiers',exact:true}).inputValue()).split('\n');expect(first).toEqual([...first].sort());expect(new Set(first).size).toBe(100);
 await page.getByRole('button',{name:'Generate',exact:true}).click();const second=(await page.getByRole('textbox',{name:'Generated identifiers',exact:true}).inputValue()).split('\n');expect(second[0]>first.at(-1)!).toBe(true);expect(new Set([...first,...second]).size).toBe(200);
});
test('clipboard denial is visible and leaves generated identifiers available',async({page})=>{
 await page.goto('/tools/uuid-generator?lang=en');await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw new Error('denied')}}}));await page.getByRole('button',{name:'Generate',exact:true}).click();await page.getByRole('button',{name:'Copy all',exact:true}).click();await expect(page.getByRole('status')).toContainText('Clipboard access was denied');await expect(page.getByRole('textbox',{name:'Generated identifiers',exact:true})).not.toHaveValue('');await expect(page.getByRole('button',{name:'Download TXT',exact:true})).toBeEnabled();
});
