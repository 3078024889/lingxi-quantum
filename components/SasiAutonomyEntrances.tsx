"use client";

import Link from "next/link";
import { useLingxiLang } from "@/lib/lingxi-i18n";

const copy:any={
  zh:{
    title:"从一个想法开始创作",
    lead:"图片、短剧、资料与研究都可以从这里进入。SASI 会先理解你要完成什么，再组织后面的步骤。",
    image:["图片创作","把一句描述变成封面、故事卡和概念视觉。"],
    video:["短剧创作","把故事整理成人物、场景、镜头、字幕和视频草片。"],
    ready:["继续深化","让作品继续完善人物、画面、节奏和最终成片。"],
  },
  en:{
    title:"Create from an idea",
    lead:"Start with images, stories, documents or research. SASI first understands the result you want, then organizes the work.",
    image:["Image creation","Turn a brief into covers, story cards and concept visuals."],
    video:["Story creation","Turn a story into characters, scenes, shots, subtitles and a video draft."],
    ready:["Keep refining","Continue improving characters, visuals, pacing and the finished work."],
  },
};

export default function SasiAutonomyEntrances(){
  const {lang}=useLingxiLang();
  const c=copy[lang]||copy.en;
  return <section className="mx-auto max-w-6xl px-6 pb-16">
    <div className="rounded-3xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-6">
      <h2 className="text-xl font-semibold text-[var(--lx-ink)]">{c.title}</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--lx-muted)]">{c.lead}</p>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <Link href="/sasi/image" className="rounded-2xl border border-[var(--lx-line)] p-5">
          <b>{c.image[0]}</b><p className="mt-2 text-sm text-[var(--lx-muted)]">{c.image[1]}</p>
        </Link>
        <Link href="/sasi/drama" className="rounded-2xl border border-[var(--lx-line)] p-5">
          <b>{c.video[0]}</b><p className="mt-2 text-sm text-[var(--lx-muted)]">{c.video[1]}</p>
        </Link>
        <div className="rounded-2xl border border-[var(--lx-line)] p-5">
          <b>{c.ready[0]}</b><p className="mt-2 text-sm text-[var(--lx-muted)]">{c.ready[1]}</p>
        </div>
      </div>
    </div>
  </section>;
}
