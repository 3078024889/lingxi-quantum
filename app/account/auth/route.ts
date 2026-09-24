import { NextRequest,NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSameOriginMutation } from "@/lib/sasi/request-security";

export const runtime="nodejs";
export const dynamic="force-dynamic";

function safeNext(value:FormDataEntryValue|null){
  const v=String(value||"");
  return v.startsWith("/")&&!v.startsWith("//")&&!v.includes("\\")&&v.length<=512?v:"/products";
}
function redirect(location:string){
  return new NextResponse(null,{status:303,headers:{Location:location,"Cache-Control":"no-store"}});
}
function errorLocation(code:string,mode:string,next:string){
  const q=new URLSearchParams({auth_error:code,mode,next});
  return `/account?${q.toString()}`;
}

export async function POST(req:NextRequest){
  if(!isSameOriginMutation(req))return redirect("/account?auth_error=origin");
  const form=await req.formData().catch(()=>null);
  if(!form)return redirect("/account?auth_error=request");

  const mode=String(form.get("mode")||"signin")==="signup"?"signup":"signin";
  const email=String(form.get("email")||"").trim().toLowerCase();
  const password=String(form.get("password")||"");
  const displayName=String(form.get("displayName")||"").trim();
  const next=safeNext(form.get("next"));

  if(!/^\S+@\S+\.\S+$/.test(email))return redirect(errorLocation("email",mode,next));
  if(password.length<6)return redirect(errorLocation("password",mode,next));
  if(mode==="signup"&&(displayName.length<2||displayName.length>24))return redirect(errorLocation("name",mode,next));

  try{
    const supabase=createClient();
    if(mode==="signup"){
      const {error}=await supabase.auth.signUp({email,password,options:{data:{display_name:displayName}}});
      if(error){
        const code=/already registered|User already registered/i.test(error.message)?"registered":"auth";
        return redirect(errorLocation(code,"signup",next));
      }
      const {error:signinError}=await supabase.auth.signInWithPassword({email,password});
      if(signinError)return redirect(errorLocation("registered_signin","signin",next));
      return redirect(next);
    }

    const {error}=await supabase.auth.signInWithPassword({email,password});
    if(error){
      const code=/Invalid login credentials/i.test(error.message)?"credentials":"auth";
      return redirect(errorLocation(code,"signin",next));
    }
    return redirect(next);
  }catch{
    return redirect(errorLocation("service",mode,next));
  }
}
