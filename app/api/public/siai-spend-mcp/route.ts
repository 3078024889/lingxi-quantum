import {NextRequest,NextResponse} from "next/server";
import {diagnoseAiSpend} from "@/lib/siai/free-spend-diagnostic";
import type {SpendInput} from "@/lib/siai/free-spend-diagnostic";
export const runtime="nodejs";
const MAX_BODY=16000;
const tools=[{name:"diagnose_ai_spend",description:"免费分析手动填写的SI/AI订阅花费、低使用率及潜在节省。不连接账户，不验证第三方套餐可用性。",inputSchema:{type:"object",additionalProperties:false,required:["currency","items"],properties:{currency:{type:"string",enum:["CNY","USD"]},items:{type:"array",minItems:1,maxItems:30,items:{type:"object",additionalProperties:false,required:["name","monthlyPrice","usedPerMonth"],properties:{name:{type:"string",maxLength:100},monthlyPrice:{type:"number",minimum:0},usedPerMonth:{type:"integer",minimum:0},expectedPerMonth:{type:"integer",minimum:0},alternativeMonthlyPrice:{type:"number",minimum:0},essential:{type:"boolean"}}}}}}}];
const allowed=new Set(["https://lingxifield.com","https://lingxifield.cn"]);
const ok=(body:unknown,status=200)=>NextResponse.json(body,{status,headers:{"Cache-Control":"no-store","Access-Control-Allow-Methods":"POST,OPTIONS","Access-Control-Allow-Headers":"content-type,mcp-protocol-version","MCP-Protocol-Version":"2025-06-18"}});
export async function OPTIONS(request:NextRequest){
 const origin=request.headers.get("origin");
 if(!origin||!allowed.has(origin))return new Response(null,{status:403});
 return new Response(null,{status:204,headers:{"Access-Control-Allow-Origin":origin,"Vary":"Origin","Access-Control-Allow-Methods":"POST,OPTIONS","Access-Control-Allow-Headers":"content-type,mcp-protocol-version"}});
}
export async function POST(request:NextRequest){
 if(process.env.ENABLE_PUBLIC_SIAI_SPEND_MCP!=="true")return ok({error:"MCP endpoint is not enabled"},503);
 const origin=request.headers.get("origin");
 // Native MCP clients generally omit Origin. Block untrusted browser origins.
 if(origin&&!allowed.has(origin))return ok({error:"forbidden origin"},403);
 const size=Number(request.headers.get("content-length")||"0");
 if(size>MAX_BODY)return ok({error:"request too large"},413);
 let raw="";
 try{raw=await request.text();if(raw.length>MAX_BODY)return ok({error:"request too large"},413);}catch{return ok({error:"body read failed"},400);}
 let msg:any;
 try{msg=JSON.parse(raw);}catch{return ok({jsonrpc:"2.0",id:null,error:{code:-32700,message:"Parse error"}},400);}
 if(!msg||msg.jsonrpc!=="2.0"||typeof msg.method!=="string")return ok({jsonrpc:"2.0",id:msg?.id??null,error:{code:-32600,message:"Invalid Request"}},400);
 const id=msg.id??null;
 const response=(result:unknown)=>ok({jsonrpc:"2.0",id,result});
 if(msg.method==="notifications/initialized")return new Response(null,{status:202});
 if(msg.method==="initialize")return response({protocolVersion:"2025-06-18",capabilities:{tools:{listChanged:false}},serverInfo:{name:"lingxifield-free-spend-diagnostic",version:"0.1.0"}});
 if(msg.method==="ping")return response({});
 if(msg.method==="tools/list")return response({tools});
 if(msg.method==="tools/call"){
  if(msg.params?.name!=="diagnose_ai_spend")return ok({jsonrpc:"2.0",id,error:{code:-32602,message:"Unknown tool"}},400);
  try {
   const result=diagnoseAiSpend(msg.params?.arguments as SpendInput);
   return response({content:[{type:"text",text:JSON.stringify(result)}],structuredContent:result,isError:false});
  }catch(e){
   return response({content:[{type:"text",text:e instanceof Error?e.message:"输入无效"}],isError:true});
  }
 }
 return ok({jsonrpc:"2.0",id,error:{code:-32601,message:"Method not found"}},400);
}
