import {NextResponse} from 'next/server';
import {entries} from '../../../../../lib/catalog-store';
import rawEvidence from '../../../../../data/evidence.json';
import {catalogReadiness} from '../../../../../lib/catalog-insights.mjs';
import {searchPlatforms} from '../../../../../lib/platform-repository';
import {COMPANY_EVIDENCE_IDS} from '../../../../../lib/market-company-evidence';
export const dynamic='force-dynamic';
export function GET(){return NextResponse.json({version:'2.8',scope:'imported_source_catalog',curatedMarket:{products:searchPlatforms({limit:1}).total,publisherEvidence:COMPANY_EVIDENCE_IDS.length},...catalogReadiness(entries,rawEvidence)},{headers:{'Cache-Control':'public, s-maxage=300'}})}
