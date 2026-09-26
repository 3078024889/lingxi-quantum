import {NextRequest,NextResponse} from "next/server";
import {executeSasiKernel} from "@/lib/sasi-kernel/runtime";
import {registeredCapabilities} from "@/lib/sasi-kernel/registry";
import {isSameOriginMutation} from "@/lib/sasi/request-security";
export const runtime="nodejs";export const dynamic="force-dynamic";
export async function GET(){return NextResponse.json({ok:true,engine:"sasi-kernel",providerRequired:false,capabilities:registeredCapabilities(),compatibility:"autonomous-v1"},{headers:{"Cache-Control":"no-store"}});}
export async function POST(req:NextRequest){
 const size=Number(req.headers.get("content-length")||0);if(Number.isFinite(size)&&size>512*1024)return NextResponse.json({error:"请求内容过大。"},{status:413});
 if(!isSameOriginMutation(req))return NextResponse.json({error:"请求来源无效。"},{status:403});
 const body:Record<string,unknown>=await req.json().catch(()=>({}));
 const kind=body.kind==="image"?"image":body.kind==="video"?"video":body.kind==="utility"?"utility":body.kind==="file"?"file":"knowledge";
 const result=await executeSasiKernel({kind,action:String(body.action||"answer"),input:body.input,intelligence:body.intelligence==="light"?"light":body.intelligence==="high"?"high":"standard",mode:"autonomous"});
 return NextResponse.json(result,{status:result.ok?200:422,headers:{"Cache-Control":"no-store"}});
}
