import {NextRequest,NextResponse} from "next/server";
import {createAdminClient} from "@/lib/supabase/admin";
import {verifyBurnRevealToken} from "@/lib/tools/burn-link-token";
import {boundedRequestJson} from '@/lib/security/bounded-request-json';
import {presignR2} from '@/lib/r2-private';

export const runtime="nodejs";

export async function POST(req:NextRequest){
 const body=await boundedRequestJson(req,4096).catch(()=>null) as Record<string,unknown>|null;
 const id=typeof body?.id==="string"?body.id:"";
 const revealToken=typeof body?.revealToken==="string"?body.revealToken:"";
 if(!id)return NextResponse.json({error:"NOTE_ID_REQUIRED"},{status:400,headers:{"Cache-Control":"no-store"}});
 if(!verifyBurnRevealToken(id,revealToken)){
   return NextResponse.json({error:"INVALID_REVEAL_TOKEN"},{status:403,headers:{"Cache-Control":"no-store"}});
 }
 const viewId=typeof body?.viewId==='string'?body.viewId:'';
 if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(viewId))return NextResponse.json({error:'VIEW_ID_REQUIRED'},{status:400,headers:{'Cache-Control':'no-store'}});

 const admin=createAdminClient();
 const{data,error}=await admin.rpc("commit_burn_note_view",{p_id:id,p_view_id:viewId});
 if(error){
   console.error("[burn commit]",error.code,error.message);
   return NextResponse.json({error:"NOTE_COMMIT_FAILED"},{status:503,headers:{"Cache-Control":"no-store"}});
 }
 const row=Array.isArray(data)?data[0]:data;
 if(!row)return NextResponse.json({error:"NOTE_GONE"},{status:410,headers:{"Cache-Control":"no-store"}});
 const ttl=Math.floor((Date.parse(row.access_until)-Date.now())/1000);
 if(!Number.isFinite(ttl)||ttl<1)return NextResponse.json({error:'NOTE_GONE'},{status:410,headers:{'Cache-Control':'no-store'}});
 let files:{id:string;name:string;size:number;type:string;url:string}[]=[];
 if(row.has_files){
  const {data:items,error:filesError}=await admin.from('burn_files').select('id,object_key,original_name,size_bytes,mime_type').eq('note_id',id).order('created_at');
  if(filesError)return NextResponse.json({error:'NOTE_FILES_UNAVAILABLE'},{status:503,headers:{'Cache-Control':'no-store'}});
  files=(items||[]).map(f=>({id:String(f.id),name:String(f.original_name),size:Number(f.size_bytes),type:String(f.mime_type),url:presignR2('GET',String(f.object_key),Math.min(ttl,300))}));
 }
 return NextResponse.json({ok:true,...row,files},{headers:{"Cache-Control":"no-store"}});
}
