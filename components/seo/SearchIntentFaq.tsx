import {searchFaqIntro,searchFaqTitle,searchIntentFaq} from "@/lib/seo/search-intent-faq";
import type {SeoLocale} from "@/lib/seo/global-seo";

export default function SearchIntentFaq({slug,locale}:{slug:string;locale:SeoLocale}){
 const items=searchIntentFaq(slug,locale);
 if(!items.length)return null;
 return <section className="lx-growth-faq" aria-labelledby={`search-faq-${slug}`}>
  <h2 id={`search-faq-${slug}`} className="lx-growth-section-title">{searchFaqTitle(locale)}</h2>
  <p>{searchFaqIntro(locale)}</p>
  <div className="lx-growth-faq-grid">
   {items.map((item,index)=><details key={`${slug}-${index}`} className="lx-growth-faq-item">
    <summary>{item.q}</summary><p>{item.a}</p>
   </details>)}
  </div>
 </section>;
}
