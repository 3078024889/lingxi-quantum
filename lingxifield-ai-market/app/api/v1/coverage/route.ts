import {NextResponse} from 'next/server';
import {entries} from '../../../../lib/catalog-store';
import {marketEvidence} from '../../../../lib/market-store';
import companies from '../../../../data/company-profiles.json';
import experiences from '../../../../data/user-experiences.json';
import {coverageReport} from '../../../../lib/market-analytics.mjs';
import {searchPlatforms} from '../../../../lib/platform-repository';
import {COMPANY_EVIDENCE,COMPANY_EVIDENCE_IDS} from '../../../../lib/market-company-evidence';
export const dynamic='force-dynamic';
export function GET(){
 const counts=coverageReport({catalog:entries,companies,evidence:marketEvidence,experiences});
 const companiesWithEvidence=COMPANY_EVIDENCE_IDS.map(id=>COMPANY_EVIDENCE[id]);
 return NextResponse.json({...counts,scope:'legacy_market_metrics',collections:{curatedTools:searchPlatforms({limit:1}).total,importedSourceCatalog:entries.length,legacyCompanyProfiles:companies.length},publisherEvidence:{profiles:companiesWithEvidence.length,founding:companiesWithEvidence.filter(x=>x.founded?.source).length,headquarters:companiesWithEvidence.filter(x=>x.headquarters?.source).length,funding:companiesWithEvidence.filter(x=>x.funding?.source).length,listing:companiesWithEvidence.filter(x=>x.listing?.source).length}},{headers:{'Cache-Control':'public, s-maxage=300'}});}
