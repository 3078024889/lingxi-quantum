import {NextRequest,NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
import {fetchNativeArtifact} from "@/lib/sasi-kernel/compute/native-client";
export const runtime="nodejs";
export const dynamic="force-dynamic";
export const maxDuration=60;

export async function GET(req:NextRequest,{params}:{params:{id:string;artifactId:string}}){
  const {data:{user}}=await createClient().auth.getUser();
  if(!user)return NextResponse.json({error:"AUTH_REQUIRED"},{status:401});
  try{
    const response=await fetchNativeArtifact(params.id,params.artifactId,user.id,req.headers.get("range"));
    if(!response.ok)return NextResponse.json({error:"ARTIFACT_UNAVAILABLE"},{status:response.status===404?404:response.status===416?416:503});
    const headers=new Headers({"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"});
    for(const key of ["content-type","content-length","content-range","accept-ranges","content-disposition"]){
      const value=response.headers.get(key);if(value)headers.set(key,value);
    }
    return new NextResponse(response.body,{status:response.status,headers});
  }catch{return NextResponse.json({error:"ARTIFACT_UNAVAILABLE"},{status:503});}
}
