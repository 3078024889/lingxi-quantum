import {NextRequest,NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
import {createAdminClient} from "@/lib/supabase/admin";
import {
 advanceWalletLedgerCursor,
 decodeWalletLedgerCursor,
 encodeWalletLedgerCursor,
 mergeWalletLedgerRows,
 walletLedgerAfterFilter,
 type WalletLedgerCursor,
 type WalletLedgerCurrency
} from "@/lib/money/ledger-pagination";

export const runtime="nodejs";
export const dynamic="force-dynamic";

const PAGE_SIZE=50;

export async function GET(req:NextRequest){
 const currencyRaw=(req.nextUrl.searchParams.get("currency")||"CNY").toUpperCase();
 if(currencyRaw!=="CNY"&&currencyRaw!=="USD")return NextResponse.json({error:"INVALID_CURRENCY"},{status:400});
 const currency=currencyRaw as WalletLedgerCurrency;
 const cursorRaw=req.nextUrl.searchParams.get("cursor");
 const decodedCursor=decodeWalletLedgerCursor(cursorRaw,currency);
 if(cursorRaw&&!decodedCursor)return NextResponse.json({error:"INVALID_CURSOR"},{status:400});

 const {data:{user}}=await createClient().auth.getUser();
 if(!user)return NextResponse.json({error:"LOGIN_REQUIRED"},{status:401});

 const cursor:WalletLedgerCursor=decodedCursor??{
  v:2,currency,snapshotAt:new Date().toISOString(),sasiAfter:null,aiAfter:null
 };
 const admin=createAdminClient();

 let sasiQuery=currency==="CNY"
  ?admin.from("sasi_credit_ledger").select("id,kind,delta_available,available_after,reference_id,created_at").eq("user_id",user.id).lte("created_at",cursor.snapshotAt).order("created_at",{ascending:false}).order("id",{ascending:false})
  :admin.from("sasi_usd_wallet_ledger").select("id,kind,delta_available_cents,available_after_cents,reference_id,created_at").eq("user_id",user.id).lte("created_at",cursor.snapshotAt).order("created_at",{ascending:false}).order("id",{ascending:false});
 let aiQuery=currency==="CNY"
  ?admin.from("ai_wallet_ledger").select("id,kind,delta_available_fen,available_after_fen,reference_id,created_at").eq("user_id",user.id).lte("created_at",cursor.snapshotAt).order("created_at",{ascending:false}).order("id",{ascending:false})
  :admin.from("ai_usd_wallet_ledger").select("id,kind,delta_cents,available_after_cents,reference_id,created_at").eq("user_id",user.id).lte("created_at",cursor.snapshotAt).order("created_at",{ascending:false}).order("id",{ascending:false});

 if(cursor.sasiAfter)sasiQuery=sasiQuery.or(walletLedgerAfterFilter(cursor.sasiAfter));
 if(cursor.aiAfter)aiQuery=aiQuery.or(walletLedgerAfterFilter(cursor.aiAfter));

 const [sasi,ai]=await Promise.all([
  sasiQuery.limit(PAGE_SIZE+1),
  aiQuery.limit(PAGE_SIZE+1)
 ]);
 if(sasi.error||ai.error)return NextResponse.json({error:"LEDGER_UNAVAILABLE"},{status:503});

 const sasiRows=(sasi.data||[]).map((r:any)=>currency==="CNY"?({
  id:String(r.id),currency,kind:String(r.kind),delta_minor:Number(r.delta_available),balance_after_minor:Number(r.available_after),
  reference_id:r.reference_id?String(r.reference_id):null,created_at:String(r.created_at),source:"SASI",sourceKey:"sasi" as const
 }):({
  id:String(r.id),currency,kind:String(r.kind),delta_minor:Number(r.delta_available_cents),balance_after_minor:Number(r.available_after_cents),
  reference_id:r.reference_id?String(r.reference_id):null,created_at:String(r.created_at),source:"SASI",sourceKey:"sasi" as const
 }));
 const aiRows=(ai.data||[]).map((r:any)=>currency==="CNY"?({
  id:String(r.id),currency,kind:String(r.kind),delta_minor:Number(r.delta_available_fen),balance_after_minor:Number(r.available_after_fen),
  reference_id:r.reference_id?String(r.reference_id):null,created_at:String(r.created_at),source:"AI",sourceKey:"ai" as const
 }):({
  id:String(r.id),currency,kind:String(r.kind),delta_minor:Number(r.delta_cents),balance_after_minor:Number(r.available_after_cents),
  reference_id:r.reference_id?String(r.reference_id):null,created_at:String(r.created_at),source:"AI",sourceKey:"ai" as const
 }));

 const merged=mergeWalletLedgerRows<(typeof sasiRows)[number],(typeof aiRows)[number]>(sasiRows,aiRows);
 const visible=merged.slice(0,PAGE_SIZE);
 const hasMore=merged.length>PAGE_SIZE;
 const nextCursor=hasMore?encodeWalletLedgerCursor(advanceWalletLedgerCursor(cursor,visible)):null;
 const rows=visible.map(({sourceKey,...row})=>row);

 return NextResponse.json({
  rows,currency,size:PAGE_SIZE,hasMore,nextCursor,
  scope:"wallet_ledger_entries",complete:false
 },{headers:{"Cache-Control":"private, no-store, max-age=0"}});
}
