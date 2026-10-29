import {NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
import {createAdminClient} from "@/lib/supabase/admin";
export const runtime="nodejs";
export const dynamic="force-dynamic";
export async function GET(){
 const {data:{user}}=await createClient().auth.getUser();
 if(!user)return NextResponse.json({error:"LOGIN_REQUIRED"},{status:401});
 const admin=createAdminClient();
 const [cny,aiUsd,sasiUsd]=await Promise.all([
  admin.from("ai_wallet_ledger").select("id,kind,delta_available_fen,available_after_fen,reference_id,created_at").eq("user_id",user.id).order("created_at",{ascending:false}).limit(200),
  admin.from("ai_usd_wallet_ledger").select("id,kind,delta_cents,available_after_cents,reference_id,created_at").eq("user_id",user.id).order("created_at",{ascending:false}).limit(200),
  admin.from("sasi_usd_wallet_ledger").select("id,kind,delta_available_cents,available_after_cents,reference_id,created_at").eq("user_id",user.id).order("created_at",{ascending:false}).limit(200)
 ]);
 if(cny.error||aiUsd.error||sasiUsd.error)return NextResponse.json({error:"LEDGER_UNAVAILABLE"},{status:503});
 const rows=[
  ...(cny.data||[]).map(r=>({id:r.id,currency:"CNY",kind:r.kind,delta_minor:r.delta_available_fen,balance_after_minor:r.available_after_fen,reference_id:r.reference_id,created_at:r.created_at,source:"AI"})),
  ...(aiUsd.data||[]).map(r=>({id:r.id,currency:"USD",kind:r.kind,delta_minor:r.delta_cents,balance_after_minor:r.available_after_cents,reference_id:r.reference_id,created_at:r.created_at,source:"AI"})),
  ...(sasiUsd.data||[]).map(r=>({id:r.id,currency:"USD",kind:r.kind,delta_minor:r.delta_available_cents,balance_after_minor:r.available_after_cents,reference_id:r.reference_id,created_at:r.created_at,source:"SASI"}))
 ].sort((a,b)=>Date.parse(b.created_at)-Date.parse(a.created_at));
 return NextResponse.json({rows,scope:"wallet_ledger_entries",complete:false},{headers:{"Cache-Control":"private, no-store, max-age=0"}});
}
