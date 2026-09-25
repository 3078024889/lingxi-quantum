"use client";

import Link from "next/link";
import LxText from "@/components/LxText";
import SasiWorkspace from "@/app/sasi/SasiWorkspace";

export default function SasiDramaLaunch({accountEmail}:{accountEmail:string|null}){
  return <main className="min-h-screen bg-[#fafaff] pt-16 lg:ml-[260px] lg:pt-0">
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold tracking-[.16em] text-slate-500"><LxText zh="灵犀场 · AI短剧" en="LINGXIFIELD · AI Drama" ja="LINGXIFIELD · AIドラマ" ko="LINGXIFIELD · AI 드라마" fr="LINGXIFIELD · Drama IA" de="LINGXIFIELD · KI-Drama" es="LINGXIFIELD · Drama IA" pt="LINGXIFIELD · Drama IA" ar="LINGXIFIELD · دراما بالذكاء الاصطناعي"/></p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl"><LxText zh="把故事交进来，一步步长成可以看的短剧。" en="Bring in the story and grow it step by step into a drama people can watch." ja="物語を持ち込み、見られる短編ドラマへ育てます。" ko="이야기를 가져오면 시청 가능한 숏드라마로 단계적으로 완성합니다." fr="Apportez l’histoire et faites-la grandir jusqu’à un drama prêt à regarder." de="Bringen Sie die Geschichte mit und entwickeln Sie sie Schritt für Schritt zum anschaubaren Kurzdrama." es="Trae la historia y hazla crecer paso a paso hasta un drama listo para ver." pt="Traga a história e faça-a crescer até virar um drama pronto para assistir." ar="أدخل القصة ودعها تنمو خطوة بخطوة إلى دراما قصيرة قابلة للمشاهدة."/></h1>
            <p className="mt-4 text-sm leading-7 text-slate-600"><LxText zh="剧本、人物参考、图片、声音和现有镜头都可以直接带进来。你可以选灵犀场准备好的 Skill，也可以上传自己的 Skill；确定时长、画质和画幅后，再看本次真实预算。" en="Bring scripts, character references, images, voices or existing shots. Choose a LINGXIFIELD Skill or upload your own, then see the real budget after selecting duration, quality and format." ja="脚本、人物参考、画像、音声、既存ショットを持ち込み、Skill と仕様を選んで実際の予算を確認できます。" ko="대본, 캐릭터 참고, 이미지, 음성, 기존 영상을 넣고 Skill과 사양을 선택한 뒤 실제 예산을 확인할 수 있습니다." fr="Ajoutez scénario, références, images, voix ou plans existants, choisissez un Skill et vos réglages, puis voyez le budget réel." de="Bringen Sie Skript, Referenzen, Bilder, Stimmen oder vorhandene Shots mit, wählen Sie Skill und Spezifikation und sehen Sie dann das reale Budget." es="Añade guion, referencias, imágenes, voces o planos existentes, elige un Skill y la especificación y consulta el presupuesto real." pt="Adicione roteiro, referências, imagens, vozes ou cenas existentes, escolha um Skill e a especificação e veja o orçamento real." ar="أضف النص والمراجع والصور والأصوات واللقطات الموجودة، واختر Skill والمواصفات ثم اعرض الميزانية الفعلية."/></p>
          </div>
          <div className="flex flex-wrap gap-3"><Link href="/sasi/drama?view=skills" className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm text-slate-700">Skills</Link><Link href="/sasi/pricing" className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm text-slate-700">余额与价格</Link><Link href="/sasi/connections" className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm text-slate-700">模型与 API</Link></div>
        </div>
        {!accountEmail&&<p className="mt-5 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">登录后可以保存项目、Skill 和创作进度，下次回来继续。</p>}
      </section>
      <div className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white"><SasiWorkspace accountEmail={accountEmail}/></div>
    </div>
  </main>;
}
