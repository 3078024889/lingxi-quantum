import{NextRequest,NextResponse}from"next/server";import{createClient}from"@/lib/supabase/server";import{createAdminClient}from"@/lib/supabase/admin";import{isSameOriginMutation}from"@/lib/sasi/request-security";
export const runtime="nodejs";export const dynamic="force-dynamic";
function safeNext(v:FormDataEntryValue|null){const s=String(v||"");return s.startsWith("/")&&!s.startsWith("//")&&!s.includes("\\")&&s.length<=512?s:"/products"}
function redirect(location:string){return new NextResponse(null,{status:303,headers:{Location:location,"Cache-Control":"no-store"}})}
function loc(code:string,mode:string,next:string,email=""){return`/account?${new URLSearchParams({auth_error:code,mode,next,...(email?{email}:{})}).toString()}`}
function esc(s:string){return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]!))}
async function sendCode(email:string,code:string,name:string){
 const key=process.env.RESEND_API_KEY;if(!key)return{ok:false,reason:"RESEND_API_KEY_MISSING",id:null};
 const from=process.env.LINGXIFIELD_AUTH_FROM_EMAIL||"account@lingxifield.com";
 try{
  const r=await fetch("https://api.resend.com/emails",{method:"POST",headers:{authorization:`Bearer ${key}`,"content-type":"application/json","Idempotency-Key":`account-signup/${email}/${code}`},body:JSON.stringify({from,to:[email],subject:`${code} · 灵犀场邮箱验证码`,html:`<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:28px"><div style="font-size:12px;color:#888;letter-spacing:.12em">LINGXIFIELD</div><h2 style="margin:14px 0">验证你的邮箱</h2><p>${esc(name||"你好")}，欢迎来到灵犀场。</p><p>请回到注册页面输入下面的验证码：</p><div style="font-size:34px;font-weight:700;letter-spacing:.18em;padding:18px 0">${esc(code)}</div><p style="color:#777;font-size:13px">如果不是你本人发起注册，可以忽略这封邮件。</p></div>`})});
  const body=await r.json().catch(()=>({}));
  if(!r.ok)return{ok:false,reason:String(body?.message||body?.name||`HTTP_${r.status}`).slice(0,180),id:null};
  const id=String(body?.id||"").trim();
  return id?{ok:true,reason:"",id}:{ok:false,reason:"RESEND_ACCEPTED_WITHOUT_ID",id:null};
 }catch(e:any){return{ok:false,reason:String(e?.message||"SEND_FAILED").slice(0,180),id:null}}
}
export async function POST(req:NextRequest){
 if(!isSameOriginMutation(req))return redirect("/account?auth_error=origin");
 const f=await req.formData().catch(()=>null);if(!f)return redirect("/account?auth_error=request");
 const mode=String(f.get("mode")||"signin"),email=String(f.get("email")||"").trim().toLowerCase(),next=safeNext(f.get("next"));
 if(!/^\S+@\S+\.\S+$/.test(email))return redirect(loc("email",mode,next,email));
 try{
  const supabase=createClient();
  if(mode==="verify"){
   const token=String(f.get("token")||"").replace(/\D/g,"");
   if(!/^\d{6,8}$/.test(token))return redirect(loc("code_invalid","verify",next,email));
   const{error}=await supabase.auth.verifyOtp({email,token,type:"email"});
   return error?redirect(loc("code_invalid","verify",next,email)):redirect(next);
  }
  const password=String(f.get("password")||"");if(password.length<8)return redirect(loc("password",mode,next,email));
  if(mode==="signup"){
   const displayName=String(f.get("displayName")||"").trim();if(displayName.length<2||displayName.length>24)return redirect(loc("name","signup",next,email));
   const admin=createAdminClient();
   const{data,error}=await admin.auth.admin.generateLink({type:"signup",email,password,options:{data:{display_name:displayName}}});
   if(error){const c=/already|registered|exists/i.test(error.message)?"registered":"service";return redirect(loc(c,"signup",next,email))}
   const otp=String((data.properties as any)?.email_otp||"");
   if(!/^\d{6,8}$/.test(otp)){if(data.user?.id)await admin.auth.admin.deleteUser(data.user.id).catch(()=>{});return redirect(loc("service","signup",next,email))}
   const sent=await sendCode(email,otp,displayName);
   if(!sent.ok){
    // Critical repair: do NOT delete the Supabase user after generateLink.
    // generateLink can invalidate/recreate the OTP lifecycle; deleting here made an accepted mail unusable
    // and made immediate retries race against auth state.
    console.error("LINGXIFIELD_AUTH_EMAIL_DELIVERY_FAILED",{provider:"resend",reason:sent.reason,emailDomain:email.split("@")[1]||""});
    return redirect(loc("email_delivery","signup",next,email));
   }
   return redirect(loc("code_sent","verify",next,email));
  }
  const{data,error}=await supabase.auth.signInWithPassword({email,password});
  if(error){const c=/Email not confirmed/i.test(error.message)?"email_unconfirmed":/Invalid login credentials/i.test(error.message)?"credentials":"service";return redirect(loc(c,"signin",next,email))}
  if(!data.user?.email_confirmed_at){await supabase.auth.signOut({scope:"global"});return redirect(loc("email_unconfirmed","signin",next,email))}
  return redirect(next);
 }catch(e:any){console.error("LINGXIFIELD_AUTH_ROUTE_FAILED",{mode,reason:String(e?.message||"UNKNOWN").slice(0,180)});return redirect(loc("service",mode,next,email))}
}
