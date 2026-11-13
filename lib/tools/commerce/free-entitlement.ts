import "server-only";
import {createHash} from "node:crypto";
import {createAdminClient} from "@/lib/supabase/admin";
import {trustedClientIp} from "@/lib/security/trusted-client-ip";
export type FreeEntitlementKind="image-watermark-daily"|"video-watermark-lifetime"|"video-dubbing-preview";

function verifiedSalt(){
 // Preserve the existing hash algorithm and previously issued entitlement
 // hashes. Never permit a publicly guessable hard-coded fallback in prod.
 const key=process.env.LINGXIFIELD_PRIVACY_HASH_SECRET||process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!key||key.length<32)throw Error("ENTITLEMENT_HASH_SECRET_MISSING");
 return key;
}
function hash(ip:string){
 return createHash("sha256").update(`${verifiedSalt()}:${ip}`).digest("hex");
}
export async function claimFreeEntitlement(req:Request,userId:string,kind:FreeEntitlementKind){
 const clientIp=trustedClientIp(req);
 // Unknown IP must not become a global bucket shared across unrelated users.
 if(clientIp==="unknown")return{ok:false as const,error:"ENTITLEMENT_UNAVAILABLE"};
 let ipHash:string;
 try{ipHash=hash(clientIp)}catch{return{ok:false as const,error:"ENTITLEMENT_UNAVAILABLE"}}
 const admin=createAdminClient();
 const {data,error}=await admin.rpc("claim_tool_free_entitlement",{
  p_user_id:userId,p_tool_key:kind,p_ip_hash:ipHash,
  p_usage_day:new Date().toISOString().slice(0,10)
 });
 if(error){console.error("[tool-free-entitlement]",error.code,error.message);return{ok:false as const,error:"ENTITLEMENT_UNAVAILABLE"}}
 return data===true?{ok:true as const}:{ok:false as const,error:"FREE_ENTITLEMENT_USED"};
}
