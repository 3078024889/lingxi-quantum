"use client";

import Link from "next/link";
import LxText from "@/components/LxText";
import {useLingxiLang,type LingxiLang} from "@/lib/lingxi-i18n";
import SasiWorkspace from "@/app/sasi/SasiWorkspace";
import SasiAutonomousDrama from "@/components/SasiAutonomousDrama";

const labels:Record<LingxiLang,{skills:string;balance:string;models:string;login:string}>={
 zh:{skills:"Skills",balance:"余额与价格",models:"可选增强",login:"登录后可以保存项目、Skill 和创作进度，下次回来继续。"},
 en:{skills:"Skills",balance:"Balance & pricing",models:"Optional enhancement",login:"Sign in to save projects, Skills and creation progress, then continue next time."},
 ja:{skills:"Skills",balance:"残高と料金",models:"任意の強化",login:"ログインするとプロジェクト、Skill、制作進捗を保存し、次回続きから再開できます。"},
 ko:{skills:"Skills",balance:"잔액 및 가격",models:"선택형 향상",login:"로그인하면 프로젝트, Skill, 창작 진행 상황을 저장하고 다음에 이어서 할 수 있습니다."},
 fr:{skills:"Skills",balance:"Solde et tarifs",models:"Amélioration facultative",login:"Connectez-vous pour enregistrer projets, Skills et progression, puis reprendre plus tard."},
 de:{skills:"Skills",balance:"Guthaben & Preise",models:"Optionale Erweiterung",login:"Melden Sie sich an, um Projekte, Skills und Fortschritt zu speichern und später fortzusetzen."},
 es:{skills:"Skills",balance:"Saldo y precios",models:"Mejora opcional",login:"Inicia sesión para guardar proyectos, Skills y progreso y continuar más tarde."},
 pt:{skills:"Skills",balance:"Saldo e preços",models:"Melhoria opcional",login:"Entre para salvar projetos, Skills e progresso e continuar depois."},
 ar:{skills:"Skills",balance:"الرصيد والأسعار",models:"تحسين اختياري",login:"سجّل الدخول لحفظ المشاريع وSkills وتقدم الإنشاء والعودة إليه لاحقًا."}
};

export default function SasiDramaLaunch({accountEmail}:{accountEmail:string|null}){
 const{lang}=useLingxiLang();const c=labels[lang]??labels.en;
 return <main className="min-h-screen bg-[var(--lx-bg)] pt-16 lg:ml-[260px] lg:pt-0">
  <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
   <section className="rounded-3xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-6 sm:p-8">
    <div className="flex flex-wrap items-start justify-between gap-6">
     <div className="max-w-3xl">
      <p className="text-xs font-semibold tracking-[.16em] text-[var(--lx-faint)]"><LxText zh="灵犀场 · AI短剧" en="LINGXIFIELD · AI Drama" ja="LINGXIFIELD · AIドラマ" ko="LINGXIFIELD · AI 드라마" fr="LINGXIFIELD · Drama IA" de="LINGXIFIELD · KI-Drama" es="LINGXIFIELD · Drama IA" pt="LINGXIFIELD · Drama IA" ar="LINGXIFIELD · دراما بالذكاء الاصطناعي"/></p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--lx-ink)] sm:text-4xl"><LxText zh="把故事交进来，一步步长成可以看的短剧。" en="Bring in the story and grow it step by step into a drama people can watch." ja="物語を持ち込み、見られる短編ドラマへ育てます。" ko="이야기를 가져오면 시청 가능한 숏드라마로 단계적으로 완성합니다." fr="Apportez l’histoire et faites-la grandir jusqu’à un drama prêt à regarder." de="Bringen Sie die Geschichte mit und entwickeln Sie sie Schritt für Schritt zum anschaubaren Kurzdrama." es="Trae la historia y hazla crecer paso a paso hasta un drama listo para ver." pt="Traga a história e faça-a crescer até virar um drama pronto para assistir." ar="أدخل القصة ودعها تنمو خطوة بخطوة إلى دراما قصيرة قابلة للمشاهدة."/></h1>
      <p className="mt-4 text-sm leading-7 text-[var(--lx-muted)]"><LxText zh="剧本、人物参考、图片、声音和现有镜头都可以直接带进来。你可以选灵犀场准备好的 Skill，也可以上传自己的 Skill；确定时长、画质和画幅后，再看本次真实预算。" en="Bring scripts, character references, images, voices or existing shots. Choose a LINGXIFIELD Skill or upload your own, then see the real budget after selecting duration, quality and format." ja="脚本、人物参考、画像、音声、既存ショットを持ち込み、Skill と仕様を選んで実際の予算を確認できます。" ko="대본, 캐릭터 참고, 이미지, 음성, 기존 영상을 넣고 Skill과 사양을 선택한 뒤 실제 예산을 확인할 수 있습니다." fr="Ajoutez scénario, références, images, voix ou plans existants, choisissez un Skill et vos réglages, puis voyez le budget réel." de="Bringen Sie Skript, Referenzen, Bilder, Stimmen oder vorhandene Shots mit, wählen Sie Skill und Spezifikation und sehen Sie dann das reale Budget." es="Añade guion, referencias, imágenes, voces o planos existentes, elige un Skill y la especificación y consulta el presupuesto real." pt="Adicione roteiro, referências, imagens, vozes ou cenas existentes, escolha um Skill e a especificação e veja o orçamento real." ar="أضف النص والمراجع والصور والأصوات واللقطات الموجودة، واختر Skill والمواصفات ثم اعرض الميزانية الفعلية."/></p>
     </div>
     <div className="flex flex-wrap gap-3"><Link href="/sasi/drama?view=skills" className="rounded-full border border-[var(--lx-line)] bg-[var(--lx-panel)] px-5 py-2.5 text-sm text-[var(--lx-muted)]">{c.skills}</Link><Link href="/sasi/pricing" className="rounded-full border border-[var(--lx-line)] bg-[var(--lx-panel)] px-5 py-2.5 text-sm text-[var(--lx-muted)]">{c.balance}</Link><Link href="/sasi/connections" className="rounded-full border border-[var(--lx-line)] bg-[var(--lx-panel)] px-5 py-2.5 text-sm text-[var(--lx-muted)]">{c.models}</Link></div>
    </div>
    {!accountEmail&&<p className="mt-5 rounded-xl bg-[var(--lx-soft)] px-4 py-3 text-sm text-[var(--lx-muted)]">{c.login}</p>}
   </section>
   <div className="mt-8"><SasiAutonomousDrama/></div>
<div className="mt-8 overflow-hidden rounded-3xl border border-[var(--lx-line)] bg-[var(--lx-panel)]"><SasiWorkspace accountEmail={accountEmail}/></div>
  </div>
 </main>
}
