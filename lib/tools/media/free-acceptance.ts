import "server-only";
import {createClient} from "@/lib/supabase/server";
import {enforceAbuseGuard} from "@/lib/security/abuse-guard";

const MEDIA_TOOLS=new Set(["video-dubbing","video-translate","audio-transcription","video-transcription","image-translator","subtitle-translate"]);
/** Free acceptance never creates a quote or consumes the daily tool allowance. */
export async function authorizeFreeMediaAcceptance(req:Request,toolSlug:string){
 if(process.env.NEXT_PUBLIC_TOOL_FREE_ACCEPTANCE!=="true")return null;
 if(!MEDIA_TOOLS.has(toolSlug))return {ok:false as const,error:"INVALID_TOOL",status:400};
 const {data:{user},error}=await createClient().auth.getUser();
 if(error||!user)return {ok:false as const,error:"LOGIN_REQUIRED",status:401};
 const guard=await enforceAbuseGuard(req,{scope:"media-acceptance",userId:user.id,accountLimit:600,ipLimit:1200});
 if(!guard.ok)return guard;
 return {ok:true as const};
}
