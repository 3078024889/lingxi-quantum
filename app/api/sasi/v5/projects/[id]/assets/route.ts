import {NextRequest,NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
import {createAdminClient} from "@/lib/supabase/admin";
import {isSameOriginMutation} from "@/lib/sasi/request-security";
import {assertOwnedProject} from "@/lib/sasi-v5/project-dna-repository";
export const runtime="nodejs";export const dynamic="force-dynamic";
async function user(){const{data:{user}}=await createClient().auth.getUser();return user}
export async function GET(_:NextRequest, props:{params: Promise<{id:string}>}) {
 const params = await props.params;
 const u=await user();if(!u)return NextResponse.json({error:"AUTH_REQUIRED"},{status:401});
 try{await assertOwnedProject(u.id,params.id);const{data,error}=await createAdminClient().from("sasi_v5_approved_assets").select("id,asset_type,label,version,status,artifact_id,asset_id,external_ref,metadata,created_at,approved_at").eq("user_id",u.id).eq("project_id",params.id).order("created_at",{ascending:false});if(error)throw error;return NextResponse.json({assets:data??[]},{headers:{"Cache-Control":"no-store"}})}catch{return NextResponse.json({error:"ASSET_LIBRARY_UNAVAILABLE"},{status:404})}
}
export async function POST(request:NextRequest, props:{params: Promise<{id:string}>}) {
 const params = await props.params;
 if(!isSameOriginMutation(request))return NextResponse.json({error:"INVALID_REQUEST_ORIGIN"},{status:403});
 const u=await user();if(!u)return NextResponse.json({error:"AUTH_REQUIRED"},{status:401});
 const body=await request.json().catch(()=>null) as Record<string,unknown>|null;if(!body)return NextResponse.json({error:"INVALID_JSON"},{status:400});
 try{
  await assertOwnedProject(u.id,params.id);const admin=createAdminClient();
  const type=String(body.assetType??"").slice(0,40),label=String(body.label??"").trim().slice(0,160);
  if(!/^(character|scene|brand|product|voice|logo|reference|other)$/.test(type)||!label)return NextResponse.json({error:"INVALID_ASSET"},{status:400});
  const prior=await admin.from("sasi_v5_approved_assets").select("version").eq("user_id",u.id).eq("project_id",params.id).eq("asset_type",type).eq("label",label).order("version",{ascending:false}).limit(1).maybeSingle();
  const version=Number(prior.data?.version??0)+1;
  if(body.approve===true)await admin.from("sasi_v5_approved_assets").update({status:"superseded"}).eq("user_id",u.id).eq("project_id",params.id).eq("asset_type",type).eq("label",label).eq("status","approved");
  const{data,error}=await admin.from("sasi_v5_approved_assets").insert({user_id:u.id,project_id:params.id,asset_type:type,label,version,status:body.approve===true?"approved":"draft",artifact_id:typeof body.artifactId==="string"?body.artifactId:null,asset_id:typeof body.assetId==="string"?body.assetId:null,external_ref:typeof body.externalRef==="string"?body.externalRef.slice(0,500):null,metadata:body.metadata&&typeof body.metadata==="object"?body.metadata:{},approved_at:body.approve===true?new Date().toISOString():null}).select("*").single();
  if(error)throw error;return NextResponse.json({asset:data},{status:201});
 }catch{return NextResponse.json({error:"ASSET_SAVE_FAILED"},{status:503})}
}
