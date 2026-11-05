"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import {useLingxiLang} from "@/lib/lingxi-i18n";
import {ALL_TOOLS_PASS_CATALOG,type AllToolsPassSku} from "@/lib/tools/commerce/all-tools-pass";

type Language="zh"|"en"|"ja"|"ko"|"fr"|"de"|"es"|"pt"|"ar";
const COPY:Record<Language,{
 title:string;subtitle:string;free:string;new:string;week:string;month:string;quarter:string;year:string;
 days:string;buy:string;processing:string;success:string;login:string;insufficient:string;unavailable:string;
 balance:string;currency:string;wallet:string;scope:string;existing:string;refresh:string;confirmation:string;
 }> = {
 zh:{title:"全场实用工具通用包",subtitle:"一个通用包，使用现有及后续新增的全部实用工具。",free:"每个账户、每个 IP、每个工具，每天免费 1 次。上传并开始处理即计次，无须导出。",new:"新工具自动包含",week:"7 天",month:"30 天",quarter:"90 天",year:"365 天",days:"天",buy:"使用现有余额购买",processing:"正在确认购买…",success:"购买成功，通用包已生效",login:"请先登录",insufficient:"余额不足，请先充值",unavailable:"暂时无法购买，请重试",balance:"统一余额",currency:"计价币种",wallet:"前往充值",scope:"适用于 100+ 实用工具，不包含 SASI 原有按任务计费。正常人工使用不限次数；禁止自动化滥用。",existing:"当前有效期至",refresh:"刷新套餐状态",confirmation:"购买后将直接扣除所选币种的现有余额。购买时间可叠加延长有效期。"},
 en:{title:"All Practical Tools Pass",subtitle:"One pass for all current and future practical tools.",free:"One free use per account, IP and tool each day. Starting an uploaded file counts even without export.",new:"New tools included",week:"7 days",month:"30 days",quarter:"90 days",year:"365 days",days:"days",buy:"Buy with wallet balance",processing:"Confirming purchase…",success:"Purchased. Your pass is active.",login:"Sign in first",insufficient:"Insufficient balance. Top up first.",unavailable:"Purchase unavailable. Try again.",balance:"Unified balance",currency:"Billing currency",wallet:"Top up balance",scope:"Covers 100+ practical tools; SASI retains its task billing. Unlimited ordinary manual use, automated abuse prohibited.",existing:"Current pass valid until",refresh:"Refresh pass status",confirmation:"Your selected-currency wallet will be debited. Overlapping purchases extend your pass."},
 ja:{title:"全ツール共通パス",subtitle:"既存・今後の実用ツールが対象です。",free:"アカウント・IP・ツールごとに毎日1回無料。アップロードして処理開始時にカウントします。",new:"新ツールも対象",week:"7日",month:"30日",quarter:"90日",year:"365日",days:"日",buy:"残高で購入",processing:"購入確認中…",success:"購入が完了しました",login:"ログインしてください",insufficient:"残高が不足しています",unavailable:"購入できません。再試行してください",balance:"共通残高",currency:"通貨",wallet:"チャージ",scope:"100以上の実用ツールが対象。SASIは従来どおり個別課金。通常の手動利用に回数制限はなく、不正自動化は禁止です。",existing:"有効期限",refresh:"状態を更新",confirmation:"選択通貨の残高から引き落とします。既存期間に追加されます。"},
 ko:{title:"모든 실용 도구 이용권",subtitle:"현재 및 향후 실용 도구를 모두 이용하세요.",free:"계정, IP, 도구별 하루 1회 무료. 업로드 후 사용을 시작하면 내보내기 없이도 차감됩니다.",new:"신규 도구 포함",week:"7일",month:"30일",quarter:"90일",year:"365일",days:"일",buy:"잔액으로 구매",processing:"구매 확인 중…",success:"구매 완료",login:"먼저 로그인하세요",insufficient:"잔액이 부족합니다",unavailable:"구매할 수 없습니다. 다시 시도하세요",balance:"통합 잔액",currency:"통화",wallet:"충전",scope:"100개 이상의 실용 도구 포함. SASI 작업 요금은 별도입니다. 일반적인 수동 사용은 횟수 제한 없으며 자동 남용은 금지됩니다.",existing:"현재 만료일",refresh:"상태 새로고침",confirmation:"선택한 통화의 잔액이 차감되며 이용 기간은 연장됩니다."},
 fr:{title:"Pass outils pratiques",subtitle:"Un pass pour tous les outils actuels et futurs.",free:"Une utilisation gratuite par compte, IP et outil chaque jour. L'envoi et le début du traitement comptent sans export.",new:"Nouveaux outils inclus",week:"7 jours",month:"30 jours",quarter:"90 jours",year:"365 jours",days:"jours",buy:"Payer avec le solde",processing:"Confirmation…",success:"Achat confirmé",login:"Connectez-vous",insufficient:"Solde insuffisant",unavailable:"Achat indisponible. Réessayez.",balance:"Solde unique",currency:"Devise",wallet:"Recharger",scope:"Plus de 100 outils pratiques inclus. SASI conserve sa facturation par tâche. Usage manuel ordinaire illimité, abus automatisé interdit.",existing:"Valide jusqu'au",refresh:"Actualiser",confirmation:"Le solde dans la devise choisie sera débité. La durée se cumule."},
 de:{title:"Pass für alle Werkzeuge",subtitle:"Ein Pass für alle aktuellen und zukünftigen praktischen Werkzeuge.",free:"Ein kostenloser Einsatz pro Konto, IP und Werkzeug täglich. Hochladen und Starten zählt auch ohne Export.",new:"Neue Werkzeuge inklusive",week:"7 Tage",month:"30 Tage",quarter:"90 Tage",year:"365 Tage",days:"Tage",buy:"Mit Guthaben kaufen",processing:"Kauf wird bestätigt…",success:"Kauf erfolgreich",login:"Bitte anmelden",insufficient:"Guthaben nicht ausreichend",unavailable:"Kauf derzeit nicht möglich",balance:"Gemeinsames Guthaben",currency:"Währung",wallet:"Guthaben aufladen",scope:"Über 100 praktische Werkzeuge, SASI-Aufgaben separat. Gewöhnliche manuelle Nutzung unbegrenzt, automatischer Missbrauch verboten.",existing:"Gültig bis",refresh:"Status aktualisieren",confirmation:"Das Guthaben der gewählten Währung wird belastet; Laufzeiten verlängern sich."},
 es:{title:"Pase para todas las herramientas",subtitle:"Un pase para las herramientas actuales y futuras.",free:"Un uso gratis por cuenta, IP y herramienta al día. Subir e iniciar el proceso cuenta aunque no exportes.",new:"Incluye nuevas herramientas",week:"7 días",month:"30 días",quarter:"90 días",year:"365 días",days:"días",buy:"Comprar con saldo",processing:"Confirmando compra…",success:"Compra completada",login:"Inicia sesión",insufficient:"Saldo insuficiente",unavailable:"Compra no disponible",balance:"Saldo unificado",currency:"Moneda",wallet:"Recargar",scope:"Incluye más de 100 herramientas. SASI conserva su cobro por tarea. Uso manual habitual ilimitado; abuso automatizado prohibido.",existing:"Válido hasta",refresh:"Actualizar estado",confirmation:"Se descontará el saldo de la moneda elegida y se ampliará la duración."},
 pt:{title:"Passe para todas as ferramentas",subtitle:"Um passe para ferramentas atuais e futuras.",free:"Uma utilização grátis por conta, IP e ferramenta ao dia. Enviar e iniciar conta mesmo sem exportar.",new:"Novas ferramentas incluídas",week:"7 dias",month:"30 dias",quarter:"90 dias",year:"365 dias",days:"dias",buy:"Comprar com saldo",processing:"Confirmando compra…",success:"Compra concluída",login:"Entre na sua conta",insufficient:"Saldo insuficiente",unavailable:"Compra indisponível",balance:"Saldo único",currency:"Moeda",wallet:"Adicionar saldo",scope:"Inclui mais de 100 ferramentas. O SASI continua por tarefa. Uso manual normal ilimitado; abuso automatizado proibido.",existing:"Válido até",refresh:"Atualizar estado",confirmation:"O saldo da moeda escolhida será debitado e a duração será ampliada."},
 ar:{title:"باقة جميع الأدوات",subtitle:"باقة واحدة لجميع الأدوات الحالية والقادمة.",free:"استخدام مجاني واحد يومياً لكل حساب وعنوان IP وأداة. يُحسب رفع الملف وبدء معالجته حتى دون تصدير.",new:"تشمل الأدوات الجديدة",week:"7 أيام",month:"30 يوماً",quarter:"90 يوماً",year:"365 يوماً",days:"يوم",buy:"الشراء من الرصيد",processing:"جارٍ تأكيد الشراء…",success:"تم الشراء بنجاح",login:"سجّل الدخول أولاً",insufficient:"الرصيد غير كافٍ",unavailable:"الشراء غير متاح الآن",balance:"الرصيد الموحد",currency:"العملة",wallet:"شحن الرصيد",scope:"تشمل أكثر من 100 أداة عملية. تظل مهام SASI مدفوعة على حدة. الاستخدام اليدوي المعتاد غير محدود ويُمنع الاستخدام الآلي المسيء.",existing:"صالحة حتى",refresh:"تحديث الحالة",confirmation:"سيُخصم الرصيد بالعملة المختارة وستُمدد مدة الباقة."}
};
type Currency="CNY"|"USD";
export default function AllToolsPassPage(){
 const {lang}=useLingxiLang();
 const c=COPY[(lang in COPY?lang:"en") as Language],rtl=lang==="ar";
 const [currency,setCurrency]=useState<Currency>("CNY");
 const [expiry,setExpiry]=useState<string|null>(null);
 const [busy,setBusy]=useState(false);
 const [available,setAvailable]=useState(false);
 const [message,setMessage]=useState("");
 const [request,setRequest]=useState<{sku:AllToolsPassSku;id:string}|null>(null);
 async function refresh(){
  const r=await fetch("/api/tools/pass?currency="+currency,{cache:"no-store"});
  if(r.ok){const data=await r.json();setExpiry(data.expiresAt||null);setAvailable(data.available===true);}else setAvailable(false);
 }
 useEffect(()=>{void refresh()},[currency]);
 async function buy(sku:AllToolsPassSku){
  if(busy)return;
  setBusy(true);setMessage("");
  const id=request?.sku===sku?request.id:crypto.randomUUID();
  setRequest({sku,id});
  try{
   const r=await fetch("/api/tools/pass",{method:"POST",headers:{"content-type":"application/json"},
    body:JSON.stringify({sku,currency,requestId:id})});
   const data=await r.json().catch(()=>({}));
   if(r.ok&&data.ok){setMessage(c.success);setRequest(null);await refresh();}
   else if(r.status===401)setMessage(c.login);
   else if(r.status===402)setMessage(c.insufficient);
   else setMessage(c.unavailable);
  }catch{setMessage(c.unavailable)}finally{setBusy(false)}
 }
 return <main dir={rtl?"rtl":"ltr"} className="mx-auto max-w-5xl px-4 py-10 text-[var(--lx-ink)]">
  <h1 className="mb-3 text-3xl font-bold">{c.title}</h1>
  <p className="mb-3 text-base">{c.subtitle}</p>
  <p className="mb-5 text-sm">{c.free}</p>
  <p className="mb-6 text-sm">{c.scope}</p>
  <div className="mb-5 flex flex-wrap items-center gap-3">
   <label htmlFor="pass-currency" className="text-sm font-semibold">{c.currency}</label>
   <select id="pass-currency" value={currency} onChange={e=>{setCurrency(e.target.value as Currency);setRequest(null)}}
    className="rounded-lg border bg-transparent px-4 py-2 text-base">
    <option value="CNY">CNY (¥)</option><option value="USD">USD ($)</option>
   </select>
   <Link href="/sasi/pricing" className="rounded-lg border px-4 py-2 text-sm underline">{c.wallet}</Link>
  </div>
  {expiry&&<p className="mb-4 text-sm">{c.existing}: {new Date(expiry).toLocaleString(lang==="zh"?"zh-CN":lang)}</p>}
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
   {ALL_TOOLS_PASS_CATALOG.map((o,i)=><section key={o.sku} className={"rounded-2xl border p-5 "+(i===3?"border-[var(--lx-ink)]":"border-[var(--lx-line)]")}>
    <h2 className="text-lg font-bold">{[c.week,c.month,c.quarter,c.year][i]}</h2>
    <p className="my-4 text-3xl font-semibold">{currency==="CNY"?"¥":"$"}{o.price}</p>
    <p className="mb-4 text-sm">{c.new}</p>
    <button type="button" disabled={busy} onClick={()=>void buy(o.sku)}
     className="w-full rounded-xl border border-current px-3 py-3 text-sm font-semibold disabled:opacity-50">{busy?c.processing:c.buy}</button>
   </section>)}
  </div>
  {!available&&<p role="status" className="mt-5 rounded-xl border p-3 text-sm">{c.unavailable}</p>}
  <p className="mt-5 text-sm">{c.confirmation}</p>
  {message&&<p role="status" className="mt-3 rounded-xl border px-4 py-3 text-sm">{message}</p>}
  <button type="button" onClick={()=>void refresh()} className="mt-4 text-sm underline">{c.refresh}</button>
 </main>;
}
