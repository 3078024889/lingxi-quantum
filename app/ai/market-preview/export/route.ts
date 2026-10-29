import {NextRequest,NextResponse} from "next/server";
import {fetchCatalogPreview} from "../../../../lib/ai-discovery/catalog-preview";
import {filterMarketModels,safeMarketSort} from "../../../../lib/ai-discovery/model-market-view";
import {modelMarketCsv} from "../../../../lib/ai-discovery/market-csv";
export const dynamic="force-dynamic";
export async function GET(request:NextRequest){
 const headers={"Cache-Control":"private, no-store","X-Robots-Tag":"noindex, nofollow","X-Content-Type-Options":"nosniff"};
 if(process.env.AI_MARKET_PREVIEW_ENABLED!=="true")return NextResponse.json({error:"Preview disabled"},{status:404,headers});
 const params=request.nextUrl.searchParams;
 const q=(params.get("q")??"").slice(0,100),sort=safeMarketSort(params.get("sort")??undefined);
 const catalog=await fetchCatalogPreview();
 if(catalog.status!=="ok")return NextResponse.json({error:"Source unavailable"},{status:503,headers});
 const rows=filterMarketModels(catalog.models,q,sort,100).rows;
 const csv=modelMarketCsv(rows,catalog.observedAt!,catalog.source);
 return new NextResponse("\uFEFF"+csv,{status:200,headers:{...headers,"Content-Type":"text/csv; charset=utf-8","Content-Disposition":"attachment; filename=\"lingxifield-ai-market-preview.csv\""}});
}
