import { NextRequest,NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSameOriginMutation } from "@/lib/sasi/request-security";
import { mailboxTokenHash,randomLocalPart,randomMailboxToken,tempMailConfigured,tempMailDomain,TEMP_MAIL_TTL_MINUTES } from "@/lib/tools/temp-mail";

export const runtime="nodejs";
export const maxDuration=30;

function utcDayStart(){
  const d=new Date();d.setUTCHours(0,0,0,0);return d.toISOString();
}

export async function POST(req:NextRequest){
  if(!isSameOriginMutation(req))return NextResponse.json({error:"REQUEST_REJECTED"},{status:403});
  if(!tempMailConfigured())return NextResponse.json({error:"SERVICE_UNAVAILABLE"},{status:503});

  const supabase=createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user)return NextResponse.json({error:"SIGN_IN_REQUIRED"},{status:401});

  const body=await req.json().catch(()=>null) as any;
  const count=Math.floor(Number(body?.count));
  if(!Number.isFinite(count)||count<11||count>100)return NextResponse.json({error:"BATCH_SIZE_INVALID"},{status:400});

  const admin=createAdminClient();
  const {data:pass}=await admin.from("tool_payment_quotes")
    .select("id,status,created_at")
    .eq("user_id",user.id)
    .eq("tool_id","temp-mail-day-pass")
    .eq("status","paid")
    .gte("created_at",utcDayStart())
    .order("created_at",{ascending:false})
    .limit(1)
    .maybeSingle();

  if(!pass)return NextResponse.json({error:"DAY_PASS_REQUIRED"},{status:402});

  const guard=await admin.rpc("privacy_rate_limit",{p_key:`temp-mail-batch:${user.id}`,p_limit:30,p_window_seconds:3600});
  if(guard.error){
    console.error("[temp mail batch rate guard]",guard.error.code,guard.error.message);
    return NextResponse.json({error:"SERVICE_BUSY"},{status:503});
  }
  if(guard.data!==true)return NextResponse.json({error:"TOO_MANY_REQUESTS"},{status:429});

  const output:any[]=[];
  for(let n=0;n<count;n++){
    let created=false;
    for(let retry=0;retry<5;retry++){
      const localPart=randomLocalPart(),token=randomMailboxToken();
      const expiresAt=new Date(Date.now()+TEMP_MAIL_TTL_MINUTES*60_000).toISOString();
      const {data,error}=await admin.from("temp_mailboxes").insert({
        local_part:localPart,token_hash:mailboxTokenHash(token),expires_at:expiresAt,
      }).select("id,local_part,expires_at").single();
      if(!error&&data){
        output.push({id:data.id,address:`${data.local_part}@${tempMailDomain()}`,token,expiresAt:data.expires_at});
        created=true;break;
      }
      if(error?.code!=="23505")return NextResponse.json({error:"BATCH_CREATE_FAILED"},{status:500});
    }
    if(!created)return NextResponse.json({error:"BATCH_CREATE_RETRY"},{status:503});
  }
  return NextResponse.json({mailboxes:output,count:output.length});
}
