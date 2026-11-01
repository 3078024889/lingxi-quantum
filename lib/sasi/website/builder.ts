import type {SiteDNA} from "./site-dna";

const esc=(s="")=>s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]!));
const PATH=/^\/(?:[a-z0-9][a-z0-9/_-]*)?\/?$/i;
function resolvedCta(href:string,pages:Set<string>):string{
 const raw=href.trim();
 if(raw.length>500||/[\u0000-\u001f\u007f]/.test(raw))throw Error("SITE_CTA_URL_INVALID");
 if(PATH.test(raw)){
  const path=raw.replace(/\/$/,"")||"/";
  if(!pages.has(path))throw Error("SITE_CTA_TARGET_MISSING");
  return path;
 }
 if(/^mailto:[^@\s]+@[^@\s]+\.[^@\s]+$/i.test(raw)||/^tel:\+?[\d ()-]{5,25}$/i.test(raw))return raw;
 if(/^https:\/\//i.test(raw)){
  let url:URL;try{url=new URL(raw)}catch{throw Error("SITE_CTA_URL_INVALID")}
  if(url.protocol!=="https:"||!url.hostname||url.username||url.password)throw Error("SITE_CTA_URL_INVALID");
  return url.toString();
 }
 throw Error("SITE_CTA_URL_INVALID");
}

/** Build a portable static website with working CTAs only.
 * An unsupplied CTA destination is plain copy, never a fake button.
 */
export function buildStaticSite(site:SiteDNA){
 const pageNames=new Set(site.pages.map(p=>p.path.replace(/\/$/,"")||"/"));
 const pages=site.pages.map(p=>{
  let headingCount=0;
  const sections=p.sections.map(s=>{
   const heading=s.heading?.trim();
   let h="";
   if(heading){const tag=headingCount++===0?"h1":"h2";h="<"+tag+">"+esc(heading)+"</"+tag+">";}
   let cta="";
   if(s.cta?.trim()){
    cta=s.ctaHref?.trim()
     ?'<a class="site-cta" href="'+esc(resolvedCta(s.ctaHref,pageNames))+'">'+esc(s.cta)+'</a>'
     :'<p class="site-cta-note">'+esc(s.cta)+'</p>';
   }
   return '<section data-kind="'+esc(s.type)+'">'+h+(s.body?'<p>'+esc(s.body)+'</p>':"")+cta+'</section>';
  }).join("");
  const title=esc(p.title),description=esc(site.seo.description);
  const css="*,*::before,*::after{box-sizing:border-box}body{margin:0;background:#fff;color:#172033;font:16px/1.65 system-ui,sans-serif}main{max-width:1100px;margin:auto;padding:clamp(20px,5vw,64px)}section{padding:clamp(24px,4vw,56px) 0;border-bottom:1px solid #e5e9ef}h1{font-size:clamp(2rem,5vw,3.8rem);line-height:1.2}h2{font-size:clamp(1.4rem,3vw,2.4rem)}.site-cta{display:inline-block;padding:.8rem 1.2rem;background:#132448;color:#fff;border-radius:12px;text-decoration:none}.site-cta:focus-visible{outline:3px solid #1e70e6;outline-offset:4px}.site-cta-note{color:#53647e}";
  const html='<!doctype html><html lang="'+esc(site.locales[0]||"en")+'"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="'+description+'"><title>'+title+'</title><style>'+css+'</style></head><body><main>'+sections+'</main></body></html>';
  return {path:p.path,file:p.path==="/"?"index.html":p.path.replace(/^\//,"").replace(/\/$/,"")+"/index.html",html};
 });
 return{site,files:pages};
}
