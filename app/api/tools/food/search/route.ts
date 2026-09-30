import{NextRequest,NextResponse}from"next/server";
import{createAdminClient}from"@/lib/supabase/admin";
import{searchLocalFoods}from"@/lib/tools/food/local-catalog";
import{canonicalFood}from"@/lib/tools/food/canonical";
import{normalizeFoodQuery}from"@/lib/tools/food/multilingual";
import{resolveFoodIdentity,foodSearchTerms}from"@/lib/tools/food/global-food-identity";
import{foodRegionsForCountry}from"@/lib/tools/food/region-hierarchy";
import{providersForRegions}from"@/lib/tools/food/data-provider-registry";
export const runtime="nodejs";
function publicItem(x:any,canonicalKey:string){return{food_id:Number(x.food_id),code:String(x.source_food_id||x.code||canonicalKey),name_zh:String(x.name_zh||x.name_en||""),name_en:String(x.name_en||x.description_en||x.name_zh||""),category:x.category?String(x.category):null,score:Number(x.score||1),canonical_key:canonicalKey,source:String(x.source_label||x.source_key||"Nutrition database"),nutrition_available:true,provenance:{providerId:String(x.source_key||"nutrition-db"),licenseStatus:"cleared"}}}
export async function GET(req:NextRequest){
 const u=new URL(req.url),raw=u.searchParams.get("q")?.trim()||"";if(!raw||raw.length>120)return NextResponse.json({items:[]});
 const country=(u.searchParams.get("country")||"").trim().toUpperCase(),regions=foodRegionsForCountry(country),identity=resolveFoodIdentity(raw,country);
 const normalized=normalizeFoodQuery(raw),canonical=canonicalFood(normalized),terms=foodSearchTerms(raw,country),rows:any[]=[];
 for(const term of Array.from(new Set([raw,normalized,canonical.query,...terms]))){
  for(const x of searchLocalFoods(term,12))rows.push({...x,canonical_key:identity?.food.key||canonical.key,source:"LINGXIFIELD Curated References",nutrition_available:true,provenance:{providerId:"local-curated",licenseStatus:"cleared"}});
 }
 let databaseAvailable=false;
 try{
  const admin=createAdminClient();databaseAvailable=true;
  for(const term of Array.from(new Set([identity?.food.names.en||"",canonical.query,normalized,...terms])).filter(Boolean).slice(0,12)){
   const{data,error}=await admin.rpc("search_food_compact_v1",{p_query:term,p_limit:16});
   if(!error)for(const x of data||[])rows.push(publicItem(x,identity?.food.key||canonical.key));
   if(rows.length>=36)break;
  }
 }catch(error){
  databaseAvailable=false;
  if(process.env.NODE_ENV!=="test"&&process.env.LINGXIFIELD_DEBUG==="1")console.warn("Food database enhancement unavailable");
 }
 const seen=new Set<number>();const items=rows.filter(x=>Number.isInteger(Number(x.food_id))&&!seen.has(Number(x.food_id))&&seen.add(Number(x.food_id))).slice(0,30);
 const unresolved=items.length===0&&identity?{identity:{key:identity.food.key,name_zh:identity.food.names.zh,name_en:identity.food.names.en,category:identity.food.category},nutrition_available:false,reason:"NO_CLEARED_SOURCE"}:null;
 return NextResponse.json({canonical_key:identity?.food.key||canonical.key,query:raw,normalized_query:normalized,country:country||null,regions,providers:providersForRegions(regions).map(x=>({id:x.id,label:x.label,commercialUse:x.commercialUse})),search_terms:terms,database_available:databaseAvailable,items,unresolved},{headers:{"Cache-Control":"public, max-age=60, stale-while-revalidate=300"}});
}