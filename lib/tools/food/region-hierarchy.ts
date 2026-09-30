export type FoodRegionCode =
 "GLOBAL"|"AFROFOODS"|"ASEANFOODS"|"CARICOMFOODS"|"CARKFOODS"|"EUROFOODS"|"LATINFOODS"|
 "NEASIAFOODS"|"MEFOODS_GULFOODS"|"NORAMFOODS"|"OCEANIAFOODS"|"SARCFOODS";

const GROUPS:Record<FoodRegionCode,string[]>={
 GLOBAL:[],
 AFROFOODS:["DZ","AO","BJ","BW","BF","BI","CM","CF","TD","CG","CI","CD","DJ","ER","SZ","ET","GA","GM","GH","KE","LS","LR","LY","MG","MW","ML","MR","MU","MA","MZ","NA","NE","NG","RW","SN","SC","SL","SO","ZA","SD","TZ","TG","TN","UG","ZM","ZW"],
 ASEANFOODS:["BN","KH","ID","LA","MY","MM","PH","SG","TH","VN"],
 CARICOMFOODS:["AI","AG","BS","BB","BZ","VG","KY","DM","GD","GY","JM","MS","KN","LC","VC","SR","TT","TC"],
 CARKFOODS:["AF","AZ","KZ","KG","TJ","TM","UZ"],
 EUROFOODS:["AL","AT","BE","BA","BG","HR","CZ","DK","FI","FR","DE","GR","HU","IS","IE","IT","XK","LT","LU","ME","NL","MK","NO","PL","PT","RO","RS","SK","SI","ES","SE","CH","TR","GB"],
 LATINFOODS:["AR","BO","BR","CL","CO","CR","CU","DO","EC","SV","GT","HN","MX","NI","PA","PY","PE","UY","VE"],
 NEASIAFOODS:["CN","HK","MO","KP","JP","MN","KR","TW"],
 MEFOODS_GULFOODS:["CY","EG","JO","LB","PS","SY","AE","BH","IQ","KW","OM","QA","SA","YE"],
 NORAMFOODS:["CA","MX","US"],
 OCEANIAFOODS:["AS","AU","CK","FJ","PF","GU","KI","MH","FM","NR","NZ","NU","MP","PW","PG","PN","WS","SB","TK","TO","TV","VU","WF"],
 SARCFOODS:["BD","BT","IN","MV","NP","PK","LK"]
};
const MAP=new Map<string,FoodRegionCode[]>();
for(const [r,codes] of Object.entries(GROUPS) as [FoodRegionCode,string[]][])for(const c of codes)MAP.set(c,[...(MAP.get(c)||[]),r]);
export function foodRegionsForCountry(country?:string|null):FoodRegionCode[]{return MAP.get(String(country||"").trim().toUpperCase())||["GLOBAL"]}
export function knownFoodCountry(country?:string|null){return MAP.has(String(country||"").trim().toUpperCase())}
export const INFOODS_REGION_COUNTRY_COUNTS=Object.fromEntries(Object.entries(GROUPS).map(([k,v])=>[k,v.length]));
export const INFOODS_COUNTRY_CODES=[...new Set(Object.values(GROUPS).flat())].sort();
