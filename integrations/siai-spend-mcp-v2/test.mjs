import test from "node:test";
import assert from "node:assert/strict";
import { Client, StreamableHTTPClientTransport } from "@modelcontextprotocol/client";
import { startLocalMcp } from "./server.mjs";

async function connected(url,mode="auto") {
 const client=new Client({name:"lingxifield-mcp-test",version:"1.0.0"},{
  versionNegotiation:{mode}
 });
 await client.connect(new StreamableHTTPClientTransport(new URL(url)));
 return client;
}

test("official MCP v2 client negotiates modern protocol, lists and calls real calculator", {timeout:20000}, async()=>{
 const local=await startLocalMcp();
 let client;
 try {
  client=await connected(local.url,"auto");
  assert.equal(client.getProtocolEra(),"modern");
  const tools=await client.listTools();
  assert.ok(tools.tools.some(t=>t.name==="diagnose_ai_spend"));
  const result=await client.callTool({
   name:"diagnose_ai_spend",
   arguments:{
    currency:"USD",
    items:[{name:"Video AI",monthlyPrice:29,usedPerMonth:3,expectedPerMonth:10,monthlyQuota:5}]
   }
  });
  assert.equal(result.isError??false,false);
  assert.equal(result.structuredContent?.monthlySpend,29);
  assert.equal(result.structuredContent?.findings?.[0]?.quotaShortfall,5);
  assert.equal(result.structuredContent?.potentialMonthlySavings,0);
 } finally {
  if(client)await client.close();
  await local.close();
 }
});

test("official MCP v2 server supports legacy 2025 client with same calculations", {timeout:20000}, async()=>{
 const local=await startLocalMcp();
 let client;
 try{
  client=await connected(local.url,"legacy");
  assert.equal(client.getProtocolEra(),"legacy");
  const result=await client.callTool({
   name:"diagnose_ai_spend",
   arguments:{currency:"CNY",items:[{name:"Unused AI",monthlyPrice:99,usedPerMonth:0,expectedPerMonth:0}]}
  });
  assert.equal(result.structuredContent?.potentialMonthlySavings,99);
 }finally{
  if(client)await client.close();
  await local.close();
 }
});

test("rejects malicious web Origin and non-MCP paths before invoking a tool", {timeout:15000}, async()=>{
 const local=await startLocalMcp();
 try {
  const payload=JSON.stringify({jsonrpc:"2.0",id:1,method:"ping"});
  const badOrigin=await fetch(local.url,{
   method:"POST",
   headers:{"Content-Type":"application/json",Origin:"https://attacker.example"},
   body:payload
  });
  assert.equal(badOrigin.status,403);
  const wrong=await fetch(local.url.replace("/mcp","/hidden"),{method:"POST",body:payload});
  assert.equal(wrong.status,404);
  const oversized=await fetch(local.url,{
   method:"POST",
   headers:{"Content-Type":"application/json"},
   body:"X".repeat(16400)
  });
  assert.equal(oversized.status,413);
 }finally{
  await local.close();
 }
});
