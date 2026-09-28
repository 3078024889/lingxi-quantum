import "server-only";
import {randomUUID} from "node:crypto";
import {createAdminClient} from "@/lib/supabase/admin";
export async function recordVisualValidation(input:{
 userId:string;projectId?:string|null;taskId?:string|null;kind:"image"|"video";tier:string;passed:boolean;
 vector:Record<string,unknown>;reasons:string[];technical:Record<string,unknown>;semanticModel?:string|null;
}){
 if(process.env.SASI_V5_LEARNING_ENABLED!=="true")return{recorded:false as const};
 try{
   const{error}=await createAdminClient().from("sasi_v5_visual_validations").insert({
     id:randomUUID(),user_id:input.userId,project_id:input.projectId??null,task_id:input.taskId??null,
     kind:input.kind,quality_tier:input.tier,passed:input.passed,quality:input.vector,
     reasons:input.reasons.slice(0,20),technical:input.technical,semantic_model:input.semanticModel??null,
   });
   if(error)throw error;return{recorded:true as const};
 }catch(error){console.error("[sasi-v5] visual validation telemetry unavailable",error instanceof Error?error.message:"unknown");return{recorded:false as const}}
}
