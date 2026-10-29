import {NextRequest,NextResponse} from "next/server";
import {createClient,getServerUser} from "@/lib/supabase/server";
import {getProduct} from "@/lib/plans";
export const dynamic="force-dynamic";
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const csvSafe=(s:string)=>s.replace(/[%_,()\\]/g,"").slice(0,80);
export async function GET(req:NextRequest){
 const db=createClient();const user=await getServerUser(db);
 if(!user)return NextResponse.json({error:"LOGIN_REQUIRED"},{status:401});
 const p=req.nextUrl.searchParams;
 const page=Math.min(10000,Math.max(0,Number.parseInt(p.get("page")||"0",10)||0));
 const size=25,category=p.get("category")||"all",status=p.get("status")||"all";
 const start=p.get("start")||"",end=p.get("end")||"",term=(p.get("q")||"").trim().slice(0,80);
 if(start&&!/^\d{4}-\d{2}-\d{2}$/.test(start)||end&&!/^\d{4}-\d{2}-\d{2}$/.test(end))return NextResponse.json({error:"INVALID_DATE"},{status:400});
 let query=db.from("orders").select("id,product_id,amount_rmb,amount_usd,currency,status,provider,created_at,paid_at",{count:"exact"}).eq("user_id",user.id).is("user_deleted_at",null);
 if(start)query=query.gte("created_at",start+"T00:00:00");
 if(end)query=query.lt("created_at",new Date(Date.parse(end+"T00:00:00Z")+86400000).toISOString());
 if(["pending","paid","refunded","failed","cancelled"].includes(status))query=query.eq("status",status);
 if(category==="topup")query=query.or("product_id.like.ai-balance-%,product_id.like.ai-usd-balance-%,product_id.like.sasi-balance-%,product_id.like.sasi-usd-balance-%,product_id.like.sasi-credit-%");
 if(category==="tools")query=query.like("product_id","toolquote:%");
 if(category==="other")query=query.not("product_id","like","toolquote:%").not("product_id","like","ai-balance-%").not("product_id","like","ai-usd-balance-%").not("product_id","like","sasi-balance-%").not("product_id","like","sasi-usd-balance-%").not("product_id","like","sasi-credit-%");
 if(term){
  if(uuid.test(term))query=query.eq("id",term);
  else if(/^\d+(?:\.\d{1,2})?$/.test(term)){
   const num=Number(term);if(!Number.isFinite(num))return NextResponse.json({error:"INVALID_QUERY"},{status:400});
   query=query.or("amount_rmb.eq."+num+",amount_usd.eq."+num);
  }else{
   const cleaned=csvSafe(term);
   if(!cleaned)return NextResponse.json({rows:[],total:0,page,size},{headers:{"Cache-Control":"private,no-store"}});
   query=query.or("product_id.ilike.%"+cleaned+"%,provider.ilike.%"+cleaned+"%");
  }
 }
 const {data,error,count}=await query.order("created_at",{ascending:false}).range(page*size,page*size+size-1);
 if(error)return NextResponse.json({error:"ORDERS_SEARCH_FAILED"},{status:503});
 const rows=(data||[]).map(o=>{const product=getProduct(o.product_id);return {...o,group:product?.group??null,nameZh:product?.name??null,nameEn:product?.nameEn??null}});
 return NextResponse.json({rows,total:count??0,page,size},{headers:{"Cache-Control":"private, no-store, max-age=0"}});
}
