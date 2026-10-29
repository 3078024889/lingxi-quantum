import { NextRequest, NextResponse } from 'next/server';
import {entries} from '../../../../lib/catalog-store';
import {searchCatalog} from '../../../../lib/catalog-engine.mjs';
export const runtime='nodejs';
export async function GET(request:NextRequest){
 const sp=request.nextUrl.searchParams;
 const result=searchCatalog(entries,{q:sp.get('q')||'',category:sp.get('category')||'',status:sp.get('status')||'active',limit:Number(sp.get('limit')||24),cursor:Number(sp.get('cursor')||0)});
 return NextResponse.json({version:'2.5',source:'locally validated imports',dataAvailability:entries.length?'catalog_only':'no_imported_records',...result},{headers:{'Cache-Control':'public, max-age=0, s-maxage=300, stale-while-revalidate=1800'}});
}
