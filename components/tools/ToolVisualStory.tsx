import Image from "next/image";

type StoryImage={src:string;alt:string};

export default function ToolVisualStory({
  eyebrow,
  title,
  intro,
  images,
}:{eyebrow:string;title:string;intro:string;images:StoryImage[]}){
  if(!images.length)return null;
  const [hero,...rest]=images;
  return <section className="mt-14 border-t border-[var(--lx-line)] pt-10">
    <div className="mx-auto max-w-4xl text-center">
      <p className="text-xs font-semibold tracking-[.2em] text-[var(--lx-faint)]">{eyebrow}</p>
      <h2 className="mt-3 font-display text-2xl text-[var(--lx-ink)] sm:text-3xl">{title}</h2>
      <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-[var(--lx-muted)]">{intro}</p>
    </div>
    <div className="mx-auto mt-7 max-w-5xl overflow-hidden rounded-3xl border border-[var(--lx-line)] bg-[var(--lx-panel)] shadow-sm">
      <Image src={hero.src} alt={hero.alt} width={1200} height={1200} className="h-auto w-full" loading="lazy"/>
    </div>
    {rest.length>0&&<div className="mx-auto mt-5 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {rest.map((item,index)=><figure key={item.src} className="overflow-hidden rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)]">
        <Image src={item.src} alt={item.alt} width={1200} height={1200} className="h-auto w-full" loading="lazy"/>
        <figcaption className="px-4 py-3 text-xs leading-6 text-[var(--lx-muted)]">{index+2} / {images.length}</figcaption>
      </figure>)}
    </div>}
  </section>;
}
