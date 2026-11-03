import {NextRequest,NextResponse} from 'next/server';
import {entries} from '../../../../../lib/catalog-store';
import {discoverCatalog} from '../../../../../lib/catalog-insights.mjs';
export const dynamic='force-dynamic';
export function GET(req:NextRequest){const sp=req.nextUrl.searchParams;return NextResponse.json({version:'2.8',...discoverCatalog(entries,sp.get('q')||'',{limit:Number(sp.get('limit')||8)})},{headers:{'Cache-Control':'public, s-maxage=120'}})}
