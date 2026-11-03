import {NextResponse} from 'next/server';
import {marketLaunchEvidence} from '../../../../lib/market-launch-evidence';
export const dynamic='force-dynamic';
export function GET(){
 return NextResponse.json({scope:'curated-32-release-acceptance',
  checkedAt:'2026-11-02',...marketLaunchEvidence()},{headers:{'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
}
