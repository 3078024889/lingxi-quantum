import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSasiOperator } from "@/lib/sasi/operator/access";
import { loadSasiOperatorEvidence } from "@/lib/sasi/operator/evidence";
export const runtime="nodejs";
export async function GET(){ const supabase=createClient(); const {data:{user}}=await supabase.auth.getUser(); if(!user||!isSasiOperator(user.email)) return NextResponse.json({error:"Not found."},{status:404}); const evidence=await loadSasiOperatorEvidence(); return NextResponse.json(evidence,{headers:{"Cache-Control":"no-store"}}); }
