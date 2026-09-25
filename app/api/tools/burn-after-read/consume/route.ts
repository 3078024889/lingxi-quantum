import {NextRequest,NextResponse} from "next/server";
import {createAdminClient} from "@/lib/supabase/admin";
import {isSameOriginMutation} from "@/lib/sasi/request-security";
import {presignR2} from "@/lib/r2-private";
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
 const{data,error}=await admin.rpc("preview_burn_note",{p_id:String(id)});
 if(error){
   console.error("[burn preview]",error.code,error.message);
   return NextResponse.json({error:"NOTE_READ_FAILED"},{status:500,headers:{"Cache-Control":"no-store"}});
 }
 const row=Array.isArray(data)?data[0]:data;
 if(!row)return NextResponse.json({error:"NOTE_GONE"},{status:410,headers:{"Cache-Control":"no-store"}});

 let files:{id:string;name:string;size:number;type:string;url:string}[]=[];
 if(row.has_files){
   const {data:items,error:filesError}=await admin.from("burn_files")
     .select("id,object_key,original_name,size_bytes,mime_type")
     .eq("note_id",String(id))
     .order("created_at");
   if(filesError){
     console.error("[burn preview files]",filesError.code,filesError.message);
     return NextResponse.json({error:"NOTE_READ_FAILED"},{status:500,headers:{"Cache-Control":"no-store"}});
   }
   files=(items||[]).map((f)=>({
     id:String(f.id),name:String(f.original_name),size:Number(f.size_bytes),type:String(f.mime_type),
     url:presignR2("GET",String(f.object_key),300)
   }));
 }
 return NextResponse.json({...row,files},{headers:{"Cache-Control":"no-store"}});
}
