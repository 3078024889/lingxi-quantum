import http from"node:http";
import{createHmac,timingSafeEqual}from"node:crypto";

const PORT=Number(process.env.PORT||3100);
const SECRET=(process.env.LINGXIFIELD_DOCUMENT_GATEWAY_SECRET||"").trim();
const GOTENBERG=(process.env.GOTENBERG_INTERNAL_URL||"http://gotenberg:3000").replace(/\/+$/,"");
const ALLOWED=(process.env.LINGXIFIELD_ALLOWED_ORIGINS||"https://lingxifield.com,https://lingxifield.cn").split(",").map(x=>x.trim()).filter(Boolean);
const MAX=50*1024*1024;

function cors(res,origin){
 if(origin&&ALLOWED.includes(origin)){
  res.setHeader("access-control-allow-origin",origin);
  res.setHeader("vary","Origin");
  res.setHeader("access-control-allow-methods","POST,OPTIONS,GET");
  res.setHeader("access-control-allow-headers","content-type,x-lingxifield-filename,x-lingxifield-size,x-lingxifield-exp,x-lingxifield-nonce,x-lingxifield-token");
 }
}
function secureEqual(a,b){
 const aa=Buffer.from(a),bb=Buffer.from(b);
 return aa.length===bb.length&&timingSafeEqual(aa,bb);
}
function sign(payload){return createHmac("sha256",SECRET).update(payload).digest("base64url")}
function safeName(raw){
 try{return decodeURIComponent(raw||"document")}catch{return"document"}
}
async function readBody(req,expected){
 const chunks=[];let total=0;
 for await(const chunk of req){
  total+=chunk.length;
  if(total>MAX)throw Object.assign(new Error("too large"),{status:413});
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

const server=http.createServer(async(req,res)=>{
 const origin=String(req.headers.origin||"");
 cors(res,origin);
 if(req.method==="OPTIONS"){res.statusCode=204;return res.end()}
 if(req.method==="GET"&&req.url==="/health"){res.statusCode=200;return res.end("ok")}
 if(req.method!=="POST"||req.url!=="/convert"){res.statusCode=404;return res.end("not found")}
 if(!SECRET){res.statusCode=503;return res.end("gateway not configured")}
 if(origin&&!ALLOWED.includes(origin)){res.statusCode=403;return res.end("origin denied")}

 const filename=safeName(String(req.headers["x-lingxifield-filename"]||""));
 const size=Number(req.headers["x-lingxifield-size"]||0);
 const exp=Number(req.headers["x-lingxifield-exp"]||0);
 const nonce=String(req.headers["x-lingxifield-nonce"]||"");
 const token=String(req.headers["x-lingxifield-token"]||"");
 const type=String(req.headers["content-type"]||"application/octet-stream").slice(0,160);
 if(!filename||!nonce||!token||!size||size>MAX||exp<Math.floor(Date.now()/1000)||exp>Math.floor(Date.now()/1000)+360){
  res.statusCode=401;return res.end("invalid ticket");
 }
 const payload=[exp,nonce,size,filename,type].join("\n");
 if(!secureEqual(token,sign(payload))){res.statusCode=401;return res.end("bad signature")}

 try{
  const bytes=await readBody(req,size);
  const file=new File([bytes],filename,{type});
  const fd=new FormData();fd.set("files",file,filename);
  const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),55_000);
  let gr;
  try{
   gr=await fetch(`${GOTENBERG}/forms/libreoffice/convert`,{method:"POST",headers:gotenbergHeaders(),body:fd,signal:ctrl.signal});
  }finally{clearTimeout(timer)}
  if(!gr.ok){res.statusCode=gr.status>=500?502:400;return res.end("conversion failed")}
  res.statusCode=200;
  res.setHeader("content-type","application/pdf");
  res.setHeader("cache-control","private, no-store");
  res.setHeader("x-content-type-options","nosniff");
  const body=Buffer.from(await gr.arrayBuffer());
  res.setHeader("content-length",String(body.length));
  return res.end(body);
 }catch(e){
  res.statusCode=e?.status||502;
  return res.end("conversion failed");
 }
});
server.requestTimeout=60_000;
server.headersTimeout=10_000;
server.listen(PORT,"0.0.0.0",()=>console.log(`LINGXIFIELD_DOCUMENT_GATEWAY_READY=${PORT}`));
