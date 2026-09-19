import { NextRequest,NextResponse } from "next/server";
import {createClient} from "@/lib/supabase/server";
import {createAdminClient} from "@/lib/supabase/admin";
import {isSameOriginMutation} from "@/lib/sasi/request-security";
import {MEMORY_NODE_TYPE,MEMORY_UUID,parseMemory,memoryFamily} from "@/lib/sasi/project-memory";
import {loadProjectMemory} from "@/lib/sasi/load-project-memory";
export const dynamic="force-dynamic";

async function owner(id:string) {
  const db=createClient();const {data:{user}}=await db.auth.getUser();
  if(!user)return {error:NextResponse.json({error:"AUTH_REQUIRED"},{status:401})} as const;
  if(!MEMORY_UUID.test(id))return {error:NextResponse.json({error:"INVALID_PROJECT_ID"},{status:400})} as const;
  const {data,error}=await db.from("sasi_projects").select("id").eq("id",id).eq("user_id",user.id).maybeSingle();
  if(error)return {error:NextResponse.json({error:"PROJECT_LOOKUP_FAILED"},{status:503})} as const;
  if(!data)return {error:NextResponse.json({error:"PROJECT_NOT_FOUND"},{status:404})} as const;
  return {db,user} as const;
}
export async function GET(_:Request,{params}:{params:{id:string}}) {
  const access=await owner(params.id);if("error" in access)return access.error;
  try{return NextResponse.json(await loadProjectMemory(access.db,access.user.id,params.id),{headers:{"Cache-Control":"no-store"}});}
  catch{return NextResponse.json({error:"MEMORY_UNAVAILABLE"},{status:503});}
}
export async function POST(request:NextRequest,{params}:{params:{id:string}}) {
  if(!isSameOriginMutation(request))return NextResponse.json({error:"INVALID_ORIGIN"},{status:403});
  const access=await owner(params.id);if("error" in access)return access.error;
  const body=await request.json().catch(()=>null);const parsed=body&&parseMemory(body);
  if(!parsed||!MEMORY_UUID.test(String(body.id??"")))return NextResponse.json({error:"INVALID_MEMORY"},{status:400});
  const admin=createAdminClient();
  const rate=await admin.rpc("rate_limit_check",{p_key:`sasi-memory:${access.user.id}`,p_limit:12,p_window_seconds:60});
  if(rate.error)return NextResponse.json({error:"MEMORY_GUARD_UNAVAILABLE"},{status:503});
  if(rate.data!==true)return NextResponse.json({error:"MEMORY_RATE_LIMITED"},{status:429});
  try{if((await loadProjectMemory(access.db,access.user.id,params.id)).events.length>=400)return NextResponse.json({error:"MEMORY_REVIEW_REQUIRED"},{status:409});}
  catch{return NextResponse.json({error:"MEMORY_READ_FAILED"},{status:503});}
  if(parsed.supersedes) {
    const {data,error}=await access.db.from("sasi_nodes").select("id").eq("id",parsed.supersedes).eq("user_id",access.user.id).eq("project_id",params.id).eq("node_type",MEMORY_NODE_TYPE).maybeSingle();
    if(error||!data||parsed.supersedes===body.id)return NextResponse.json({error:"INVALID_MEMORY_SOURCE"},{status:400});
  }
  const input={...parsed,source:"user_explicit",schemaVersion:1};
  const {error}=await admin.from("sasi_nodes").insert({id:body.id,user_id:access.user.id,project_id:params.id,node_type:MEMORY_NODE_TYPE,status:"draft",input});
  if(error?.code==="23505") {
    const {data}=await access.db.from("sasi_nodes").select("input").eq("id",body.id).eq("project_id",params.id).eq("user_id",access.user.id).eq("node_type",MEMORY_NODE_TYPE).maybeSingle();
    const same=data&&Object.entries(input).every(([key,value])=>data.input[key]===value);
    return NextResponse.json(same?{saved:true,id:body.id}:{error:"MEMORY_CONFLICT"},{status:same?200:409});
  }
  if(error)return NextResponse.json({error:"MEMORY_SAVE_FAILED"},{status:503});
  return NextResponse.json({saved:true,id:body.id},{status:201});
}
export async function DELETE(request:NextRequest,{params}:{params:{id:string}}) {
  if(!isSameOriginMutation(request))return NextResponse.json({error:"INVALID_ORIGIN"},{status:403});
  const access=await owner(params.id);if("error" in access)return access.error;
  const id=request.nextUrl.searchParams.get("memoryId")??"";
  if(!MEMORY_UUID.test(id))return NextResponse.json({error:"INVALID_MEMORY"},{status:400});
  // Erase only this project-owned memory, never a workflow node or another account.
  let ids:string[];
  try{ids=memoryFamily((await loadProjectMemory(access.db,access.user.id,params.id)).events,id);}catch{return NextResponse.json({error:"MEMORY_READ_FAILED"},{status:503});}
  const {error}=await createAdminClient().from("sasi_nodes").delete().in("id",ids).eq("project_id",params.id).eq("user_id",access.user.id).eq("node_type",MEMORY_NODE_TYPE);
  return error?NextResponse.json({error:"MEMORY_DELETE_FAILED"},{status:503}):NextResponse.json({deleted:true});
}
