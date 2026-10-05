"use client";

import Link from "next/link";
import {useEffect,useState} from "react";
import {useLingxiLang,type LingxiLang} from "@/lib/lingxi-i18n";
import type {SasiMode} from "@/lib/sasi/core/session-contract";

type State="checking"|"connected"|"not-connected"|"login"|"unavailable";
type Copy=Record<LingxiLang,string>;
const L=(zh:string,en:string,ja:string,ko:string,fr:string,de:string,es:string,pt:string,ar:string):Copy=>({zh,en,ja,ko,fr,de,es,pt,ar});

const COPY={
 eyebrow:L("开始前只看这一点","One thing before you start","始める前に1点だけ","시작 전 한 가지만","Une chose avant de commencer","Eine Sache vor dem Start","Una cosa antes de empezar","Uma coisa antes de começar","شيء واحد قبل البدء"),
 title:L("让 SASI 真正开始创作，还差一步：连接你自己的智能服务。","One step to make SASI create for real: connect your own intelligence service.","SASIで本格的に作るには、あなたのAIサービスを接続するだけです。","SASI가 실제로 만들기 시작하려면 내 AI 서비스를 연결하세요.","Pour que SASI crée réellement, connectez votre propre service d’IA.","Damit SASI wirklich erstellt, verbinde deinen eigenen KI-Dienst.","Para que SASI cree de verdad, conecta tu propio servicio de IA.","Para o SASI criar de verdade, conecte seu próprio serviço de IA.","لبدء الإنشاء الفعلي عبر SASI، اربط خدمة الذكاء الخاصة بك."),
 lead:L(
  "模型费用不由灵犀场代付。连接你已有的 OpenRouter 或火山引擎账号后，模型费用由对应服务商按其规则收取；灵犀场负责把网站、短剧、书本、学习和科研流程编排起来。",
  "LINGXIFIELD does not prepay model costs. Connect your existing OpenRouter or Volcengine account; the provider bills model usage under its own rules, while SASI orchestrates website, drama, book, learning and research workflows.",
  "モデル料金をLINGXIFIELDが立て替えることはありません。OpenRouterまたはVolcengineの既存アカウントを接続すると、モデル利用料は各サービス側の規則で請求され、SASIはウェブサイト・短編映像・本・学習・研究の流れを編成します。",
  "LINGXIFIELD가 모델 비용을 대신 결제하지 않습니다. 기존 OpenRouter 또는 Volcengine 계정을 연결하면 모델 사용료는 해당 서비스 규칙에 따라 청구되고, SASI는 웹사이트·숏드라마·책·학습·연구 흐름을 구성합니다.",
  "LINGXIFIELD n’avance pas les coûts des modèles. Connectez votre compte OpenRouter ou Volcengine ; le fournisseur facture l’usage selon ses règles, et SASI orchestre les flux site, fiction, livre, apprentissage et recherche.",
  "LINGXIFIELD streckt Modellkosten nicht vor. Verbinde dein OpenRouter- oder Volcengine-Konto; die Modellnutzung wird vom jeweiligen Anbieter berechnet, während SASI Website-, Drama-, Buch-, Lern- und Forschungsabläufe orchestriert.",
  "LINGXIFIELD no adelanta el coste de los modelos. Conecta tu cuenta de OpenRouter o Volcengine; el proveedor cobra el uso según sus reglas y SASI orquesta web, ficción, libros, aprendizaje e investigación.",
  "A LINGXIFIELD não antecipa o custo dos modelos. Conecte sua conta OpenRouter ou Volcengine; o provedor cobra o uso segundo suas regras e o SASI orquestra site, drama, livros, estudo e pesquisa.",
  "لا تدفع LINGXIFIELD تكلفة النماذج مقدمًا. اربط حساب OpenRouter أو Volcengine الخاص بك؛ يحتسب المزوّد تكلفة الاستخدام وفق قواعده، بينما ينظم SASI مسارات المواقع والدراما والكتب والتعلم والبحث."
 ),
 connected:L("智能服务已连接，可以直接开始。","Your intelligence service is connected. You can start now.","AIサービスは接続済みです。すぐに開始できます。","지능형 서비스가 연결되었습니다. 바로 시작할 수 있습니다.","Votre service d’IA est connecté. Vous pouvez commencer.","Dein KI-Dienst ist verbunden. Du kannst starten.","Tu servicio de IA está conectado. Ya puedes empezar.","Seu serviço de IA está conectado. Você já pode começar.","تم ربط خدمة الذكاء ويمكنك البدء الآن."),
 connect:L("连接我的智能服务","Connect my intelligence service","AIサービスを接続","내 지능형 서비스 연결","Connecter mon service d’IA","Meinen KI-Dienst verbinden","Conectar mi servicio de IA","Conectar meu serviço de IA","ربط خدمة الذكاء الخاصة بي"),
 freeHint:L("没有现成账号？OpenRouter 提供免费模型，Gemini API 也有免费层；可以先在服务商处创建自己的 Key，再回来连接。","No provider account yet? OpenRouter offers free models and the Gemini API has a free tier. Create your own key with a provider, then connect it here.","アカウントがまだない場合、OpenRouterには無料モデル、Gemini APIには無料枠があります。サービス側で自分のKeyを作成してから接続できます。","계정이 없다면 OpenRouter 무료 모델이나 Gemini API 무료 등급을 활용할 수 있습니다. 제공업체에서 내 Key를 만든 뒤 연결하세요.","Pas encore de compte ? OpenRouter propose des modèles gratuits et l’API Gemini dispose d’un niveau gratuit. Créez votre propre clé chez le fournisseur puis connectez-la ici.","Noch kein Konto? OpenRouter bietet kostenlose Modelle und die Gemini API eine kostenlose Stufe. Erstelle beim Anbieter deinen eigenen Key und verbinde ihn anschließend hier.","¿Aún no tienes cuenta? OpenRouter ofrece modelos gratuitos y la API de Gemini tiene nivel gratuito. Crea tu propia clave con el proveedor y conéctala aquí.","Ainda não tem conta? O OpenRouter oferece modelos gratuitos e a API Gemini tem camada gratuita. Crie sua própria chave no provedor e conecte aqui.","ليس لديك حساب بعد؟ يوفر OpenRouter نماذج مجانية ولدى Gemini API طبقة مجانية. أنشئ مفتاحك لدى المزوّد ثم اربطه هنا."),
 websiteLocal:L("网站模式即使暂时没连接，也可以先看本地结构草稿；连接后再进入真正的智能生成。","Website mode can show a local structure draft before you connect; connect a service for full intelligent generation.","Webサイトモードは未接続でもローカル構成案を確認できます。本格生成には接続してください。","웹사이트 모드는 연결 전에도 로컬 구조 초안을 볼 수 있으며, 실제 지능형 생성은 연결 후 진행됩니다.","Le mode site peut afficher une ébauche locale avant connexion ; connectez un service pour la génération intelligente complète.","Im Website-Modus kannst du vor der Verbindung einen lokalen Strukturentwurf sehen; für die vollständige KI-Erstellung verbindest du danach einen Dienst.","El modo web puede mostrar un borrador local antes de conectar; conecta un servicio para la generación inteligente completa.","O modo site pode mostrar um rascunho local antes da conexão; conecte um serviço para a geração inteligente completa.","يمكن لوضع الموقع عرض مسودة محلية قبل الربط؛ اربط خدمة للحصول على التوليد الذكي الكامل."),
 login:L("先登录，再连接你的智能服务。","Sign in first, then connect your intelligence service.","先にログインしてからAIサービスを接続してください。","먼저 로그인한 뒤 지능형 서비스를 연결하세요.","Connectez-vous d’abord, puis reliez votre service d’IA.","Melde dich zuerst an und verbinde dann deinen KI-Dienst.","Inicia sesión primero y luego conecta tu servicio de IA.","Entre primeiro e depois conecte seu serviço de IA.","سجّل الدخول أولًا ثم اربط خدمة الذكاء الخاصة بك.")
} as const;

export default function SasiStartGuide({mode}:{mode:SasiMode}){
 const {lang}=useLingxiLang(); const t=(k:keyof typeof COPY)=>COPY[k][lang]||COPY[k].en;
 const [state,setState]=useState<State>("checking");
 useEffect(()=>{
  let alive=true;
  fetch("/api/sasi/connections",{cache:"no-store"})
   .then(async r=>({r,b:await r.json().catch(()=>({}))}))
   .then(({r,b})=>{
    if(!alive)return;
    if(r.status===401){setState("login");return}
    if(!r.ok){setState("unavailable");return}
    const rows=Array.isArray(b.connections)?b.connections:[];
    const ok=rows.some((x:any)=>["healthy","stored"].includes(String(x.healthStatus||"")));
    setState(ok?"connected":"not-connected");
   }).catch(()=>alive&&setState("unavailable"));
  return()=>{alive=false};
 },[]);
 if(state==="connected") return <div className="mx-auto mt-6 max-w-3xl rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-soft)] px-4 py-3 text-sm text-[var(--lx-muted)]">{t("connected")}</div>;
 return <section className="mx-auto mt-6 max-w-3xl rounded-3xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-5 shadow-sm">
   <p className="text-[11px] font-semibold uppercase tracking-[.16em] text-[var(--lx-faint)]">{t("eyebrow")}</p>
   <h2 className="mt-2 text-lg font-semibold text-[var(--lx-ink)]">{t("title")}</h2>
   <p className="mt-2 text-sm leading-6 text-[var(--lx-muted)]">{state==="login"?t("login"):t("lead")}</p>
   {mode==="website"&&<p className="mt-2 text-xs leading-5 text-[var(--lx-faint)]">{t("websiteLocal")}</p>}
   <div className="mt-4 flex flex-wrap items-center gap-3">
    <Link href="/sasi/connections" className="rounded-xl bg-[var(--lx-ink)] px-4 py-2.5 text-sm font-medium text-[var(--lx-bg)]">{t("connect")}</Link>
    <span className="max-w-xl text-xs leading-5 text-[var(--lx-faint)]">{t("freeHint")}</span>
   </div>
  </section>;
}
