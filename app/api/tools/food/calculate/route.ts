import {NextResponse} from 'next/server';
// Historical paid orders are honored by the unified analysis endpoint, with one-time grant consumption.
export async function POST(){return NextResponse.json({error:'FOOD_ANALYSIS_REQUIRED',reload:true},{status:410,headers:{'Cache-Control':'no-store'}});}