import {NextResponse} from 'next/server';
// Older cached clients must reload into the shared, metered analysis flow.
export async function POST(){return NextResponse.json({error:'FOOD_ANALYSIS_REQUIRED',reload:true},{status:410,headers:{'Cache-Control':'no-store'}});}