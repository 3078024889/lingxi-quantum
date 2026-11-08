"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import {useLingxiLang} from "@/lib/lingxi-i18n";
import {usePreferredCurrency} from "@/components/CurrencyPreferenceProvider";
import {ALL_TOOLS_PASS_CATALOG,type AllToolsPassSku} from "@/lib/tools/commerce/all-tools-pass";
import premium from "./ToolPassPremium.module.css";

type Language="zh"|"en"|"ja"|"ko"|"fr"|"de"|"es"|"pt"|"ar";
const COPY:Record<Language,{
 title:string;subtitle:string;free:string;new:string;week:string;month:string;quarter:string;year:string;
 days:string;buy:string;processing:string;success:string;login:string;insufficient:string;unavailable:string;
 balance:string;currency:string;wallet:string;scope:string;existing:string;refresh:string;confirmation:string;
 }> = {
 zh:{title:"全场实用工具通用包",subtitle:"一个通用包，使用现有及后续新增的全部实用工具。",free:"每个账户、每个 IP、每个工具，每天免费 1 次。上传并开始处理即计次，无须导出。",new:"新工具自动包含",week:"7 天",month:"30 天",quarter:"90 天",year:"365 天",days:"天",buy:"立即开通",processing:"正在确认购买…",success:"购买成功，通用包已生效",login:"请先登录",insufficient:"余额不足，请先充值",unavailable:"暂时无法购买，请重试",balance:"统一余额",currency:"计价币种",wallet:"前往充值",scope:"适用于 100+ 实用工具，不包含 SASI 原有按任务计费。正常人工使用不限次数；禁止自动化滥用。",existing:"当前有效期至",refresh:"刷新套餐状态",confirmation:"购买后将直接扣除所选币种的现有余额。购买时间可叠加延长有效期。"},
 en:{title:"All Practical Tools Pass",subtitle:"One pass for all current and future practical tools.",free:"One free use per account, IP and tool each day. Starting an uploaded file counts even without export.",new:"New tools included",week:"7 days",month:"30 days",quarter:"90 days",year:"365 days",days:"days",buy:"Choose plan",processing:"Confirming purchase…",success:"Purchased. Your pass is active.",login:"Sign in first",insufficient:"Insufficient balance. Top up first.",unavailable:"Purchase unavailable. Try again.",balance:"Unified balance",currency:"Billing currency",wallet:"Top up balance",scope:"Covers 100+ practical tools; SASI retains its task billing. Unlimited ordinary manual use, automated abuse prohibited.",existing:"Current pass valid until",refresh:"Refresh pass status",confirmation:"Your selected-currency wallet will be debited. Overlapping purchases extend your pass."},
 ja:{title:"全ツール共通パス",subtitle:"既存・今後の実用ツールが対象です。",free:"アカウント・IP・ツールごとに毎日1回無料。アップロードして処理開始時にカウントします。",new:"新ツールも対象",week:"7日",month:"30日",quarter:"90日",year:"365日",days:"日",buy:"このプランを選ぶ",processing:"購入確認中…",success:"購入が完了しました",login:"ログインしてください",insufficient:"残高が不足しています",unavailable:"購入できません。再試行してください",balance:"共通残高",currency:"通貨",wallet:"チャージ",scope:"100以上の実用ツールが対象。SASIは従来どおり個別課金。通常の手動利用に回数制限はなく、不正自動化は禁止です。",existing:"有効期限",refresh:"状態を更新",confirmation:"選択通貨の残高から引き落とします。既存期間に追加されます。"},
 ko:{title:"모든 실용 도구 이용권",subtitle:"현재 및 향후 실용 도구를 모두 이용하세요.",free:"계정, IP, 도구별 하루 1회 무료. 업로드 후 사용을 시작하면 내보내기 없이도 차감됩니다.",new:"신규 도구 포함",week:"7일",month:"30일",quarter:"90일",year:"365일",days:"일",buy:"이용권 선택",processing:"구매 확인 중…",success:"구매 완료",login:"먼저 로그인하세요",insufficient:"잔액이 부족합니다",unavailable:"구매할 수 없습니다. 다시 시도하세요",balance:"통합 잔액",currency:"통화",wallet:"충전",scope:"100개 이상의 실용 도구 포함. SASI 작업 요금은 별도입니다. 일반적인 수동 사용은 횟수 제한 없으며 자동 남용은 금지됩니다.",existing:"현재 만료일",refresh:"상태 새로고침",confirmation:"선택한 통화의 잔액이 차감되며 이용 기간은 연장됩니다."},
 fr:{title:"Pass outils pratiques",subtitle:"Un pass pour tous les outils actuels et futurs.",free:"Une utilisation gratuite par compte, IP et outil chaque jour. L'envoi et le début du traitement comptent sans export.",new:"Nouveaux outils inclus",week:"7 jours",month:"30 jours",quarter:"90 jours",year:"365 jours",days:"jours",buy:"Choisir ce pass",processing:"Confirmation…",success:"Achat confirmé",login:"Connectez-vous",insufficient:"Solde insuffisant",unavailable:"Achat indisponible. Réessayez.",balance:"Solde unique",currency:"Devise",wallet:"Recharger",scope:"Plus de 100 outils pratiques inclus. SASI conserve sa facturation par tâche. Usage manuel ordinaire illimité, abus automatisé interdit.",existing:"Valide jusqu'au",refresh:"Actualiser",confirmation:"Le solde dans la devise choisie sera débité. La durée se cumule."},
 de:{title:"Pass für alle Werkzeuge",subtitle:"Ein Pass für alle aktuellen und zukünftigen praktischen Werkzeuge.",free:"Ein kostenloser Einsatz pro Konto, IP und Werkzeug täglich. Hochladen und Starten zählt auch ohne Export.",new:"Neue Werkzeuge inklusive",week:"7 Tage",month:"30 Tage",quarter:"90 Tage",year:"365 Tage",days:"Tage",buy:"Pass auswählen",processing:"Kauf wird bestätigt…",success:"Kauf erfolgreich",login:"Bitte anmelden",insufficient:"Guthaben nicht ausreichend",unavailable:"Kauf derzeit nicht möglich",balance:"Gemeinsames Guthaben",currency:"Währung",wallet:"Guthaben aufladen",scope:"Über 100 praktische Werkzeuge, SASI-Aufgaben separat. Gewöhnliche manuelle Nutzung unbegrenzt, automatischer Missbrauch verboten.",existing:"Gültig bis",refresh:"Status aktualisieren",confirmation:"Das Guthaben der gewählten Währung wird belastet; Laufzeiten verlängern sich."},
 es:{title:"Pase para todas las herramientas",subtitle:"Un pase para las herramientas actuales y futuras.",free:"Un uso gratis por cuenta, IP y herramienta al día. Subir e iniciar el proceso cuenta aunque no exportes.",new:"Incluye nuevas herramientas",week:"7 días",month:"30 días",quarter:"90 días",year:"365 días",days:"días",buy:"Elegir plan",processing:"Confirmando compra…",success:"Compra completada",login:"Inicia sesión",insufficient:"Saldo insuficiente",unavailable:"Compra no disponible",balance:"Saldo unificado",currency:"Moneda",wallet:"Recargar",scope:"Incluye más de 100 herramientas. SASI conserva su cobro por tarea. Uso manual habitual ilimitado; abuso automatizado prohibido.",existing:"Válido hasta",refresh:"Actualizar estado",confirmation:"Se descontará el saldo de la moneda elegida y se ampliará la duración."},
 pt:{title:"Passe para todas as ferramentas",subtitle:"Um passe para ferramentas atuais e futuras.",free:"Uma utilização grátis por conta, IP e ferramenta ao dia. Enviar e iniciar conta mesmo sem exportar.",new:"Novas ferramentas incluídas",week:"7 dias",month:"30 dias",quarter:"90 dias",year:"365 dias",days:"dias",buy:"Escolher plano",processing:"Confirmando compra…",success:"Compra concluída",login:"Entre na sua conta",insufficient:"Saldo insuficiente",unavailable:"Compra indisponível",balance:"Saldo único",currency:"Moeda",wallet:"Adicionar saldo",scope:"Inclui mais de 100 ferramentas. O SASI continua por tarefa. Uso manual normal ilimitado; abuso automatizado proibido.",existing:"Válido até",refresh:"Atualizar estado",confirmation:"O saldo da moeda escolhida será debitado e a duração será ampliada."},
 ar:{title:"باقة جميع الأدوات",subtitle:"باقة واحدة لجميع الأدوات الحالية والقادمة.",free:"استخدام مجاني واحد يومياً لكل حساب وعنوان IP وأداة. يُحسب رفع الملف وبدء معالجته حتى دون تصدير.",new:"تشمل الأدوات الجديدة",week:"7 أيام",month:"30 يوماً",quarter:"90 يوماً",year:"365 يوماً",days:"يوم",buy:"اختر الباقة",processing:"جارٍ تأكيد الشراء…",success:"تم الشراء بنجاح",login:"سجّل الدخول أولاً",insufficient:"الرصيد غير كافٍ",unavailable:"الشراء غير متاح الآن",balance:"الرصيد الموحد",currency:"العملة",wallet:"شحن الرصيد",scope:"تشمل أكثر من 100 أداة عملية. تظل مهام SASI مدفوعة على حدة. الاستخدام اليدوي المعتاد غير محدود ويُمنع الاستخدام الآلي المسيء.",existing:"صالحة حتى",refresh:"تحديث الحالة",confirmation:"سيُخصم الرصيد بالعملة المختارة وستُمدد مدة الباقة."}
};
type Currency="CNY"|"USD";
type PaymentChoice="wallet"|"wechat"|"alipay"|"paypal";
type Offer=(typeof ALL_TOOLS_PASS_CATALOG)[number];

export default function AllToolsPassPage(){
 const {lang}=useLingxiLang();
 const c=COPY[(lang in COPY?lang:"en") as Language],rtl=lang==="ar",zh=lang==="zh";
 const {currency:preferredCurrency,ready:currencyReady,setCurrency:setPreferredCurrency}=usePreferredCurrency();
 const [currency,setCurrency]=useState<Currency>("CNY");
 useEffect(()=>{if(currencyReady)setCurrency(preferredCurrency)},[currencyReady,preferredCurrency]);
 const [expiry,setExpiry]=useState<string|null>(null);
 const [selected,setSelected]=useState<Offer|null>(null);
 const [method,setMethod]=useState<PaymentChoice>("wallet");
 const [busy,setBusy]=useState(false);
 const [available,setAvailable]=useState(false);
 const [providers,setProviders]=useState({wechat:false,alipay:false,paypal:false});
 const [message,setMessage]=useState("");
 const [walletBalanceMinor,setWalletBalanceMinor]=useState<number|null>(null);
 const [notices,setNotices]=useState<Array<{id:string;titleZh:string;titleEn:string;publishedAt:string}>>([]);
 useEffect(()=>{let alive=true;fetch("/api/site-announcements",{cache:"no-store"})
  .then(r=>r.ok?r.json():null).then(data=>{if(!alive||!Array.isArray(data?.items))return;
   setNotices(data.items.filter((item:unknown)=>Boolean(item&&typeof item==="object"&&typeof (item as {id?:unknown}).id==="string")).slice(0,3));
  }).catch(()=>{});return()=>{alive=false};},[]);
 const [request,setRequest]=useState<{sku:AllToolsPassSku;id:string}|null>(null);

 async function refresh(){
  try {
   const [p,g]=await Promise.all([
    fetch("/api/tools/pass?currency="+currency,{cache:"no-store",credentials:"same-origin"}),
    fetch("/api/pay/providers",{cache:"no-store",credentials:"same-origin"}),
   ]);
   const data=p.ok?await p.json():null,channels=g.ok?await g.json():null;
   setExpiry(data?.expiresAt||null);
   setAvailable(data?.available===true);
   setProviders({
    wechat:channels?.wechat===true,
    alipay:channels?.alipay===true,
    paypal:channels?.paypal===true
   });
   // Never display a sample balance. Authenticated snapshots only; unavailable means no amount.
   const wallet=await fetch("/api/money/summary",{cache:"no-store",credentials:"same-origin"}).catch(()=>null);
   const account=wallet?.ok?await wallet.json().catch(()=>null):null;
   const actual=account?.balances?.[currency]?.availableMinor;
   setWalletBalanceMinor(typeof actual==="number"&&Number.isSafeInteger(actual)&&actual>=0?actual:null);
  }catch{setAvailable(false);setProviders({wechat:false,alipay:false,paypal:false});setWalletBalanceMinor(null);}
 }
 useEffect(()=>{void refresh()},[currency]);

 const choices=(currency==="CNY"?[
  {id:"wallet" as const,label:zh?"账户余额":"Wallet balance",ready:available},
  {id:"wechat" as const,label:zh?"微信支付":"WeChat Pay",ready:available&&providers.wechat},
  {id:"alipay" as const,label:zh?"支付宝":"Alipay",ready:available&&providers.alipay}
 ]:[
  {id:"paypal" as const,label:"PayPal",ready:available&&providers.paypal}
 ]);
 const selectedChoice=choices.find(x=>x.id===method);
 function openOffer(offer:Offer){
  setSelected(offer);setMethod(currency==="USD"?"paypal":"wallet");setMessage("");setRequest(null);
  void refresh();
 }
 async function confirm(){
  if(!selected||busy)return;
  if(!selectedChoice?.ready){
   setMessage(zh?"当前支付方式暂不可用，请选择其他方式。":"This payment option is currently unavailable.");
   return;
  }
  if(method==="wechat"||method==="alipay"){
   const query=new URLSearchParams({productId:selected.sku,redirect:"/tools/pass",method});
   window.location.assign("/checkout?"+query.toString());
   return;
  }
  setBusy(true);setMessage("");
  try{
   if(method==="paypal"){
    const response=await fetch("/api/pay/create",{
     method:"POST",headers:{"Content-Type":"application/json"},credentials:"same-origin",
     body:JSON.stringify({productId:selected.sku,returnPath:"/tools/pass"})
    });
    const data=await response.json().catch(()=>({}));
    if(response.status===401){setMessage(c.login);return;}
    if(!response.ok||!data.url)throw Error("PAYPAL_ORDER_UNAVAILABLE");
    const target=new URL(data.url);
    if(target.protocol!=="https:"||!/(^|\.)paypal\.com$/.test(target.hostname))
     throw Error("UNSAFE_PAYPAL_URL");
    window.location.assign(target.href);
    return;
   }
   const id=request?.sku===selected.sku?request.id:crypto.randomUUID();
   setRequest({sku:selected.sku,id});
   const response=await fetch("/api/tools/pass",{
    method:"POST",headers:{"Content-Type":"application/json"},credentials:"same-origin",
    body:JSON.stringify({sku:selected.sku,currency,requestId:id})
   });
   const data=await response.json().catch(()=>({}));
   if(response.ok&&data.ok){setMessage(c.success);setRequest(null);await refresh();setSelected(null);}
   else if(response.status===401)setMessage(c.login);
   else if(response.status===402)setMessage(c.insufficient);
   else setMessage(c.unavailable);
  }catch{setMessage(c.unavailable);}
  finally{setBusy(false);}
 }
 return <main dir={rtl?"rtl":"ltr"} className={premium.root}>
  <div className={premium.frame}>
   <section className={premium.hero} aria-labelledby="toolpass-membership-title">
    <div className={premium.heroCopy}>
     <p className={premium.eyebrow}>LINGXIFIELD · TOOLPASS</p>
     <h1 className={premium.title} id="toolpass-membership-title">{zh?"工具包会员":c.title}<span>ToolPass</span></h1>
     <p className={premium.lead}>{zh?"畅享 100+ 实用工具，划算又高效":"Unlock 100+ practical tools. One membership, more possibilities."}</p>
     <ul className={premium.benefits}>
      <li><span className={premium.check} aria-hidden="true">✓</span><b>{zh?"全站 100+ 工具":"100+ practical tools"}</b><span>{zh?"一站畅用":"All in one place"}</span></li>
      <li><span className={premium.check} aria-hidden="true">✓</span><b>{zh?"持续更新":"Always evolving"}</b><span>{zh?"新工具同步加入":"New tools included"}</span></li>
      <li><span className={premium.check} aria-hidden="true">✓</span><b>{zh?"高性价比":"More value"}</b><span>{zh?"创作、办公与日常处理都适用":"Built for work and everyday tasks"}</span></li>
     </ul>
    </div>
    <div className={premium.art} aria-hidden="true">
     <span className={premium.tool+" "+premium.toolPhoto}>▧</span>
     <span className={premium.tool+" "+premium.toolCut}>✂</span>
     <span className={premium.tool+" "+premium.toolPdf}>PDF</span>
     <span className={premium.tool+" "+premium.toolVideo}>▶</span>
     <div className={premium.box}><span className={premium.boxCrown}>♛</span><span className={premium.boxLabel}>100+ {zh?"工具":"tools"}</span></div>
    </div>
   </section>
   <div className={premium.toolbar}>
    <div>{expiry&&<p>{c.existing}：{new Date(expiry).toLocaleDateString(zh?"zh-CN":lang)}</p>}</div>
    <label className="flex items-center gap-2 text-sm"><span className="text-[var(--lx-muted)]">{c.currency}</span>
     <select aria-label={c.currency} value={currency} onChange={e=>{const next=e.target.value as Currency;setCurrency(next);setPreferredCurrency(next);setSelected(null);setMessage("");}}>
      <option value="CNY">CNY ¥</option><option value="USD">USD $</option>
     </select>
    </label>
   </div>
   <div className={premium.plans} aria-label={zh?"工具包会员方案":"ToolPass plans"}>
    {ALL_TOOLS_PASS_CATALOG.map((offer,i)=><section key={offer.sku} className={premium.plan+" "+(i===1?premium.planFeatured:"")}>
     {i===1&&<span className={premium.planBadge}>{zh?"♛ 热门推荐":"♛ Most popular"}</span>}
     <h2 className={premium.planDuration}>{i===0&&zh?"7 天体验":[c.week,c.month,c.quarter,c.year][i]}</h2>
     <strong className={premium.planPrice}>{currency==="CNY"?"¥":"$"}{offer.price}</strong>
     <p className={premium.planDesc}>{zh?["短期使用 · 轻松上手","畅享全站工具","更优惠 · 更省心","长期使用 · 超值之选"][i]:["Try it for a week","Access all tools","Even better value","Ideal for long-term use"][i]}</p>
     <button type="button" onClick={()=>openOffer(offer)} className={premium.planBuy+" "+(i===1?premium.planBuyFeatured:"")}>{zh?"立即购买":c.buy}</button>
    </section>)}
   </div>
   <div className={premium.subFooter}>
    <span><b>∞</b>{zh?"100+ 实用工具随心用":"100+ practical tools"}</span>
    <span><b>⟳</b>{zh?"新增工具持续更新":"New tools always included"}</span>
    <span><b>ϟ</b>{zh?"即买即用 · 高效省心":"Instant access after verified purchase"}</span>
   </div>
  </div>
  <section className={premium.lowerPanels} aria-label={zh?"会员账户与更新":"Membership and updates"}>
   <div className={premium.lowerCard}>
    <div className={premium.lowerHeading}><div><span className={premium.lowerIcon} aria-hidden="true">▣</span>
     <div><h2>{zh?"余额与充值":"Balance & top up"}</h2><p>{zh?"用于购买工具包与平台服务":"Use your verified account funds for eligible purchases"}</p></div>
     </div><Link className={premium.lowerLink} href="/ai-wallet">{zh?"充值与明细":"Top up & details"} ↗</Link></div>
    <div className={premium.balanceBody}>
     <div><small>{zh?"账户余额":"Account balance"} · {currency}</small>
      {walletBalanceMinor===null?<p className={premium.balanceUnavailable}>{zh?"登录后查看实际余额":"Sign in to view your actual balance"}</p>:
       <strong>{currency==="CNY"?"¥":"$"}{(walletBalanceMinor/100).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}</strong>}</div>
     <Link href="/ai-wallet" className={premium.rechargeAction}>{zh?"充值":"Top up"}</Link>
     <Link href="/account/orders" className={premium.ordersAction}>{zh?"订单记录":"Orders"}</Link>
    </div>
    <p className={premium.lowerFootnote}>{zh?"充值到账、账户明细与历史权益均以真实账户记录为准。":"All funds, receipts and entitlements reflect verified account records."}</p>
   </div>
   <div className={premium.lowerCard}>
    <div className={premium.lowerHeading}><div><span className={premium.lowerIcon} aria-hidden="true">♧</span>
     <div><h2>{zh?"公告中心":"Announcements"}</h2><p>{zh?"平台更新、工具上新与服务资讯":"Updates, new tools and service notices"}</p></div>
     </div><Link className={premium.lowerLink} href="/announcements">{zh?"查看全部":"View all"} ↗</Link></div>
    <div className={premium.noticeList}>
     {notices.length>0?notices.map(item=><Link key={item.id} href={"/announcements#"+encodeURIComponent(item.id)} className={premium.noticeRow}>
      <span className={premium.noticeBadge}>{zh?"更新":"NEWS"}</span>
      <span className={premium.noticeTitle}>{zh?item.titleZh:item.titleEn||item.titleZh}</span>
      <time>{item.publishedAt&&Number.isFinite(Date.parse(item.publishedAt))?new Date(item.publishedAt).toLocaleDateString(zh?"zh-CN":"en-US"):""}</time>
     </Link>):<p className={premium.lowerFootnote}>{zh?"最新公告可在公告中心查看。":"Visit announcements for platform updates."}</p>}
    </div>
   </div>
  </section>
  {message&&!selected&&<p role="status" className="mt-4 rounded-xl border border-[var(--lx-line)] p-4 text-sm">{message}</p>}
  {selected&&<div role="presentation" className={premium.overlay} onClick={()=>{if(!busy)setSelected(null)}}>
   <section role="dialog" aria-modal="true" aria-labelledby="toolpass-checkout-title" dir={rtl?"rtl":"ltr"} className={premium.modal} onClick={event=>event.stopPropagation()}>
    <div className={premium.modalTop}>
     <div><p className={premium.modalEyebrow}>TOOLPASS</p><h2 id="toolpass-checkout-title" className={premium.modalTitle}>{zh?"确认购买":"Confirm purchase"}</h2></div>
     <button type="button" disabled={busy} className={premium.close} aria-label={zh?"关闭":"Close"} onClick={()=>setSelected(null)}>×</button>
    </div>
    <div className={premium.summary}>
     <div className={premium.summaryIcon} aria-hidden="true">♛</div>
     <div className={premium.summaryInfo}>
      <strong>{zh?"工具包会员":"ToolPass membership"} · {[c.week,c.month,c.quarter,c.year][ALL_TOOLS_PASS_CATALOG.findIndex(o=>o.sku===selected.sku)]}</strong>
      <p>{zh?"解锁全场 100+ 实用工具（含后续新增）":"All 100+ practical tools and new additions"}</p>
     </div>
     <strong className={premium.summaryPrice}>{currency==="CNY"?"¥":"$"}{selected.price}</strong>
    </div>
    <h3 className={premium.methodTitle}>{zh?"选择支付方式":"Choose payment method"}</h3>
    <div>
     {choices.map(choice=><button type="button" key={choice.id} aria-pressed={method===choice.id} disabled={!choice.ready||busy}
      className={premium.payMethod} onClick={()=>{setMethod(choice.id);setMessage("");}}>
      <span aria-hidden="true" className={premium.radio}/>
      <span className={premium.payIcon} aria-hidden="true">{choice.id==="wallet"?"▣":choice.id==="wechat"?"微":choice.id==="alipay"?"支":"P"}</span>
      <span className={premium.payLabel}>{choice.label}{choice.id==="wallet"&&walletBalanceMinor!==null?
       <small className="block text-xs text-[var(--lx-muted)]">{zh?"当前余额":"Balance"}：{currency==="CNY"?"¥":"$"}{(walletBalanceMinor/100).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}</small>:null}</span>
      <span className={premium.payStatus}>{choice.ready?(zh?"可使用":"Available"):(zh?"暂未开放":"Unavailable")}</span>
     </button>)}
     {currency==="CNY"&&<button type="button" className={premium.payMethod} disabled={busy}
      onClick={()=>{setCurrency("USD");setPreferredCurrency("USD");setMethod("paypal");setMessage("");}}>
      <span aria-hidden="true" className={premium.radio}/><span className={premium.payIcon}>P</span>
      <span className={premium.payLabel}>PayPal <small className="block text-xs text-[var(--lx-muted)]">USD</small></span>
      <span className={premium.payStatus}>{providers.paypal&&available?(zh?"切换美元支付":"Pay in USD"):(zh?"暂未开放":"Unavailable")}</span>
     </button>}
    </div>
    {message&&<p role="alert" className="mt-3 text-sm text-amber-700">{message}</p>}
    <div className={premium.payFooter}>
     <div><span className="block text-xs text-[var(--lx-muted)]">{zh?"应付金额":"Total"}</span><strong>{currency==="CNY"?"¥":"$"}{selected.price}</strong></div>
     <button type="button" onClick={()=>void confirm()} disabled={busy||!selectedChoice?.ready}>{busy?c.processing:zh?"立即支付":"Pay now"}</button>
    </div>
    {!choices.some(choice=>choice.ready)&&<p role="status" className={premium.modalNote}>{zh?"当前支付方式暂未开放，完成商户验证后可使用。":"Payment methods open after merchant verification."}</p>}
    <p className={premium.modalNote}><Link href="/ai-wallet" className="underline underline-offset-4">{zh?"查看余额与充值":"View balance & top up"}</Link></p>
   </section>
  </div>}
 </main>;
}
