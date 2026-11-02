import {NextResponse} from 'next/server';
import {findPublisher} from '../../../../../lib/market-publisher-registry';
import {marketIdParam} from '../../../../../lib/market-registry-params.mjs';
export const dynamic='force-dynamic';
export async function GET(_req:Request,{params}:{params:Promise<{id:string}>}){
 const {id:raw}=await params,id=marketIdParam(raw);
 if(!id)return NextResponse.json({error:'INVALID_PUBLISHER_ID'},{status:400});
 const publisher=findPublisher(id);
 if(!publisher)return NextResponse.json({error:'PUBLISHER_NOT_IN_CURATED_32'},{status:404});
 return NextResponse.json({scope:'curated_32_publishers',publisher,
  note:'Official publisher evidence and separately dated model/API offers; unknown company financing and unmeasured metrics are not filled with guesses.'},
  {headers:{'Cache-Control':'public, s-maxage=300','X-Content-Type-Options':'nosniff'}});
}
