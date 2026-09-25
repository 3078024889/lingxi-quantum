import {NextRequest,NextResponse} from "next/server";
import {createAdminClient} from "@/lib/supabase/admin";
import {isSameOriginMutation} from "@/lib/sasi/request-security";
import {isTrustedBurnWebViewRequest,verifyBurnRevealToken} from "@/lib/tools/burn-link-token";

export const runtime="nodejs";

export async function POST(req:NextRequest){
 const{id,revealToken}=await req.json().catch(()=>({}));
 if(!id)return NextResponse.json({error:"NOTE_ID_REQUIRED"},{status:400});
 const tokenOk=verifyBurnRevealToken(String(id),String(revealToken||""));
 if(!tokenOk&&!isSameOriginMutation(req)&&!isTrustedBurnWebViewRequest(req)){
   return NextResponse.json({error:"INVALID_REQUEST_ORIGIN"},{status:403,headers:{"Cache-Control":"no-store"}});
 }

 const admin=createAdminClient();
 const{data,error}=await admin.rpc("commit_burn_note_view",{p_id:String(id)});
 if(error){
   console.error("[burn commit]",error.code,error.message);
   return NextResponse.json({error:"NOTE_COMMIT_FAILED"},{status:503,headers:{"Cache-Control":"no-store"}});
 }
 const row=Array.isArray(data)?data[0]:data;
 if(!row)return NextResponse.json({error:"NOTE_GONE"},{status:410,headers:{"Cache-Control":"no-store"}});
 return NextResponse.json({ok:true,...row},{headers:{"Cache-Control":"no-store"}});
}
