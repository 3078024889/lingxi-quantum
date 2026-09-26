import { type EmailOtpType } from "@supabase/supabase-js";
import { NextRequest,NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime="nodejs";
export const dynamic="force-dynamic";

function safeNext(v:string|null){
  return v&&v.startsWith("/")&&!v.startsWith("//")&&!v.includes("\\")&&v.length<=512?v:"/products";
}
function go(req:NextRequest,path:string){
  const url=req.nextUrl.clone();
  url.pathname=path;
  url.search="";
  return NextResponse.redirect(url,303);
}

export async function GET(req:NextRequest){
  const next=safeNext(req.nextUrl.searchParams.get("next"));
  const code=req.nextUrl.searchParams.get("code");
  const tokenHash=req.nextUrl.searchParams.get("token_hash");
  const type=req.nextUrl.searchParams.get("type") as EmailOtpType|null;
  const supabase=createClient();

  if(code){
    const {error}=await supabase.auth.exchangeCodeForSession(code);
    if(!error)return go(req,next);
  }

  if(tokenHash&&type){
    const {error}=await supabase.auth.verifyOtp({token_hash:tokenHash,type});
    if(!error)return go(req,next);
  }

  const url=req.nextUrl.clone();
  url.pathname="/account";
  url.search="";
  url.searchParams.set("auth_error","confirmation_failed");
  return NextResponse.redirect(url,303);
}
