import{test,expect}from'./export-test';
const payloads:Record<string,string>={
 url:'https://lingxifield.com/?audit=20261017&lang=en',wifi:'WIFI:T:WPA;S:FieldAudit;P:local-test-123;;',
 vcard:'BEGIN:VCARD\nVERSION:3.0\nFN:Audit Example\nTEL:123456\nEMAIL:audit@example.com\nEND:VCARD',
 email:'mailto:audit@example.com?subject=%E9%AA%8C%E6%94%B6&body=%E5%85%AC%E5%BC%80%E6%A0%B7%E6%9C%AC',sms:'SMSTO:123456:Audit',tel:'tel:123456',geo:'geo:27.2,112.3',
 event:'BEGIN:VEVENT\nSUMMARY:Audit Meeting\nDTSTART:20261017T090000\nDTEND:20261017T100000\nEND:VEVENT',text:'公开验收 🌍 Unicode',
};
for(const[kind,payload]of Object.entries(payloads))for(const format of['svg','png']as const)test(`QR reader ${kind} ${format} returns the complete encoded content`,async({page})=>{
 const QR=(await import('qrcode')).default,options={width:1024,margin:2,errorCorrectionLevel:'M'as const};
 const buffer=format==='svg'?Buffer.from(await QR.toString(payload,{...options,type:'svg'})):await QR.toBuffer(payload,options);
 await page.goto('/tools/qr-code-reader?lang=en');const area=page.locator('[data-tool-workbench]'),input=area.locator('input[type=file]');await expect(input).toBeEnabled();
 await input.setInputFiles({name:`${kind}.${format}`,mimeType:format==='svg'?'image/svg+xml':'image/png',buffer});await area.getByRole('button',{name:'Process now',exact:true}).click();
 await expect(area.locator('dd').first()).toHaveText(payload);await expect(area).not.toContainText('Ready. You can save the file.');await expect(area.getByRole('button',{name:'Save file',exact:true})).toHaveCount(0);
});

test('QR reader rejects a malformed SVG and clears the previous recognized content',async({page})=>{
 const QR=(await import('qrcode')).default;await page.goto('/tools/qr-code-reader?lang=en');const area=page.locator('[data-tool-workbench]'),input=area.locator('input[type=file]');await expect(input).toBeEnabled();
 await input.setInputFiles({name:'valid.svg',mimeType:'image/svg+xml',buffer:Buffer.from(await QR.toString('VALID PREVIOUS CONTENT',{type:'svg',width:1024}))});await area.getByRole('button',{name:'Process now',exact:true}).click();await expect(area.locator('dd').first()).toHaveText('VALID PREVIOUS CONTENT');
 await input.setInputFiles({name:'broken.svg',mimeType:'image/svg+xml',buffer:Buffer.from('<svg invalid')});await expect(area.locator('dd')).toHaveCount(0);await area.getByRole('button',{name:'Process now',exact:true}).click();await expect(area).toContainText('Could not finish this time');await expect(area.locator('dd')).toHaveCount(0);
});
