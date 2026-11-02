import {NextResponse} from 'next/server';
import experiences from '../../../../data/user-experiences.json';
type Experience={
 id:string;platformId:string;summary:string;summaryEn?:string;sourceUrl:string;
 publishedOn:string;kind:string;status:string;region:string;reviewedOn?:string
};
export const revalidate=3600;
/** Citation-backed first-person reports are NOT independent verification of quality. */
export function GET(request:Request){
 const url=new URL(request.url);
 const id=url.searchParams.get('platformId');
 const lang=url.searchParams.get('lang')||'zh';
 if(!['zh','en','ja','ko','fr','de','es','pt','ar'].includes(lang))
  return NextResponse.json({error:'INVALID_LANGUAGE'},{status:400});
 const data=(experiences as Experience[])
  .filter(x=>x.status==='verified'&&(!id||x.platformId===id))
  .map(x=>({...x,summary:lang==='zh'?x.summary:(x.summaryEn||x.summary),locale:lang==='zh'?'zh':'en'}));
 return NextResponse.json({data,count:data.length,
  disclaimer:'These are dated, cited personal user reports. The original experiences were not reproduced or generalized as current platform quality, benchmark results or population-wide ratings.'},
  {headers:{'X-Content-Type-Options':'nosniff'}});
}
