import {NextRequest,NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
import {createAdminClient} from "@/lib/supabase/admin";
import {enforceAbuseGuard} from "@/lib/security/abuse-guard";
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export const runtime="nodejs";export const dynamic="force-dynamic";
const noStore={"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"} as const;
export async function GET(req:NextRequest){
 const {data:{user}}=await createClient().auth.getUser();
 if(!user)return NextResponse.json({error:"LOGIN_REQUIRED"},{status:401,headers:noStore});
 const orderId=req.nextUrl.searchParams.get("orderId")||"";
 if(!UUID.test(orderId))return NextResponse.json({error:"INVALID_ORDER"},{status:400,headers:noStore});
 const abuse=await enforceAbuseGuard(req,{scope:"sasi-software-download",userId:user.id,accountLimit:25,ipLimit:100});
 if(!abuse.ok)return NextResponse.json({error:abuse.error},{status:abuse.status,headers:noStore});
 try{
  const admin=createAdminClient();
  const {data:ent,error}=await admin.from("sasi_software_entitlements")
   .select("product_id,order_id").eq("order_id",orderId).eq("user_id",user.id).maybeSingle();
  if(error)throw Error("ENTITLEMENT_QUERY_FAILED");
  if(!ent)return NextResponse.json({error:"NOT_ENTITLED"},{status:403,headers:noStore});
  const {data:pkg,error:pkgError}=await admin.from("sasi_software_packages")
   .select("bucket,object_path,sha256,sale_ready").eq("product_id",ent.product_id).single();
  if(pkgError||!pkg?.object_path||pkg.bucket!=="sasi-software-delivery")throw Error("PACKAGE_UNAVAILABLE");
  const {data:signed,error:signError}=await admin.storage.from(pkg.bucket).createSignedUrl(pkg.object_path,60);
  if(signError||!signed?.signedUrl)throw Error("FILE_NOT_READY");
  // Server-only atomic debit prevents infinite repeated access to a private package.
  const {data:receipt,error:receiptError}=await admin.rpc("sasi_claim_software_download",{p_order_id:orderId,p_user_id:user.id});
  if(receiptError)throw Error("DOWNLOAD_RECEIPT_FAILED");
  if(!receipt?.ok)return NextResponse.json({error:receipt?.error||"DOWNLOAD_NOT_ALLOWED"},{status:403,headers:noStore});
  return NextResponse.json({ok:true,downloadUrl:signed.signedUrl,sha256:pkg.sha256,expiresInSeconds:60,remaining:receipt.remaining},{headers:noStore});
 }catch{return NextResponse.json({error:"SOFTWARE_DELIVERY_NOT_READY"},{status:503,headers:noStore});}
}
