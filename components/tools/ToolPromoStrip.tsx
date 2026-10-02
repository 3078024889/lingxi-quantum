import Image from "next/image";

type PromoImage={src:string;alt:string};

export default function ToolPromoStrip({
  eyebrow,
  title,
  intro,
  images,
}:{eyebrow:string;title:string;intro?:string;images:PromoImage[]}){
  if(!images.length)return null;
  return <section className="lx-v43-promo" aria-label={title}>
    <div className="lx-v43-promo-head">
      <div>
        <p>{eyebrow}</p>
        <h2>{title}</h2>
        {intro?<span>{intro}</span>:null}
      </div>
    </div>
    <div className="lx-v43-promo-track">
      {images.map((item,index)=><figure key={item.src} className="lx-v43-promo-card">
        <Image
          src={item.src}
          alt={item.alt}
          width={480}
          height={480}
          sizes="(max-width: 640px) 46vw, (max-width: 1200px) 22vw, 170px"
          loading="lazy"
          quality={76}
        />
        <figcaption>{String(index+1).padStart(2,"0")}</figcaption>
      </figure>)}
    </div>
  </section>;
}
