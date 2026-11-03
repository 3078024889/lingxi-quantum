import Link from "next/link";
import type {SeoLocale} from "@/lib/seo/global-seo";

type Question = {q:string;a:string;href:string;link:string};
type Content = {eyebrow:string;title:string;intro:string;questions:Question[];explore:string;create:string;tools:string};
const FAQ:Record<SeoLocale,Content>={
 zh:{
  eyebrow:"来自真实使用场景的答案",
  title:"选 AI、比价格、做作品，你想知道的都在这里",
  intro:"不必翻遍各家官网。从要完成的任务出发，比较工具与使用条件，再决定用哪一个。",
  questions:[
   {q:"全球 AI 工具这么多，怎么选最适合自己的？",a:"先明确任务：写作研究、编程建站、图片生成、视频制作还是本地部署。然后对比模型能力、免费额度、实际价格、可用地区和付款方式。",href:"/siai",link:"按任务比较全球 AI 工具"},
   {q:"AI 工具有哪些免费额度？免费版够用吗？",a:"免费体验往往附带次数、模型、清晰度、水印或商用限制。排行榜将免费功能与价格放在一起，帮助你先核对限制，再决定是否付费。",href:"/siai",link:"查看免费额度和价格"},
   {q:"想做 AI 短剧、视频或网站，从哪里开始？",a:"从 SASI 创作入口选择短剧、视频或网站任务，先写清题材、时长和风格，再按实际开放的生成与导出步骤操作。",href:"/sasi",link:"打开 SASI 智能创作"},
   {q:"PDF 编辑、电子签名、图片处理和视频转文字在哪里做？",a:"在在线实用工具中按文件类型或具体任务搜索，选择 PDF、OCR、图片转换、字幕、音频或隐私工具，按页面提示上传、处理并保存。",href:"/tools",link:"查看全部在线实用工具"},
   {q:"AI 生成的作品能不能商用？",a:"不同服务、模型和订阅套餐的商用条件并不相同。先查看工具详情中的授权摘要与官方条款，再根据所用模型和计划核对。",href:"/siai",link:"查看商用使用条件"},
   {q:"怎么知道某款 AI 工具在我的地区能不能用？",a:"查看对应工具的地区说明、登录方式及付款渠道。地区可访问不一定等于全部功能都可用，关键能力应以实际工具页面和官方资料为准。",href:"/siai",link:"对比地区与支付方式"}
  ],explore:"探索全球 SIAI 排行榜",create:"开始 SASI 创作",tools:"使用在线实用工具"
 },
 en:{
  eyebrow:"Answers for real tasks",title:"Choose the right AI, compare costs, and get things done",
  intro:"Start with your task, compare what each tool offers, then choose what fits.",
  questions:[
   {q:"How do I choose the right AI tool?",a:"Start with your task: research, coding, images, video or local models. Compare capabilities, prices, free limits, regional access and payment options.",href:"/siai",link:"Compare AI tools by task"},
   {q:"Which AI tools have a free plan?",a:"Free tiers may limit usage, resolution, models or commercial rights. Compare each offer and its limits before paying.",href:"/siai",link:"Compare free plans and prices"},
   {q:"Where can I create AI videos, dramas or websites?",a:"Start with SASI, choose the kind of project and check the available generation and export steps.",href:"/sasi",link:"Start creating with SASI"},
   {q:"Can I edit PDFs, convert images or transcribe video online?",a:"Browse online utilities by file type or task to find PDF, OCR, media, subtitle and privacy tools.",href:"/tools",link:"Browse online tools"}
  ],explore:"Explore SIAI rankings",create:"Create with SASI",tools:"Use online tools"
 },
 ja:{
  eyebrow:"用途から探す回答",title:"AIの選び方、料金比較、作品制作まで",
  intro:"やりたいことから選び、機能、料金、無料枠、利用地域を比較しましょう。",
  questions:[
   {q:"自分に合うAIツールはどう選ぶ？",a:"文章・研究・コード・画像・動画など用途を決め、機能と料金、無料枠、地域を比較します。",href:"/siai",link:"AIツールを比較"},
   {q:"無料で試せるAIツールは？",a:"無料枠には回数・画質・モデル・商用条件の制限があります。各プランを比較してください。",href:"/siai",link:"無料枠と料金"},
   {q:"AI動画やWebサイトを作るには？",a:"SASIで制作内容を選び、利用できる生成・書き出し機能を確認します。",href:"/sasi",link:"SASIで制作"},
   {q:"PDF編集や画像変換、動画文字起こしは？",a:"オンラインツールをファイル形式や用途で検索できます。",href:"/tools",link:"オンラインツール"}
  ],explore:"SIAIランキング",create:"SASIで制作",tools:"ツールを使う"
 },
 ko:{
  eyebrow:"실제 작업을 위한 답변",title:"AI 선택부터 비용 비교와 제작까지",
  intro:"해야 할 작업을 정하고 기능, 가격, 무료 한도, 지원 지역을 비교하세요.",
  questions:[
   {q:"나에게 맞는 AI 도구는 어떻게 고르나요?",a:"글쓰기, 연구, 코딩, 이미지, 영상 등 작업별로 기능과 비용, 무료 한도, 지원 지역을 비교하세요.",href:"/siai",link:"AI 도구 비교"},
   {q:"무료로 써볼 수 있는 AI가 있나요?",a:"무료 플랜은 횟수, 해상도, 모델 또는 상업적 이용에 제한이 있을 수 있습니다.",href:"/siai",link:"무료 한도와 가격"},
   {q:"AI 영상과 웹사이트는 어디서 만들까요?",a:"SASI에서 프로젝트를 선택하고 제공되는 생성 및 다운로드 단계를 확인하세요.",href:"/sasi",link:"SASI 창작"},
   {q:"PDF, 이미지, 영상 자막 도구는 어디 있나요?",a:"온라인 도구에서 파일 유형 또는 작업으로 검색하세요.",href:"/tools",link:"온라인 도구"}
  ],explore:"SIAI 순위",create:"SASI 창작",tools:"온라인 도구"
 },
 fr:{
  eyebrow:"Réponses à vos besoins",title:"Choisir une IA, comparer les tarifs et créer",
  intro:"Partez de votre tâche, puis comparez les fonctionnalités et conditions.",
  questions:[
   {q:"Comment choisir le bon outil IA ?",a:"Comparez les fonctions, les prix, les offres gratuites et la disponibilité selon votre besoin.",href:"/siai",link:"Comparer les outils IA"},
   {q:"Quels outils IA proposent un accès gratuit ?",a:"Les offres gratuites peuvent limiter les usages, la qualité, les modèles ou les droits commerciaux.",href:"/siai",link:"Comparer les offres"},
   {q:"Comment créer une vidéo IA ou un site ?",a:"Dans SASI, choisissez votre projet puis vérifiez les options de génération et d'exportation.",href:"/sasi",link:"Créer avec SASI"},
   {q:"Où modifier des PDF ou convertir des images ?",a:"Recherchez les outils PDF, OCR, vidéo et audio par tâche.",href:"/tools",link:"Outils en ligne"}
  ],explore:"Classement SIAI",create:"Créer avec SASI",tools:"Outils en ligne"
 },
 de:{
  eyebrow:"Antworten für echte Aufgaben",title:"KI wählen, Preise vergleichen, Projekte umsetzen",
  intro:"Beginne mit deinem Ziel und vergleiche Funktionen und Nutzungsbedingungen.",
  questions:[
   {q:"Welches KI-Tool passt zu mir?",a:"Vergleiche Funktionen, Kosten, Gratis-Kontingente und regionale Verfügbarkeit nach Aufgabe.",href:"/siai",link:"KI-Tools vergleichen"},
   {q:"Welche KI-Tools kann man kostenlos testen?",a:"Gratis-Tarife können Nutzung, Auflösung, Modelle oder kommerzielle Rechte begrenzen.",href:"/siai",link:"Gratis-Tarife vergleichen"},
   {q:"Wie erstelle ich KI-Videos oder Websites?",a:"Wähle in SASI einen Projekttyp und prüfe die verfügbaren Erstellungs- und Exportfunktionen.",href:"/sasi",link:"Mit SASI starten"},
   {q:"Wo kann ich PDFs oder Bilder bearbeiten?",a:"Suche Online-Werkzeuge nach Dateityp und Aufgabe.",href:"/tools",link:"Online-Tools"}
  ],explore:"SIAI-Ranking",create:"SASI-Kreation",tools:"Online-Tools"
 },
 es:{
  eyebrow:"Respuestas para tareas reales",title:"Elige una IA, compara precios y empieza a crear",
  intro:"Empieza por tu tarea y compara prestaciones, precios y condiciones.",
  questions:[
   {q:"¿Cómo elegir la herramienta IA adecuada?",a:"Compara funciones, precios, planes gratuitos y regiones según tu objetivo.",href:"/siai",link:"Comparar herramientas IA"},
   {q:"¿Qué herramientas IA tienen plan gratuito?",a:"Los planes gratis pueden limitar usos, resolución, modelos o derechos comerciales.",href:"/siai",link:"Comparar planes gratis"},
   {q:"¿Cómo crear vídeos IA o sitios web?",a:"Elige un proyecto en SASI y revisa las funciones de generación y exportación disponibles.",href:"/sasi",link:"Crear con SASI"},
   {q:"¿Dónde editar PDF o convertir imágenes?",a:"Busca utilidades PDF, OCR, vídeo y audio por tarea.",href:"/tools",link:"Herramientas online"}
  ],explore:"Ranking SIAI",create:"Crear con SASI",tools:"Herramientas online"
 },
 pt:{
  eyebrow:"Respostas para tarefas reais",title:"Escolha a IA, compare preços e comece a criar",
  intro:"Comece pela sua tarefa e compare funções, preços e condições.",
  questions:[
   {q:"Como escolher a ferramenta de IA certa?",a:"Compare recursos, preços, opções grátis e disponibilidade por tarefa.",href:"/siai",link:"Comparar ferramentas IA"},
   {q:"Quais ferramentas de IA têm plano grátis?",a:"Planos gratuitos podem limitar uso, resolução, modelos ou direitos comerciais.",href:"/siai",link:"Comparar opções grátis"},
   {q:"Como criar vídeos de IA ou sites?",a:"Escolha um projeto no SASI e confira as etapas de geração e exportação disponíveis.",href:"/sasi",link:"Criar com SASI"},
   {q:"Onde editar PDFs ou converter imagens?",a:"Busque utilitários de PDF, OCR, vídeo e áudio por tarefa.",href:"/tools",link:"Ferramentas online"}
  ],explore:"Ranking SIAI",create:"Criar com SASI",tools:"Ferramentas online"
 },
 ar:{
  eyebrow:"إجابات لاحتياجاتك",title:"اختر أداة الذكاء الاصطناعي وقارن الأسعار وابدأ",
  intro:"ابدأ بالمهمة ثم قارن الميزات والأسعار وشروط الاستخدام.",
  questions:[
   {q:"كيف أختار أداة الذكاء الاصطناعي المناسبة؟",a:"قارن الوظائف والأسعار والخطط المجانية والمناطق وفق المهمة التي تريد إنجازها.",href:"/siai",link:"مقارنة أدوات الذكاء الاصطناعي"},
   {q:"ما الأدوات التي توفر تجربة مجانية؟",a:"قد تقيّد الخطط المجانية عدد الاستخدامات أو الدقة أو النماذج أو الحقوق التجارية.",href:"/siai",link:"مقارنة الخطط المجانية"},
   {q:"كيف أنشئ فيديو أو موقعًا بالذكاء الاصطناعي؟",a:"اختر نوع المشروع في SASI وتحقق من خطوات الإنشاء والتصدير المتاحة.",href:"/sasi",link:"ابدأ مع SASI"},
   {q:"أين يمكن تعديل PDF أو تحويل الصور؟",a:"ابحث عن أدوات PDF والصور والفيديو والصوت حسب المهمة.",href:"/tools",link:"الأدوات عبر الإنترنت"}
  ],explore:"تصنيف SIAI",create:"إنشاء SASI",tools:"الأدوات عبر الإنترنت"
 }
};

export default function HomeSeoAnswers({locale}:{locale:SeoLocale}){
 const copy=FAQ[locale]||FAQ.zh;
 return <section className="lx-seo-answers" aria-labelledby="lx-seo-title" lang={locale==="zh"?"zh-CN":locale} dir={locale==="ar"?"rtl":"ltr"}>
  <div className="lx-seo-answers-head">
   <p className="lx-seo-eyebrow">{copy.eyebrow}</p>
   <h2 id="lx-seo-title">{copy.title}</h2><p>{copy.intro}</p>
  </div>
  <div className="lx-seo-question-grid">
   {copy.questions.map((item)=>(
    <article className="lx-seo-question" key={item.q}>
     <h3>{item.q}</h3><p>{item.a}</p>
     <Link href={item.href}>{item.link} <span aria-hidden="true">→</span></Link>
    </article>
   ))}
  </div>
  <nav className="lx-seo-answers-links" aria-label="LINGXIFIELD">
   <Link href="/siai">{copy.explore}</Link><Link href="/sasi">{copy.create}</Link><Link href="/tools">{copy.tools}</Link>
  </nav>
 </section>
}
