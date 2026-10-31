/**
 * Recognize only a real LINGXIFIELD product detail page.
 * /platform/:id was the legacy route; /:locale/platform/:id is the 9-language SEO route.
 * Invalid locales and unknown identifiers are deliberately excluded from GSC imports.
 */
export const MARKET_LOCALES=new Set(['zh','en','ja','ko','fr','de','es','pt','ar']);
export function matchGscProductPage(page,known,expectedOrigin=null){
 try{
  const u=new URL(page);
  if(u.protocol!=='https:'||u.username||u.password||u.port)return null;
  if(expectedOrigin&&u.origin!==expectedOrigin)return null;
  const match=u.pathname.match(/^\/(?:([a-z]{2})\/)?platform\/([a-z0-9][a-z0-9-]{0,79})\/?$/);
  if(!match)return null;
  const language=match[1]||'zh',platformId=match[2];
  if(!MARKET_LOCALES.has(language)||!known.has(platformId))return null;
  return {platformId,language};
 }catch{return null}
}
