import {NextRequest,NextResponse} from 'next/server';
import {createClient} from '@/lib/supabase/server';
import {LINGXIFIELD_RELEASE as R} from '@/lib/release/version';
import {accountMoneyFeed} from '@/lib/notifications/money-feed';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function GET(req:NextRequest){
 const lang=req.nextUrl.searchParams.get('lang')||'zh';
 const release={id:`website-release:${R.website}`,eventKey:`website-release:${R.website}`,kind:'announcement',version:R.website,title:lang==='zh'?R.titleZh:R.titleEn,body:lang==='zh'?R.highlightsZh.join('；'):R.highlightsEn.join('; '),createdAt:`${R.publishedAt}T00:00:00+08:00`,href:'/release',read:undefined as boolean|undefined};
 const headers={'Cache-Control':'private, no-store'};
 try{const supabase=createClient();const{data:{user}}=await supabase.auth.getUser();if(!user)return NextResponse.json({items:[release],authenticated:false},{headers});
  const feed=await accountMoneyFeed(user.id,lang);
  release.read=feed.seen.has(release.eventKey);
  return NextResponse.json({partial:feed.partial,readAvailable:feed.readAvailable,authenticated:true,items:[...feed.items,release].sort((a,b)=>Date.parse(b.createdAt)-Date.parse(a.createdAt))},{headers});
 }catch{return NextResponse.json({items:[release],partial:true},{headers});}
}
