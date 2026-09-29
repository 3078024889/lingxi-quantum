import { NextResponse } from "next/server";import { createClient } from "@/lib/supabase/server";
export async function GET(req:Request){try{const sb=await createClient();const {data:{user}}=await sb.auth.getUser();if(!user)return NextResponse.json({error:"请先登录。"}, {status:401});const days=Math.min(366,Math.max(1,Number(new URL(req.url).searchParams.get("days")||7)));
const {data,error}=await sb.rpc("nutrition_trends_v1",{p_days:days});if(error)throw error;return NextResponse.json(data);}catch{return NextResponse.json({error:"暂时无法生成饮食趋势。"}, {status:500})}}
