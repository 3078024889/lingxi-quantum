const ALPHABET="ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%*-_=+?";
/** Rejection sampling avoids modulo bias. No password is persisted or transmitted. */
export function generatePassword(length:number,random:Pick<Crypto,"getRandomValues">=globalThis.crypto){
 if(!Number.isInteger(length)||length<8||length>128)throw new RangeError("PASSWORD_LENGTH");
 const threshold=256-(256%ALPHABET.length);let result="";
 while(result.length<length){
  const bytes=random.getRandomValues(new Uint8Array(128));
  for(const byte of bytes){if(byte<threshold)result+=ALPHABET[byte%ALPHABET.length];if(result.length===length)break;}
 }
 return result;
}
