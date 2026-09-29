import { NextResponse } from "next/server";import { createClient } from "@/lib/supabase/server";
export async function GET(){try{const sb=await createClient();const {data:{user}}=await sb.auth.getUser();if(!user)return NextResponse.json({error:"请先登录。"}, {status:401});
const {data,error}=await sb.from("nutrition_meal_history").select("id,eaten_at,image_count,currency,charged_amount,foods,nutrition").order("eaten_at",{ascending:false}).limit(100);if(error)throw error;return NextResponse.json({items:data??[]});}catch{return NextResponse.json({error:"暂时无法读取饮食记录。"}, {status:500})}}
