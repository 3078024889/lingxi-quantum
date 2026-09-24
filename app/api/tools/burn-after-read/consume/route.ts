import {NextRequest,NextResponse} from "next/server";
import {createAdminClient} from "@/lib/supabase/admin";
import {isSameOriginMutation} from "@/lib/sasi/request-security";
import {presignR2} from "@/lib/r2-private";
export const runtime="nodejs";

export async function POST(req:NextRequest){
 if(!isSameOriginMutation(req))return NextResponse.json({error:"INVALID_REQUEST_ORIGIN"},{status:403});
 const{id}=await req.json().catch(()=>({}));if(!id)return NextResponse.json({error:"NOTE_ID_REQUIRED"},{status:400});
 const admin=createAdminClient();
 const{data,error}=await admin.rpc("consume_burn_note",{p_id:String(id)});
 if(error)return NextResponse.json({error:"NOTE_READ_FAILED"},{status:500});
 const row=Array.isArray(data)?data[0]:data;if(!row)return NextResponse.json({error:"NOTE_GONE"},{status:410});
 let files:any[]=[];
 if(row.has_files){
   const {data:items}=await admin.from("burn_files").select("id,object_key,original_name,size_bytes,mime_type").eq("note_id",String(id)).order("created_at");
   files=(items||[]).map((f:any)=>({
     id:f.id,name:f.original_name,size:f.size_bytes,type:f.mime_type,
     url:presignR2("GET",f.object_key,300)
   }));
 }
 return NextResponse.json({...row,files});
}
