import {test,expect} from "./export-test";
import {webcrypto} from "node:crypto";
import fs from "node:fs/promises";

const enc=new TextEncoder(),type="application/vnd.lingxifield.burn-encrypted";
async function makeFixture(corrupt=false){
 const secret=webcrypto.getRandomValues(new Uint8Array(32)),keyB64=Buffer.from(secret).toString("base64url");
 const noteKey=await webcrypto.subtle.importKey("raw",secret,{name:"AES-GCM"},false,["encrypt"]);
 const noteIv=webcrypto.getRandomValues(new Uint8Array(12)),notePlain=enc.encode("An encrypted note with a private file.");
 const noteCipher=await webcrypto.subtle.encrypt({name:"AES-GCM",iv:noteIv},noteKey,notePlain);
 const master=await webcrypto.subtle.importKey("raw",secret,"HKDF",false,["deriveKey"]);
 const fileKey=await webcrypto.subtle.deriveKey({name:"HKDF",hash:"SHA-256",salt:enc.encode("LINGXIFIELD-BURN-FILES-V2"),info:enc.encode("private-attachment-aes-256-gcm")},master,{name:"AES-GCM",length:256},false,["encrypt"]);
 const plain=enc.encode("CONFIDENTIAL-FILE-ONLY-FOR-THIS-RECIPIENT");
 const head=Buffer.alloc(20);head.write("LXBURN2!",0);head.writeUInt32LE(1024*1024,8);head.writeBigUInt64LE(BigInt(plain.length),12);
 const aad=new Uint8Array(24);aad.set(head);
 const iv=webcrypto.getRandomValues(new Uint8Array(12));
 const body=Buffer.from(await webcrypto.subtle.encrypt({name:"AES-GCM",iv,additionalData:aad},fileKey,plain));
 if(corrupt)body[5]^=2;
 const cipher=Buffer.concat([head,Buffer.from(iv),body]);
 return{keyB64,noteIv:Buffer.from(noteIv).toString("base64url"),noteCipher:Buffer.from(noteCipher).toString("base64url"),plain,cipher};
}
for(const corrupt of [false,true]){
 test("burn-after-read: "+(corrupt?"tampered encrypted R2 attachment never downloads":"signed link decrypts real ciphertext in browser only, downloads the original user file"),async({page})=>{
  const fixture=await makeFixture(corrupt),id="12345678-1234-4234-8234-123456789012";
  let gets=0,downloadAttempts=0;page.on("download",()=>downloadAttempts++);
  await page.route("**/api/tools/burn-after-read/consume",r=>r.fulfill({json:{ciphertext:fixture.noteCipher,iv:fixture.noteIv,has_files:true,view_duration_seconds:null}}));
  await page.route("**/api/tools/burn-after-read/ack",r=>r.fulfill({json:{ok:true,access_until:new Date(Date.now()+60000).toISOString(),files:[{id:"secret-file",name:"private.txt",size:fixture.cipher.byteLength,type,url:"https://mock-r2.test/file"}]}}));
  await page.route("https://mock-r2.test/file",r=>{gets++;return r.fulfill({status:200,body:fixture.cipher,headers:{"access-control-allow-origin":"*","content-type":"application/octet-stream"}})});
  await page.goto("/tools/burn-after-read/"+id+"?lang=en#k="+fixture.keyB64+"&t=valid-test-token");
  await page.getByRole("button",{name:"Open content",exact:true}).click();
  await expect(page.getByText("An encrypted note with a private file.",{exact:true})).toBeVisible();
  const item=page.getByRole("button",{name:/private\.txt/});
  await expect(item).toBeVisible();
  if(!corrupt){
   const pending=page.waitForEvent("download");
   await item.click();
   const dl=await pending;
   expect(dl.suggestedFilename()).toBe("private.txt");
   expect(await dl.failure()).toBeNull();
   const actual=await fs.readFile((await dl.path())!);
   expect(actual).toEqual(Buffer.from(fixture.plain));
   expect(actual).not.toEqual(fixture.cipher);
  }else{
   await item.click();
   await expect(page.locator('main [role="alert"]').filter({hasText:/Unable to open|Try again|无法打开/}).last()).toBeVisible({timeout:15000});
   // Authenticated decryption failed: browser must not receive a downloaded file.
   expect(downloadAttempts).toBe(0);
  }
  expect(gets).toBe(1);
 });
}
