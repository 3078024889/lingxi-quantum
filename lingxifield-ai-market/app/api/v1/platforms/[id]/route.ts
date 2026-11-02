import {NextResponse} from 'next/server';
import {findPlatform} from '../../../../../lib/platform-repository';

export const dynamic='force-dynamic';
export async function GET(_req:Request,{params}:{params:Promise<{id:string}>}){
 const {id}=await params;
 if(!/^[a-z0-9][a-z0-9_-]{0,99}$/i.test(id)){
  return NextResponse.json({error:'INVALID_PLATFORM_ID'},{status:400,headers:{'Cache-Control':'no-store'}});
 }
 const item=findPlatform(id);
 if(!item)return NextResponse.json({error:'PLATFORM_NOT_FOUND'},{status:404,headers:{'Cache-Control':'no-store'}});
 return NextResponse.json({item},{headers:{'Cache-Control':'public, s-maxage=120, stale-while-revalidate=120'}});
}
