"use client";

import {useEffect,useRef,useState} from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./MainSiteReleaseNotice.module.css";

type Lang="zh"|"en"|"ja"|"ko"|"fr"|"de"|"es"|"pt"|"ar";
type Copy={label:string;title:string;lead:string;body:string;benefit:string;thanks:string;global:string;china:string;action:string;dismiss:string;close:string};
type Phase="maintenance"|"complete";
type Status={enabled:boolean;version:string;site:string;phase:Phase|"pending"};

const copy:Record<Lang,Copy>={
 zh:{
  label:"LINGXIFIELD · 全球服务升级",title:"灵犀场｜全球双站架构升级完成",
  lead:"双域同行，全球连接。",
  body:"这不是一次简单的服务器维护，而是灵犀场全球服务架构的一次重要升级。自2026年11月6日起，我们全面优化全球访问链路、国内外服务器运行架构、数据安全防护与系统稳定性。",
  benefit:"国际站与国内站完成验收后，为全球 SIAI 排行榜、SASI 智能创作、百余项在线实用工具，以及统一账户、工具包与支付体验提供更稳定、更流畅的服务。",
  thanks:"感谢升级期间的理解与陪伴。让智能触手可及，让创造突破边界。",
  global:"国际站",china:"国内站",action:"开启新版体验",dismiss:"我知道了",close:"关闭公告"
 },
 en:{
  label:"LINGXIFIELD · GLOBAL UPGRADE",title:"LINGXIFIELD | Global dual-site upgrade",
  lead:"Two domains. One global connection.",
  body:"This is more than routine maintenance. Since November 6, 2026, LINGXIFIELD has upgraded international access routes, server operations, security protections, and service reliability.",
  benefit:"Once both sites pass acceptance, the upgraded infrastructure supports the global SIAI rankings, SASI creation, over 100 practical tools, and a unified account and tool-pass payment experience.",
  thanks:"Thank you for your understanding during the upgrade. Make intelligence accessible. Create without limits.",
  global:"International site",china:"China site",action:"Explore the new site",dismiss:"Got it",close:"Close"
 },
 ja:{
  label:"LINGXIFIELD · グローバル更新",title:"LINGXIFIELD｜日中・国際サイトの基盤更新",
  lead:"二つのドメインで、世界とつながる。",
  body:"2026年11月6日から、世界各地のアクセス経路、サーバー基盤、データ保護、安定性の向上に取り組みました。通常の保守を超えたサービス基盤の更新です。",
  benefit:"両サイトの検証完了後、世界のSIAIランキング、SASI制作、100以上のツール、統一アカウントと決済をより安定した環境で提供します。",
  thanks:"ご理解とご協力に感謝します。",global:"国際サイト",china:"中国サイト",action:"新しいサイトを見る",dismiss:"確認しました",close:"閉じる"
 },
 ko:{
  label:"LINGXIFIELD · 글로벌 업그레이드",title:"LINGXIFIELD | 글로벌 이중 사이트 업그레이드",
  lead:"두 도메인, 하나의 글로벌 연결.",
  body:"2026년 11월 6일부터 글로벌 접속 경로, 서버 구조, 데이터 보안 및 서비스 안정성을 개선했습니다. 단순한 서버 점검 이상의 업그레이드입니다.",
  benefit:"양쪽 사이트의 검증이 완료되면 글로벌 SIAI 순위, SASI 창작, 100개 이상의 도구와 통합 계정 및 결제 서비스를 더 안정적으로 제공합니다.",
  thanks:"업그레이드 기간의 이해와 협조에 감사드립니다.",global:"국제 사이트",china:"중국 사이트",action:"새 사이트 둘러보기",dismiss:"확인",close:"닫기"
 },
 fr:{
  label:"LINGXIFIELD · MISE À NIVEAU",title:"LINGXIFIELD | Nouvelle architecture mondiale",
  lead:"Deux domaines, une connexion mondiale.",
  body:"Depuis le 6 novembre 2026, nous avons amélioré les accès internationaux, les serveurs, la protection des données et la fiabilité de nos services.",
  benefit:"Après validation des deux sites, cette infrastructure renforcée prend en charge le classement SIAI, la création SASI, plus de 100 outils ainsi que les comptes et paiements unifiés.",
  thanks:"Merci de votre compréhension pendant cette transition.",global:"Site international",china:"Site chinois",action:"Découvrir la nouvelle version",dismiss:"Compris",close:"Fermer"
 },
 de:{
  label:"LINGXIFIELD · GLOBALES UPDATE",title:"LINGXIFIELD | Upgrade der globalen Plattform",
  lead:"Zwei Domains, weltweit verbunden.",
  body:"Seit dem 6. November 2026 verbessern wir internationale Zugangswege, Serverarchitektur, Datenschutz und Zuverlässigkeit.",
  benefit:"Nach erfolgreicher Abnahme beider Websites unterstützt die neue Infrastruktur das SIAI-Ranking, SASI-Kreation, über 100 Werkzeuge sowie einheitliche Konten und Zahlungen.",
  thanks:"Vielen Dank für Ihr Verständnis während der Umstellung.",global:"Internationale Website",china:"Website für China",action:"Neue Version entdecken",dismiss:"Verstanden",close:"Schließen"
 },
 es:{
  label:"LINGXIFIELD · ACTUALIZACIÓN",title:"LINGXIFIELD | Nueva arquitectura global",
  lead:"Dos dominios, una conexión global.",
  body:"Desde el 6 de noviembre de 2026 hemos mejorado las rutas de acceso internacionales, los servidores, la seguridad de los datos y la estabilidad.",
  benefit:"Tras validar ambos sitios, la infraestructura admite el ranking SIAI, SASI, más de 100 herramientas y una experiencia unificada de cuenta y pagos.",
  thanks:"Gracias por acompañarnos durante esta actualización.",global:"Sitio internacional",china:"Sitio para China",action:"Explorar la nueva versión",dismiss:"Entendido",close:"Cerrar"
 },
 pt:{
  label:"LINGXIFIELD · ATUALIZAÇÃO GLOBAL",title:"LINGXIFIELD | Nova infraestrutura global",
  lead:"Dois domínios, conexão global.",
  body:"Desde 6 de novembro de 2026, melhoramos as rotas globais, os servidores, a proteção dos dados e a estabilidade dos serviços.",
  benefit:"Após validar ambos os sites, a infraestrutura atenderá ao ranking SIAI, criação SASI, mais de 100 ferramentas e contas e pagamentos integrados.",
  thanks:"Agradecemos a compreensão durante a atualização.",global:"Site internacional",china:"Site para China",action:"Explorar a nova versão",dismiss:"Entendi",close:"Fechar"
 },
 ar:{
  label:"LINGXIFIELD · ترقية عالمية",title:"LINGXIFIELD | بنية جديدة للموقعين",
  lead:"نطاقان واتصال عالمي واحد.",
  body:"منذ 6 نوفمبر 2026 عملنا على تحسين مسارات الوصول العالمية والبنية التشغيلية للخوادم وحماية البيانات واستقرار الخدمة.",
  benefit:"بعد اجتياز الموقعين اختبارات القبول، تدعم البنية الجديدة تصنيف SIAI العالمي وإبداع SASI وأكثر من 100 أداة وحسابات ومدفوعات موحدة.",
  thanks:"شكراً لتفهمكم خلال الترقية.",global:"الموقع الدولي",china:"الموقع الصيني",action:"استكشف الموقع الجديد",dismiss:"فهمت",close:"إغلاق"
 }
};


const maintenance:Record<Lang,{title:string;body:string;benefit:string}>={
 zh:{
  title:"灵犀场｜全球双站架构升级公告",
  body:"这不是一次简单的服务器维护，而是灵犀场全球服务架构的一次重要升级。2026年11月6日起，灵犀场 LINGXIFIELD 开展服务器架构升级与全球访问线路优化，国际站与国内站进入新版切换阶段，预计2026年11月8日前恢复上线，具体以最终功能验收结果为准。",
  benefit:"本次升级围绕全球访问链路、服务器运行架构、数据安全防护与服务稳定性展开，为全球 SIAI 排行榜、SASI 智能创作、百余项在线实用工具，以及统一账户和工具包支付提供更坚实的基础设施。"
 },
 en:{
  title:"LINGXIFIELD | Global dual-site upgrade in progress",
  body:"Since November 6, 2026, LINGXIFIELD has been upgrading international connectivity, server operations, security and reliability. Both sites are expected to resume by November 8, subject to final functional acceptance.",
  benefit:"The upgrade supports global SIAI rankings, SASI creation, over 100 practical tools, unified accounts and tool-pass payments."
 },
 ja:{
  title:"LINGXIFIELD｜国際・中国サイトの更新のお知らせ",
  body:"2026年11月6日から接続経路、サーバー、セキュリティを更新しています。両サイトは最終検証を条件として11月8日までの復旧を予定しています。",
  benefit:"SIAIランキング、SASI制作、100以上のツールとアカウント・決済機能の安定性を改善します。"
 },
 ko:{
  title:"LINGXIFIELD | 글로벌 이중 사이트 업그레이드 안내",
  body:"2026년 11월 6일부터 국제 접속, 서버 및 보안 환경을 개선하고 있습니다. 최종 기능 검증을 전제로 11월 8일까지 복구할 예정입니다.",
  benefit:"SIAI 순위, SASI 창작, 100개 이상의 도구와 통합 계정 및 결제의 안정성을 강화합니다."
 },
 fr:{
  title:"LINGXIFIELD | Mise à niveau des deux sites en cours",
  body:"Depuis le 6 novembre 2026, nous améliorons nos serveurs, nos connexions mondiales et la sécurité. Le rétablissement est prévu d'ici le 8 novembre, sous réserve des vérifications finales.",
  benefit:"Cette mise à niveau renforce SIAI, SASI, plus de 100 outils et les comptes et paiements unifiés."
 },
 de:{
  title:"LINGXIFIELD | Upgrade beider Websites läuft",
  body:"Seit dem 6. November 2026 verbessern wir Server, weltweite Zugangswege und Datensicherheit. Die Wiederherstellung ist bis zum 8. November geplant, vorbehaltlich der abschließenden Funktionsprüfung.",
  benefit:"Die neue Infrastruktur stärkt SIAI, SASI, über 100 Werkzeuge und einheitliche Konten und Zahlungen."
 },
 es:{
  title:"LINGXIFIELD | Actualización de los dos sitios en curso",
  body:"Desde el 6 de noviembre de 2026 mejoramos los servidores, las conexiones globales y la seguridad. Prevemos restablecer ambos sitios antes del 8 de noviembre, sujeto a las pruebas finales.",
  benefit:"La mejora refuerza SIAI, SASI, más de 100 herramientas y los servicios de cuentas y pagos integrados."
 },
 pt:{
  title:"LINGXIFIELD | Atualização dos dois sites em andamento",
  body:"Desde 6 de novembro de 2026, melhoramos servidores, conexões globais e segurança. A recuperação está prevista até 8 de novembro, dependendo dos testes finais.",
  benefit:"A atualização reforça SIAI, SASI, mais de 100 ferramentas, contas e pagamentos unificados."
 },
 ar:{
  title:"LINGXIFIELD | تحديث الموقعين جارٍ",
  body:"منذ 6 نوفمبر 2026 نعمل على تحسين الخوادم والاتصال العالمي وأمن البيانات. نتوقع استعادة الموقعين بحلول 8 نوفمبر وفقاً لنتائج التحقق النهائي.",
  benefit:"تعزز الترقية ترتيب SIAI وإبداع SASI وأكثر من 100 أداة ونظام الحسابات والمدفوعات الموحد."
 }
};

const domainHosts=new Set(["lingxifield.com","www.lingxifield.com","lingxifield.cn","www.lingxifield.cn"]);
const supported=new Set<Lang>(["zh","en","ja","ko","fr","de","es","pt","ar"]);
function detectLang():Lang{
  const parts=location.pathname.split("/");
  const query=new URLSearchParams(location.search).get("lang")||"";
  const candidate=parts[1]==="siai"?parts[2]:parts[1];
  const lang=supported.has(candidate as Lang)?candidate:supported.has(query as Lang)?query:navigator.language.split("-")[0];
  return supported.has(lang as Lang)?lang as Lang:"zh";
}
export default function MainSiteReleaseNotice(){
  const [state,setState]=useState<{version:string;lang:Lang;phase:Phase}|null>(null);
  const close=useRef<HTMLButtonElement>(null);
  useEffect(()=>{
    // Keep embedded miniapps, account verification and payment forms uninterrupted.
    if(!domainHosts.has(location.hostname.toLowerCase()))return;
    if(/^\/(account|checkout|pay|billing)(?:\/|$)/.test(location.pathname))return;
    const params=new URLSearchParams(location.search);
    if(params.get("mini")==="1"||params.get("embedded")==="1")return;
    const controller=new AbortController();
    fetch("/api/site-release-announcement",{cache:"no-store",credentials:"same-origin",signal:controller.signal})
      .then(async res=>res.ok?await res.json() as Status:null)
      .then(result=>{
        if(!result)return;
        const isMaintenance=result.phase==="maintenance"&&result.version==="2026-11-dual-site-maintenance";
        const isComplete=result.phase==="complete"&&/^2026-11-dual-site-[a-f0-9]{12}$/.test(result.version);
        if(!result||result.enabled!==true||result.site!=="main"||(!isMaintenance&&!isComplete))return;
        const key="lx-main-release:"+result.version;
        try{if(localStorage.getItem(key)==="dismissed")return;}catch{}
        setState({version:result.version,lang:detectLang(),phase:result.phase as Phase});
      }).catch(()=>{});
    return()=>controller.abort();
  },[]);
  useEffect(()=>{
    if(!state)return;
    const last=document.activeElement instanceof HTMLElement?document.activeElement:null;
    const previousOverflow=document.body.style.overflow;
    document.body.style.overflow="hidden";
    close.current?.focus();
    const onKey=(event:KeyboardEvent)=>{
      if(event.key==="Escape"){event.preventDefault();dismiss();}
      if(event.key==="Tab"){
        const dialog=document.getElementById("lx-main-upgrade-modal");
        if(!dialog)return;
        const targets=Array.from(dialog.querySelectorAll<HTMLElement>("button,a[href]"));
        if(targets.length<2)return;
        if(event.shiftKey&&document.activeElement===targets[0]){
          event.preventDefault();targets[targets.length-1].focus();
        }else if(!event.shiftKey&&document.activeElement===targets[targets.length-1]){
          event.preventDefault();targets[0].focus();
        }
      }
    };
    window.addEventListener("keydown",onKey);
    return()=>{window.removeEventListener("keydown",onKey);document.body.style.overflow=previousOverflow;last?.focus();};
  },[state]);
  function dismiss(){
    if(!state)return;
    try{localStorage.setItem("lx-main-release:"+state.version,"dismissed");}catch{}
    setState(null);
  }
  if(!state)return null;
  const t=copy[state.lang];
  const notice=state.phase==="maintenance"?maintenance[state.lang]:null;
  return <div className={styles.backdrop}>
    <section id="lx-main-upgrade-modal" role="dialog" aria-modal="true" aria-labelledby="lx-main-upgrade-title"
      aria-describedby="lx-main-upgrade-detail" className={styles.card} dir={state.lang==="ar"?"rtl":"ltr"}>
      <button ref={close} className={styles.close} aria-label={t.close} onClick={dismiss} type="button">×</button>
      <div className={styles.top}>
        <Image src="/favicon-32x32.png" alt="" className={styles.logo} width={28} height={28} unoptimized/>
        <span>LINGXIFIELD</span>
        <span className={styles.spark} aria-hidden="true">✧</span>
      </div>
      <div className={styles.kicker}>{t.label}</div>
      <h2 className={styles.title} id="lx-main-upgrade-title">{notice?.title||t.title}</h2>
      <p className={styles.lead}>{t.lead}</p>
      <div className={styles.waterline} aria-hidden="true"/>
      <p className={styles.body} id="lx-main-upgrade-detail">{notice?.body||t.body}</p>
      <p className={styles.body}>{notice?.benefit||t.benefit}</p>
      <p className={styles.thanks}>{t.thanks}</p>
      <div className={styles.domains}>
        <a href="https://lingxifield.com" target="_blank" rel="noopener noreferrer">
          <small>{t.global}</small><strong>lingxifield.com</strong>
        </a>
        <a href="https://lingxifield.cn" target="_blank" rel="noopener noreferrer">
          <small>{t.china}</small><strong>lingxifield.cn</strong>
        </a>
      </div>
      <div className={styles.actions}>
        {state.phase==="complete"?<Link href="/tools" className={styles.primary} onClick={dismiss}>{t.action}</Link>:null}
        <button type="button" className={styles.secondary} onClick={dismiss}>{t.dismiss}</button>
      </div>
      <div className={styles.signature}>Celestial小仙女</div>
    </section>
  </div>;
}
