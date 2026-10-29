import {NextResponse} from 'next/server';
import {entries} from '../../../../lib/catalog-store';
import {marketEvidence} from '../../../../lib/market-store';
import companies from '../../../../data/company-profiles.json';
import experiences from '../../../../data/user-experiences.json';
import {coverageReport} from '../../../../lib/market-analytics.mjs';
export const dynamic='force-dynamic';
export function GET(){return NextResponse.json(coverageReport({catalog:entries,companies,evidence:marketEvidence,experiences}),{headers:{'Cache-Control':'public, s-maxage=300'}})}
