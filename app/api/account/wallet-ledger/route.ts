import {NextRequest,NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
import {createAdminClient} from "@/lib/supabase/admin";

export const runtime="nodejs";
export const dynamic="force-dynamic";

const PAGE_SIZE=50;
type Currency="CNY"|"USD";
type LedgerCursor={v:1;currency:Currency;snapshotAt:string;sasiOffset:number;aiOffset:number};
function encodeCursor(value:LedgerCursor){return Buffer.from(JSON.stringify(value)).toString("base64url");}
function decodeCursor(raw:string|null,currency:Currency):LedgerCursor|null{
 if(!raw)return null;
 if(raw.length>2048)return null;
 try{
  const value=JSON.parse(Buffer.from(raw,"base64url").toString("utf8")) as Partial<LedgerCursor>;
  if(value.v!==1||value.currency!==currency||typeof value.snapshotAt!=="string"||!Number.isFinite(Date.parse(value.snapshotAt)))return null;
  if(!Number.isSafeInteger(value.sasiOffset)||!Number.isSafeInteger(value.aiOffset))return null;
  if((value.sasiOffset as number)<0||(value.aiOffset as number)<0||(value.sasiOffset as number)>10000000||(value.aiOffset as number)>10000000)return null;
  return value as LedgerCursor;
 }catch{return null;}
}

export async function GET(req:NextRequest){
 const currencyRaw=(req.nextUrl.searchParams.get("currency")||"CNY").toUpperCase();
 if(currencyRaw!=="CNY"&&currencyRaw!=="USD")return NextResponse.json({error:"INVALID_CURRENCY"},{status:400});
 const currency=currencyRaw as Currency;
 const cursorRaw=req.nextUrl.searchParams.get("cursor");
 const cursor=decodeCursor(cursorRaw,currency);
 if(cursorRaw&&!cursor)return NextResponse.json({error:"INVALID_CURSOR"},{status:400});

 const {data:{user}}=await createClient().auth.getUser();
 if(!user)return NextResponse.json({error:"LOGIN_REQUIRED"},{status:401});

 const snapshotAt=cursor?.snapshotAt||new Date().toISOString();
 const sasiOffset=cursor?.sasiOffset||0;
 const aiOffset=cursor?.aiOffset||0;
 const admin=createAdminClient();

 const sasiQuery=currency==="CNY"
  ?admin.from("sasi_credit_ledger").select("id,kind,delta_available,available_after,reference_id,created_at").eq("user_id",user.id).lte("created_at",snapshotAt).order("created_at",{ascending:false}).order("id",{ascending:false}).range(sasiOffset,sasiOffset+PAGE_SIZE)
  :admin.from("sasi_usd_wallet_ledger").select("id,kind,delta_available_cents,available_after_cents,reference_id,created_at").eq("user_id",user.id).lte("created_at",snapshotAt).order("created_at",{ascending:false}).order("id",{ascending:false}).range(sasiOffset,sasiOffset+PAGE_SIZE);
 const aiQuery=currency==="CNY"
  ?admin.from("ai_wallet_ledger").select("id,kind,delta_available_fen,available_after_fen,reference_id,created_at").eq("user_id",user.id).lte("created_at",snapshotAt).order("created_at",{ascending:false}).order("id",{ascending:false}).range(aiOffset,aiOffset+PAGE_SIZE)
  :admin.from("ai_usd_wallet_ledger").select("id,kind,delta_cents,available_after_cents,reference_id,created_at").eq("user_id",user.id).lte("created_at",snapshotAt).order("created_at",{ascending:false}).order("id",{ascending:false}).range(aiOffset,aiOffset+PAGE_SIZE);

 const [sasi,ai]=await Promise.all([sasiQuery,aiQuery]);
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

 const merged=[...sasiRows,...aiRows].sort((a,b)=>{
  const time=Date.parse(b.created_at)-Date.parse(a.created_at);
  if(time!==0)return time;
  if(a.sourceKey!==b.sourceKey)return a.sourceKey==="sasi"?-1:1;
  return b.id.localeCompare(a.id);
 });
 const visible=merged.slice(0,PAGE_SIZE);
 const hasMore=merged.length>PAGE_SIZE;
 const consumedSasi=visible.filter(r=>r.sourceKey==="sasi").length;
 const consumedAi=visible.filter(r=>r.sourceKey==="ai").length;
 const nextCursor=hasMore?encodeCursor({
  v:1,currency,snapshotAt,
  sasiOffset:sasiOffset+consumedSasi,
  aiOffset:aiOffset+consumedAi
 }):null;
 const rows=visible.map(({sourceKey,...row})=>row);

 return NextResponse.json({
  rows,currency,size:PAGE_SIZE,hasMore,nextCursor,
  scope:"wallet_ledger_entries",complete:false
 },{headers:{"Cache-Control":"private, no-store, max-age=0"}});
}
