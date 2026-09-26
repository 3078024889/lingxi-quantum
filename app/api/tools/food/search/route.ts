import {NextRequest,NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";

export const runtime="nodejs";

function terms(input:string){
 return Array.from(new Set(input.split(/[\s,，、;；]+/).map(x=>x.trim()).filter(Boolean))).slice(0,8);
}

export async function GET(req:NextRequest){
 const q=new URL(req.url).searchParams.get("q")?.trim()||"";
 if(!q||q.length>120)return NextResponse.json({items:[]});
 const supabase=createClient();
 const qs=terms(q);
 const rows:any[]=[];
 for(const term of qs){
  const{data,error}=await supabase.rpc("search_food_nutrition",{p_query:term,p_limit:8});
  if(error)return NextResponse.json({error:"FOOD_SEARCH_UNAVAILABLE"},{status:503});
  for(const item of data||[])rows.push(item);
 }
 const seen=new Set<number>();
 const items=rows.filter(item=>{const id=Number(item.food_id);if(!Number.isInteger(id)||seen.has(id))return false;seen.add(id);return true}).slice(0,24);
 return NextResponse.json({items},{headers:{"Cache-Control":"public, max-age=60, stale-while-revalidate=300"}});
}
