import {NextRequest,NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";

export const dynamic="force-dynamic";
export async function GET(request:NextRequest,{params}:{params:{id:string}}){
 const db=createClient();
 const {data:{user}}=await db.auth.getUser();
 const reply=(body:unknown,status=200)=>NextResponse.json(body,{status,headers:{"Cache-Control":"private, no-store"}});
 if(!user)return reply({error:"AUTH_REQUIRED"},401);
 if(!/^[0-9a-f-]{36}$/i.test(params.id))return reply({error:"INVALID_PROJECT"},400);
 const {data:project,error:projectError}=await db.from("sasi_projects").select("id").eq("id",params.id).eq("user_id",user.id).maybeSingle();
 if(projectError||!project)return reply({error:"PROJECT_NOT_FOUND"},404);
 const ids=request.nextUrl.searchParams.getAll("assetId");
 if(ids.length>20||ids.some(id=>!/^[0-9a-f-]{36}$/i.test(id)))return reply({error:"INVALID_ASSETS"},400);
 if(!ids.length)return reply({documents:[]});
 const {data,error}=await db.from("sasi_assets").select("id,original_name,extracted_text").eq("user_id",user.id).eq("project_id",params.id).eq("status","ready").in("id",ids).order("created_at").limit(20);
 if(error)return reply({error:"CONTEXT_UNAVAILABLE"},503);
 let remaining=8000;
 const documents=(data??[]).flatMap(row=>{
  const text=String(row.extracted_text??"").slice(0,remaining);
  remaining-=text.length;
  return text?[{id:row.id,name:row.original_name,text,truncated:text.length<String(row.extracted_text??"").length}]:[];
 });
 return reply({documents});
}
