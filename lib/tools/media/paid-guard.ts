import "server-only";
import {createClient} from "@/lib/supabase/server";
import {createAdminClient} from "@/lib/supabase/admin";

export async function requirePaidMediaQuote(quoteId:string,toolIds:string[]){
 if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(quoteId))throw new Error("INVALID_QUOTE_ID");
 const supabase=createClient();const{data:{user}}=await supabase.auth.getUser();
 if(!user)throw new Error("LOGIN_REQUIRED");
 const admin=createAdminClient();
 const{data}=await admin.from("tool_payment_quotes").select("id,user_id,tool_id,status,expires_at").eq("id",quoteId).eq("user_id",user.id).maybeSingle();
 if(!data||!toolIds.includes(String(data.tool_id)))throw new Error("QUOTE_NOT_FOUND");
 if(String(data.status)!=="paid")throw new Error("QUOTE_NOT_PAID");
 return{userId:user.id,toolId:String(data.tool_id)};
}
