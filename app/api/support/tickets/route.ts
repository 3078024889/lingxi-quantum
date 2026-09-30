import{NextRequest,NextResponse}from"next/server";
import{createAdminClient}from"@/lib/supabase/admin";
import{isSameOriginMutation}from"@/lib/sasi/request-security";
import{LINGXIFIELD_RELEASE}from"@/lib/release/version";
export const runtime="nodejs";export const dynamic="force-dynamic";
async function user(req:NextRequest){
 let admin;try{admin=createAdminClient()}catch{return null}const token=(req.headers.get("authorization")||"").replace(/^Bearer\s+/i,"");
 if(!token)return null;const{data}=await admin.auth.getUser(token);return data.user||null;
}
export async function POST(req:NextRequest){
 if(!isSameOriginMutation(req))return NextResponse.json({error:"INVALID_REQUEST_ORIGIN"},{status:403});
 const u=await user(req);if(!u)return NextResponse.json({error:"LOGIN_REQUIRED"},{status:401});
 const b=await req.json().catch(()=>null)as any;const message=String(b?.message||"").trim(),title=String(b?.title||"遇到问题").trim().slice(0,120);
 if(message.length<3||message.length>5000)return NextResponse.json({error:"INVALID_MESSAGE"},{status:400});
 const pageUrl=String(b?.pageUrl||"").slice(0,1000),route=String(b?.route||"").slice(0,300);
 const admin=createAdminClient();const{data,error}=await admin.from("lingxifield_support_tickets").insert({
  owner_id:u.id,contact:String(b?.contact||u.email||"").slice(0,300),kind:String(b?.kind||"problem").slice(0,40),title,message,
  page_url:pageUrl,route,release_version:LINGXIFIELD_RELEASE.website,mini_version:LINGXIFIELD_RELEASE.miniProgram,
  error_code:b?.errorCode?String(b.errorCode).slice(0,120):null,
  screenshot_url:b?.screenshotUrl?String(b.screenshotUrl).slice(0,1000):null,
  context:{userAgent:req.headers.get("user-agent"),viewport:b?.viewport||null,tool:b?.tool||null}
 }).select("id,status,created_at").single();
 if(error)return NextResponse.json({error:"SUBMIT_FAILED"},{status:500});
 return NextResponse.json({ok:true,ticket:data,message:"已收到。我们会从这里继续处理，你可以在账户中查看进度。"});
}
export async function GET(req:NextRequest){
 const u=await user(req);if(!u)return NextResponse.json({error:"LOGIN_REQUIRED"},{status:401});
 const admin=createAdminClient();const{data,error}=await admin.from("lingxifield_support_tickets").select("id,kind,title,message,status,created_at,updated_at,release_version").eq("owner_id",u.id).order("created_at",{ascending:false}).limit(50);
 if(error)return NextResponse.json({error:"UNAVAILABLE"},{status:500});return NextResponse.json({items:data||[]});
}