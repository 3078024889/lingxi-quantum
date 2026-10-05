"use client";

import Image from "next/image";
import {usePathname} from "next/navigation";
import {useLingxiLang} from "@/lib/lingxi-i18n";
import {toolTitle} from "@/lib/tools/card-i18n";
import {toolFacts} from "@/lib/seo/product-facts";

type PromoImage={src:string;alt:string};

export default function ToolPromoStrip({
  eyebrow,title,intro,images,
}:{eyebrow:string;title:string;intro?:string;images:PromoImage[]}){
  const {lang}=useLingxiLang();
  const pathname=usePathname();
  const slug=(pathname.match(/\/tools\/([^/?#]+)/)?.[1]||"").toLowerCase();
  if(!images.length)return null;

  const localizedTitle=lang==="zh"||!slug?title:toolTitle(lang,slug,"");
  const localizedIntro=lang==="zh"||!slug?(intro||""):toolFacts(slug,lang).summary;
  const safeTitle=localizedTitle||title;
  const safeIntro=localizedIntro||(lang==="zh"?(intro||""):"");
  return <section className="lx-v43-promo" aria-label={safeTitle}>
    <div className="lx-v43-promo-head"><div>
      <p>{eyebrow}</p>
      <h2>{safeTitle}</h2>
      {safeIntro?<span>{safeIntro}</span>:null}
    </div></div>
    <div className="lx-v43-promo-track">
      {images.map((item,index)=><figure key={item.src} className="lx-v43-promo-card">
        <Image
          src={item.src}
          alt={lang==="zh"?item.alt:`${safeTitle} ${index+1}`}
          width={480} height={480}
          sizes="(max-width: 640px) 46vw, (max-width: 1200px) 22vw, 170px"
          loading="lazy" quality={76}
        />
        <figcaption>{String(index+1).padStart(2,"0")}</figcaption>
      </figure>)}
    </div>
  </section>;
}
