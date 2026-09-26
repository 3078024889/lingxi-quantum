import {NextRequest,NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
import {searchLocalFoods} from "@/lib/tools/food/local-catalog";

export const runtime="nodejs";

function terms(input:string){
  return Array.from(new Set(input.split(/[\s,，、;；]+/).map(x=>x.trim()).filter(Boolean))).slice(0,8);
}
function publicCandidate(item:any){
  return {
    food_id:Number(item.food_id),
    code:String(item.code||""),
    name_zh:String(item.name_zh||""),
    name_en:item.name_en?String(item.name_en):null,
    category:item.category?String(item.category):null,
    score:Number(item.score||0),
  };
}

export async function GET(req:NextRequest){
  const q=new URL(req.url).searchParams.get("q")?.trim()||"";
  if(!q||q.length>120)return NextResponse.json({items:[]});

  const supabase=createClient();
  const rows:any[]=[];
  for(const term of terms(q)){
    for(const item of searchLocalFoods(term,8))rows.push(item);
    const{data,error}=await supabase.rpc("search_food_nutrition",{p_query:term,p_limit:8});
    if(!error)for(const item of data||[])rows.push(item);
  }

  const seen=new Set<number>();
  const items=rows.filter(item=>{
    const id=Number(item.food_id);
    if(!Number.isInteger(id)||id<=0||seen.has(id))return false;
    seen.add(id);return true;
  }).slice(0,24).map(publicCandidate);

  // Search is free; nutrition numbers are intentionally returned only after a paid calculation.
  return NextResponse.json({items},{headers:{"Cache-Control":"public, max-age=60, stale-while-revalidate=300"}});
}
