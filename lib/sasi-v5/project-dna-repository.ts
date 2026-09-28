import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { sanitizeProjectDNA } from "./project-dna";

export async function assertOwnedProject(userId:string, projectId:string) {
  const admin=createAdminClient();
  const {data,error}=await admin.from("sasi_projects").select("id,user_id").eq("id",projectId).eq("user_id",userId).maybeSingle();
  if(error) throw new Error("SASI_PROJECT_LOOKUP_FAILED");
  if(!data) throw new Error("SASI_PROJECT_NOT_FOUND");
  return data;
}

export async function loadProjectDNA(userId:string,projectId:string){
  await assertOwnedProject(userId,projectId);
  const {data,error}=await createAdminClient().from("sasi_v5_project_dna")
    .select("id,version,status,characters,style,created_at,approved_at")
    .eq("user_id",userId).eq("project_id",projectId)
    .order("version",{ascending:false}).limit(20);
  if(error) throw new Error("SASI_V5_DNA_UNAVAILABLE");
  return data??[];
}

export async function createProjectDNAVersion(input:{userId:string;projectId:string;payload:unknown;approve?:boolean}){
  await assertOwnedProject(input.userId,input.projectId);
  const admin=createAdminClient();
  const clean=sanitizeProjectDNA(input.payload);
  const current=await admin.from("sasi_v5_project_dna").select("version")
    .eq("user_id",input.userId).eq("project_id",input.projectId)
    .order("version",{ascending:false}).limit(1).maybeSingle();
  if(current.error) throw new Error("SASI_V5_DNA_VERSION_LOOKUP_FAILED");
  const version=Number(current.data?.version??0)+1;
  const status=input.approve?"approved":"draft";
  if(input.approve){
    const {error}=await admin.from("sasi_v5_project_dna").update({status:"superseded"})
      .eq("user_id",input.userId).eq("project_id",input.projectId).eq("status","approved");
    if(error) throw new Error("SASI_V5_DNA_SUPERSEDE_FAILED");
  }
  const {data,error}=await admin.from("sasi_v5_project_dna").insert({
    user_id:input.userId,project_id:input.projectId,version,status,
    characters:clean.characters,style:clean.style,
    approved_at:input.approve?new Date().toISOString():null,
  }).select("id,version,status,characters,style,created_at,approved_at").single();
  if(error||!data) throw new Error("SASI_V5_DNA_SAVE_FAILED");
  return data;
}
