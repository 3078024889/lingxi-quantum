import {NextRequest,NextResponse} from "next/server";
import {runAgentRadar} from "@/lib/sasi-v5/agent-radar-runtime";
export const runtime="nodejs";export const dynamic="force-dynamic";export const maxDuration=60;
function allowed(request:NextRequest){
 const expected=(process.env.CRON_SECRET||process.env.SASI_RADAR_CRON_SECRET||"").trim();
 if(!expected)return false;
 return request.headers.get("authorization")===`Bearer ${expected}`;
}
export async function GET(request:NextRequest){
 if(!allowed(request))return NextResponse.json({error:"NOT_FOUND"},{status:404});
 try{return NextResponse.json(await runAgentRadar(),{headers:{"Cache-Control":"no-store"}})}
 catch(error){console.error("[sasi-v5 radar]",error instanceof Error?error.message:"unknown");return NextResponse.json({error:"RADAR_UNAVAILABLE"},{status:503})}
}
