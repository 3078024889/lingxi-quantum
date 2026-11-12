"use client";
// Versioned client-side encryption format for private burn-after-read attachments.
// The URL fragment holds the secret; no key is sent to the upload or database API.
export const BURN_ENCRYPTED_MIME="application/vnd.lingxifield.burn-encrypted";
const HEADER="LXBURN2!";
const CHUNK=1024*1024, HEADER_SIZE=20, TAG_BYTES=16, IV_BYTES=12;
const encoder=new TextEncoder();
const headerBytes=encoder.encode(HEADER);

function keyBytes(part:string){
 const raw=part.replace(/-/g,"+").replace(/_/g,"/");
 if(!/^[A-Za-z0-9+/_=-]{40,50}$/.test(part))throw Error("BURN_KEY_INVALID");
 const padded=raw+"=".repeat((4-raw.length%4)%4);
 const bin=atob(padded),bytes=Uint8Array.from(bin,c=>c.charCodeAt(0));
 if(bytes.byteLength!==32)throw Error("BURN_KEY_INVALID");
 return bytes;
}
async function fileKey(part:string){
 const base=await crypto.subtle.importKey("raw",keyBytes(part),"HKDF",false,["deriveKey"]);
 return crypto.subtle.deriveKey({
  name:"HKDF",hash:"SHA-256",
  salt:encoder.encode("LINGXIFIELD-BURN-FILES-V2"),
  info:encoder.encode("private-attachment-aes-256-gcm")
 },base,{name:"AES-GCM",length:256},false,["encrypt","decrypt"]);
}
export function burnEncryptedSize(size:number){
 if(!Number.isSafeInteger(size)||size<1||size>2*1024*1024*1024)throw Error("BURN_FILE_SIZE_INVALID");
 return HEADER_SIZE+size+Math.ceil(size/CHUNK)*(IV_BYTES+TAG_BYTES);
}
function makeAad(header:Uint8Array,i:number){
 const aad=new Uint8Array(HEADER_SIZE+4);aad.set(header);
 new DataView(aad.buffer).setUint32(HEADER_SIZE,i,true);
 return aad;
}
function encodedHeader(size:number){
 const header=new Uint8Array(HEADER_SIZE);header.set(headerBytes);
 const view=new DataView(header.buffer);
 view.setUint32(8,CHUNK,true);view.setBigUint64(12,BigInt(size),true);
 return header;
}
export async function encryptBurnFile(file:File,secretPart:string):Promise<Blob>{
 const expected=burnEncryptedSize(file.size),key=await fileKey(secretPart);
 const header=encodedHeader(file.size),parts:BlobPart[]=[header];
 for(let i=0,offset=0;offset<file.size;i++,offset+=CHUNK){
  const iv=crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const input=await file.slice(offset,offset+CHUNK).arrayBuffer();
  const output=await crypto.subtle.encrypt({name:"AES-GCM",iv,additionalData:makeAad(header,i)},key,input);
  parts.push(iv,new Uint8Array(output));
 }
 const encoded=new Blob(parts,{type:"application/octet-stream"});
 if(encoded.size!==expected)throw Error("BURN_ENCRYPTION_SIZE_MISMATCH");
 return encoded;
}
export async function decryptBurnFile(cipher:Blob,secretPart:string,mime="application/octet-stream"):Promise<Blob>{
 if(cipher.size<HEADER_SIZE+IV_BYTES+TAG_BYTES+1)throw Error("BURN_ENCRYPTED_FILE_INVALID");
 const header=new Uint8Array(await cipher.slice(0,HEADER_SIZE).arrayBuffer());
 if(header.some((b,i)=>i<8&&b!==headerBytes[i]))throw Error("BURN_ENCRYPTED_FILE_INVALID");
 const view=new DataView(header.buffer);
 if(view.getUint32(8,true)!==CHUNK)throw Error("BURN_ENCRYPTED_FILE_INVALID");
 const size=Number(view.getBigUint64(12,true));
 if(!Number.isSafeInteger(size)||size<1||burnEncryptedSize(size)!==cipher.size)throw Error("BURN_ENCRYPTED_FILE_INVALID");
 const key=await fileKey(secretPart),parts:BlobPart[]=[];
 let offset=HEADER_SIZE;
 for(let i=0,done=0;done<size;i++){
  const plainSize=Math.min(CHUNK,size-done);
  const iv=new Uint8Array(await cipher.slice(offset,offset+IV_BYTES).arrayBuffer());offset+=IV_BYTES;
  const encrypted=await cipher.slice(offset,offset+plainSize+TAG_BYTES).arrayBuffer();offset+=plainSize+TAG_BYTES;
  const block=await crypto.subtle.decrypt({name:"AES-GCM",iv,additionalData:makeAad(header,i)},key,encrypted);
  if(block.byteLength!==plainSize)throw Error("BURN_DECRYPTION_SIZE_MISMATCH");
  parts.push(new Uint8Array(block));done+=plainSize;
 }
 if(offset!==cipher.size)throw Error("BURN_ENCRYPTED_FILE_INVALID");
 return new Blob(parts,{type:mime});
}
export function burnMimeFromName(name:string){
 const ext=name.split(".").pop()?.toLowerCase()||"";
 return ({
  pdf:"application/pdf",png:"image/png",jpg:"image/jpeg",jpeg:"image/jpeg",webp:"image/webp",
  gif:"image/gif",txt:"text/plain",csv:"text/csv",json:"application/json",
  mp3:"audio/mpeg",wav:"audio/wav",mp4:"video/mp4",webm:"video/webm",zip:"application/zip",
  docx:"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xlsx:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
 } as Record<string,string>)[ext]||"application/octet-stream";
}
