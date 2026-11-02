import { NextResponse } from 'next/server';
import { getPublicEvidence } from '../../../../lib/evidence-store';
export const revalidate = 3600;
export function GET(request: Request) {
 const url = new URL(request.url);
 const platformId = url.searchParams.get('platform');
 const metric = url.searchParams.get('metric');
 const records = getPublicEvidence().filter(r => (!platformId || r.platformId === platformId) && (!metric || r.metric === metric));
 return NextResponse.json({data:records,count:records.length,asOf:new Date().toISOString(),disclaimer:'No verified data = no ranking. Period, region, methodology and source are required.'});
}
