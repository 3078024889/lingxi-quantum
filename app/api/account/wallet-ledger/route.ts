import {NextRequest,NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
import {createAdminClient} from "@/lib/supabase/admin";
export const runtime="nodejs";
export const dynamic="force-dynamic";
export async function GET(req:NextRequest){
 const raw=Number(req.nextUrl.searchParams.get("page")||"0");
 if(!Number.isInteger(raw)||raw<0||raw>1000)return NextResponse.json({error:"INVALID_PAGE"},{status:400});
 const page=raw,size=50,from=page*size,to=from+size;
 const {data:{user}}=await createClient().auth.getUser();
 if(!user)return NextResponse.json({error:"LOGIN_REQUIRED"},{status:401});
 const admin=createAdminClient();
 const [cny,aiUsd,sasiUsd]=await Promise.all([
  admin.from("ai_wallet_ledger").select("id,kind,delta_available_fen,available_after_fen,reference_id,created_at").eq("user_id",user.id).order("created_at",{ascending:false}).range(from,to),
  admin.from("ai_usd_wallet_ledger").select("id,kind,delta_cents,available_after_cents,reference_id,created_at").eq("user_id",user.id).order("created_at",{ascending:false}).range(from,to),
  admin.from("sasi_usd_wallet_ledger").select("id,kind,delta_available_cents,available_after_cents,reference_id,created_at").eq("user_id",user.id).order("created_at",{ascending:false}).range(from,to)
 ]);
 if(cny.error||aiUsd.error||sasiUsd.error)return NextResponse.json({error:"LEDGER_UNAVAILABLE"},{status:503});
 const rows=[
  ...(cny.data||[]).slice(0,size).map(r=>({id:r.id,currency:"CNY",kind:r.kind,delta_minor:r.delta_available_fen,balance_after_minor:r.available_after_fen,reference_id:r.reference_id,created_at:r.created_at,source:"AI"})),
  ...(aiUsd.data||[]).slice(0,size).map(r=>({id:r.id,currency:"USD",kind:r.kind,delta_minor:r.delta_cents,balance_after_minor:r.available_after_cents,reference_id:r.reference_id,created_at:r.created_at,source:"AI"})),
  ...(sasiUsd.data||[]).slice(0,size).map(r=>({id:r.id,currency:"USD",kind:r.kind,delta_minor:r.delta_available_cents,balance_after_minor:r.available_after_cents,reference_id:r.reference_id,created_at:r.created_at,source:"SASI"}))
 ].sort((a,b)=>Date.parse(b.created_at)-Date.parse(a.created_at));
 return NextResponse.json({rows,page,size,hasMore:[cny.data,aiUsd.data,sasiUsd.data].some(items=>(items||[]).length>size),scope:"wallet_ledger_entries",complete:false},{headers:{"Cache-Control":"private, no-store, max-age=0"}});
}
