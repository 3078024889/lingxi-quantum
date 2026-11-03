"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useLingxiLang, type LingxiLang } from "@/lib/lingxi-i18n";
import { DOMAIN_TLDS, type AvailabilityResult, type DomainTld } from "@/lib/domains/domain-center";

type Copy = {
  eyebrow: string; title: string; subtitle: string; search: string; placeholder: string;
  name: string; extension: string; availability: string; taken: string; unknown: string;
  unavailable: string; retry: string; limited: string; invalid: string; preview: string;
  price: string; saleLater: string; note: string; ideas: string; ideasNote: string;
  domains: string; domainsDesc: string; build: string; buildDesc: string;
  manager: string; managerDesc: string; start: string; guide: string;
};

const COPY: Record<LingxiLang, Copy> = {
  zh: {
    eyebrow:"灵犀场 · 全球域名中心",title:"好名字，不该只留在脑海里。",
    subtitle:"输入品牌名称，查询 .com、.net、.org、.io、.ai 等域名。选好名字后，用 SASI 继续建设网站。",
    search:"查询域名",placeholder:"输入品牌名，如 celestialstudio",name:"品牌或域名",extension:"域名后缀",
    availability:"可以注册，提交订单前还需再次确认",taken:"这个域名目前无法注册",
    unknown:"暂时无法确认注册状态",unavailable:"实时查询暂未开放",retry:"查询暂时不可用，请稍后再试",
    limited:"查询次数较多，请稍后再试",invalid:"请输入 2–63 位英文字母、数字或连接号，不能以连接号开头或结尾",
    preview:"这是测试查询结果，不代表真实可注册状态",price:"注册及续费价格将在开放购买前公布",
    saleLater:"购买服务即将开放",note:"域名是否可注册、最终价格和是否为溢价域名，以实际下单时注册商的最新确认结果为准。",
    ideas:"名称灵感",ideasNote:"以下只是名称创意，尚未查询是否可注册。",
    domains:"域名查询",domainsDesc:"真实注册商返回查询结果，不将 DNS 状态当作可注册证明。",
    build:"SASI 智能建站",buildDesc:"域名确定后继续制作品牌网站。",
    manager:"域名管理",managerDesc:"续费、解析和转移功能将在完成注册商对接后开放。",
    start:"打开 SASI 建站",guide:"了解域名与建站"
  },
  en: {
    eyebrow:"LINGXIFIELD · Global Domain Center",title:"A great name deserves a place online.",
    subtitle:"Search .com, .net, .org, .io and .ai names, then build your site with SASI.",
    search:"Check domain",placeholder:"Brand name, e.g. celestialstudio",name:"Brand or domain",extension:"Extension",
    availability:"Available to register — reconfirm at checkout",taken:"This domain cannot currently be registered",
    unknown:"Registration status cannot be confirmed",unavailable:"Live domain search is not available yet",retry:"Search is temporarily unavailable",
    limited:"Too many requests. Please try again later",invalid:"Enter 2–63 letters, numbers or hyphens; no leading or trailing hyphen",
    preview:"This is a test result, not verified live availability",price:"Registration and renewal prices will be listed before sales open",
    saleLater:"Purchases opening later",note:"Final availability, premium classification and pricing must be reconfirmed by the registrar at checkout.",
    ideas:"Name inspiration",ideasNote:"Ideas only — these names have not been checked for availability.",
    domains:"Domain search",domainsDesc:"Registrar-backed availability, not guesses based on DNS records.",
    build:"Build with SASI",buildDesc:"Create a website for your chosen brand name.",
    manager:"Domain management",managerDesc:"Renewal, DNS and transfer features are coming after provider integration.",
    start:"Open SASI site builder",guide:"Domains & websites"
  },
  ja: {
    eyebrow:"LINGXIFIELD · ドメインセンター",title:"いい名前を、ウェブ上の住所に。",subtitle:"ブランド名からドメインを検索し、SASIでサイトを作成。",search:"ドメインを検索",placeholder:"ブランド名を入力",name:"ブランド名・ドメイン",extension:"ドメイン末尾",availability:"登録可能（購入時に再確認）",taken:"現在登録できません",unknown:"登録状況を確認できません",unavailable:"リアルタイム検索は準備中です",retry:"検索できません。再試行してください",limited:"検索回数が多すぎます",invalid:"2〜63文字の英数字とハイフンを入力してください",preview:"テスト結果です。実際の登録可否ではありません",price:"販売開始前に料金を公開します",saleLater:"購入は準備中です",note:"登録可否と最終価格は購入時に再確認が必要です。",ideas:"名前のアイデア",ideasNote:"候補名です。登録可否は未確認です。",domains:"ドメイン検索",domainsDesc:"登録業者の情報を利用します。",build:"SASI サイト制作",buildDesc:"ブランドサイトを制作。",manager:"ドメイン管理",managerDesc:"更新・DNS・移管は準備中です。",start:"SASI を開く",guide:"ドメインとウェブサイト"
  },
  ko: {
    eyebrow:"LINGXIFIELD · 도메인 센터",title:"좋은 이름을 웹사이트로 완성하세요.",subtitle:"브랜드 이름으로 도메인을 검색하고 SASI로 사이트를 만드세요.",search:"도메인 확인",placeholder:"브랜드 이름 입력",name:"브랜드 또는 도메인",extension:"확장자",availability:"등록 가능 — 결제 전 재확인",taken:"현재 등록할 수 없습니다",unknown:"등록 상태를 확인할 수 없습니다",unavailable:"실시간 검색 준비 중",retry:"검색할 수 없습니다. 다시 시도하세요",limited:"검색 요청이 너무 많습니다",invalid:"영문·숫자·하이픈 2~63자를 입력하세요",preview:"테스트 결과이며 실제 등록 가능 여부가 아닙니다",price:"판매 시작 전 요금 공개",saleLater:"구매 기능 준비 중",note:"등록 가능 여부와 최종 요금은 구매 시 확인해야 합니다.",ideas:"이름 아이디어",ideasNote:"이름 제안이며 등록 가능 여부는 미확인입니다.",domains:"도메인 검색",domainsDesc:"등록업체 확인 결과를 사용합니다.",build:"SASI 웹사이트 제작",buildDesc:"브랜드 웹사이트 제작",manager:"도메인 관리",managerDesc:"갱신·DNS·이전 기능 준비 중",start:"SASI 열기",guide:"도메인 및 웹사이트"
  },
  fr: {
    eyebrow:"LINGXIFIELD · Domaines",title:"Donnez une adresse à votre idée.",subtitle:"Recherchez un domaine pour votre marque, puis créez votre site avec SASI.",search:"Vérifier",placeholder:"Nom de votre marque",name:"Marque ou domaine",extension:"Extension",availability:"Disponible, sous réserve de confirmation",taken:"Ce domaine n'est pas disponible",unknown:"Disponibilité non confirmée",unavailable:"Recherche en direct bientôt disponible",retry:"Recherche indisponible pour le moment",limited:"Trop de requêtes, réessayez plus tard",invalid:"Utilisez 2 à 63 lettres, chiffres ou tirets",preview:"Résultat de test, pas une disponibilité réelle",price:"Tarifs publiés avant l'ouverture des ventes",saleLater:"Achats bientôt disponibles",note:"La disponibilité et le prix final sont confirmés lors de la commande.",ideas:"Idées de noms",ideasNote:"Suggestions non vérifiées.",domains:"Recherche de domaines",domainsDesc:"Vérification par un registraire.",build:"Créer avec SASI",buildDesc:"Créez le site de votre marque.",manager:"Gestion des domaines",managerDesc:"Renouvellement, DNS et transferts à venir.",start:"Créer avec SASI",guide:"Domaines et sites"
  },
  de: {
    eyebrow:"LINGXIFIELD · Domaincenter",title:"Gib deiner Idee eine Webadresse.",subtitle:"Prüfe Domainnamen und erstelle danach deine Website mit SASI.",search:"Domain prüfen",placeholder:"Markenname eingeben",name:"Marke oder Domain",extension:"Endung",availability:"Verfügbar, Bestätigung bei Kauf erforderlich",taken:"Derzeit nicht registrierbar",unknown:"Status nicht bestätigt",unavailable:"Live-Suche noch nicht verfügbar",retry:"Suche momentan nicht verfügbar",limited:"Zu viele Anfragen",invalid:"2–63 Buchstaben, Ziffern oder Bindestriche eingeben",preview:"Testergebnis, keine echte Verfügbarkeit",price:"Preise folgen vor Verkaufsstart",saleLater:"Kauf bald verfügbar",note:"Verfügbarkeit und Endpreis werden beim Kauf erneut geprüft.",ideas:"Namensideen",ideasNote:"Vorschläge, Verfügbarkeit ungeprüft.",domains:"Domainsuche",domainsDesc:"Abfrage beim Registrar.",build:"Mit SASI erstellen",buildDesc:"Baue deine Markenwebsite.",manager:"Domainverwaltung",managerDesc:"Verlängerung, DNS und Transfer folgen.",start:"SASI öffnen",guide:"Domains und Websites"
  },
  es: {
    eyebrow:"LINGXIFIELD · Dominios",title:"Dale una dirección a tu idea.",subtitle:"Busca dominios para tu marca y crea tu web con SASI.",search:"Buscar dominio",placeholder:"Nombre de la marca",name:"Marca o dominio",extension:"Extensión",availability:"Disponible, pendiente de confirmar al comprar",taken:"Este dominio no está disponible",unknown:"Estado sin confirmar",unavailable:"La búsqueda en vivo aún no está disponible",retry:"Búsqueda temporalmente no disponible",limited:"Demasiadas consultas",invalid:"Escribe 2–63 letras, números o guiones",preview:"Resultado de prueba, no disponibilidad real",price:"Los precios se publicarán antes de abrir las ventas",saleLater:"Compras próximamente",note:"La disponibilidad y el precio final se confirman al comprar.",ideas:"Ideas de nombres",ideasNote:"Sugerencias sin comprobar.",domains:"Buscar dominios",domainsDesc:"Consulta mediante registrador.",build:"Crear con SASI",buildDesc:"Crea tu web de marca.",manager:"Gestionar dominios",managerDesc:"Renovación, DNS y transferencias próximamente.",start:"Abrir SASI",guide:"Dominios y sitios web"
  },
  pt: {
    eyebrow:"LINGXIFIELD · Domínios",title:"Dê um endereço à sua ideia.",subtitle:"Pesquise domínios para sua marca e crie seu site com SASI.",search:"Pesquisar domínio",placeholder:"Nome da marca",name:"Marca ou domínio",extension:"Extensão",availability:"Disponível, sujeito a confirmação na compra",taken:"Este domínio não está disponível",unknown:"Status não confirmado",unavailable:"Pesquisa ao vivo ainda não disponível",retry:"Pesquisa temporariamente indisponível",limited:"Muitas consultas",invalid:"Digite 2–63 letras, números ou hífens",preview:"Resultado de teste, não disponibilidade real",price:"Preços serão divulgados antes das vendas",saleLater:"Compras em breve",note:"Disponibilidade e preço final são confirmados na compra.",ideas:"Ideias de nomes",ideasNote:"Sugestões ainda não verificadas.",domains:"Pesquisar domínios",domainsDesc:"Consulta via registrador.",build:"Criar com SASI",buildDesc:"Crie o site da sua marca.",manager:"Gerenciar domínios",managerDesc:"Renovação, DNS e transferências em breve.",start:"Abrir SASI",guide:"Domínios e sites"
  },
  ar: {
    eyebrow:"LINGXIFIELD · مركز النطاقات",title:"امنح فكرتك عنواناً على الإنترنت.",subtitle:"ابحث عن نطاق لعلامتك التجارية، ثم أنشئ موقعك باستخدام SASI.",search:"البحث عن نطاق",placeholder:"اسم العلامة التجارية",name:"العلامة أو النطاق",extension:"الامتداد",availability:"متاح مبدئياً، يلزم التأكيد عند الشراء",taken:"هذا النطاق غير متاح حالياً",unknown:"تعذر تأكيد حالة النطاق",unavailable:"البحث المباشر غير متاح بعد",retry:"البحث غير متاح مؤقتاً",limited:"عدد طلبات كبير؛ حاول لاحقاً",invalid:"أدخل 2–63 حرفاً إنجليزياً أو رقماً أو شرطة",preview:"هذه نتيجة اختبار وليست تأكيداً للتوفر الفعلي",price:"ستُنشر الأسعار قبل فتح البيع",saleLater:"الشراء قريباً",note:"يؤكد المسجل التوفر والسعر النهائي عند الشراء.",ideas:"أفكار للأسماء",ideasNote:"اقتراحات لم يتم التحقق من توفرها.",domains:"البحث عن نطاق",domainsDesc:"التحقق من جهة تسجيل النطاقات.",build:"إنشاء موقع مع SASI",buildDesc:"أنشئ موقع علامتك التجارية.",manager:"إدارة النطاقات",managerDesc:"التجديد وDNS والنقل قريباً.",start:"فتح SASI",guide:"النطاقات والمواقع"
  }
};

function parsePublicName(input: string, tld: DomainTld) {
  const name = input.trim().toLowerCase();
  return name.endsWith("." + tld) ? name.slice(0, -tld.length - 1) : name;
}

export default function DomainCenter() {
  const {lang} = useLingxiLang();
  const c = COPY[lang] || COPY.zh;
  const [name, setName] = useState("");
  const [tld, setTld] = useState<DomainTld>("com");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AvailabilityResult | null>(null);
  const [error, setError] = useState("");

  const ideaNames = useMemo(() => {
    const base = parsePublicName(name, tld).replace(/[^a-z0-9-]/g, "").replace(/^-+|-+$/g, "").slice(0, 38);
    if (base.length < 2) return [];
    return [...new Set([base, "get" + base, base + "hq", base + "studio"])].filter(v => v.length <= 63);
  }, [name, tld]);

  async function lookup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setResult(null);
    const label = parsePublicName(name, tld);
    if (!/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])$/.test(label) || label.length < 2 || label.length > 63 || label.includes("--")) {
      setError(c.invalid);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/domains/availability", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({name:label, tld}), cache:"no-store",
      });
      const body = await response.json() as AvailabilityResult & {error?:string};
      if (!response.ok) {
        setError(response.status === 503 ? c.unavailable : response.status === 429 ? c.limited : response.status === 400 ? c.invalid : c.retry);
      } else {
        setResult(body);
      }
    } catch {
      setError(c.retry);
    } finally {
      setLoading(false);
    }
  }

  const stateLabel = result?.environment === "sandbox" ? c.preview :
    result?.status === "available" ? c.availability :
    result?.status === "unavailable" ? c.taken : c.unknown;

  return (
    <main lang={lang === "zh" ? "zh-CN" : lang} dir={lang === "ar" ? "rtl" : "ltr"} className="min-h-[70vh] px-4 py-10 md:px-8 md:py-16">
      <div className="mx-auto max-w-5xl">
        <section className="relative overflow-hidden rounded-3xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-6 shadow-sm md:p-12">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-amber-300/10 blur-3xl" />
          <div className="relative">
            <p className="text-xs font-semibold tracking-[.2em] text-[var(--lx-muted)]">{c.eyebrow}</p>
            <h1 className="mt-4 max-w-3xl text-3xl font-semibold leading-tight text-[var(--lx-ink)] md:text-5xl">{c.title}</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--lx-muted)] md:text-base">{c.subtitle}</p>
            <form onSubmit={lookup} className="mt-8 rounded-2xl border border-[var(--lx-line)] bg-white/70 p-3 shadow-sm dark:bg-black/20">
              <div className="flex flex-col gap-3 md:flex-row md:items-end">
                <label className="min-w-0 flex-1 text-xs font-medium text-[var(--lx-muted)]">
                  {c.name}
                  <input value={name} onChange={e => {setName(e.target.value);setResult(null);setError("");}} maxLength={72}
                    autoCapitalize="off" autoCorrect="off" spellCheck={false}
                    aria-label={c.name} placeholder={c.placeholder}
                    className="mt-2 w-full rounded-xl border border-[var(--lx-line)] bg-white px-4 py-3 text-base text-slate-900 outline-offset-2 focus:outline-amber-600" />
                </label>
                <label className="text-xs font-medium text-[var(--lx-muted)] md:w-32">
                  {c.extension}
                  <select value={tld} onChange={e => {setTld(e.target.value as DomainTld);setResult(null);setError("");}}
                    aria-label={c.extension}
                    className="mt-2 w-full rounded-xl border border-[var(--lx-line)] bg-white px-4 py-3 text-base text-slate-900">
                    {DOMAIN_TLDS.map(ext => <option key={ext} value={ext}>.{ext}</option>)}
                  </select>
                </label>
                <button type="submit" disabled={loading} className="rounded-xl bg-amber-700 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-amber-800 disabled:opacity-60 md:min-w-36">
                  {loading ? "…" : c.search}
                </button>
              </div>
              {error && <p role="alert" className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">{error}</p>}
              {result && <div role="status" className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--lx-line)] p-4">
                <div><p className="font-semibold text-[var(--lx-ink)]">{result.domain}</p>
                  <p className="mt-1 text-sm text-[var(--lx-muted)]">{stateLabel}</p></div>
                <span className="rounded-full border border-[var(--lx-line)] px-3 py-2 text-xs text-[var(--lx-muted)]">{c.saleLater}</span>
              </div>}
            </form>
            <p className="mt-4 text-xs leading-6 text-[var(--lx-muted)]">{c.note}</p>
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          {([
            [c.domains, c.domainsDesc, "01"],
            [c.build, c.buildDesc, "02"],
            [c.manager, c.managerDesc, "03"],
          ] as const).map(([title, description, no]) => (
            <article key={no} className="rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-6">
              <span className="text-sm font-bold text-amber-700">{no}</span>
              <h2 className="mt-3 text-lg font-semibold text-[var(--lx-ink)]">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--lx-muted)]">{description}</p>
            </article>
          ))}
        </section>
        <section className="mt-8 grid gap-6 rounded-2xl border border-[var(--lx-line)] bg-[var(--lx-panel)] p-6 md:grid-cols-2 md:p-8">
          <div>
            <h2 className="text-xl font-semibold text-[var(--lx-ink)]">{c.ideas}</h2>
            <p className="mt-2 text-sm text-[var(--lx-muted)]">{c.ideasNote}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {ideaNames.length ? ideaNames.map(idea => <button key={idea} type="button" onClick={() => {setName(idea);setResult(null);setError("");}}
                className="rounded-full border border-[var(--lx-line)] px-3 py-2 text-sm text-[var(--lx-ink)] hover:border-amber-600">{idea}.{tld}</button>) :
                <span className="text-sm text-[var(--lx-muted)]">{c.placeholder}</span>}
            </div>
          </div>
          <div className="flex flex-col justify-center rounded-2xl bg-amber-900/5 p-5">
            <h2 className="text-xl font-semibold text-[var(--lx-ink)]">{c.build}</h2>
            <p className="mt-2 text-sm text-[var(--lx-muted)]">{c.buildDesc}</p>
            <Link href="/sasi/build" className="mt-5 inline-flex w-fit rounded-xl bg-amber-700 px-5 py-3 text-sm font-semibold text-white hover:bg-amber-800">{c.start}</Link>
          </div>
        </section>
        <p className="mt-6 text-center text-xs text-[var(--lx-muted)]">{c.price}</p>
      </div>
    </main>
  );
}
