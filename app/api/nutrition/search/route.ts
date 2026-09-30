import { NextResponse } from "next/server";import { nutritionAdmin,cleanLimit } from "@/lib/nutrition/server";import { resolveCanonicalFood } from "@/lib/nutrition/canonical-food";
export const runtime="nodejs";
export async function POST(req:Request){try{const b=await req.json();const raw=String(b?.query??"").trim();if(raw.length<1||raw.length>120)return NextResponse.json({error:"请输入食物名称。"}, {status:400});
const c=resolveCanonicalFood(raw),sb=nutritionAdmin();const {data,error}=await sb.rpc("search_food_compact_v1",{p_query:c.query,p_limit:cleanLimit(b?.limit)});if(error)throw error;
return NextResponse.json({canonical_key:c.key,items:(data??[]).map((x:any)=>({...x,canonical_key:c.key}))});}catch{return NextResponse.json({error:"暂时没有找到合适的食物，可以换个名称再试。"}, {status:500})}}
