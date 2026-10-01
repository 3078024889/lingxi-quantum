function bytesToUtf8(binary:string){try{const bytes=Uint8Array.from(binary,c=>c.charCodeAt(0));return new TextDecoder("utf-8").decode(bytes)}catch{return binary}}
function b64(s:string){try{return bytesToUtf8(atob(s.replace(/\s/g,"")))}catch{return s}}
function qp(s:string){try{const bin=s.replace(/=\r?\n/g,"").replace(/=([0-9A-F]{2})/gi,(_,h)=>String.fromCharCode(parseInt(h,16)));return bytesToUtf8(bin)}catch{return s}}
export function decodeMailHeader(v:string){return String(v||"").replace(/=\?([^?]+)\?([bq])\?([^?]+)\?=/gi,(_,cs,enc,data)=>{try{return String(enc).toLowerCase()==="b"?b64(data):qp(String(data).replace(/_/g," "))}catch{return data}})}
function stripHtml(s:string){return s.replace(/<style[\s\S]*?<\/style>/gi," ").replace(/<script[\s\S]*?<\/script>/gi," ").replace(/<br\s*\/?>/gi,"\n").replace(/<\/p>/gi,"\n").replace(/<[^>]+>/g," ").replace(/&nbsp;/gi," ").replace(/&amp;/gi,"&").replace(/&lt;/gi,"<").replace(/&gt;/gi,">").replace(/&#39;/g,"'").replace(/&quot;/gi,'"').replace(/[ \t]+\n/g,"\n").replace(/\n{3,}/g,"\n\n").trim()}
export function normalizeStoredMail(subject:string,text:string){
 const cleanSubject=decodeMailHeader(subject).trim()||"(无主题)",raw=String(text||"");
 const boundary=(raw.match(/boundary="?([^"\r\n;]+)"?/i)||[])[1];let best="";
 for(const part of (boundary?raw.split("--"+boundary):[raw])){const split=part.search(/\r?\n\r?\n/);if(split<0)continue;const head=part.slice(0,split),body=part.slice(split).replace(/^\r?\n\r?\n/,"").replace(/\r?\n--$/,"").trim();const type=(head.match(/content-type:\s*([^;\r\n]+)/i)||[])[1]?.toLowerCase()||"",enc=(head.match(/content-transfer-encoding:\s*([^\r\n]+)/i)||[])[1]?.trim().toLowerCase()||"";const decoded=enc==="base64"?b64(body):enc==="quoted-printable"?qp(body):body;if(type==="text/plain"){best=decoded.trim();break}if(!best&&type==="text/html")best=stripHtml(decoded)}
 if(!best&&!/content-(?:type|transfer-encoding):/i.test(raw))best=raw.trim();
 return{subject:cleanSubject,text:best}
}
