import "server-only";
import {createAdminClient} from "@/lib/supabase/admin";
import {createClient} from "@/lib/supabase/server";
export async function moneyOperatorSettings(){const {data,error}=await createAdminClient().from("money_operator_settings").select("admin_emails,notify_email").eq("id",true).single();if(error||!data)throw new Error("MONEY_SETTINGS_UNAVAILABLE");return data as {admin_emails:string[];notify_email:string};}
export async function moneyAdministrator(){const {data:{user}}=await createClient().auth.getUser();if(!user?.email||!user.email_confirmed_at)return null;const settings=await moneyOperatorSettings();return settings.admin_emails.some(x=>x.toLowerCase()===user.email!.toLowerCase())?user:null;}
