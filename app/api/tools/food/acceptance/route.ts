import {NextRequest,NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
import {isSameOriginMutation} from "@/lib/sasi/request-security";
import {boundedRequestJson} from "@/lib/security/bounded-request-json";
import {enforceAbuseGuard} from "@/lib/security/abuse-guard";
import {parseFoodGroups} from "@/lib/tools/food/analysis-input";
import {resolveFoodMeal} from "@/lib/tools/food/analysis-server";
export const runtime="nodejs";
export async function POST(req:NextRequest){
 const reply=(body:unknown,status=200)=>NextResponse.json(body,{status,headers:{"Cache-Control":"private, no-store"}});
 if(process.env.NEXT_PUBLIC_TOOL_FREE_ACCEPTANCE!=="true")return reply({error:"ACCEPTANCE_CLOSED"},404);
 if(!isSameOriginMutation(req))return reply({error:"INVALID_REQUEST_ORIGIN"},403);
 const {data:{user},error}=await createClient().auth.getUser();
 if(error||!user)return reply({error:"LOGIN_REQUIRED"},401);
 const body=await boundedRequestJson(req,32000).catch(()=>null) as {groups?:unknown}|null;
 let groups;
 try{groups=parseFoodGroups(body?.groups);}catch{return reply({error:"INVALID_FOOD_ITEMS"},400);}
 const guard=await enforceAbuseGuard(req,{scope:"food-free-acceptance",userId:user.id,accountLimit:120,ipLimit:240});
 if(!guard.ok)return reply({error:guard.error},guard.status);
 try{return reply(await resolveFoodMeal(groups.flat()));}
 catch{return reply({error:"FOOD_UNAVAILABLE"},503);}
}
