import { NextRequest,NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
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
  return `/account?${new URLSearchParams({auth_error:code,mode,next}).toString()}`;
}
function originOf(req:NextRequest){
  const proto=(req.headers.get("x-forwarded-proto")||"https").split(",")[0].trim();
  const host=(req.headers.get("x-forwarded-host")||req.headers.get("host")||"lingxifield.com").split(",")[0].trim();
  return `${proto}://${host}`;
}

export async function POST(req:NextRequest){
  if(!isSameOriginMutation(req)){
    return redirect("/account?auth_error=origin");
  }

  const form=await req.formData().catch(()=>null);
  if(!form)return redirect("/account?auth_error=request");

  const mode=String(form.get("mode")||"signin")==="signup"?"signup":"signin";
  const email=String(form.get("email")||"").trim().toLowerCase();
  const password=String(form.get("password")||"");
  const displayName=String(form.get("displayName")||"").trim();
  const next=safeNext(form.get("next"));

  if(!/^\S+@\S+\.\S+$/.test(email))return redirect(errorLocation("email",mode,next));
  if(password.length<8)return redirect(errorLocation("password",mode,next));
  if(mode==="signup"&&(displayName.length<2||displayName.length>24))return redirect(errorLocation("name",mode,next));

  try{
    const supabase=createClient();

    if(mode==="signup"){
      const confirmUrl=new URL("/auth/confirm",originOf(req));
      confirmUrl.searchParams.set("next",next);

      const {data,error}=await supabase.auth.signUp({
        email,
        password,
        options:{
          data:{display_name:displayName},
          emailRedirectTo:confirmUrl.toString(),
        },
      });

      if(error){
        const code=/already registered|User already registered/i.test(error.message)?"registered":"service";
        return redirect(errorLocation(code,"signup",next));
      }

      // Hosted Auth must require email confirmation. If signUp returns a live session,
      // confirmation is disabled. Fail closed and remove this just-created account so
      // an unverified email can never become a usable account by accident.
      if(data.session){
        try{
          await supabase.auth.signOut({scope:"global"});
          if(data.user?.id){
            await createAdminClient().auth.admin.deleteUser(data.user.id);
          }
        }catch{}
        return redirect(errorLocation("verification_config","signup",next));
      }

      return redirect(errorLocation("check_email","signin",next));
    }

    const {data,error}=await supabase.auth.signInWithPassword({email,password});
    if(error){
      const code=/Email not confirmed/i.test(error.message)
        ?"email_unconfirmed"
        :/Invalid login credentials/i.test(error.message)
          ?"credentials"
          :"service";
      return redirect(errorLocation(code,"signin",next));
    }

    if(!data.user?.email_confirmed_at){
      await supabase.auth.signOut({scope:"global"});
      return redirect(errorLocation("email_unconfirmed","signin",next));
    }

    return redirect(next);
  }catch{
    return redirect(errorLocation("service",mode,next));
  }
}
