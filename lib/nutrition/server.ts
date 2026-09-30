import { createClient } from "@supabase/supabase-js";
export function nutritionAdmin(){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL?.trim(),key=process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
 if(!url||!key) throw new Error("Nutrition service is temporarily unavailable.");
 return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
}
export function cleanLimit(v:unknown,d=20){const n=Number(v);return Number.isFinite(n)?Math.min(50,Math.max(1,Math.floor(n))):d}
