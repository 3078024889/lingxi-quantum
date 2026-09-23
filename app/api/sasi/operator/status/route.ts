import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSasiOperator } from "@/lib/sasi/operator/access";
import { sasiOperatorReadiness } from "@/lib/sasi/operator/readiness";
export const runtime="nodejs";
export async function GET(){ const supabase=createClient(); const {data:{user}}=await supabase.auth.getUser(); if(!user||!isSasiOperator(user.email)) return NextResponse.json({error:"Not found."},{status:404}); const readiness=await sasiOperatorReadiness(); return NextResponse.json(readiness,{headers:{"Cache-Control":"no-store"}}); }
