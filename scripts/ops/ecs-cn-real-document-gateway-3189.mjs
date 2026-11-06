#!/usr/bin/env node
// CN staging 3189: real small DOCX -> PDF and signed gateway anti-replay.
import {execFileSync} from "node:child_process";
import {parseEnv} from "node:util";
import fs from "node:fs";
import {randomUUID} from "node:crypto";

if(process.argv.length!==3||process.argv[2]!=="--run-local-3189-only"){
 console.log("CN_DOCUMENT_REAL_GATE_REQUIRES_EXPLICIT_3189_FLAG");process.exit(2);
}
if(process.getuid?.()!==0){console.log("CN_DOC_GATE_REQUIRES_LOCAL_ROOT");process.exit(2)}
const env=parseEnv(fs.readFileSync("/etc/lingxifield/staging.env","utf8"));
const stage=env.NEXT_PUBLIC_SITE_URL==="https://lingxifield.cn"&&
 env.NEXT_PUBLIC_SUPABASE_URL==="https://sxsgdpqojepgbbrxrzlq.supabase.co"&&
 ["ALIPAY_ENABLED","WECHAT_MINI_VPAY_TOPUPS_ENABLED","WECHAT_MINI_VPAY_TOOLS_ENABLED"].every(k=>env[k]==="false");
if(!stage){console.log("CN_DOC_GATE_SITE_PAYMENT_ISOLATION_FAILED");process.exit(3)}
const python = String.raw`
import io,sys,zipfile
from xml.sax.saxutils import escape
s=io.BytesIO()
p={"[Content_Types].xml":"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>""",
"_rels/.rels":"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>""",
"word/document.xml":"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
<w:body><w:p><w:r><w:t>LINGXIFIELD CN GATE REAL DOCX TEST</w:t></w:r></w:p><w:sectPr/></w:body></w:document>"""}
with zipfile.ZipFile(s,"w",zipfile.ZIP_DEFLATED) as z:
 for n,v in p.items():z.writestr(n,v)
sys.stdout.buffer.write(s.getvalue())
`;
let docx;
try{docx=execFileSync("python3",["-c",python],{maxBuffer:1024*1024,timeout:15000})}
catch{console.log("CN_DOCX_LOCAL_FIXTURE_GENERATION_FAILED");process.exit(4)}
if(docx.length<250||docx.length>100000){console.log("CN_DOCX_FIXTURE_SIZE_INVALID");process.exit(4)}
console.log("CN_DOCX_FIXTURE_BYTES="+docx.length);
const base="http://127.0.0.1:3189";
const name="cn-real-gateway-"+randomUUID()+".docx";
const type="application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const output=async res=>{
 const bytes=Buffer.from(await res.arrayBuffer());
 const magic=bytes.subarray(0,5).toString("ascii")==="%PDF-";
 const end=bytes.subarray(Math.max(0,bytes.length-1024)).includes(Buffer.from("%%EOF"));
 console.log("CN_DOC_PDF_BYTES="+bytes.length);
 console.log("CN_DOC_PDF_MAGIC="+(magic?"PASS":"FAIL"));
 console.log("CN_DOC_PDF_EOF="+(end?"PASS":"FAIL"));
 if(!magic||!end||bytes.length<500)throw Error("PDF_NOT_VALID");
};
let failed=false;
async function check(label,fn){
 try{await fn();console.log(label+"=PASS")}
 catch(e){console.log(label+"=FAIL_"+String(e.message||"UNKNOWN").replace(/[^A-Z_0-9]/g,"").slice(0,70));failed=true}
}
const request=async(url,init,ms=75000)=>fetch(url,{...init,redirect:"error",cache:"no-store",signal:AbortSignal.timeout(ms)});
await check("CN_DOC_STAGE_USER_API_REAL_DOCX",async()=>{
 const fd=new FormData();
 fd.set("file",new File([docx],name,{type}),name);
 const resp=await request(base+"/api/tools/document/normalize",{method:"POST",body:fd},68000);
 console.log("CN_DOC_STAGE_NORMALIZE_HTTP="+resp.status);
 if(resp.status!==200){await resp.body?.cancel();throw Error("HTTP_"+resp.status)}
 await output(resp);
});
await check("CN_DOC_SIGNED_GATEWAY_REAL_DOCX",async()=>{
 const ticket=await request(base+"/api/tools/document/ticket",{
   method:"POST",headers:{"content-type":"application/json"},
   body:JSON.stringify({name,size:docx.length,type})
 },12000);
 console.log("CN_DOC_STAGE_TICKET_HTTP="+ticket.status);
 if(ticket.status!==200){await ticket.body?.cancel();throw Error("TICKET_HTTP_"+ticket.status)}
 const info=await ticket.json();
 console.log("CN_DOC_STAGE_TICKET_MODE="+(info.mode==="direct"?"direct":info.mode==="same-origin"?"same-origin":"unknown"));
 if(info.mode!=="direct"||typeof info.token!=="string"||typeof info.nonce!=="string"||
 !Number.isSafeInteger(info.exp)||typeof info.url!=="string")throw Error("DIRECT_GATEWAY_NOT_CONFIGURED");
 const u=new URL(info.url);
 if(u.protocol!=="https:"||u.pathname!=="/convert"||u.username||u.password||u.search||u.hash)throw Error("GATEWAY_TICKET_URL_INVALID");
 const headers={
  "content-type":type,
  "x-lingxifield-ticket-version":"v1",
  "x-lingxifield-filename":encodeURIComponent(name),
  "x-lingxifield-size":String(docx.length),
  "x-lingxifield-exp":String(info.exp),
  "x-lingxifield-nonce":info.nonce,
  "x-lingxifield-token":info.token
 };
 // Connect to the already verified loopback gateway. Do not access a user-supplied URL.
 const doConvert=()=>request("http://127.0.0.1:3100/convert",
 {method:"POST",headers,body:docx},75000);
 const first=await doConvert();
 console.log("CN_DOC_GATEWAY_REAL_HTTP="+first.status);
 if(first.status!==200){await first.body?.cancel();throw Error("GATEWAY_HTTP_"+first.status)}
 await output(first);
 const second=await doConvert();
 console.log("CN_DOC_GATEWAY_REPLAY_HTTP="+second.status);
 await second.body?.cancel();
 if(second.status!==409)throw Error("REPLAY_NOT_409");
});
console.log("CN_SASI_REAL_PROVIDER_GATE=NOT_VERIFIED");
console.log("CN_PAYMENT_CALLBACK_AND_ENTITLEMENT_GATE=NOT_VERIFIED");
console.log("CN_PUBLIC_3188_SWITCH=NOT_ATTEMPTED");
console.log("CN_REAL_DOCUMENT_GATE_RESULT="+(failed?"FAIL":"PASS"));
if(failed)process.exitCode=1;
