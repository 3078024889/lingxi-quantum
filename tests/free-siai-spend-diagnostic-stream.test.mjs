import test from "node:test";
import assert from "node:assert/strict";
import {readMcpBodyLimited,McpBodyTooLargeError} from "../lib/siai/mcp-bounded-body.ts";

const bytes=value=>new TextEncoder().encode(value);
function stream(chunks){
 return new ReadableStream({start(controller){
  for(const part of chunks)controller.enqueue(part);
  controller.close();
 }});
}
test("bounded request permits an exact-size valid UTF-8 payload",async()=>{
 const part=bytes('{"jsonrpc":"2.0"}');
 assert.equal(await readMcpBodyLimited(stream([part]),part.byteLength),'{"jsonrpc":"2.0"}');
});
test("checks byte size, not JavaScript character count",async()=>{
 await assert.rejects(readMcpBodyLimited(stream([bytes("汉")]),2),McpBodyTooLargeError);
 assert.equal(await readMcpBodyLimited(stream([bytes("汉")]),3),"汉");
});
test("chunked payload rejected as soon as cap is exceeded",async()=>{
 let produced=0;
 const parts=[bytes("1234"),bytes("5678"),bytes("this should never need to be fully buffered")];
 const incoming=new ReadableStream({pull(controller){
  if(produced>=parts.length){controller.close();return;}
  controller.enqueue(parts[produced++]);
 }});
 await assert.rejects(readMcpBodyLimited(incoming,6),McpBodyTooLargeError);
 assert.ok(produced<=3);
});
test("invalid UTF-8 is rejected",async()=>{
 await assert.rejects(readMcpBodyLimited(stream([Uint8Array.from([0xc3,0x28])]),100),TypeError);
});
test("missing body and invalid cap are rejected",async()=>{
 await assert.rejects(readMcpBodyLimited(null,100),TypeError);
 await assert.rejects(readMcpBodyLimited(stream([bytes("{}")]),0),TypeError);
});
