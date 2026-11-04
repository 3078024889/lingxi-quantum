import {CHINA_HOST,CHINA_SITE,PRIMARY_HOST,PRIMARY_SITE} from "./site-domains";
import {languageAlternates} from "./global-seo";

/** Only known production hosts can select an SEO origin. Never echo arbitrary Host headers. */
function knownHost(value:string|null|undefined):string|null {
  const host=(value||"").split(",")[0].trim().toLowerCase().split(":")[0].replace(/^www\./,"");
  return host===CHINA_HOST||host===PRIMARY_HOST?host:null;
}
export function seoSiteForRequest(host:string|null|undefined,forwardedHost?:string|null):string {
  // On Vercel, the internal Host can be normalized to the primary origin while
  // X-Forwarded-Host retains the verified public .cn domain used by the visitor.
  // Both inputs are allowlisted: never echo an arbitrary incoming hostname.
  const trusted=knownHost(forwardedHost)||knownHost(host);
  return trusted===CHINA_HOST?CHINA_SITE:PRIMARY_SITE;
}
/** /siai is the verified China-language regional entry; other languages stay on .com. */
export function siaiLanguageAlternates():Record<string,string> {
  const alternatives=languageAlternates("/siai");
  const urls:Record<string,string>={};
  for(const [lang,path] of Object.entries(alternatives))urls[lang]=PRIMARY_SITE+path;
  urls["zh-CN"]=CHINA_SITE+"/siai";
  urls["zh"]=PRIMARY_SITE+"/siai";
  urls["x-default"]=PRIMARY_SITE+"/siai";
  return urls;
}
