import http from"node:http";
import{createHmac,timingSafeEqual,randomUUID}from"node:crypto";

const PORT=Number(process.env.PORT||3100);
const SECRET=(process.env.LINGXIFIELD_DOCUMENT_GATEWAY_SECRET||"").trim();
const GOTENBERG=(process.env.GOTENBERG_INTERNAL_URL||"http://gotenberg:3000").replace(/\/+$/,"");
const ALLOWED=(process.env.LINGXIFIELD_ALLOWED_ORIGINS||"https://lingxifield.com,https://lingxifield.cn").split(",").map(x=>x.trim()).filter(Boolean);
const MAX_INPUT=50*1024*1024;
const MAX_OUTPUT=100*1024*1024;
const ALLOWED_EXTENSIONS=new Set(["doc","docx","docm","dot","dotm","dotx","odt","fodt","ott","rtf","txt","xls","xlsx","xlsm","xlt","xltx","ods","csv","tsv","ppt","pptx","pptm","pot","potx","odp"]);
const usedNonces=new Map();
const requestCounts=new Map();

function now(){return Math.floor(Date.now()/1000)}
function cleanState(){
 const t=now();
 for(const[n,e]of usedNonces)if(e<t)usedNonces.delete(n);
 const minute=Math.floor(t/60);
 for(const[k,v]of requestCounts)if(v.minute!==minute)requestCounts.delete(k);
}
setInterval(cleanState,60_000).unref?.();

function securityHeaders(res){
 res.setHeader("x-content-type-options","nosniff");
 res.setHeader("x-frame-options","DENY");
 res.setHeader("referrer-policy","no-referrer");
 res.setHeader("cache-control","private, no-store, max-age=0");
}
function cors(res,origin){
 if(origin&&ALLOWED.includes(origin)){
  res.setHeader("access-control-allow-origin",origin);
  res.setHeader("vary","Origin");
  res.setHeader("access-control-allow-methods","POST,OPTIONS,GET");
  res.setHeader("access-control-allow-headers","content-type,x-lingxifield-ticket-version,x-lingxifield-filename,x-lingxifield-size,x-lingxifield-exp,x-lingxifield-nonce,x-lingxifield-token");
 }
}
function secureEqual(a,b){
 const aa=Buffer.from(a),bb=Buffer.from(b);
 return aa.length===bb.length&&timingSafeEqual(aa,bb);
}
function sign(payload){return createHmac("sha256",SECRET).update(payload).digest("base64url")}
function safeName(raw){try{return decodeURIComponent(raw||"document")}catch{return"document"}}
function extOf(name){return(name.split(".").pop()||"").toLowerCase()}
function ipOf(req){return String(req.headers["x-forwarded-for"]||req.socket.remoteAddress||"").split(",")[0].trim()}
function rateAllowed(req){
 const ip=ipOf(req),minute=Math.floor(now()/60),state=requestCounts.get(ip);
 if(!state||state.minute!==minute){requestCounts.set(ip,{minute,count:1});return true}
 state.count++;return state.count<=30;
}
async function readBody(req,expected){
 const chunks=[];let total=0;
 for await(const chunk of req){
  total+=chunk.length;
  if(total>MAX_INPUT)throw Object.assign(new Error("too large"),{status:413});
  chunks.push(chunk);
 }
 if(expected&&total!==expected)throw Object.assign(new Error("size mismatch"),{status:400});
 return Buffer.concat(chunks);
}
function gotenbergHeaders(){
 const h=new Headers();
 const user=(process.env.GOTENBERG_BASIC_USER||"").trim(),pass=(process.env.GOTENBERG_BASIC_PASSWORD||"").trim();
 if(user&&pass)h.set("authorization","Basic "+Buffer.from(`${user}:${pass}`).toString("base64"));
 return h;
}
function pdfMagic(buffer){return buffer.length>=5&&buffer[0]===0x25&&buffer[1]===0x50&&buffer[2]===0x44&&buffer[3]===0x46&&buffer[4]===0x2d}
async function deepHealth(){
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),1500);
 try{
  const r=await fetch(`${GOTENBERG}/health`,{method:"HEAD",headers:gotenbergHeaders(),signal:controller.signal});
  return r.ok;
 }catch{return false}finally{clearTimeout(timer)}
}

const server=http.createServer(async(req,res)=>{
 const requestId=randomUUID();
 securityHeaders(res);
 res.setHeader("x-lingxifield-request-id",requestId);
 const origin=String(req.headers.origin||"");
 cors(res,origin);

 if(req.method==="OPTIONS"){
  if(origin&&!ALLOWED.includes(origin)){res.statusCode=403;return res.end()}
  res.statusCode=204;return res.end();
 }
 if(req.method==="GET"&&req.url==="/health"){
  const ok=Boolean(SECRET.length>=32)&&await deepHealth();
  res.setHeader("content-type","application/json; charset=utf-8");
  res.statusCode=ok?200:503;
  return res.end(JSON.stringify({ok,service:"document-gateway"}));
 }
 if(req.method!=="POST"||req.url!=="/convert"){res.statusCode=404;return res.end("not found")}
 if(!SECRET||SECRET.length<32){res.statusCode=503;return res.end("gateway not configured")}
 if(origin&&!ALLOWED.includes(origin)){res.statusCode=403;return res.end("origin denied")}
 if(!rateAllowed(req)){res.statusCode=429;res.setHeader("retry-after","60");return res.end("rate limited")}

 const version=String(req.headers["x-lingxifield-ticket-version"]||"");
 const filename=safeName(String(req.headers["x-lingxifield-filename"]||""));
 const size=Number(req.headers["x-lingxifield-size"]||0);
 const exp=Number(req.headers["x-lingxifield-exp"]||0);
 const nonce=String(req.headers["x-lingxifield-nonce"]||"");
 const token=String(req.headers["x-lingxifield-token"]||"");
 const type=String(req.headers["content-type"]||"application/octet-stream").slice(0,160);
 const ext=extOf(filename);
 const t=now();

 if(version!=="v1"||!filename||!ALLOWED_EXTENSIONS.has(ext)){res.statusCode=415;return res.end("unsupported document")}
 if(!nonce||!token||!size||size>MAX_INPUT||exp<t||exp>t+360){res.statusCode=401;return res.end("invalid ticket")}
 if(usedNonces.has(nonce)){res.statusCode=409;return res.end("ticket already used")}
 const payload=[version,exp,nonce,size,filename,type].join("\n");
 if(!secureEqual(token,sign(payload))){res.statusCode=401;return res.end("bad signature")}
 usedNonces.set(nonce,exp);

 try{
  const bytes=await readBody(req,size);
  const file=new File([bytes],filename,{type});
  const fd=new FormData();fd.set("files",file,filename);
  fd.set("exportFormFields","false");
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),70_000);
  let gr;
  try{gr=await fetch(`${GOTENBERG}/forms/libreoffice/convert`,{method:"POST",headers:gotenbergHeaders(),body:fd,signal:controller.signal})}
  finally{clearTimeout(timer)}
  if(!gr.ok){res.statusCode=gr.status===400?400:502;return res.end("conversion failed")}
  const body=Buffer.from(await gr.arrayBuffer());
  if(body.length>MAX_OUTPUT){res.statusCode=413;return res.end("converted file too large")}
  if(!pdfMagic(body)){res.statusCode=502;return res.end("invalid conversion result")}
  res.statusCode=200;
  res.setHeader("content-type","application/pdf");
  res.setHeader("content-length",String(body.length));
  return res.end(body);
 }catch(e){
  const aborted=e?.name==="AbortError";
  res.statusCode=aborted?504:(e?.status||502);
  return res.end(aborted?"conversion timeout":"conversion failed");
 }
});

server.requestTimeout=90_000;
server.headersTimeout=10_000;
server.keepAliveTimeout=5_000;
server.maxRequestsPerSocket=100;
server.listen(PORT,"0.0.0.0",()=>console.log(`LINGXIFIELD_DOCUMENT_GATEWAY_READY=${PORT}`));
