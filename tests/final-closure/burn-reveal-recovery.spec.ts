import {test,expect} from './export-test';
import {webcrypto} from 'node:crypto';

async function encrypted(){
 const key=await webcrypto.subtle.generateKey({name:'AES-GCM',length:256},true,['encrypt']);
 const raw=await webcrypto.subtle.exportKey('raw',key),iv=webcrypto.getRandomValues(new Uint8Array(12));
 const cipher=await webcrypto.subtle.encrypt({name:'AES-GCM',iv},key,new TextEncoder().encode('Private text recovered without a second view'));
 const encode=(v:ArrayBuffer|Uint8Array)=>Buffer.from(v instanceof Uint8Array?v:new Uint8Array(v)).toString('base64url');
 return {key:encode(raw),iv:encode(iv),ciphertext:encode(cipher)};
}
test('lost ACK retries one receipt after local AES decrypt; files arrive only from ACK',async({page})=>{
 const data=await encrypted();let previews=0,acks=0;const receipts:string[]=[];
 await page.route('**/api/tools/burn-after-read/consume',r=>{previews++;return r.fulfill({json:{ciphertext:data.ciphertext,iv:data.iv,has_files:true,view_duration_seconds:null}})});
 await page.route('**/api/tools/burn-after-read/ack',r=>{acks++;const body=r.request().postDataJSON();receipts.push(body.viewId);expect(body.revealToken).toBe('signed-test-token');return acks===1?r.abort('failed'):r.fulfill({json:{ok:true,access_until:new Date(Date.now()+60000).toISOString(),files:[{id:'file',name:'private.txt',size:100,type:'text/plain',url:'https://example.test/committed-file'}]}})});
 await page.goto('/tools/burn-after-read/12345678-1234-4234-8234-123456789012?lang=zh#k='+data.key+'&t=signed-test-token');
 await page.getByRole('button',{name:'打开内容',exact:true}).click();await expect(page.getByRole('alert').filter({hasText:'暂时无法打开'})).toBeVisible();
 await expect(page.getByText('private.txt',{exact:true})).toHaveCount(0);
 await page.getByRole('button',{name:'打开内容',exact:true}).click();await expect(page.getByText('Private text recovered without a second view',{exact:true})).toBeVisible();
 await expect(page.getByText('private.txt',{exact:true})).toBeVisible();expect(previews).toBe(1);expect(acks).toBe(2);expect(receipts[0]).toMatch(/^[0-9a-f-]{36}$/);expect(receipts[1]).toBe(receipts[0]);
});
test('incorrect decrypt key does not acknowledge or display file links',async({page})=>{
 const data=await encrypted();let acks=0;
 await page.route('**/api/tools/burn-after-read/consume',r=>r.fulfill({json:{ciphertext:data.ciphertext,iv:data.iv,has_files:true}}));
 await page.route('**/api/tools/burn-after-read/ack',r=>{acks++;return r.fulfill({json:{ok:true}})});
 await page.goto('/tools/burn-after-read/12345678-1234-4234-8234-123456789012?lang=zh#k='+Buffer.alloc(32).toString('base64url')+'&t=signed-test-token');
 await page.getByRole('button',{name:'打开内容',exact:true}).click();await expect(page.getByRole('alert').filter({hasText:'暂时无法打开'})).toBeVisible();expect(acks).toBe(0);await expect(page.getByText('Private text recovered without a second view',{exact:true})).toHaveCount(0);
});
