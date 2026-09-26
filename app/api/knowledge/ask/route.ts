import { NextRequest, NextResponse } from "next/server";
import { isSameOriginMutation } from "@/lib/sasi/request-security";
import { executeSasi } from "@/lib/sasi-autonomous/runtime";

export const runtime = "nodejs";
export const maxDuration = 30;

type Evidence = { index:number; title:string; locator?:string; text:string };

export async function POST(req:NextRequest){
 const contentLength=Number(req.headers.get("content-length")||0);
 if(Number.isFinite(contentLength)&&contentLength>384*1024)return NextResponse.json({error:"这次资料太多，请减少引用内容后再试。"},{status:413});
 if(!isSameOriginMutation(req))return NextResponse.json({error:"请求来源无效。"},{status:403});
 const body:Record<string,unknown>=await req.json().catch(()=>({}));
 const question=String(body.question||"").trim().slice(0,4000);
 const mode=body.mode==="research"?"research":body.mode==="learning"?"learning":"book";
 const intelligence=body.intelligence==="light"?"light":body.intelligence==="high"?"high":"standard";
 const rawEvidence:unknown[]=Array.isArray(body.evidence)?body.evidence:[];
 const evidence:Evidence[]=rawEvidence.slice(0,intelligence==="high"?14:intelligence==="light"?5:9).map((raw:unknown,i:number):Evidence=>{const e=raw&&typeof raw==="object"?raw as Record<string,unknown>:{};return{index:Number(e.index)||i+1,title:String(e.title||"资料").slice(0,240),locator:String(e.locator||"").slice(0,240),text:String(e.text||"").slice(0,8000)}}).filter((e:Evidence)=>e.text.trim().length>0);
 if(!question||!evidence.length)return NextResponse.json({error:"请先输入问题并加入相关资料。"},{status:400});
 const result=await executeSasi({kind:"knowledge",action:"answer",intelligence,input:{question,evidence,mode}});
 if(!result.ok)return NextResponse.json({error:result.error?.message||"这次没有整理出结果。",code:result.error?.code},{status:422});
 const payload=(result.artifacts.find((x)=>x.type==="json"&&x.name==="answer")?.value??{}) as Record<string,unknown>;
 return NextResponse.json({answer:String(payload.answer||""),intelligence,evidenceCount:evidence.length,citations:Array.isArray(payload.citations)?payload.citations:[],confidence:typeof payload.confidence==="number"?payload.confidence:null,intent:payload.intent??null,conflicts:Array.isArray(payload.conflicts)?payload.conflicts:[],sources:evidence.map((item:Evidence)=>({index:item.index,title:item.title,locator:item.locator||""})),execution:"autonomous",chargedRmb:null,chargedUsd:null,chargedCurrency:null,learningEventId:null},{headers:{"Cache-Control":"no-store"}});
}
