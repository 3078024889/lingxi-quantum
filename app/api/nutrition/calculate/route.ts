import { NextResponse } from "next/server";import { nutritionAdmin } from "@/lib/nutrition/server";
export const runtime="nodejs";
export async function POST(req:Request){try{const b=await req.json(),items=Array.isArray(b?.items)?b.items:[];if(!items.length||items.length>50)return NextResponse.json({error:"请先确认这一餐里的食物。"}, {status:400});
const clean=items.map((x:any)=>({food_id:Number(x.food_id),grams:Number(x.grams)}));if(clean.some((x:any)=>!Number.isInteger(x.food_id)||!Number.isFinite(x.grams)||x.grams<=0||x.grams>10000))return NextResponse.json({error:"请检查食物份量。"}, {status:400});
const sb=nutritionAdmin();const {data,error}=await sb.rpc("calculate_food_compact_v1",{p_items:clean});if(error)throw error;return NextResponse.json(data);}catch{return NextResponse.json({error:"这次没有计算成功，请重新尝试。"}, {status:500})}}
