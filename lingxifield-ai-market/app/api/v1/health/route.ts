import {NextResponse} from 'next/server';
import {marketEvidence} from '../../../../lib/market-store';
export const dynamic='force-dynamic';
export function GET(){return NextResponse.json({service:'lingxifield-ai-market',status:'ok',evidenceRecords:marketEvidence.length,verifiedRecords:marketEvidence.filter(x=>x.status==='verified').length,noLiveData:marketEvidence.length===0},{headers:{'Cache-Control':'no-store'}})}
