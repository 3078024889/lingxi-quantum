"use client";
import {type FormEvent,useState} from "react";
import Link from "next/link";
import {useLingxiLang,type LingxiLang} from "@/lib/lingxi-i18n";
import LingxiMiniIcon,{type LingxiIconName} from "@/components/LingxiMiniIcon";
type Mode="drama"|"knowledge"|"research";
type C={kicker:string;hero:string;lead:string;placeholder:string;drama:string;doc:string;research:string;begin:string;next:string;nextTitle:string;cards:{href:string,title:string,note:string,mark:LingxiIconName}[]};
const d:Record<LingxiLang,C>={
 zh:{kicker:"AI 创作入口",hero:"把一个还没成形的念头，继续推到真正发生。",lead:"先告诉 SASI 你现在想完成什么。灵犀场会沿着目标接住故事、资料和上下文，把下一步送到你面前。",placeholder:"例如：把这份小说做成 20 集竖屏短剧；或把这篇论文变成可以持续追问的研究智能体。",drama:"AI短剧",doc:"资料智能体",research:"科研",begin:"开始",next:"继续往哪里走",nextTitle:"从你现在要解决的事进入。",cards:[
 {href:"/sasi/drama",title:"AI短剧生成",note:"把故事、人物和素材继续推进到镜头与成片。",mark:"drama"},
 {href:"/ai-knowledge",title:"书本 / 资料智能体",note:"让书本、论文和资料变成可以持续追问、引用和回看的智能体。",mark:"book"},
 {href:"/ai-research",title:"科研 SASI",note:"让问题、证据、比较与结论留在同一条研究脉络里。",mark:"research"},
 {href:"/sasi/connections",title:"模型与 API",note:"把你已经在用的 AI 接进来，创作时不必来回切换。",mark:"connections"},
 {href:"/sasi/pricing",title:"创作余额",note:"按你习惯的币种充值，使用时再从对应余额结算。",mark:"wallet"}]},
 en:{kicker:"AI Creation",hero:"Move an unfinished idea toward something real.",lead:"Tell SASI what you want to finish. LINGXIFIELD carries your story, sources and context forward and brings the next useful step to you.",placeholder:"Example: turn this novel into a 20-episode vertical drama, or this paper into a research agent.",drama:"AI Drama",doc:"Document Agent",research:"Research",begin:"Begin",next:"Where to go next",nextTitle:"Enter from the work you need done now.",cards:[
 {href:"/sasi/drama",title:"AI Drama",note:"Move stories, characters and assets toward shots and delivery.",mark:"drama"},
 {href:"/ai-knowledge",title:"Book & Document Agent",note:"Turn books, papers and files into an intelligence you can keep questioning.",mark:"book"},
 {href:"/ai-research",title:"Research SASI",note:"Keep questions, evidence, comparison and conclusions in one research thread.",mark:"research"},
 {href:"/sasi/connections",title:"Models & APIs",note:"Connect the AI services you already use and keep creation in one place.",mark:"connections"},
 {href:"/sasi/pricing",title:"Creation Balance",note:"Top up in your preferred currency and use the matching balance when creating.",mark:"wallet"}]},
 ja:{kicker:"AI 制作",hero:"まだ形になっていない考えを、実際の成果まで進める。",lead:"SASI に何を完成させたいか伝えてください。物語、資料、文脈を引き継ぎ、次の一歩へ進めます。",placeholder:"例：この小説を20話の縦型短編ドラマにする。この論文を継続して質問できる研究エージェントにする。",drama:"AIドラマ",doc:"資料エージェント",research:"研究",begin:"始める",next:"次の入口",nextTitle:"今必要な仕事から入る。",cards:[
 {href:"/sasi/drama",title:"AI短編ドラマ",note:"物語、人物、素材をショットと完成作品まで進めます。",mark:"drama"},
 {href:"/ai-knowledge",title:"Book / 資料エージェント",note:"本、論文、資料を継続して質問・引用できる知的エージェントへ。",mark:"book"},
 {href:"/ai-research",title:"研究 SASI",note:"問い、証拠、比較、結論を一つの研究の流れに保ちます。",mark:"research"},
 {href:"/sasi/connections",title:"モデルと API",note:"普段使う AI サービスを接続し、制作を一か所にまとめます。",mark:"connections"},
 {href:"/sasi/pricing",title:"制作残高",note:"使いやすい通貨でチャージし、制作時に対応残高から精算します。",mark:"wallet"}]},
 ko:{kicker:"AI 창작",hero:"아직 형태가 없는 생각을 실제 결과까지 이어갑니다.",lead:"SASI에게 무엇을 완성하고 싶은지 알려주세요. 이야기, 자료, 맥락을 이어 받아 다음 단계를 제시합니다.",placeholder:"예: 이 소설을 20부작 세로형 숏드라마로 만들거나, 이 논문을 계속 질문할 수 있는 연구 에이전트로 만들기.",drama:"AI 드라마",doc:"자료 에이전트",research:"연구",begin:"시작",next:"다음으로",nextTitle:"지금 해결할 일에서 시작하세요.",cards:[
 {href:"/sasi/drama",title:"AI 숏드라마",note:"이야기, 인물, 자료를 장면과 완성본까지 이어갑니다.",mark:"drama"},
 {href:"/ai-knowledge",title:"책 / 자료 에이전트",note:"책, 논문, 자료를 계속 질문하고 인용할 수 있는 지능형 에이전트로 만듭니다.",mark:"book"},
 {href:"/ai-research",title:"연구 SASI",note:"질문, 근거, 비교, 결론을 하나의 연구 흐름에 유지합니다.",mark:"research"},
 {href:"/sasi/connections",title:"모델 및 API",note:"사용 중인 AI 서비스를 연결해 창작을 한곳에서 이어갑니다.",mark:"connections"},
 {href:"/sasi/pricing",title:"창작 잔액",note:"원하는 통화로 충전하고 창작 시 해당 잔액에서 결제합니다.",mark:"wallet"}]},
 fr:{kicker:"Création IA",hero:"Faites passer une idée encore informe jusqu’à un résultat réel.",lead:"Dites à SASI ce que vous voulez terminer. LINGXIFIELD conserve histoire, sources et contexte pour proposer la prochaine étape utile.",placeholder:"Ex. : transformer ce roman en 20 épisodes verticaux, ou cet article en agent de recherche.",drama:"Drama IA",doc:"Agent documentaire",research:"Recherche",begin:"Commencer",next:"Et ensuite",nextTitle:"Entrez par le travail à accomplir maintenant.",cards:[
 {href:"/sasi/drama",title:"Drama IA",note:"Faites avancer histoire, personnages et ressources jusqu’aux plans et au rendu.",mark:"drama"},
 {href:"/ai-knowledge",title:"Agent livre / documents",note:"Transformez livres, articles et fichiers en intelligence interrogeable et traçable.",mark:"book"},
 {href:"/ai-research",title:"SASI Recherche",note:"Gardez questions, preuves, comparaisons et conclusions dans un même fil.",mark:"research"},
 {href:"/sasi/connections",title:"Modèles & API",note:"Connectez vos services IA et gardez la création au même endroit.",mark:"connections"},
 {href:"/sasi/pricing",title:"Solde création",note:"Rechargez dans votre devise préférée et utilisez le solde correspondant.",mark:"wallet"}]},
 de:{kicker:"KI-Erstellung",hero:"Bringen Sie eine unfertige Idee bis zu einem echten Ergebnis.",lead:"Sagen Sie SASI, was Sie fertigstellen möchten. LINGXIFIELD trägt Story, Quellen und Kontext weiter und zeigt den nächsten nützlichen Schritt.",placeholder:"Beispiel: diesen Roman als 20-teiliges Hochformat-Drama umsetzen oder dieses Paper in einen Forschungsagenten verwandeln.",drama:"KI-Drama",doc:"Dokument-Agent",research:"Forschung",begin:"Starten",next:"Wie geht es weiter",nextTitle:"Beginnen Sie mit der Arbeit, die jetzt ansteht.",cards:[
 {href:"/sasi/drama",title:"KI-Drama",note:"Story, Figuren und Assets bis zu Shots und fertigem Ergebnis weiterführen.",mark:"drama"},
 {href:"/ai-knowledge",title:"Buch- & Dokument-Agent",note:"Bücher, Papers und Dateien in eine weiter befragbare Intelligenz verwandeln.",mark:"book"},
 {href:"/ai-research",title:"Forschungs-SASI",note:"Fragen, Belege, Vergleiche und Schlussfolgerungen in einem Forschungsfaden halten.",mark:"research"},
 {href:"/sasi/connections",title:"Modelle & APIs",note:"Ihre vorhandenen KI-Dienste verbinden und Erstellung an einem Ort halten.",mark:"connections"},
 {href:"/sasi/pricing",title:"Erstellungsguthaben",note:"In der bevorzugten Währung aufladen und bei Nutzung passend abrechnen.",mark:"wallet"}]},
 es:{kicker:"Creación IA",hero:"Lleva una idea aún sin forma hasta un resultado real.",lead:"Dile a SASI qué quieres terminar. LINGXIFIELD mantiene historia, fuentes y contexto y te acerca el siguiente paso útil.",placeholder:"Ej.: convertir esta novela en 20 episodios verticales o este artículo en un agente de investigación.",drama:"Drama IA",doc:"Agente documental",research:"Investigación",begin:"Empezar",next:"Siguiente paso",nextTitle:"Entra desde el trabajo que necesitas resolver ahora.",cards:[
 {href:"/sasi/drama",title:"Drama IA",note:"Lleva historia, personajes y recursos hasta planos y entrega final.",mark:"drama"},
 {href:"/ai-knowledge",title:"Agente de libros y documentos",note:"Convierte libros, artículos y archivos en una inteligencia que puedas seguir consultando.",mark:"book"},
 {href:"/ai-research",title:"SASI Investigación",note:"Mantén preguntas, evidencia, comparación y conclusiones en un mismo hilo.",mark:"research"},
 {href:"/sasi/connections",title:"Modelos y API",note:"Conecta los servicios de IA que ya utilizas y crea en un solo lugar.",mark:"connections"},
 {href:"/sasi/pricing",title:"Saldo de creación",note:"Recarga en tu moneda preferida y usa el saldo correspondiente al crear.",mark:"wallet"}]},
 pt:{kicker:"Criação IA",hero:"Leve uma ideia ainda sem forma até um resultado real.",lead:"Diga ao SASI o que você quer concluir. A LINGXIFIELD mantém história, fontes e contexto e traz o próximo passo útil.",placeholder:"Ex.: transformar este romance em 20 episódios verticais ou este artigo em um agente de pesquisa.",drama:"Drama IA",doc:"Agente documental",research:"Pesquisa",begin:"Começar",next:"Próximo passo",nextTitle:"Entre pelo trabalho que precisa resolver agora.",cards:[
 {href:"/sasi/drama",title:"Drama IA",note:"Leve história, personagens e recursos até cenas e entrega final.",mark:"drama"},
 {href:"/ai-knowledge",title:"Agente de livros e documentos",note:"Transforme livros, artigos e arquivos em uma inteligência que você possa continuar consultando.",mark:"book"},
 {href:"/ai-research",title:"SASI Pesquisa",note:"Mantenha perguntas, evidências, comparação e conclusões no mesmo fluxo.",mark:"research"},
 {href:"/sasi/connections",title:"Modelos e APIs",note:"Conecte os serviços de IA que já usa e mantenha a criação em um só lugar.",mark:"connections"},
 {href:"/sasi/pricing",title:"Saldo de criação",note:"Recarregue na moeda preferida e use o saldo correspondente ao criar.",mark:"wallet"}]},
 ar:{kicker:"إنشاء بالذكاء الاصطناعي",hero:"انقل فكرة لم تتشكل بعد إلى نتيجة حقيقية.",lead:"أخبر SASI بما تريد إنجازه. يحتفظ LINGXIFIELD بالقصة والمصادر والسياق ويقودك إلى الخطوة التالية المفيدة.",placeholder:"مثال: حوّل هذه الرواية إلى 20 حلقة عمودية، أو حوّل هذا البحث إلى وكيل بحثي مستمر.",drama:"دراما AI",doc:"وكيل مستندات",research:"بحث",begin:"ابدأ",next:"إلى أين بعد ذلك",nextTitle:"ابدأ من العمل الذي تحتاج إلى إنجازه الآن.",cards:[
 {href:"/sasi/drama",title:"دراما AI",note:"انقل القصة والشخصيات والمواد إلى اللقطات والنسخة النهائية.",mark:"drama"},
 {href:"/ai-knowledge",title:"وكيل الكتب والمستندات",note:"حوّل الكتب والأبحاث والملفات إلى ذكاء يمكنك مواصلة سؤاله والاستشهاد به.",mark:"book"},
 {href:"/ai-research",title:"SASI للبحث",note:"احتفظ بالأسئلة والأدلة والمقارنات والاستنتاجات في مسار واحد.",mark:"research"},
 {href:"/sasi/connections",title:"النماذج وAPI",note:"اربط خدمات الذكاء الاصطناعي التي تستخدمها وواصل الإنشاء في مكان واحد.",mark:"connections"},
 {href:"/sasi/pricing",title:"رصيد الإنشاء",note:"اشحن بالعملة المناسبة واستخدم الرصيد المطابق عند الإنشاء.",mark:"wallet"}]}
};
export default function SasiCommandCenter(){
 const{lang}=useLingxiLang(),c=d[lang]??d.en;const[mode,setMode]=useState<Mode>("drama"),[prompt,setPrompt]=useState("");
 function submit(e:FormEvent){e.preventDefault();const value=prompt.trim();if(value)sessionStorage.setItem("sasi-intent",value);location.assign(mode==="drama"?"/sasi/drama":mode==="knowledge"?"/ai-knowledge":"/ai-research")}
 return <main className="lx11-page lx-sasi-center"><div className="mx-auto max-w-6xl px-6 py-14 sm:py-20">
  <section className="max-w-3xl lx-sasi-hero"><div className="lx-sasi-hero-line"><LingxiMiniIcon name="sasi" size="title"/><p className="text-sm font-medium text-[var(--lx-faint)]">SASI · {c.kicker}</p></div><h1 className="mt-3 text-3xl font-semibold leading-tight text-[var(--lx-ink)] sm:text-4xl">{c.hero}</h1><p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--lx-muted)]">{c.lead}</p></section>
  <section className="mt-10 rounded-3xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-5 sm:p-7 lx-sasi-prompt-panel"><form onSubmit={submit}><textarea value={prompt} onChange={e=>setPrompt(e.target.value)} rows={5} placeholder={c.placeholder} className="w-full resize-none bg-transparent text-sm leading-7 text-[var(--lx-ink)] outline-none placeholder:text-[var(--lx-faint)]"/><div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--lx-line)] pt-5"><div className="flex flex-wrap gap-2">{([["drama",c.drama],["knowledge",c.doc],["research",c.research]] as const).map(([id,label])=><button type="button" key={id} onClick={()=>setMode(id)} className={`rounded-full border px-4 py-2 text-sm ${mode===id?"border-[var(--lx-line-strong)] bg-[var(--lx-soft)] text-[var(--lx-ink)]":"border-[var(--lx-line)] text-[var(--lx-muted)]"}`}>{label}</button>)}</div><button className="rounded-xl bg-[var(--lx-ink)] px-5 py-3 text-sm font-semibold text-[var(--lx-bg)]">{c.begin} →</button></div></form></section>
  <section className="mt-12"><p className="text-sm text-[var(--lx-faint)]">{c.next}</p><h2 className="mt-2 text-2xl font-semibold text-[var(--lx-ink)]">{c.nextTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{c.cards.map(card=><Link key={card.href} href={card.href} className="group rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-5 transition hover:border-[var(--lx-line-strong)] lx-sasi-entry-card"><div className="flex items-center justify-between"><LingxiMiniIcon name={card.mark} size="card"/><span className="text-sm text-[var(--lx-faint)]">→</span></div><h3 className="mt-5 text-base font-semibold text-[var(--lx-ink)]">{card.title}</h3><p className="mt-2 text-sm leading-6 text-[var(--lx-muted)]">{card.note}</p></Link>)}</div></section>
 </div></main>
}
