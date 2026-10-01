import fs from"node:fs";
const site=(process.argv[2]||"").replace(/\/+$/,"");
if(!site)throw new Error("Usage: node scripts/document-gateway/smoke.mjs https://lingxifield.com");
const rtf=Buffer.from(String.raw`{\rtf1\ansi\deff0{\fonttbl{\f0 Arial;}}\f0\fs24 LINGXIFIELD document gateway production smoke test.}`);
const name="lingxifield-gateway-smoke.rtf";
const type="application/rtf";

const ticketRes=await fetch(site+"/api/tools/document/ticket",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({name,size:rtf.length,type})});
if(!ticketRes.ok)throw new Error(`TICKET_HTTP_${ticketRes.status}`);
const ticket=await ticketRes.json();
if(ticket.mode!=="direct")throw new Error("DOCUMENT_GATEWAY_NOT_CONFIGURED_ON_SITE");

const convert=await fetch(ticket.url,{method:"POST",headers:{
 "content-type":type,
 "x-lingxifield-ticket-version":"v1",
 "x-lingxifield-filename":encodeURIComponent(name),
 "x-lingxifield-size":String(rtf.length),
 "x-lingxifield-exp":String(ticket.exp),
 "x-lingxifield-nonce":ticket.nonce,
 "x-lingxifield-token":ticket.token
},body:rtf});
if(!convert.ok)throw new Error(`CONVERT_HTTP_${convert.status}`);
const bytes=new Uint8Array(await convert.arrayBuffer());
const magic=String.fromCharCode(...bytes.slice(0,5));
if(magic!=="%PDF-")throw new Error("CONVERTED_RESULT_NOT_PDF");

// Replay must be rejected.
const replay=await fetch(ticket.url,{method:"POST",headers:{
 "content-type":type,
 "x-lingxifield-ticket-version":"v1",
 "x-lingxifield-filename":encodeURIComponent(name),
 "x-lingxifield-size":String(rtf.length),
 "x-lingxifield-exp":String(ticket.exp),
 "x-lingxifield-nonce":ticket.nonce,
 "x-lingxifield-token":ticket.token
},body:rtf});
if(replay.status!==409)throw new Error(`REPLAY_GUARD_EXPECTED_409_GOT_${replay.status}`);

console.log(`GATEWAY_PDF_BYTES=${bytes.length}`);
console.log("DOCUMENT_GATEWAY_DIRECT_CONVERSION=PASS");
console.log("DOCUMENT_GATEWAY_PDF_MAGIC=PASS");
console.log("DOCUMENT_GATEWAY_REPLAY_GUARD=PASS");
console.log("DOCUMENT_GATEWAY_END_TO_END=PASS");
