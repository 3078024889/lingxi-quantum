import {NextRequest,NextResponse} from "next/server";
import {createAdminClient} from "@/lib/supabase/admin";
import {isSameOriginMutation} from "@/lib/sasi/request-security";
export const runtime="nodejs";
const TTL=new Set([10,60,1440,4320,10080]);const VIEWS=new Set([1,3,5]);const DUR=new Set([5,10,30,60]);const MODES=new Set(["once","timed","limited","fast"]);
export async function POST(req:NextRequest){
 if(!isSameOriginMutation(req))return NextResponse.json({error:"REQUEST_REJECTED"},{status:403});
 const body=await req.json().catch(()=>null) as any;if(!body)return NextResponse.json({error:"INVALID_BODY"},{status:400});
 const ciphertext=String(body.ciphertext||""),iv=String(body.iv||""),ttl=Number(body.ttlMinutes),mode=String(body.mode||"once"),maxViews=Number(body.maxViews||1),duration=body.viewDurationSeconds==null?null:Number(body.viewDurationSeconds);
 if(ciphertext.length<10||ciphertext.length>400000||iv.length<8||iv.length>100||!TTL.has(ttl)||!MODES.has(mode)||!VIEWS.has(maxViews)||(mode==="fast"&&!DUR.has(Number(duration))))return NextResponse.json({error:"INVALID_NOTE"},{status:400});
 const admin=createAdminClient();const ip=(req.headers.get("x-forwarded-for")||"unknown").split(",")[0].trim();
 const guard=await admin.rpc("privacy_rate_limit",{p_key:`burn-create:${ip}`,p_limit:40,p_window_seconds:3600});
 if(guard.error){console.error("[burn rate guard]",guard.error.code,guard.error.message);return NextResponse.json({error:"SERVICE_BUSY"},{status:503})}
 if(guard.data!==true)return NextResponse.json({error:"TOO_MANY_REQUESTS"},{status:429});
 const expiresAt=new Date(Date.now()+ttl*60000).toISOString();
 const{data,error}=await admin.from("burn_notes").insert({ciphertext,iv,expires_at:expiresAt,mode,max_views:maxViews,view_duration_seconds:mode==="fast"?duration:null}).select("id,expires_at").single();
 if(error||!data){console.error("[burn create]",error?.code,error?.message);return NextResponse.json({error:"CREATE_FAILED"},{status:500})}
 return NextResponse.json({id:data.id,expiresAt:data.expires_at});
}
