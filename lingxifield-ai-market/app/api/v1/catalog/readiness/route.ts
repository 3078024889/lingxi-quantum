import {NextResponse} from 'next/server';
import {entries} from '../../../../../lib/catalog-store';
import rawEvidence from '../../../../../data/evidence.json';
import {catalogReadiness} from '../../../../../lib/catalog-insights.mjs';
export const dynamic='force-dynamic';
export function GET(){return NextResponse.json({version:'2.8',...catalogReadiness(entries,rawEvidence)},{headers:{'Cache-Control':'public, s-maxage=300'}})}
