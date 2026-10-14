import {test,expect} from 'playwright/test';
import fs from 'node:fs/promises';
import sharp from 'sharp';
import jsQR from 'jsqr';
const cases=[
 ['url',['https://example.com/?a=1&b=2'],'https://example.com/?a=1&b=2'],
 ['wifi',['Field Network','secret123','WPA'],'WIFI:T:WPA;S:Field Network;P:secret123;;'],
 ['vcard',['Ada','123456','ada@example.com'],'BEGIN:VCARD\nVERSION:3.0\nFN:Ada\nTEL:123456\nEMAIL:ada@example.com\nEND:VCARD'],
 ['email',['ada@example.com','Hello','Message'],'mailto:ada@example.com?subject=Hello&body=Message'],
 ['sms',['123456','Hello'],'SMSTO:123456:Hello'],
 ['tel',['123456'],'tel:123456'],
 ['geo',['27.2','112.3'],'geo:27.2,112.3'],
 ['event',['Meeting','20261014T090000','20261014T100000'],'BEGIN:VEVENT\nSUMMARY:Meeting\nDTSTART:20261014T090000\nDTEND:20261014T100000\nEND:VEVENT'],
 ['text',['Unicode 🌍 汉字'],'Unicode 🌍 汉字'],
] as const;
for(const [kind,values,payload] of cases)test(`QR ${kind}: real downloaded PNG independently decodes to its full payload`,async({page})=>{
 await page.goto('/tools/qr-code-generator?lang=en');const scope=page.locator('[data-tool-workbench]');await scope.getByRole('button',{name:kind,exact:true}).click();const fields=scope.locator('input');await expect(fields).toHaveCount(values.length);for(const [index,value]of values.entries())await fields.nth(index).fill(value);
 await scope.getByRole('button',{name:'Generate QR',exact:true}).click();await expect(scope.locator('img[alt=QR]')).toBeVisible();for(const format of ['PNG','SVG']){const waiting=page.waitForEvent('download');await scope.getByRole('button',{name:format,exact:true}).click();const file=await waiting;expect(await file.failure()).toBeNull();const {data,info}=await sharp(await fs.readFile((await file.path())!)).ensureAlpha().raw().toBuffer({resolveWithObject:true});expect(jsQR(new Uint8ClampedArray(data),info.width,info.height)?.data).toBe(payload);}
});
test('Cron single-value steps return all times and malformed steps have no successful result',async({page})=>{
 await page.goto('/tools/cron-parser?lang=en');const scope=page.locator('[data-tool-workbench]');const expression=scope.locator('input:not([type=number])');await expression.fill('0/15 * * * *');await expect(scope.locator('ol li')).toHaveCount(10);const iso=await scope.locator('ol li').evaluateAll(items=>items.map(item=>item.textContent!.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/)?.[0]));for(let i=1;i<iso.length;i++)expect(Date.parse(iso[i]!)-Date.parse(iso[i-1]!)).toBe(15*60*1000);await expression.fill('*/2/3 * * * *');await expect(scope.locator('ol')).toHaveCount(0);await expect(scope).toContainText('INVALID_FIELD_SYNTAX');
});
