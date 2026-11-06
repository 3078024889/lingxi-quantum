"use client";
import Link from "next/link";
import {useLingxiLang,type LingxiLang} from "@/lib/lingxi-i18n";
import {SIAI_DISCOVERY} from "@/lib/siai-search-discovery";

type Task = {title:string;description:string;cta:string};
type HomeCopy = {title:string;intro:string;tasks:[Task,Task,Task]};
const HOME_TASKS:Record<LingxiLang,HomeCopy>={
 zh:{title:"选 SI/AI 工具，先解决这三个问题",intro:"不用反复打开相似榜单，按真正要完成的任务查看功能、费用与限制。",tasks:[
  {title:"生成 10 秒视频要多少钱？",description:"先按时长、清晰度、模型和计费单位估算，再核对厂商公布的价格。",cta:"打开视频与 API 成本计算器"},
  {title:"写作、编程、图片、视频，该选哪个工具？",description:"按照要完成的工作筛选产品，比较擅长功能和官方资料，不把热度当实力。",cta:"按实际任务比较"},
  {title:"哪些工具有免费额度，所在地区能用吗？",description:"查看有来源的免费方案，再确认地区、付款方式与商用条款。",cta:"比较免费额度与限制"}
 ]},
 en:{title:"Choose SI/AI tools by what you need",intro:"Three practical decisions, without repeated directory links.",tasks:[
  {title:"What will a 10-second AI video cost?",description:"Estimate duration, quality and credits first, then verify published provider pricing.",cta:"Open video and API cost estimator"},
  {title:"Which tool fits writing, coding, images or video?",description:"Filter by task and compare features and official information, not hype.",cta:"Compare by task"},
  {title:"Which free plans work in my region?",description:"Check sourced free allowances, availability, payment methods and commercial terms.",cta:"Compare free plans and restrictions"}
 ]},
 ja:{title:"用途からSI/AIツールを選ぶ",intro:"同じ一覧を何度も見る代わりに、3つの具体的な目的から探せます。",tasks:[
  {title:"10秒のAI動画はいくら？",description:"時間・画質・クレジットから見積もり、公式料金を確認。",cta:"動画・API費用を計算"},
  {title:"文章・コード・画像・動画に合うツールは？",description:"用途別に機能と公式資料を比較。",cta:"用途から比較"},
  {title:"無料枠と利用地域は？",description:"出典付き無料枠、地域、決済、商用条件を確認。",cta:"無料枠と制約を比較"}
 ]},
 ko:{title:"작업으로 SI/AI 도구 선택",intro:"반복되는 목록보다 실제로 필요한 세 가지 질문에서 시작하세요.",tasks:[
  {title:"10초 AI 영상 비용은?",description:"영상 길이, 화질, 크레딧으로 계산하고 공식 요금을 확인합니다.",cta:"영상·API 비용 계산"},
  {title:"글쓰기, 코딩, 이미지, 영상에 맞는 도구는?",description:"작업별 기능과 공식 자료를 비교합니다.",cta:"작업별 비교"},
  {title:"무료 한도와 지역 제한은?",description:"출처가 있는 무료 한도, 지역, 결제와 상업적 이용 조건을 확인합니다.",cta:"무료 한도와 제한 비교"}
 ]},
 fr:{title:"Choisissez vos outils SI/IA selon vos besoins",intro:"Trois questions concrètes, sans répéter les mêmes annuaires.",tasks:[
  {title:"Combien coûte une vidéo IA de 10 secondes ?",description:"Estimez durée, qualité et crédits, puis vérifiez les tarifs officiels.",cta:"Calculer les coûts vidéo et API"},
  {title:"Quel outil pour écrire, coder, créer des images ou vidéos ?",description:"Comparez les fonctions par tâche et les sources officielles.",cta:"Comparer par usage"},
  {title:"Quelles offres gratuites sont disponibles dans ma région ?",description:"Vérifiez quotas sourcés, régions, paiement et droits commerciaux.",cta:"Comparer les offres gratuites"}
 ]},
 de:{title:"SI/KI-Tools nach Aufgabe auswählen",intro:"Drei konkrete Fragen statt wiederholter Verzeichnis-Links.",tasks:[
  {title:"Was kostet ein 10-Sekunden-KI-Video?",description:"Dauer, Qualität und Credits berechnen, dann offizielle Tarife prüfen.",cta:"Video- und API-Kosten berechnen"},
  {title:"Welches Tool für Texte, Code, Bilder oder Videos?",description:"Funktionen und offizielle Quellen nach Aufgabe vergleichen.",cta:"Nach Aufgabe vergleichen"},
  {title:"Welche Gratis-Angebote funktionieren in meiner Region?",description:"Belegte Freikontingente, Regionen, Zahlungs- und Nutzungsbedingungen prüfen.",cta:"Gratis-Angebote vergleichen"}
 ]},
 es:{title:"Elige herramientas SI/IA según tu tarea",intro:"Tres decisiones útiles sin repetir el mismo directorio.",tasks:[
  {title:"¿Cuánto cuesta un vídeo IA de 10 segundos?",description:"Calcula duración, calidad y créditos y verifica precios oficiales.",cta:"Calcular costes de vídeo y API"},
  {title:"¿Qué herramienta sirve para escribir, programar o crear?",description:"Compara funciones y fuentes oficiales por tarea.",cta:"Comparar por tarea"},
  {title:"¿Qué planes gratis funcionan en mi región?",description:"Consulta cuotas verificadas, regiones, pagos y condiciones comerciales.",cta:"Comparar planes gratis"}
 ]},
 pt:{title:"Escolha ferramentas SI/IA por tarefa",intro:"Três decisões práticas em vez de listas repetidas.",tasks:[
  {title:"Quanto custa um vídeo IA de 10 segundos?",description:"Estime duração, qualidade e créditos e confira preços oficiais.",cta:"Calcular custos de vídeo e API"},
  {title:"Qual ferramenta para escrever, programar ou criar?",description:"Compare recursos e fontes oficiais por tarefa.",cta:"Comparar por tarefa"},
  {title:"Quais planos grátis funcionam na minha região?",description:"Veja limites com fonte, regiões, pagamentos e uso comercial.",cta:"Comparar opções grátis"}
 ]},
 ar:{title:"اختر أدوات SI/AI حسب المهمة",intro:"ثلاثة أسئلة عملية بدلاً من قوائم متكررة.",tasks:[
  {title:"كم يكلف فيديو بالذكاء الاصطناعي مدته 10 ثوانٍ؟",description:"احسب المدة والجودة والرصيد ثم تحقق من الأسعار الرسمية.",cta:"حساب تكلفة الفيديو وواجهة API"},
  {title:"أي أداة تناسب الكتابة والبرمجة والصور والفيديو؟",description:"قارن الوظائف والمصادر الرسمية حسب المهمة.",cta:"مقارنة حسب المهمة"},
  {title:"ما الخطط المجانية المتاحة في منطقتي؟",description:"راجع الحصص الموثقة والمناطق ووسائل الدفع وشروط الاستخدام التجاري.",cta:"مقارنة الخطط المجانية"}
 ]}
};
const HOME_DESTINATIONS=[
 "/siai?intent=cost#siai-cost-estimator",
 "/siai#siai-market",
 "/siai?intent=free#siai-market"
] as const;

export function SiaiSearchDiscovery({variant}:{variant:"home"|"ranking"}){
 const {lang}=useLingxiLang(),copy=SIAI_DISCOVERY[lang],homeCopy=HOME_TASKS[lang];
 const icons=["🌐","🏆","✨","🧭","📊","👑"] as const;
 const intents=["cost","all","all","all","api","all"] as const;
 const home=variant==="home",prefix=home?"siai-search-home":"siai-search-ranking";
 return <section className={home?"lx11-home-section my-8":"mx-auto my-5 w-full px-3 sm:px-5"} aria-labelledby={prefix+"-title"} lang={lang==="zh"?"zh-CN":lang} dir={lang==="ar"?"rtl":"ltr"} data-siai-search-intents={variant}>
  <div className="mb-4">
   <h2 id={prefix+"-title"} className="text-xl font-bold sm:text-2xl">{home?homeCopy.title:copy.rankTitle}</h2>
   <p className="mt-2 text-sm leading-7">{home?homeCopy.intro:copy.rankIntro}</p>
  </div>
  {home?
   <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
    {homeCopy.tasks.map((task,i)=><article key={HOME_DESTINATIONS[i]} id={prefix+"-"+i} className="rounded-xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-4">
     <h3 className="text-base font-bold">{task.title}</h3>
     <p className="mt-2 text-sm leading-6">{task.description}</p>
     <Link href={HOME_DESTINATIONS[i]} className="mt-3 inline-block text-sm font-semibold underline underline-offset-4">{task.cta} →</Link>
    </article>)}
   </div>:
   <div className="siai-discovery-six">
    {copy.topics.map((topic,i)=><article key={topic.q} id={prefix+"-"+i} className="siai-discovery-card">
     <a href={"/siai?intent="+intents[i]+(intents[i]==="cost"||intents[i]==="api"?"#siai-cost-estimator":"#siai-market")} aria-label={topic.q}>
      <span className="siai-discovery-icon" aria-hidden="true">{icons[i]}</span>
      <h3>{topic.q}</h3><p>{topic.rank}</p>
     </a>
    </article>)}
   </div>}
 </section>;
}
