import "server-only";
import{createAdminClient}from"@/lib/supabase/admin";

let cached:{at:number;ok:boolean}|null=null;
const TTL=30_000;

export async function durableRuntimeAvailable(){
 if(cached&&Date.now()-cached.at<TTL)return cached.ok;
 try{
  const admin=createAdminClient();
  const [runs,steps]=await Promise.all([
   admin.from("sasi_durable_runs").select("id",{head:true,count:"exact"}).limit(1),
   admin.from("sasi_durable_step_results").select("id",{head:true,count:"exact"}).limit(1),
  ]);
  const ok=!runs.error&&!steps.error;
  cached={at:Date.now(),ok};return ok;
 }catch{
  cached={at:Date.now(),ok:false};return false;
 }
}
