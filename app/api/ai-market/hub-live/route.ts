import {NextRequest,NextResponse} from 'next/server';
import {getLiveHub} from '@/lib/ai-market/live-hub.mjs';
export const dynamic='force-dynamic';
const headers={'Cache-Control':'public, s-maxage=180, stale-while-revalidate=240','X-Robots-Tag':'noindex'};
export async function GET(req:NextRequest){
 const kind=req.nextUrl.searchParams.get('kind')||'models';
 if(kind!=='models'&&kind!=='spaces')return NextResponse.json({error:'INVALID_KIND'},{status:400,headers:{'Cache-Control':'no-store'}});
 try{return NextResponse.json(await getLiveHub(kind),{headers});}
 catch{return NextResponse.json({error:'SOURCE_UNAVAILABLE',records:[],isRanking:false},{status:503,headers:{'Cache-Control':'no-store'}});}
}
