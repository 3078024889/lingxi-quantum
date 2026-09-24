import { NextRequest,NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSameOriginMutation } from "@/lib/sasi/request-security";

export const runtime="nodejs";
export async function POST(req:NextRequest){
  if(!isSameOriginMutation(req))return NextResponse.json({error:"INVALID_REQUEST_ORIGIN"},{status:403});
  const body=await req.json().catch(()=>null) as any;
  if(!body)return NextResponse.json({error:"INVALID_BODY"},{status:400});
  const mode=body.mode==="signup"?"signup":"signin";
  const email=String(body.email||"").trim().toLowerCase();
  const password=String(body.password||"");
  const displayName=String(body.displayName||"").trim();
  if(!/^\S+@\S+\.\S+$/.test(email))return NextResponse.json({error:"INVALID_EMAIL"},{status:400});
  if(password.length<6)return NextResponse.json({error:"PASSWORD_TOO_SHORT"},{status:400});
  if(mode==="signup"&&(displayName.length<2||displayName.length>24))return NextResponse.json({error:"INVALID_DISPLAY_NAME"},{status:400});

  const supabase=createClient();
  if(mode==="signup"){
    const {error}=await supabase.auth.signUp({email,password,options:{data:{display_name:displayName}}});
    if(error)return NextResponse.json({error:error.message},{status:400});
    const {error:signinError}=await supabase.auth.signInWithPassword({email,password});
    if(signinError)return NextResponse.json({registered:true,error:signinError.message},{status:409});
    return NextResponse.json({ok:true,registered:true});
  }

  const {error}=await supabase.auth.signInWithPassword({email,password});
  if(error)return NextResponse.json({error:error.message},{status:401});
  return NextResponse.json({ok:true});
}
