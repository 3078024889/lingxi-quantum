import {NextResponse} from 'next/server';
import {entries} from '../../../../../lib/catalog-store';
import {catalogDetail} from '../../../../../lib/catalog-quality.mjs';
export const dynamic='force-dynamic';
export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){
 const {id}=await params;
 const item=catalogDetail(entries,id);
 if(!item)return NextResponse.json({error:'CATALOG_ENTRY_NOT_FOUND',dataAvailability:'no_verified_entry'},{status:404,headers:{'Cache-Control':'no-store'}});
 return NextResponse.json({version:'2.7',item,verifiedMarketMetrics:false},{headers:{'Cache-Control':'public, s-maxage=300'}});
}
