import { createHash,createHmac,randomBytes,timingSafeEqual } from "node:crypto";
import { NextRequest,NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSameOriginMutation } from "@/lib/sasi/request-security";
import { createMailboxAccessCookie,mailboxTokenHash,randomLocalPart,randomMailboxToken,tempMailConfigured,tempMailDomain,TEMP_MAIL_ACCESS_COOKIE,TEMP_MAIL_TTL_MINUTES } from "@/lib/tools/temp-mail";

export const runtime="nodejs";
const DEVICE_COOKIE="lx_tm_device",DEVICE_MAX_AGE=60*60*24*30;
const FREE_PER_DEVICE=10,FREE_PER_ACCOUNT=10,FREE_PER_IP=50;

function sha(value:string){return createHash("sha256").update(value).digest("hex")}
function clientIp(req:NextRequest){return (req.headers.get("x-forwarded-for")||req.headers.get("x-real-ip")||"unknown").split(",")[0].trim().slice(0,128)}
function secret(){return process.env.TEMP_MAIL_INGEST_SECRET?.trim()||""}
function signDevice(id:string){return createHmac("sha256",secret()).update(`lingxifield:temp-mail-device:v1:${id}`).digest("base64url")}
function validDevice(value:string|undefined){
 if(!value)return "";const dot=value.lastIndexOf(".");if(dot<1)return "";
 const id=value.slice(0,dot),sig=value.slice(dot+1);if(!/^[A-Za-z0-9_-]{20,64}$/.test(id)||!sig)return "";
 const expected=signDevice(id),a=Buffer.from(sig),b=Buffer.from(expected);
 return a.length===b.length&&timingSafeEqual(a,b)?id:"";
}
function device(req:NextRequest){
 const existing=validDevice(req.cookies.get(DEVICE_COOKIE)?.value);
 if(existing)return{id:existing,cookie:""};
 const id=randomBytes(24).toString("base64url");return{id,cookie:`${id}.${signDevice(id)}`};
}
async function rateGuard(admin:ReturnType<typeof createAdminClient>,key:string,limit:number){
 const result=await admin.rpc("privacy_rate_limit",{p_key:key,p_limit:limit,p_window_seconds:3600});
 if(result.error){console.error("[temp mail rate guard]",result.error.code,result.error.message);throw new Error("SERVICE_BUSY")}
 return result.data===true;
}

export async function POST(req:NextRequest){
 if(!isSameOriginMutation(req))return NextResponse.json({error:"REQUEST_REJECTED"},{status:403});
 if(!tempMailConfigured())return NextResponse.json({error:"SERVICE_UNAVAILABLE"},{status:503});

 const admin=createAdminClient(),dev=device(req),ip=clientIp(req);
 let userId="";
 try{const supabase=createClient();const{data:{user}}=await supabase.auth.getUser();userId=user?.id||""}catch{}

 const deviceHash=sha(`device:${dev.id}`),ipHash=sha(`ip:${ip}`),accountHash=userId?sha(`account:${userId}`):"";
 try{
   const guards=[await rateGuard(admin,`temp-mail:device:${deviceHash}`,60),await rateGuard(admin,`temp-mail:ip:${ipHash}`,120)];
   if(accountHash)guards.push(await rateGuard(admin,`temp-mail:account:${accountHash}`,60));
   if(guards.some(ok=>!ok))return NextResponse.json({error:"TOO_MANY_REQUESTS"},{status:429});
 }catch{return NextResponse.json({error:"SERVICE_BUSY"},{status:503})}

 const hashes=[deviceHash],limits=[FREE_PER_DEVICE];
 if(accountHash){hashes.push(accountHash);limits.push(FREE_PER_ACCOUNT)}
 hashes.push(ipHash);limits.push(FREE_PER_IP);

 const quota=await admin.rpc("consume_temp_mail_free_quota_multi",{p_identity_hashes:hashes,p_limits:limits});
 if(quota.error){console.error("[temp mail multi quota]",quota.error.code,quota.error.message);return NextResponse.json({error:"SERVICE_BUSY"},{status:503})}
 const q=(quota.data||{}) as {allowed?:boolean;remaining?:number};
 if(q.allowed!==true)return NextResponse.json({error:"FREE_DAILY_LIMIT_REACHED",freeDailyLimit:10},{status:429});

 for(let i=0;i<6;i++){
   const localPart=randomLocalPart(),token=randomMailboxToken(),expiresAt=new Date(Date.now()+TEMP_MAIL_TTL_MINUTES*60_000).toISOString();
   const {data,error}=await admin.from("temp_mailboxes").insert({
     local_part:localPart,token_hash:mailboxTokenHash(token),expires_at:expiresAt,
     owner_user_id:userId||null,source_kind:"single",
   }).select("id,local_part,expires_at").single();

   if(!error&&data){
     const response=NextResponse.json({
       id:data.id,address:`${data.local_part}@${tempMailDomain()}`,
       expiresAt:data.expires_at,ttlMinutes:TEMP_MAIL_TTL_MINUTES,
       freeRemaining:Math.max(0,Number(q.remaining||0)),
     });
     if(dev.cookie)response.cookies.set({name:DEVICE_COOKIE,value:dev.cookie,httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:"/",maxAge:DEVICE_MAX_AGE});
     response.cookies.set({name:TEMP_MAIL_ACCESS_COOKIE,value:createMailboxAccessCookie(data.id,token),httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:"/api/tools/temp-mail",maxAge:TEMP_MAIL_TTL_MINUTES*60});
     return response;
   }
   if(error?.code!=="23505"){console.error("[temp mail create]",error?.code,error?.message);return NextResponse.json({error:"CREATE_FAILED"},{status:500})}
 }
 return NextResponse.json({error:"PLEASE_RETRY"},{status:503});
}
