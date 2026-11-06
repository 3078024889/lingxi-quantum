import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { createMcpHandler, McpServer } from "@modelcontextprotocol/server";
import { toNodeHandler, localhostHostValidation, localhostOriginValidation } from "@modelcontextprotocol/node";
import * as z from "zod/v4";
import { diagnoseAiSpend } from "../../lib/siai/free-spend-diagnostic.ts";

// Official v2 SDK laboratory. Binds loopback only. Never mount this file in Next.js.
const item = z.object({
  name: z.string().min(1).max(100),
  monthlyPrice: z.number().finite().min(0).max(1_000_000),
  usedPerMonth: z.number().int().min(0).max(1_000_000),
  expectedPerMonth: z.number().int().min(0).max(1_000_000).optional(),
  monthlyQuota: z.number().int().min(0).max(1_000_000).optional(),
  alternativeMonthlyPrice: z.number().finite().min(0).max(1_000_000).optional(),
  essential: z.boolean().optional()
});
const input = z.object({
  currency: z.enum(["CNY", "USD"]),
  items: z.array(item).min(1).max(30)
});

export function makeMcpHandler() {
  return createMcpHandler(() => {
    const server = new McpServer({
      name: "lingxifield-spend-diagnostic",
      version: "0.1.0"
    });
    server.registerTool("diagnose_ai_spend", {
      description: "Free read-only SI/AI subscription spending check. Self-reported costs and quota only. No verified vendor quote, account access, cancellation or payment.",
      inputSchema: input
    }, async args => {
      try {
        const result = diagnoseAiSpend(args);
        return {
          content: [{type:"text",text:JSON.stringify(result)}],
          structuredContent: result
        };
      } catch {
        return {
          content: [{type:"text",text:"Invalid or inconsistent subscription values."}],
          isError: true
        };
      }
    });
    return server;
  }, {responseMode:"json"});
}
export async function startLocalMcp(port=0) {
  const handler=makeMcpHandler();
  const send=toNodeHandler(handler);
  const allowHost=localhostHostValidation();
  const allowOrigin=localhostOriginValidation();
  const node=createServer((req,res)=>{
    if(req.url!=="/mcp") {res.writeHead(404);res.end();return;}
    if(!allowHost(req,res) || !allowOrigin(req,res))return;
    const size=Number(req.headers["content-length"]??0);
    if(!Number.isFinite(size)||size>16384){res.writeHead(413);res.end();return;}
    void Promise.resolve(send(req,res)).catch(()=>{
      if(!res.headersSent)res.writeHead(500);
      if(!res.writableEnded)res.end();
    });
  });
  await new Promise((resolveListen,rejectListen)=>{
    node.once("error",rejectListen);
    node.listen(port,"127.0.0.1",resolveListen);
  });
  const address=node.address();
  if(!address||typeof address==="string")throw Error("Unexpected listener address");
  return {
    url:"http://127.0.0.1:"+address.port+"/mcp",
    close:async()=>{
      await handler.close();
      await new Promise((done,rejectClose)=>node.close(err=>err?rejectClose(err):done()));
    }
  };
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  if(process.env.ENABLE_LOCAL_SIAI_SPEND_MCP!=="true"){
    throw Error("Local MCP lab is disabled. Set ENABLE_LOCAL_SIAI_SPEND_MCP=true for localhost-only testing.");
  }
  const requested=Number(process.env.SIAI_MCP_PORT??4309);
  if(!Number.isInteger(requested)||requested<1024||requested>65535)throw Error("Invalid local port");
  const local=await startLocalMcp(requested);
  process.stderr.write("MCP lab listening at "+local.url+" (localhost only)\n");
}
