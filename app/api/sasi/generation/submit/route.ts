import {NextRequest,NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";import {isSameOriginMutation} from "@/lib/sasi/request-security";import {submitLocalGeneration} from "@/lib/sasi/sovereign-generation/worker-client";
export const runtime="nodejs";export const maxDuration=30;
export async function POST(req:NextRequest){
 if(!isSameOriginMutation(req))return NextResponse.json({error:"INVALID_REQUEST_ORIGIN"},{status:403});
 const supabase=createClient();const{data:{user}}=await supabase.auth.getUser();if(!user)return NextResponse.json({error:"AUTH_REQUIRED"},{status:401});
 const body=await req.json().catch(()=>({}));const kind=body.kind==="video"?"video":body.kind==="image"?"image":null,prompt=String(body.prompt||"").trim();
 if(!kind||prompt.length<2||prompt.length>4000)return NextResponse.json({error:"INVALID_GENERATION_REQUEST"},{status:400});
 try{const result=await submitLocalGeneration({kind,prompt,ratio:["1:1","16:9","9:16"].includes(String(body.ratio))?String(body.ratio):"1:1",duration:kind==="video"?Math.max(2,Math.min(30,Number(body.duration)||6)):undefined,style:String(body.style||"")});return NextResponse.json({ok:true,result},{headers:{"Cache-Control":"no-store"}})}
 catch(e){return NextResponse.json({error:e instanceof Error?e.message:"LOCAL_GENERATION_UNAVAILABLE"},{status:503})}
}
