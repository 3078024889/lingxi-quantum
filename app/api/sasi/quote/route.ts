import {NextRequest,NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
import {enforceAbuseGuard} from "@/lib/security/abuse-guard";
import {isSameOriginMutation} from "@/lib/sasi/request-security";
import {sasiPaidProductionEnabled} from "@/lib/sasi/payment-gate";
import {selectSasiVideoProvider} from "@/lib/sasi/provider";
import {quoteVideoTask} from "@/lib/sasi/video-pricing";
import {hashSasiPrompt,signSasiTaskQuote} from "@/lib/sasi/task-quote";
import type {SasiQuality} from "@/lib/sasi/catalog";

export const runtime="nodejs";export const dynamic="force-dynamic";

export async function POST(request:NextRequest){
 if(!isSameOriginMutation(request))return NextResponse.json({error:"INVALID_REQUEST_ORIGIN"},{status:403});
 const supabase=createClient();const{data:{user}}=await supabase.auth.getUser();
 if(!user)return NextResponse.json({error:"AUTH_REQUIRED"},{status:401});
 const abuse=await enforceAbuseGuard(request,{scope:"sasi-managed-video-quote",userId:user.id,accountLimit:60,ipLimit:160});
 if(!abuse.ok)return NextResponse.json({error:abuse.error},{status:abuse.status});
 if(!sasiPaidProductionEnabled())return NextResponse.json({error:"SASI_MANAGED_VIDEO_NOT_READY"},{status:503});
 const body=await request.json().catch(()=>null) as Record<string,unknown>|null;
 if(!body)return NextResponse.json({error:"INVALID_JSON"},{status:400});
 const projectId=typeof body.projectId==="string"?body.projectId:"",prompt=typeof body.prompt==="string"?body.prompt.trim():"";
 if(!["16:9","9:16","1:1"].includes(String(body.aspectRatio)))return NextResponse.json({error:"UNSUPPORTED_ASPECT_RATIO"},{status:422});
 const duration=Number(body.duration),aspectRatio=body.aspectRatio as "16:9"|"9:16"|"1:1";
 const quality:SasiQuality=body.quality==="cinema"?"cinema":body.quality==="fast"?"fast":"balanced";
 if(!/^[0-9a-f-]{36}$/i.test(projectId)||prompt.length<6||prompt.length>4000||!Number.isSafeInteger(duration)||duration<4||duration>60){
   return NextResponse.json({error:"INVALID_VIDEO_REQUEST"},{status:400});
 }
 const owned=await supabase.from("sasi_projects").select("id").eq("id",projectId).eq("user_id",user.id).maybeSingle();
 if(owned.error||!owned.data)return NextResponse.json({error:"PROJECT_NOT_FOUND"},{status:404});
 const selection=selectSasiVideoProvider({quality,duration,aspectRatio});
 if(body.resolution!==undefined&&(body.resolution!=="720p"&&body.resolution!=="1080p"))return NextResponse.json({error:"UNSUPPORTED_RESOLUTION"},{status:422});
 if(!selection)return NextResponse.json({error:"NO_VERIFIED_QUALITY_ROUTE"},{status:503});
 if(body.resolution){
   const actual=selection.provider==="openai"&&quality==="cinema"?"1792x1024":quality==="cinema"?"1080p":"720p";
   if(body.resolution!==actual)return NextResponse.json({error:"UNSUPPORTED_RESOLUTION"},{status:422});
 }
 try{
   const quote=quoteVideoTask(selection,duration,Date.now(),"platform");
   const token=signSasiTaskQuote({
     userId:user.id,projectId,nodeId:null,promptHash:hashSasiPrompt(prompt),duration,quality,aspectRatio,
     provider:selection.provider,model:selection.model,amountFen:quote.amountFen,amountUsdCents:quote.amountUsdCents,
     rateVersion:quote.rateVersion,retailFenPerSecond:quote.retailFenPerSecond,skillSource:"platform",
     skillId:"sasi-managed-video-v5",expiresAt:quote.expiresAt,
   });
   return NextResponse.json({
     quoteToken:token,amountFen:quote.amountFen,amountUsdCents:quote.amountUsdCents,
     expiresAt:new Date(quote.expiresAt).toISOString(),quality,
   },{headers:{"Cache-Control":"no-store"}});
 }catch(error){
   const code=error instanceof Error?error.message:"SASI_QUOTE_FAILED";
   return NextResponse.json({error:/EXPIRED|UNAVAILABLE/.test(code)?"SASI_PRICE_NOT_READY":"SASI_QUOTE_FAILED"},{status:503});
 }
}
