import crypto from "node:crypto";
import {NextRequest,NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
import {createAdminClient} from "@/lib/supabase/admin";
import {isSameOriginMutation} from "@/lib/sasi/request-security";
import {publicPlatformSkills} from "@/lib/sasi/skill-runtime";

export const runtime="nodejs";
export const dynamic="force-dynamic";
const ALLOWED_EXT=new Set(["md","txt","json","yaml","yml"]);
const MAX_BYTES=256*1024;
function ext(name:string){return name.toLowerCase().split(".").pop()||""}
function safeName(value:string){return value.replace(/\.[^.]+$/,"").replace(/\s+/g," ").trim().slice(0,120)}

export async function GET(){
  const supabase=createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user)return NextResponse.json({platform:publicPlatformSkills(),mine:[]},{headers:{"Cache-Control":"private, no-store"}});
  const admin=createAdminClient();
  const {data,error}=await admin.from("sasi_user_skills").select("id,name,description,source_file_name,sha256,created_at,updated_at").eq("user_id",user.id).eq("is_active",true).order("updated_at",{ascending:false}).limit(50);
  if(error)return NextResponse.json({error:"SKILL_LIST_FAILED"},{status:500});
  return NextResponse.json({platform:publicPlatformSkills(),mine:data||[]},{headers:{"Cache-Control":"private, no-store"}});
}

export async function POST(req:NextRequest){
  if(!isSameOriginMutation(req))return NextResponse.json({error:"INVALID_REQUEST_ORIGIN"},{status:403});
  const supabase=createClient();const {data:{user}}=await supabase.auth.getUser();
  if(!user)return NextResponse.json({error:"LOGIN_REQUIRED"},{status:401});
  const form=await req.formData(),file=form.get("file"),requestedName=String(form.get("name")||"").trim();
  if(!(file instanceof File))return NextResponse.json({error:"SKILL_FILE_REQUIRED"},{status:400});
  if(file.size<=0||file.size>MAX_BYTES||!ALLOWED_EXT.has(ext(file.name)))return NextResponse.json({error:"SKILL_FILE_UNSUPPORTED"},{status:400});
  const content=Buffer.from(await file.arrayBuffer()).toString("utf8").replace(/\u0000/g,"").trim();
  if(!content||content.length>200000)return NextResponse.json({error:"SKILL_CONTENT_INVALID"},{status:400});
  const name=safeName(requestedName||file.name);if(!name)return NextResponse.json({error:"SKILL_NAME_REQUIRED"},{status:400});
  const description=content.split(/\r?\n/).map(x=>x.trim()).find(Boolean)?.slice(0,180)||"";
  const sha256=crypto.createHash("sha256").update(content).digest("hex");
  const admin=createAdminClient();
  const {data:existing}=await admin.from("sasi_user_skills").select("id,name,description,source_file_name,sha256,created_at,updated_at").eq("user_id",user.id).eq("sha256",sha256).maybeSingle();
  if(existing)return NextResponse.json({skill:existing,duplicate:true});
  const {data,error}=await admin.from("sasi_user_skills").insert({user_id:user.id,name,description,source_file_name:file.name,content,sha256,is_active:true}).select("id,name,description,source_file_name,sha256,created_at,updated_at").single();
  if(error||!data)return NextResponse.json({error:"SKILL_SAVE_FAILED"},{status:500});
  return NextResponse.json({skill:data},{status:201});
}

export async function DELETE(req:NextRequest){
  if(!isSameOriginMutation(req))return NextResponse.json({error:"INVALID_REQUEST_ORIGIN"},{status:403});
  const supabase=createClient();const {data:{user}}=await supabase.auth.getUser();
  if(!user)return NextResponse.json({error:"LOGIN_REQUIRED"},{status:401});
  const body=await req.json().catch(()=>null) as {id?:unknown}|null,id=String(body?.id||"");
  if(!/^[0-9a-f-]{36}$/i.test(id))return NextResponse.json({error:"INVALID_SKILL_ID"},{status:400});
  const admin=createAdminClient();const {error}=await admin.from("sasi_user_skills").update({is_active:false,updated_at:new Date().toISOString()}).eq("id",id).eq("user_id",user.id);
  if(error)return NextResponse.json({error:"SKILL_DELETE_FAILED"},{status:500});
  return NextResponse.json({ok:true});
}
