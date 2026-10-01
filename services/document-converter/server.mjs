import http from "node:http";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {spawn} from "node:child_process";
import {pathToFileURL} from "node:url";

const PORT=Number(process.env.PORT||8787);
const HOST=process.env.HOST||"0.0.0.0";
const SECRET=(process.env.LINGXIFIELD_DOCUMENT_CONVERTER_SECRET||"").trim();
const MAX_BYTES=20*1024*1024;
if(!SECRET)throw new Error("LINGXIFIELD_DOCUMENT_CONVERTER_SECRET is required");

function soffice(){
 if(process.env.SOFFICE_PATH)return process.env.SOFFICE_PATH;
 if(process.platform==="win32")return "C:\\Program Files\\LibreOffice\\program\\soffice.exe";
 return "soffice";
}
function auth(req){return req.headers.authorization===`Bearer ${SECRET}`;}
async function readBody(req){
 const chunks=[];let total=0;
 for await(const chunk of req){total+=chunk.length;if(total>MAX_BYTES)throw new Error("TOO_LARGE");chunks.push(chunk);}
 return Buffer.concat(chunks);
}
async function convert(bytes,ext){
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),"lx-doc-"));
 const profile=path.join(dir,"profile");
 const input=path.join(dir,`input.${ext}`);
 try{
  await fs.mkdir(profile,{recursive:true});await fs.writeFile(input,bytes);
  const args=[`-env:UserInstallation=${pathToFileURL(profile).href}`,"--headless","--nologo","--nodefault","--nolockcheck","--convert-to","pdf:writer_pdf_Export","--outdir",dir,input];
  await new Promise((resolve,reject)=>{
   const child=spawn(soffice(),args,{stdio:["ignore","pipe","pipe"]});let stderr="";
   child.stderr.on("data",d=>{stderr+=String(d).slice(0,4000)});
   const timer=setTimeout(()=>{child.kill("SIGKILL");reject(new Error("CONVERSION_TIMEOUT"));},45_000);
   child.on("error",e=>{clearTimeout(timer);reject(e)});
   child.on("exit",code=>{clearTimeout(timer);code===0?resolve():reject(new Error(`CONVERSION_EXIT_${code}:${stderr}`))});
  });
  const output=path.join(dir,"input.pdf");const pdf=await fs.readFile(output);
  if(pdf.length<5||pdf.subarray(0,5).toString("ascii")!=="%PDF-")throw new Error("INVALID_PDF");
  return pdf;
 }finally{await fs.rm(dir,{recursive:true,force:true}).catch(()=>{});}
}

const server=http.createServer(async(req,res)=>{
 try{
  if(req.method==="GET"&&req.url==="/health"){res.writeHead(200,{"content-type":"application/json"});res.end(JSON.stringify({ok:true}));return;}
  if(req.method!=="POST"||req.url!=="/convert"){res.writeHead(404);res.end();return;}
  if(!auth(req)){res.writeHead(401);res.end();return;}
  const ext=String(req.headers["x-lingxifield-ext"]||"").toLowerCase();
  if(ext!=="doc"&&ext!=="docx"){res.writeHead(415);res.end();return;}
  const pdf=await convert(await readBody(req),ext);
  res.writeHead(200,{"content-type":"application/pdf","content-length":pdf.length,"cache-control":"no-store","x-content-type-options":"nosniff"});res.end(pdf);
 }catch(e){const status=e instanceof Error&&e.message==="TOO_LARGE"?413:500;res.writeHead(status,{"content-type":"application/json"});res.end(JSON.stringify({ok:false}));}
});
server.listen(PORT,HOST,()=>console.log(`LINGXIFIELD_DOCUMENT_CONVERTER_READY=${HOST}:${PORT}`));
