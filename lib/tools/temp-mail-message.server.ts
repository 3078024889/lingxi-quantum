import "server-only";
function decodeBase64(s:string){try{return Buffer.from(s.replace(/\s/g,""),"base64").toString("utf8")}catch{return s}}
function decodeQp(s:string){try{return Buffer.from(s.replace(/=\r?\n/g,"").replace(/=([0-9A-F]{2})/gi,(_,h)=>String.fromCharCode(parseInt(h,16))),"binary").toString("utf8")}catch{return s}}
export function decodeMimeHeader(v:string){return String(v||"").replace(/=\?([^?]+)\?([bq])\?([^?]+)\?=/gi,(_,cs,enc,data)=>{try{if(String(enc).toLowerCase()==="b")return Buffer.from(data,"base64").toString("utf8");const raw=String(data).replace(/_/g," ").replace(/=([0-9A-F]{2})/gi,(_:string,h:string)=>String.fromCharCode(parseInt(h,16)));return Buffer.from(raw,"binary").toString("utf8")}catch{return data}})}
function stripHtml(s:string){return s.replace(/<style[\s\S]*?<\/style>/gi," ").replace(/<script[\s\S]*?<\/script>/gi," ").replace(/<br\s*\/?>/gi,"\n").replace(/<\/p>/gi,"\n").replace(/<[^>]+>/g," ").replace(/&nbsp;/gi," ").replace(/&amp;/gi,"&").replace(/&lt;/gi,"<").replace(/&gt;/gi,">").replace(/&#39;/g,"'").replace(/&quot;/gi,'"').replace(/[ \t]+\n/g,"\n").replace(/\n{3,}/g,"\n\n").trim()}
export function normalizeInboundMessage(subject:string,text:string){
 const cleanSubject=decodeMimeHeader(subject).trim()||"(无主题)",raw=String(text||"");
 const boundary=(raw.match(/boundary="?([^"\r\n;]+)"?/i)||[])[1];let best="";
 for(const part of (boundary?raw.split("--"+boundary):[raw])){const split=part.search(/\r?\n\r?\n/);if(split<0)continue;const head=part.slice(0,split),body=part.slice(split).replace(/^\r?\n\r?\n/,"").replace(/\r?\n--$/,"").trim();const type=(head.match(/content-type:\s*([^;\r\n]+)/i)||[])[1]?.toLowerCase()||"",enc=(head.match(/content-transfer-encoding:\s*([^\r\n]+)/i)||[])[1]?.trim().toLowerCase()||"";let decoded=enc==="base64"?decodeBase64(body):enc==="quoted-printable"?decodeQp(body):body;if(type==="text/plain"){best=decoded.trim();break}if(!best&&type==="text/html")best=stripHtml(decoded)}
 if(!best&&!/content-(?:type|transfer-encoding):/i.test(raw))best=raw.trim();
 return{subject:cleanSubject,text:best.slice(0,200000)}
}
