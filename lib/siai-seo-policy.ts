/**
 * Product-level SEO gate for SIAI embedded into LINGXIFIELD.
 * No previews, incomplete facts, unreviewed candidates or invented figures
 * in sitemap/crawler-indexable pages.
 */
export const SIAI_DETAIL_LOCALES=['zh','en','ja','ko','fr','de','es','pt','ar'] as const;
export type SiaiDetailLocale=(typeof SIAI_DETAIL_LOCALES)[number];
type RequiredFact={price?:string;free?:string;models?:string;region?:string;
 priceSource?:string;freeSource?:string;modelsSource?:string;regionSource?:string};
const sourced=(s:string|undefined)=>Boolean(s&&/^https:\/\//i.test(s));
const known=(s:string|undefined)=>Boolean(s&&s.trim()&&
 !/^(?:—|无资料|未核实|待核验|暂无|未知|以官网为准|not verified|unknown)$/i.test(s.trim()));
export function hasIndexableFacts(facts:RequiredFact|undefined|null){
 if(!facts)return false;
 return (['price','free','models','region'] as const).every(k=>
  known(facts[k])&&sourced(facts[(k+'Source') as keyof RequiredFact]));
}
/** Resolve production consistently on Vercel, Cloudflare Workers and self-hosted ECS. */
function isProductionRuntime(env:Record<string,string|undefined>){
 // Vercel preview deployments must stay noindex even though NODE_ENV is production.
 if(env.VERCEL_ENV)return env.VERCEL_ENV==="production";
 // Cloudflare Workers and ECS do not define VERCEL_ENV; Next.js production builds set NODE_ENV.
 return env.NODE_ENV==="production";
}
/** The public ranking landing page is indexable in production independently of detail-page evidence gates. */
export function siaiLandingShouldIndex(env:Record<string,string|undefined>=process.env){
 return isProductionRuntime(env);
}
export function siaiSeoEnabled(env:Record<string,string|undefined>=process.env){
 return isProductionRuntime(env)&&env.SIAI_MAIN_INDEX_READY==='1';
}
export function siaiDetailShouldIndex(facts:RequiredFact|undefined|null,
 env:Record<string,string|undefined>=process.env){
 return siaiSeoEnabled(env)&&hasIndexableFacts(facts);
}
export function siaiProductPath(lang:SiaiDetailLocale,id:string){
 return '/siai/'+lang+'/'+encodeURIComponent(id);
}
export function validSiaiDetailLang(value:string):value is SiaiDetailLocale{
 return SIAI_DETAIL_LOCALES.some(v=>v===value);
}
