import {NextRequest,NextResponse} from "next/server";
import {createAdminClient} from "@/lib/supabase/admin";
import {verifyBurnRevealToken} from "@/lib/tools/burn-link-token";
import {boundedRequestJson} from '@/lib/security/bounded-request-json';
export const runtime="nodejs";

export async function POST(req:NextRequest){
 const body=await boundedRequestJson(req,4096).catch(()=>null) as Record<string,unknown>|null;
 const id=typeof body?.id==="string"?body.id:"";
 const revealToken=typeof body?.revealToken==="string"?body.revealToken:"";
 if(!id)return NextResponse.json({error:"NOTE_ID_REQUIRED"},{status:400,headers:{"Cache-Control":"no-store"}});
 if(!verifyBurnRevealToken(id,revealToken)){
   return NextResponse.json({error:"INVALID_REVEAL_TOKEN"},{status:403,headers:{"Cache-Control":"no-store"}});
 }

 const admin=createAdminClient();
 const{data,error}=await admin.rpc("preview_burn_note",{p_id:String(id)});
 if(error){
   console.error("[burn preview]",error.code,error.message);
   return NextResponse.json({error:"NOTE_READ_FAILED"},{status:500,headers:{"Cache-Control":"no-store"}});
 }
 const row=Array.isArray(data)?data[0]:data;
 if(!row)return NextResponse.json({error:"NOTE_GONE"},{status:410,headers:{"Cache-Control":"no-store"}});

 return NextResponse.json(row,{headers:{"Cache-Control":"no-store"}});
}
