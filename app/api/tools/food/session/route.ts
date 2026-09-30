import {createHash} from "crypto";
import {NextRequest,NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
import {createAdminClient} from "@/lib/supabase/admin";
import {isSameOriginMutation} from "@/lib/sasi/request-security";
import {enforceAbuseGuard} from "@/lib/security/abuse-guard";
import {foodRequestIpHash} from "@/lib/tools/food/request-identity";
export const runtime="nodejs";
const MAX=12*1024*1024,MAX_FILES=20;
function validImage(b:Buffer,t:string){
 if(b.length<12)return false;
 if(t==="image/jpeg")return b[0]===0xff&&b[1]===0xd8&&b[2]===0xff;
 if(t==="image/png")return b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
 if(t==="image/webp")return b.subarray(0,4).toString()==="RIFF"&&b.subarray(8,12).toString()==="WEBP";
 return false;
}
export async function POST(req:NextRequest){
 if(!isSameOriginMutation(req))return NextResponse.json({error:"INVALID_REQUEST_ORIGIN"},{status:403});
 const abuse=await enforceAbuseGuard(req,{scope:"food-image-session",accountLimit:80,ipLimit:120});
 if(!abuse.ok)return NextResponse.json({error:abuse.error},{status:abuse.status});
 const fd=await req.formData();const fs=fd.getAll("images").filter((x):x is File=>x instanceof File);
 if(fs.length<1||fs.length>MAX_FILES)return NextResponse.json({error:"INVALID_IMAGE_COUNT"},{status:400});
 const hashes:string[]=[];
 for(const f of fs){if(f.size<1||f.size>MAX)return NextResponse.json({error:"IMAGE_TOO_LARGE"},{status:413});
   const b=Buffer.from(await f.arrayBuffer());if(!validImage(b,f.type))return NextResponse.json({error:"UNSUPPORTED_IMAGE"},{status:415});
   hashes.push(createHash("sha256").update(b).digest("hex"));
 }
 const sb=createClient();const{data:{user}}=await sb.auth.getUser();
 const admin=createAdminClient();const{data,error}=await admin.from("food_calorie_image_sessions_v18").insert({
   account_id:user?.id||null,ip_hash:foodRequestIpHash(req),image_hashes:hashes,photo_count:hashes.length
 }).select("id,photo_count,expires_at").single();
 if(error||!data)return NextResponse.json({error:"IMAGE_SESSION_UNAVAILABLE"},{status:503});
 return NextResponse.json({sessionId:data.id,photoCount:data.photo_count,expiresAt:data.expires_at});
}