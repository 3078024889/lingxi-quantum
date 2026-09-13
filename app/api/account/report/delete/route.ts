import {NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
import {createAdminClient} from "@/lib/supabase/admin";
const tables:Record<string,string>={lifemap:"life_map_submissions",relationship:"relationship_submissions",qian:"qian_submissions",mirror:"tarot_reading_submissions",resilience:"resilience_submissions",romance:"romance_submissions",daily:"daily_tide_submissions",wealth:"wealth_submissions",archetype:"mini_dendrite_assessments"};
export async function POST(req:Request){
 const origin=req.headers.get("origin");if(origin&&origin!==new URL(req.url).origin)return NextResponse.json({error:"请求来源不匹配"},{status:403});
 const {data:{user}}=await createClient().auth.getUser();if(!user)return NextResponse.json({error:"请先登录"},{status:401});
 let body;try{body=await req.json()}catch{return NextResponse.json({error:"请求格式有误"},{status:400})}
 const table=typeof body?.kind==="string"&&Object.prototype.hasOwnProperty.call(tables,body.kind)?tables[body.kind]:null;
 if(!table||typeof body?.id!=="string"||!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(body.id))return NextResponse.json({error:"报告类型或编号有误"},{status:400});
 let query=createAdminClient().from(table).delete().eq("id",body.id).eq("user_id",user.id);
 if(body.kind==="archetype")query=query.eq("product_id","life-archetype");
 const {data,error}=await query.select("id");
 if(error)return NextResponse.json({error:"删除失败，请稍后重试"},{status:500});
 if(!data?.length)return NextResponse.json({error:"报告不存在或不属于当前账户"},{status:404});
 return NextResponse.json({ok:true});
}
