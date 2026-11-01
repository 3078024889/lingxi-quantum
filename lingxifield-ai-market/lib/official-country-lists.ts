/**
 * Country lists transcribed from official publisher lists on 2026-10-30.
 * ISO 3166-1 alpha-2; lists represent publisher access policy, NOT network accessibility.
 * Refresh via reviewed snapshots, preserving evidence and dates. Never infer from UI language.
 */
const parse=(raw:string)=>new Set(raw.trim().split(/\s+/));
export const OFFICIAL_COUNTRY_SNAPSHOTS={
 // Official Gemini WEB app excerpt, not a complete 230+ territory transcript.
 // Never classify regions absent from this subset as unsupported.
 gemini:{
  checkedAt:'2026-10-31',isComplete:false,productScope:'Gemini web app',
  source:'https://support.google.com/gemini/answer/13575153?hl=en',
  countries:parse('HK US SG JP KR GB DE FR ES PT CA AU IN BR ID PH VN AE TW MY TH MO NZ IT NL')
 },

 // Verified Claude API countries from Anthropic's developer documentation.
 // This is a reviewed subset, not a claim that the SDK installer is geo-restricted.
 'anthropic-sdk-python':{
  checkedAt:'2026-10-31',isComplete:false,
  productScope:'Claude API access; Python SDK installation is separate',
  source:'https://platform.claude.com/docs/en/api/supported-regions',
  countries:parse('US JP SG GB AU CA DE FR KR TW IN BR AE IT ES PT NL NZ MY TH PH VN ID MX AR CL CO PE UY ZA EG NG KE GH SA QA KW IL IE BE CH SE NO DK FI PL AT CZ GR RO HU UA TR PK BD LK NP KZ KG UZ AZ AM GE AL HR RS BA ME MK BG SI SK EE LV LT LU MT CY IS JO LB IQ PS OM BH')
 },
 chatgpt:{
  checkedAt:'2026-10-30',
  source:'https://help.openai.com/en/articles/7947663-chatgpt-supported-countries',
  countries:parse('AF AX AL DZ AD AO AG AR AM AW AU AT AZ BS BH BD BB BE BZ BM BJ BT BO BA BW BR BN BG BF BI CV KH CM CA KY CF TD CL CO KM CG CD CR CI HR CY CZ DK DJ DM DO EC EG SV GQ ER EE SZ ET FO FJ FI FR GF PF TF GA GM GE DE GH GR GD GL GT GP GN GW GY HT VA HN HU IS IN ID IQ IE IL IT JM JP JO KZ KE KI KW KG LA LV LB LS LR LY LI LT LU MG MW MY MV ML MT MH MQ MR MU YT MX FM MD MC MN ME MA MZ MM NA NR NP NL NC NZ NI NE NG MK NO OM PK PW PS PA PG PY PE PH PL PT QA RE RO RW BL SH KN LC MF PM VC WS SM ST SA SN RS SC SL SG SK SI SB SO ZA KR SS ES LK SR SE CH SD SJ TW TJ TZ TH TL TG TO TT TN TR TM TV UG UA AE GB US UY UZ VU VN WF YE ZM ZW')
 },
 claude:{
  checkedAt:'2026-10-30',
  source:'https://support.claude.com/en/articles/8461763-where-can-i-access-claude',
  countries:parse('AL DZ AD AO AG AR AM AU AT AZ BS BH BD BB BE BZ BJ BT BO BA BW BR BN BG BF BI KH CM CA CV TD CL CO KM CG CR HR CZ DK DJ DM DO TL EC EG SV GQ EE SZ FJ FI FR GA GM GE DE GH GR GD GT GN GW GY HT HN HU IS IN ID IQ IE IL IT CI JM JP JO KZ KE KI KW KG LA LV LB LS LR LI LT LU MG MW MY MV ML MT MH MU MX FM MD MC MN ME MA MZ NA NR NP NL NZ NE NG MK NO OM PK PW PS PA PG PY PE PH PL PT QA CY RO RW KN LC VC WS SM ST SA SN RS SC SL SG SK SI SB ZA KR ES LK SR SE CH TW TJ TZ TH TG TO TT TN TR TM TV UG UA AE GB US UY UZ VU VA VN ZM ZW')
 }
} as const;
export function officialCountrySnapshot(productId:string){return OFFICIAL_COUNTRY_SNAPSHOTS[productId as keyof typeof OFFICIAL_COUNTRY_SNAPSHOTS];}
export function officialSupportCountries(productId:string){return [...(officialCountrySnapshot(productId)?.countries||[])].sort();}
export function officialCountryStatus(productId:string,region:string){
 const snapshot=officialCountrySnapshot(productId);
 if(!snapshot||region==='GLOBAL')return 'unknown' as const;
 return snapshot.countries.has(region)?'supported' as const:('isComplete' in snapshot && snapshot.isComplete===false)?'unknown' as const:'unsupported' as const;
}
