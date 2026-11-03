import {NextResponse} from 'next/server';
export const dynamic='force-dynamic';
// Use only confirmed operator-owned addresses. Never guess support@ or info@.
// AI_MARKET_CONTACT_EMAILS may contain up to three verified @lingxifield.com mailboxes.
export async function GET(){
 const configured=(process.env.AI_MARKET_CONTACT_EMAILS||'').split(',').map(x=>x.trim().toLowerCase())
  .filter(x=>/^[a-z0-9._%+-]+@lingxifield\.com$/.test(x));
 const addresses=[...new Set([...configured,'business@lingxifield.com'])].slice(0,3);
 return NextResponse.json({addresses},{headers:{'Cache-Control':'public, s-maxage=300, stale-while-revalidate=600'}});
}
