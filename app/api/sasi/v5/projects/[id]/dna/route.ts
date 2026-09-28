import {NextRequest,NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
import {isSameOriginMutation} from "@/lib/sasi/request-security";
import {createProjectDNAVersion,loadProjectDNA} from "@/lib/sasi-v5/project-dna-repository";

export const runtime="nodejs";export const dynamic="force-dynamic";

async function user(){
  const{data:{user}}=await createClient().auth.getUser();
  return user;
}
export async function GET(_:NextRequest, props:{params: Promise<{id:string}>}) {
  const params = await props.params;
  const u=await user();if(!u)return NextResponse.json({error:"AUTH_REQUIRED"},{status:401});
  try{return NextResponse.json({versions:await loadProjectDNA(u.id,params.id)},{headers:{"Cache-Control":"no-store"}})}
  catch(e){return NextResponse.json({error:e instanceof Error?e.message:"SASI_V5_DNA_UNAVAILABLE"},{status:404})}
}
export async function POST(request:NextRequest, props:{params: Promise<{id:string}>}) {
  const params = await props.params;
  if(!isSameOriginMutation(request))return NextResponse.json({error:"INVALID_REQUEST_ORIGIN"},{status:403});
  const u=await user();if(!u)return NextResponse.json({error:"AUTH_REQUIRED"},{status:401});
  const body=await request.json().catch(()=>null) as Record<string,unknown>|null;
  if(!body)return NextResponse.json({error:"INVALID_JSON"},{status:400});
  try{
    const version=await createProjectDNAVersion({userId:u.id,projectId:params.id,payload:body,approve:body.approve===true});
    return NextResponse.json({version},{status:201});
  }catch(e){
    const code=e instanceof Error?e.message:"SASI_V5_DNA_SAVE_FAILED";
    return NextResponse.json({error:code},{status:/NOT_FOUND/.test(code)?404:503});
  }
}
