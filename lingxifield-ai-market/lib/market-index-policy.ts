/**
 * Safe SEO release gate for dual-domain AI market.
 * The staging preview and unreviewed translations MUST never enter Google's index.
 * Enable only after approved live content + localized E2E: AI_MARKET_INDEX_READY=1
 * and AI_MARKET_INDEXED_LOCALES=zh,en,... (explicit allowlist).
 */
export const marketLocales=['zh','en','ja','ko','fr','de','es','pt','ar'] as const;
export type MarketLocale=(typeof marketLocales)[number];
/**
 * Release URL must be an owned, HTTPS production host. Do not let a preview
 * deployment publish canonical links to the unrelated LINGXIFIELD main homepage.
 * A release may target /ai subdomain or a dedicated market domain later.
 */
export function verifiedMarketOrigin(env=process.env):string|null{
 const raw=env.AI_MARKET_CANONICAL_ORIGIN;
 if(!raw)return null;
 try{
  const u=new URL(raw);
  if(u.protocol!=='https:'||u.username||u.password||u.port||u.pathname!=='/'||u.search||u.hash)return null;
  const host=u.hostname.toLowerCase();
  if(!['ai.lingxifield.com','ai.lingxifield.cn','market.lingxifield.com','market.lingxifield.cn'].includes(host))return null;
  return u.origin;
 }catch{return null}
}
export const marketCanonicalOrigin=verifiedMarketOrigin()||'https://lingxifield.com';
export function indexableMarketLocales():MarketLocale[]{
 const enabled=process.env.NODE_ENV==='production'&&process.env.AI_MARKET_INDEX_READY==='1'&&process.env.VERCEL_ENV!=='preview'&&process.env.AI_MARKET_DOMAIN_VERIFIED==='1'&&Boolean(verifiedMarketOrigin());
 if(!enabled)return [];
 const raw=(process.env.AI_MARKET_INDEXED_LOCALES||'').split(',').map(v=>v.trim()).filter(Boolean);
 return marketLocales.filter(lang=>raw.includes(lang));
}
export function mayIndexMarket(lang?:string){const allowed=indexableMarketLocales();return lang?allowed.includes(lang as MarketLocale):allowed.length>0;}
export function alternatesForMarket(lang:string){
 const languages:Record<string,string>={};
 for(const locale of indexableMarketLocales())languages[locale]=marketCanonicalOrigin+'/'+locale+'/ai';
 if(languages.zh)languages['zh-CN']=languages.zh;
 if(languages.en)languages['x-default']=languages.en;
 return {canonical:marketCanonicalOrigin+'/'+lang+'/ai',languages};
}
