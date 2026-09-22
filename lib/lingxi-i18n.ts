"use client";

import { useEffect, useState } from "react";

export type LingxiLang="zh"|"en"|"ja"|"ko"|"fr"|"de"|"es"|"pt"|"ar";
export const LANG_NAMES:Record<LingxiLang,string>={
  zh:"中文",en:"English",ja:"日本語",ko:"한국어",fr:"Français",de:"Deutsch",es:"Español",pt:"Português",ar:"العربية"
};

const ZH={
 brand:"灵犀场",brandFull:"灵犀场 LINGXIFIELD",sasiBrand:"灵犀场 SASI",
 newTask:"新任务",search:"搜索工具、功能或输入你的问题…",create:"创作",recharge:"充值",account:"账户",updates:"更新",
 start:"开始",sasi:"SASI",fieldGroup:"灵犀场",
 home:"首页",tools:"实用工具",studio:"SASI 创作",books:"书本 SASI",learning:"学习 SASI",research:"科研 SASI",
 field:"场域精测",manifest:"意识显化",subconscious:"潜意识重塑",practice:"修炼技术",wallet:"AI 余额",myField:"我的场域",
 light:"浅色",dark:"深色",language:"语言",
 footerLine:"易懂易做，一键即达。让一个念头找到路径，让想法从这里开始生长。",
 follow:"关注灵犀场",service:"服务号",miniapp:"小程序",terms:"用户服务协议",privacy:"隐私政策",declaration:"系统声明",refunds:"充值与退款",sasiRules:"SASI 创作规则",
 homeKicker:"一念即达 · 一念显化",homeTitle:"今天想让什么开始发生？",
 homeLead:"不必先知道该选哪个工具，也不用绕过复杂步骤。把问题、资料或一个还没成形的念头带进来，灵犀场帮你找到入口，再把下一步交到你手里。",
 homePlaceholder:"例如：把这份 PDF 压到 10MB；把一本书变成可以追问的资料；或者，从一个故事开始生成短剧……",
 begin:"开始 →",betterFrom:"更适合从",specificProblem:"先解决一个具体问题",growIdea:"让一个想法开始生长",
 fromHere:"从这里开始",easyReach:"易懂易做，一键即达",homeSectionLead:"不把功能堆给你，而是把入口整理好。需要什么，就从对应的门进去。",
 continueIn:"继续向内",changePath:"让变化有路径，也有回声",changePathLead:"有些问题需要被处理，有些问题需要被看见。灵犀场把两者放在同一座场里。",
 homeNoteA:"灵犀场不是一排按钮。",homeNoteB:"它更像一条从念头到结果的路。",homeNoteC:"工具负责把事情做完，SASI 负责把想法展开，场域系统负责帮助你看见自己正在走向哪里。",
 open:"进入 →",expand:"继续展开 →",
 toolsHero:"少绕一步，事情就更快一点。",toolsLead:"图片、PDF、视频、字幕、隐私与日常文件问题，都从这里开始。能留在浏览器里的，就尽量不上传。",
 toolCount:"个入口已摆上台面",toolSearch:"搜索：PDF 压缩、图片去水印、卡路里、视频转文字…",all:"全部",local:"本地处理",online:"在线能力",
 noTool:"没有找到完全匹配的工具。",noToolLead:"你也可以直接在顶部搜索框描述问题，灵犀场会继续帮你找到入口。",
 sasiKicker:"灵犀场 SASI",sasiTitle:"把一个念头放进来。",sasiLead:"你可以只说一句，也可以带上附件。SASI 先理解你想完成什么，再把任务送到合适的创作、研究或构建路径。",
 sasiPlaceholder:"例如：我有一个故事，想先做成 30 秒漫剧；或者，把这份产品需求直接拆成可以开发的网站。",
 attachment:"附件",connections:"连接",auto:"自动判断",visual:"影像创作",webapp:"网站 / 应用",researchMode:"研究资料",
 creationEntry:"创作入口",wantResult:"想完成什么，就从哪里开始。",oldExit:"旧版大首页退出公共入口，只保留真正需要的生产能力。",
 available:"可进入",coming:"待上线",connecting:"正在接入 →",
 skillsLead:"按任务调用，不必先学会所有能力。",connectTitle:"需要外部能力时，再把它接进来。",
 connectLead:"GitHub、Vercel、Supabase、模型 API 与其他服务不再散落在多个页面。连接入口统一放在这里。",
 openConnect:"打开连接中心 →",balanceTitle:"创作、研究与工具，共用同一个余额入口。",balanceLead:"按实际使用量结算。未使用余额长期保留，不按周清零。",viewBalance:"查看余额与充值 →",
 walletTitle:"让余额留在这里，等你真正需要时再流动。",walletLead:"不绑定会员，不制造“快过期”的压力。创作、研究与需要 AI 的工具，共用同一个余额入口。",
 current:"当前可用",principal:"充值本金",bonus:"赠送额度",refundable:"未使用可退款本金",balanceState:"余额状态",
 topupKicker:"补充余额",topupTitle:"需要多少，就放进来多少。",topupLead:"不是会员，也没有周期清零。充值后的余额长期保留，真正使用 AI 时才按实际用量结算。",
 common:"常用",thisTopup:"这次补充",continueTopup:"继续充值 →",topupFine:"支付成功后会回到这里。余额到账后无需再次开通任何会员或套餐。",
 intelligence:"智能模式",intTitle:"让任务自己匹配合适的力度。",intLead:"你不必认识模型厂商。轻量、标准、高智能代表不同的处理强度与消耗系数。",
 lite:"轻量",standard:"标准",high:"高智能",invite:"邀请",inviteTitle:"把入口分享给真正会用到的人。",records:"退款与记录",recordsTitle:"未使用的充值本金，按原充值记录核对。",
 generateInvite:"生成邀请链接",copy:"复制",orders:"查看充值记录 →",refundRules:"查看退款规则 →",
 updateTitle:"灵犀场更新",update1:"新的统一工作台正在逐步上线。",update2:"SASI、工具平台与 AI 余额已接入同一入口。"
} as const;
type Key=keyof typeof ZH;

const EN:Partial<Record<Key,string>>={
 brand:"LINGXIFIELD",brandFull:"LINGXIFIELD",sasiBrand:"LINGXIFIELD SASI",newTask:"New task",search:"Search tools, features, or describe your problem…",create:"Create",recharge:"Top up",account:"Account",updates:"Updates",
 start:"Start",fieldGroup:"LingxiField",home:"Home",tools:"Tools",studio:"SASI Studio",books:"Book SASI",learning:"Learning SASI",research:"Research SASI",field:"Field Insights",manifest:"Manifestation",subconscious:"Subconscious",practice:"Practice",wallet:"AI Balance",myField:"My Field",light:"Light",dark:"Dark",language:"Language",
 footerLine:"Easy to understand, easy to do, one step closer. Give an idea a path and let it begin to grow.",follow:"Follow LingxiField",service:"WeChat",miniapp:"Mini Program",terms:"Terms",privacy:"Privacy",declaration:"System Notice",refunds:"Top-ups & Refunds",sasiRules:"SASI Rules",
 homeKicker:"One thought · One path",homeTitle:"What would you like to set in motion today?",homeLead:"You do not need to know the right tool first. Bring a problem, a document, or an unfinished idea. LingxiField finds the entry point and hands you the next step.",homePlaceholder:"For example: compress this PDF to 10MB; turn this book into something I can ask; or start a short drama from one story…",begin:"Start →",betterFrom:"Best place to start",specificProblem:"Solve one concrete problem",growIdea:"Let an idea begin to grow",fromHere:"Start here",easyReach:"Clear, simple, within reach",homeSectionLead:"We do not dump features on you. We arrange the entrances so you can step directly into what you need.",continueIn:"Go deeper",changePath:"Give change a path and an echo",changePathLead:"Some problems need action; others need to be seen. LingxiField keeps both in the same space.",homeNoteA:"LingxiField is not a wall of buttons.",homeNoteB:"It is a path from thought to result.",homeNoteC:"Tools finish tasks, SASI expands ideas, and the field system helps you see where you are going.",open:"Open →",expand:"Explore →",
 toolsHero:"One less detour makes everything faster.",toolsLead:"Images, PDFs, video, subtitles, privacy and everyday file problems all start here. If it can stay in your browser, we keep it there.",toolCount:"entries on the surface",toolSearch:"Search: PDF compression, watermark cleanup, calories, video transcription…",all:"All",local:"Local",online:"Online",noTool:"No exact tool match found.",noToolLead:"Describe the problem in the top search box and LingxiField will keep looking for the right entrance.",
 sasiKicker:"LINGXIFIELD SASI",sasiTitle:"Put one thought here.",sasiLead:"Say one sentence or bring an attachment. SASI first understands what you want to complete, then routes the task into creation, research or building.",sasiPlaceholder:"For example: I have a story and want a 30-second animated drama; or turn this product brief into a website build plan.",attachment:"Attachment",connections:"Connections",auto:"Auto",visual:"Visual creation",webapp:"Website / App",researchMode:"Research",creationEntry:"Creation entrances",wantResult:"Start from the result you want.",oldExit:"The old public SASI home is retired. Only the production capabilities you actually need remain.",available:"Available",coming:"Coming soon",connecting:"Connecting →",skillsLead:"Call skills when the task needs them. You do not need to learn everything first.",connectTitle:"Connect external capability only when you need it.",connectLead:"GitHub, Vercel, Supabase, model APIs and other services now share one connection center.",openConnect:"Open connection center →",balanceTitle:"Creation, research and tools share one balance.",balanceLead:"Charged by actual use. Unused balance stays available.",viewBalance:"View balance & top up →",
 walletTitle:"Let your balance stay here until you truly need it.",walletLead:"No membership lock-in and no artificial expiry pressure. Creation, research and AI tools share one balance.",current:"Available now",principal:"Top-up principal",bonus:"Bonus balance",refundable:"Unused refundable principal",balanceState:"Balance state",topupKicker:"Add balance",topupTitle:"Add what you need, when you need it.",topupLead:"Not a membership and no periodic reset. Your balance stays until actual AI usage consumes it.",common:"Common",thisTopup:"This top-up",continueTopup:"Continue →",topupFine:"After payment you return here. No membership or package needs to be activated.",intelligence:"Intelligence modes",intTitle:"Let each task match the right level.",intLead:"You do not need to know model vendors. Light, Standard and High represent different processing strength and usage multipliers.",lite:"Light",standard:"Standard",high:"High",invite:"Invite",inviteTitle:"Share the entrance with someone who will actually use it.",records:"Refunds & records",recordsTitle:"Unused principal is checked against the original top-up record.",generateInvite:"Create invite link",copy:"Copy",orders:"View top-up records →",refundRules:"View refund rules →",updateTitle:"LingxiField updates",update1:"The unified workspace is rolling out step by step.",update2:"SASI, tools and AI balance now share one entrance."
};

const commonNav=(home:string,tools:string,studio:string,books:string,learning:string,research:string,field:string,manifest:string,sub:string,practice:string,wallet:string,myField:string,newTask:string,search:string,create:string,recharge:string,account:string,updates:string,start:string,fieldGroup:string,light:string,dark:string,language:string)=>({home,tools,studio,books,learning,research,field,manifest,subconscious:sub,practice,wallet,myField,newTask,search,create,recharge,account,updates,start,fieldGroup,light,dark,language});
const JA={...commonNav("ホーム","ツール","SASI 制作","ブック SASI","学習 SASI","研究 SASI","フィールド分析","意識の具現化","潜在意識","実践","AI 残高","マイフィールド","新しいタスク","ツールや機能を検索、または問題を入力…","制作","チャージ","アカウント","更新","開始","霊犀場","ライト","ダーク","言語"),homeTitle:"今日は何を動かしたいですか？",begin:"始める →",all:"すべて",local:"ローカル処理",online:"オンライン",coming:"近日公開",available:"利用可能",current:"現在の残高",continueTopup:"チャージを続ける →"};
const KO={...commonNav("홈","도구","SASI 제작","북 SASI","학습 SASI","연구 SASI","필드 분석","의식 구현","잠재의식","수련","AI 잔액","나의 필드","새 작업","도구와 기능을 검색하거나 문제를 입력하세요…","제작","충전","계정","업데이트","시작","링시필드","라이트","다크","언어"),homeTitle:"오늘 무엇을 움직이게 하고 싶나요?",begin:"시작 →",all:"전체",local:"로컬 처리",online:"온라인",coming:"곧 공개",available:"사용 가능",current:"현재 사용 가능",continueTopup:"계속 충전 →"};
const FR={...commonNav("Accueil","Outils","Studio SASI","Livre SASI","Apprentissage SASI","Recherche SASI","Analyse du champ","Manifestation","Subconscient","Pratique","Solde IA","Mon espace","Nouvelle tâche","Rechercher un outil, une fonction ou décrire votre besoin…","Créer","Recharger","Compte","Nouveautés","Départ","LingxiField","Clair","Sombre","Langue"),homeTitle:"Que voulez-vous mettre en mouvement aujourd’hui ?",begin:"Commencer →",all:"Tout",local:"Local",online:"En ligne",coming:"Bientôt",available:"Disponible",current:"Disponible",continueTopup:"Continuer →"};
const DE={...commonNav("Start","Werkzeuge","SASI Studio","Buch SASI","Lernen SASI","Forschung SASI","Feldanalyse","Manifestation","Unterbewusstsein","Praxis","KI-Guthaben","Mein Feld","Neue Aufgabe","Werkzeuge und Funktionen suchen oder Problem eingeben…","Erstellen","Aufladen","Konto","Neuigkeiten","Start","LingxiField","Hell","Dunkel","Sprache"),homeTitle:"Was möchten Sie heute in Bewegung bringen?",begin:"Start →",all:"Alle",local:"Lokal",online:"Online",coming:"Demnächst",available:"Verfügbar",current:"Verfügbar",continueTopup:"Weiter →"};
const ES={...commonNav("Inicio","Herramientas","SASI Studio","Libro SASI","Aprendizaje SASI","Investigación SASI","Análisis de campo","Manifestación","Subconsciente","Práctica","Saldo IA","Mi campo","Nueva tarea","Busca herramientas y funciones o describe tu problema…","Crear","Recargar","Cuenta","Novedades","Inicio","LingxiField","Claro","Oscuro","Idioma"),homeTitle:"¿Qué quieres poner en marcha hoy?",begin:"Empezar →",all:"Todo",local:"Local",online:"En línea",coming:"Próximamente",available:"Disponible",current:"Disponible",continueTopup:"Continuar →"};
const PT={...commonNav("Início","Ferramentas","SASI Studio","Livro SASI","Aprendizagem SASI","Pesquisa SASI","Análise de campo","Manifestação","Subconsciente","Prática","Saldo IA","Meu campo","Nova tarefa","Pesquise ferramentas e funções ou descreva o problema…","Criar","Recarregar","Conta","Novidades","Início","LingxiField","Claro","Escuro","Idioma"),homeTitle:"O que você quer colocar em movimento hoje?",begin:"Começar →",all:"Tudo",local:"Local",online:"Online",coming:"Em breve",available:"Disponível",current:"Disponível",continueTopup:"Continuar →"};
const AR={...commonNav("الرئيسية","الأدوات","استوديو SASI","كتاب SASI","تعلّم SASI","بحث SASI","تحليل المجال","التجسيد","العقل الباطن","الممارسة","رصيد الذكاء","مجالي","مهمة جديدة","ابحث عن أداة أو ميزة، أو اكتب ما تريد حله…","إنشاء","شحن","الحساب","التحديثات","ابدأ","LingxiField","فاتح","داكن","اللغة"),homeTitle:"ما الذي تريد أن تبدأ حركته اليوم؟",begin:"ابدأ →",all:"الكل",local:"محلي",online:"عبر الإنترنت",coming:"قريبًا",available:"متاح",current:"المتاح الآن",continueTopup:"متابعة الشحن →"};

const dictionaries:Record<LingxiLang,Partial<Record<Key,string>>>={zh:ZH,en:EN,ja:JA,ko:KO,fr:FR,de:DE,es:ES,pt:PT,ar:AR};
export function tr(lang:LingxiLang,key:Key){return dictionaries[lang][key]??EN[key]??ZH[key]}
export function setLingxiLang(lang:LingxiLang){
 localStorage.setItem("lx-lang",lang);document.documentElement.lang=lang==="zh"?"zh-CN":lang;document.documentElement.dir=lang==="ar"?"rtl":"ltr";document.documentElement.dataset.lang=lang;document.documentElement.classList.toggle("lang-en",lang==="en");window.dispatchEvent(new CustomEvent("lingxi:lang",{detail:lang}));
}
export function useLingxiLang(){
 const[lang,setLangState]=useState<LingxiLang>("zh");
 useEffect(()=>{const saved=(localStorage.getItem("lx-lang")||"zh") as LingxiLang;const next=LANG_NAMES[saved]?saved:"zh";setLangState(next);setLingxiLang(next);const h=(e:Event)=>setLangState((e as CustomEvent<LingxiLang>).detail);window.addEventListener("lingxi:lang",h);return()=>window.removeEventListener("lingxi:lang",h)},[]);
 return{lang,setLang:setLingxiLang,t:(key:Key)=>tr(lang,key)};
}
