import type {Language} from './v2';
const TEXT={"zh":{"unknownPrice":"价格尚未核实","variable":"按套餐计费，查看官网","localFree":"本地核心软件免费；云服务另计","api":"聊天/核心免费体验；API按量计费","sdk":"SDK免费安装，API按用量收费","annual":"年付折合每月","monthly":"每月","monthlyRef":"每月（参考）","workYear":"每个工作区每年","localMonthly":"按月单独购买","unknownFree":"免费额度未核实","limited":"有免费方案，额度有限","webFree":"可免费使用部分网页功能，API另计","localUse":"在自有设备运行免费，需本地硬件","dailyCredits":"每天积分","monthlyCredits":"每月积分","oneTime":"一次性积分，不每日恢复","buildCredits":"每天构建积分，月上限","sandbox":"免费沙盒消息额度","freeNoCommercial":"免费积分仅限非商业作品","notFreeVerified":"免费试用情况未核实","modelVaries":"具体模型取决于产品与套餐","modelLocal":"模型由用户自行安装选择","loginSource":"查看官方注册或登录要求"},"en":{"unknownPrice":"Price not verified","variable":"Price varies by plan","localFree":"Local software free; cloud billed separately","api":"Free chat/basic use; API usage billed separately","sdk":"SDK free to install; API metered","annual":"per month, billed annually","monthly":"per month","monthlyRef":"per month (reference)","workYear":"per workspace per year","localMonthly":"per single monthly purchase","unknownFree":"Free allowance not verified","limited":"Free option with usage limits","webFree":"Some web features free; API separate","localUse":"Free on your own device; hardware required","dailyCredits":"credits daily","monthlyCredits":"credits monthly","oneTime":"one-time credits, not renewed daily","buildCredits":"build credits/day; monthly cap","sandbox":"free sandbox message credits","freeNoCommercial":"free credits; generated music noncommercial","notFreeVerified":"Free trial availability not verified","modelVaries":"Model versions depend on product and plan","modelLocal":"Models selected by the user for local use","loginSource":"See official sign-in requirements"},"ja":{"unknownPrice":"価格未確認","variable":"プランによって異なる","localFree":"ローカル本体は無料・クラウド別料金","api":"基本利用無料・API従量課金","sdk":"SDK導入無料・API従量課金","annual":"月額換算・年払い","monthly":"月額","monthlyRef":"月額（参考）","workYear":"ワークスペースごと年額","localMonthly":"月単位で購入","unknownFree":"無料枠未確認","limited":"無料プランあり・制限付き","webFree":"一部Web機能無料・API別","localUse":"自分のPCなら無料・機器が必要","dailyCredits":"クレジット/日","monthlyCredits":"クレジット/月","oneTime":"初回のみ・毎日補充なし","buildCredits":"構築クレジット/日・月上限","sandbox":"無料サンドボックスメッセージ","freeNoCommercial":"無料クレジット・作品は商用不可","notFreeVerified":"無料体験の有無は未確認","modelVaries":"モデルは製品とプランによって異なる","modelLocal":"利用モデルはユーザーが選択","loginSource":"公式登録・ログイン要件を確認"},"ko":{"unknownPrice":"가격 미확인","variable":"요금제에 따라 다름","localFree":"로컬 무료·클라우드 별도","api":"기본 무료·API 사용량 별도","sdk":"SDK 무료 설치·API 별도 청구","annual":"연간 결제 시 월 환산","monthly":"월","monthlyRef":"월별 참고","workYear":"워크스페이스당 연간","localMonthly":"월 단위 구매","unknownFree":"무료 한도 미확인","limited":"무료 요금제·사용량 제한","webFree":"일부 웹 기능 무료·API 별도","localUse":"자체 기기 무료·하드웨어 필요","dailyCredits":"크레딧/일","monthlyCredits":"크레딧/월","oneTime":"일회성 크레딧·매일 충전 없음","buildCredits":"빌드 크레딧/일·월 상한","sandbox":"무료 샌드박스 메시지","freeNoCommercial":"무료 크레딧·상업적 이용 불가","notFreeVerified":"무료 체험 여부 미확인","modelVaries":"모델은 제품·요금제에 따라 다름","modelLocal":"사용자가 로컬 모델 선택","loginSource":"공식 로그인 조건 확인"},"fr":{"unknownPrice":"Prix non vérifié","variable":"Prix selon l’offre","localFree":"Logiciel local gratuit ; cloud séparé","api":"Usage de base gratuit ; API à l’usage","sdk":"SDK gratuit ; API facturée","annual":"par mois, facturé annuellement","monthly":"par mois","monthlyRef":"par mois (indicatif)","workYear":"par espace et par an","localMonthly":"achat mensuel unique","unknownFree":"Quota gratuit non vérifié","limited":"Offre gratuite à quota limité","webFree":"Certaines fonctions Web gratuites ; API séparée","localUse":"Gratuit sur votre appareil ; matériel requis","dailyCredits":"crédits/jour","monthlyCredits":"crédits/mois","oneTime":"crédits uniques, sans renouvellement quotidien","buildCredits":"crédits de création/jour ; plafond mensuel","sandbox":"crédits de messages sandbox gratuits","freeNoCommercial":"crédits gratuits ; musique non commerciale","notFreeVerified":"Essai gratuit non vérifié","modelVaries":"Modèles selon le produit et l’offre","modelLocal":"Modèles choisis par l’utilisateur","loginSource":"Voir les conditions de connexion"},"de":{"unknownPrice":"Preis ungeprüft","variable":"Preis je nach Tarif","localFree":"Lokal kostenlos; Cloud separat","api":"Basis gratis; API nach Nutzung","sdk":"SDK kostenlos; API separat","annual":"pro Monat, jährlich abgerechnet","monthly":"pro Monat","monthlyRef":"pro Monat (Richtwert)","workYear":"pro Workspace und Jahr","localMonthly":"monatlicher Einzelkauf","unknownFree":"Gratislimit nicht geprüft","limited":"Gratisplan mit Nutzungslimits","webFree":"Einige Webfunktionen gratis; API separat","localUse":"Auf eigener Hardware gratis","dailyCredits":"Credits pro Tag","monthlyCredits":"Credits pro Monat","oneTime":"Einmalige Credits, nicht täglich","buildCredits":"Build-Credits pro Tag, Monatslimit","sandbox":"Gratis-Sandbox-Nachrichten","freeNoCommercial":"Gratis-Credits; Musik nicht kommerziell","notFreeVerified":"Gratis-Test nicht bestätigt","modelVaries":"Modelle je nach Produkt und Tarif","modelLocal":"Modelle werden lokal ausgewählt","loginSource":"Offizielle Anmeldebedingungen prüfen"},"es":{"unknownPrice":"Precio sin verificar","variable":"Precio según el plan","localFree":"Software local gratis; nube aparte","api":"Uso básico gratis; API por consumo","sdk":"SDK gratis; API de pago","annual":"al mes, facturado anualmente","monthly":"al mes","monthlyRef":"al mes (referencia)","workYear":"por espacio al año","localMonthly":"compra mensual individual","unknownFree":"Cuota gratis no verificada","limited":"Plan gratis con límites","webFree":"Funciones web gratis; API aparte","localUse":"Gratis en tu equipo; requiere hardware","dailyCredits":"créditos diarios","monthlyCredits":"créditos mensuales","oneTime":"créditos únicos, no se reponen a diario","buildCredits":"créditos de creación/día; tope mensual","sandbox":"mensajes sandbox gratuitos","freeNoCommercial":"créditos gratis; música no comercial","notFreeVerified":"Prueba gratis sin verificar","modelVaries":"Modelos según producto y plan","modelLocal":"Modelos elegidos por el usuario","loginSource":"Consultar requisitos de acceso"},"pt":{"unknownPrice":"Preço não verificado","variable":"Preço conforme o plano","localFree":"Local grátis; nuvem à parte","api":"Uso básico grátis; API por consumo","sdk":"SDK gratuito; API cobrada","annual":"por mês, cobrado anualmente","monthly":"por mês","monthlyRef":"por mês (referência)","workYear":"por workspace ao ano","localMonthly":"compra mensal avulsa","unknownFree":"Limite grátis não verificado","limited":"Plano gratuito com limites","webFree":"Funções web grátis; API à parte","localUse":"Grátis no próprio dispositivo; requer hardware","dailyCredits":"créditos diários","monthlyCredits":"créditos mensais","oneTime":"créditos únicos, não renovam diariamente","buildCredits":"créditos de criação/dia; teto mensal","sandbox":"mensagens sandbox gratuitas","freeNoCommercial":"créditos grátis; música não comercial","notFreeVerified":"Teste grátis não verificado","modelVaries":"Modelos conforme produto e plano","modelLocal":"Modelos escolhidos pelo usuário","loginSource":"Consultar condições de login"},"ar":{"unknownPrice":"السعر غير مؤكد","variable":"السعر حسب الخطة","localFree":"محلي مجاني، السحابة منفصلة","api":"الاستخدام الأساسي مجاني، API حسب الاستهلاك","sdk":"SDK مجاني، API مدفوعة","annual":"شهرياً عند الدفع سنوياً","monthly":"شهرياً","monthlyRef":"شهرياً (تقريبي)","workYear":"لكل مساحة عمل سنوياً","localMonthly":"شراء شهري منفصل","unknownFree":"الحصة المجانية غير مؤكدة","limited":"خطة مجانية بحدود الاستخدام","webFree":"بعض وظائف الويب مجانية وAPI منفصلة","localUse":"مجاني على جهازك مع متطلبات العتاد","dailyCredits":"رصيد يومي","monthlyCredits":"رصيد شهري","oneTime":"رصيد لمرة واحدة، لا يتجدد يومياً","buildCredits":"رصيد بناء يومي مع حد شهري","sandbox":"رسائل مجانية في بيئة تجريبية","freeNoCommercial":"رصيد مجاني، الموسيقى غير تجارية","notFreeVerified":"التجربة المجانية غير مؤكدة","modelVaries":"النماذج حسب المنتج والخطة","modelLocal":"النماذج يختارها المستخدم محلياً","loginSource":"راجع شروط التسجيل الرسمية"}} as const;
type Scope='price'|'free'|'models';
type FactConfig={price:string|readonly [string,number,string];free:string|readonly [string,number,number?];models:string};
const FACTS:Readonly<Record<string,FactConfig>>={
 "anthropic-sdk-python": {
  "price": "sdk",
  "free": "unknownFree",
  "models": "Anthropic Python SDK · Python ≥3.10"
 },
 "chatgpt": {
  "price": [
   "USD",
   20,
   "monthly"
  ],
  "free": "limited",
  "models": "GPT-6 family · plan-specific availability"
 },
 "claude": {
  "price": [
   "USD",
   20,
   "monthly"
  ],
  "free": "limited",
  "models": "Claude model family · exact availability by plan"
 },
 "comfyui": {
  "price": "localFree",
  "free": "localUse",
  "models": "ComfyUI + user-selected image models"
 },
 "deepseek": {
  "price": "api",
  "free": "webFree",
  "models": "deepseek-flash · deepseek-v4-pro"
 },
 "dify": {
  "price": [
   "USD",
   590,
   "workYear"
  ],
  "free": [
   "sandbox",
   200
  ],
  "models": "Model APIs selected in workflows"
 },
 "elevenlabs": {
  "price": [
   "USD",
   6,
   "monthly"
  ],
  "free": [
   "monthlyCredits",
   10000
  ],
  "models": "Speech · voice cloning · sound effects"
 },
 "fasterwhisper": {
  "price": "localFree",
  "free": "localUse",
  "models": "Whisper · CTranslate2"
 },
 "gemini": {
  "price": ["USD",19.99,"monthly"],
  "free": "limited",
  "models": "Gemini family · plan-specific availability"
 },
 "grok": {
  "price": ["USD",30,"monthly"],
  "free": "limited",
  "models": "Grok family · plan-specific availability"
 },
 "langchain": {
  "price": "localFree",
  "free": "localUse",
  "models": "Models connected through LangChain"
 },
 "llamacpp": {
  "price": "localFree",
  "free": "localUse",
  "models": "GGUF-compatible local models"
 },
 "llamaindex": {
  "price": "localFree",
  "free": "localUse",
  "models": "Connected model providers"
 },
 "lovable": {
  "price": [
   "USD",
   25,
   "monthlyRef"
  ],
  "free": [
   "buildCredits",
   5,
   30
  ],
  "models": "Website and application generation"
 },
 "luma": {
  "price": ["USD",49.99,"monthly"],
  "free": "notFreeVerified",
  "models": "Luma video models · versions by plan"
 },
 "midjourney": {
  "price": ["USD",10,"monthly"],
  "free": "notFreeVerified",
  "models": "Midjourney image & video models"
 },
 "n8n": {
  "price": [
   "EUR",
   20,
   "annual"
  ],
  "free": "unknownFree",
  "models": "Workflow integrations · models connected separately"
 },
 "ollama": {
  "price": "localFree",
  "free": "localUse",
  "models": "Locally installed models"
 },
 "openwebui": {
  "price": "localFree",
  "free": "localUse",
  "models": "Ollama · OpenAI-compatible APIs"
 },
 "openai-python": {
  "price": "sdk",
  "free": "unknownFree",
  "models": "OpenAI Python SDK · API model selected separately"
 },
 "perplexity": {
  "price": [
   "USD",
   20,
   "monthly"
  ],
  "free": "limited",
  "models": "Search & research models · plan-specific"
 },
 "replit": {
  "price": [
   "USD",
   20,
   "annual"
  ],
  "free": "limited",
  "models": "Replit AI coding features"
 },
 "runway": {
  "price": [
   "USD",
   12,
   "annual"
  ],
  "free": [
   "oneTime",
   125
  ],
  "models": "Gen-4.5 · video generation and editing"
 },
 "automatic1111": {
  "price": "localFree",
  "free": "localUse",
  "models": "Stable Diffusion · user-installed checkpoints"
 },
 "suno": {
  "price": [
   "USD",
   8,
   "annual"
  ],
  "free": [
   "freeNoCommercial",
   50
  ],
  "models": "Suno song and audio generation"
 },
 "transformers": {
  "price": "localFree",
  "free": "localUse",
  "models": "Text · image · audio model library"
 },
 "vllm": {
  "price": "localFree",
  "free": "localUse",
  "models": "Serving compatible large language models"
 },
 "whisper": {
  "price": "localFree",
  "free": "localUse",
  "models": "Whisper speech recognition"
 },
 "qwen": {
  "price": "api",
  "free": "webFree",
  "models": "Qwen family · selected versions differ by channel"
 },
 "jimeng": {
  "price": [
   "CNY",
   79,
   "localMonthly"
  ],
  "free": "limited",
  "models": "Seedance video · image generation"
 },
 "kling": {
  "price": "variable",
  "free": "limited",
  "models": "Kling video models · features by plan"
 },
 "doubao": {
  "price": "variable",
  "free": "webFree",
  "models": "Doubao multimodal model family"
 }
};
export function localizedCatalogFact(id:string,language:Language,scope:Scope,original:string):string{
 if(language==='zh')return original;
 const c=FACTS[id],t=TEXT[language];
 if(!c)return scope==='price'?t.unknownPrice:scope==='free'?t.unknownFree:t.modelVaries;
 if(scope==='models')return c.models||t.modelVaries;
 const field=c[scope];
 if(typeof field==='string')return (t as Record<string,string>)[field]|| (scope==='price'?t.unknownPrice:t.unknownFree);
 if(scope==='price'){
  const [currency,value,kind]=field as [string,number,string];
  const symbol=currency==='USD'?'$':currency==='EUR'?'€':'¥';
  return symbol+value+' '+((t as Record<string,string>)[kind]||t.variable);
 }
 const [kind,n,max]=(field as [string,number,number?]);
 const suffix=(t as Record<string,string>)[kind]||t.unknownFree;
 if(kind==='buildCredits')return n+' '+suffix+' '+max;
 return n+' '+suffix;
}
export function localizedLoginFact(language:Language,raw:string):string{
 if(language==='zh')return raw;
 if(!raw)return TEXT[language].loginSource;
 const parts=raw.split(/[、，·]/).map(x=>x.trim()).filter(Boolean);
 const translations:Record<string,string>={'邮箱':'Email','邮箱验证链接':'Email verification','邮箱密码':'Email and password','手机短信':'Phone SMS','手机号短信':'Phone SMS','运营商一键登录':'Mobile carrier login','本地无需平台账户':'No account for local software','本地无需平台账号':'No account for local software','账号':'Account','剪映账号':'Jianying account','抖音账号':'Douyin account','快手账号':'Kuaishou account','iOS':'iOS'};
 const mapped=parts.map(x=>translations[x]||x);
 return mapped.some(x=>/[\u4e00-\u9fff]/.test(x))?TEXT[language].loginSource:mapped.join(' · ');
}
