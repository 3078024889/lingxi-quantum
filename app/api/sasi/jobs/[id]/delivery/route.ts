import {NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
import {createAdminClient} from "@/lib/supabase/admin";
export const runtime="nodejs";export const dynamic="force-dynamic";
export async function GET(_:Request, props:{params: Promise<{id:string}>}) {
 const params = await props.params;
 const{data:{user}}=await createClient().auth.getUser();if(!user)return NextResponse.json({error:"AUTH_REQUIRED"},{status:401});
 const admin=createAdminClient();
 const{data,error}=await admin.from("sasi_deliveries").select("id,bucket_id,object_path,ai_generated,label_metadata").eq("job_id",params.id).eq("user_id",user.id).maybeSingle();
 if(error||!data)return NextResponse.json({error:"DELIVERY_NOT_FOUND"},{status:404});
 const signed=await admin.storage.from(data.bucket_id).createSignedUrl(data.object_path,300,{download:false});
 if(signed.error||!signed.data?.signedUrl)return NextResponse.json({error:"DELIVERY_LINK_FAILED"},{status:503});
 return NextResponse.json({id:data.id,url:signed.data.signedUrl,expiresIn:300,aiGenerated:data.ai_generated,label:data.label_metadata},{headers:{"Cache-Control":"no-store"}});
}
