"use client";

import Link from "next/link";
import {useEffect,useState} from "react";
import {LANG_NAMES,type LingxiLang,useLingxiLang} from "@/lib/lingxi-i18n";
import CurrencySelector from "@/components/CurrencySelector";

const COPY={
 zh:{kicker:"账户设置",title:"把常用偏好放在一个地方",lead:"语言、币种、显示方式和账户入口都可以从这里调整。",language:"语言",appearance:"显示",light:"浅色",dark:"深色",money:"支付币种",moneyNote:"CNY 与 USD 独立定价，不按实时汇率换算。",links:"账户与服务",notifications:"消息与公告",balance:"余额与充值",withdraw:"余额提现",connections:"创作连接",support:"我的问题",privacy:"隐私政策",terms:"用户服务协议",release:"版本与更新"},
 en:{kicker:"Account settings",title:"Keep your everyday preferences in one place",lead:"Adjust language, currency, appearance and account shortcuts here.",language:"Language",appearance:"Appearance",light:"Light",dark:"Dark",money:"Payment currency",moneyNote:"CNY and USD use independent price books, not live exchange-rate conversion.",links:"Account & services",notifications:"Notifications & updates",balance:"Balance & top-up",withdraw:"Balance withdrawal",connections:"Creative connections",support:"My support",privacy:"Privacy",terms:"Terms",release:"Release & updates"},
 ja:{kicker:"アカウント設定",title:"よく使う設定をひとつの場所に",lead:"言語、通貨、表示、アカウント入口をここで調整できます。",language:"言語",appearance:"表示",light:"ライト",dark:"ダーク",money:"支払い通貨",moneyNote:"CNY と USD は独立価格で、リアルタイム為替換算ではありません。",links:"アカウントとサービス",notifications:"通知と更新",balance:"残高とチャージ",withdraw:"残高の出金",connections:"制作サービス接続",support:"サポート",privacy:"プライバシー",terms:"利用規約",release:"バージョンと更新"},
 ko:{kicker:"계정 설정",title:"자주 쓰는 설정을 한곳에",lead:"언어, 통화, 화면 모드와 계정 바로가기를 여기서 조정하세요.",language:"언어",appearance:"화면",light:"라이트",dark:"다크",money:"결제 통화",moneyNote:"CNY와 USD는 독립 가격이며 실시간 환율로 환산하지 않습니다.",links:"계정 및 서비스",notifications:"알림 및 업데이트",balance:"잔액 및 충전",withdraw:"잔액 출금",connections:"창작 서비스 연결",support:"지원",privacy:"개인정보",terms:"이용약관",release:"버전 및 업데이트"},
 fr:{kicker:"Paramètres du compte",title:"Vos préférences au même endroit",lead:"Réglez langue, devise, apparence et raccourcis de compte ici.",language:"Langue",appearance:"Apparence",light:"Clair",dark:"Sombre",money:"Devise de paiement",moneyNote:"CNY et USD ont des tarifs indépendants, sans conversion au taux de change en direct.",links:"Compte et services",notifications:"Notifications",balance:"Solde et recharge",withdraw:"Retrait du solde",connections:"Connexions de création",support:"Assistance",privacy:"Confidentialité",terms:"Conditions",release:"Versions et mises à jour"},
 de:{kicker:"Kontoeinstellungen",title:"Wichtige Einstellungen an einem Ort",lead:"Sprache, Währung, Darstellung und Kontozugänge hier anpassen.",language:"Sprache",appearance:"Darstellung",light:"Hell",dark:"Dunkel",money:"Zahlungswährung",moneyNote:"CNY und USD haben unabhängige Preise und werden nicht nach Live-Wechselkurs umgerechnet.",links:"Konto & Dienste",notifications:"Mitteilungen",balance:"Guthaben & Aufladen",withdraw:"Guthaben auszahlen",connections:"Kreativdienste",support:"Support",privacy:"Datenschutz",terms:"Bedingungen",release:"Versionen & Updates"},
 es:{kicker:"Ajustes de cuenta",title:"Tus preferencias en un solo lugar",lead:"Ajusta idioma, moneda, apariencia y accesos de cuenta aquí.",language:"Idioma",appearance:"Apariencia",light:"Claro",dark:"Oscuro",money:"Moneda de pago",moneyNote:"CNY y USD usan precios independientes y no se convierten con el tipo de cambio en tiempo real.",links:"Cuenta y servicios",notifications:"Notificaciones",balance:"Saldo y recarga",withdraw:"Retirar saldo",connections:"Conexiones de creación",support:"Soporte",privacy:"Privacidad",terms:"Términos",release:"Versiones y novedades"},
 pt:{kicker:"Configurações da conta",title:"Preferências em um só lugar",lead:"Ajuste idioma, moeda, aparência e atalhos da conta aqui.",language:"Idioma",appearance:"Aparência",light:"Claro",dark:"Escuro",money:"Moeda de pagamento",moneyNote:"CNY e USD têm preços independentes e não usam conversão pela cotação em tempo real.",links:"Conta e serviços",notifications:"Notificações",balance:"Saldo e recarga",withdraw:"Sacar saldo",connections:"Conexões de criação",support:"Suporte",privacy:"Privacidade",terms:"Termos",release:"Versões e atualizações"},
 ar:{kicker:"إعدادات الحساب",title:"تفضيلاتك اليومية في مكان واحد",lead:"اضبط اللغة والعملة والمظهر وروابط الحساب من هنا.",language:"اللغة",appearance:"المظهر",light:"فاتح",dark:"داكن",money:"عملة الدفع",moneyNote:"تسعير CNY وUSD مستقل ولا يعتمد على تحويل سعر الصرف المباشر.",links:"الحساب والخدمات",notifications:"الإشعارات والتحديثات",balance:"الرصيد والشحن",withdraw:"سحب الرصيد",connections:"اتصالات خدمات الإبداع",support:"الدعم",privacy:"الخصوصية",terms:"الشروط",release:"الإصدارات والتحديثات"},
} as const;

export default function AccountSettingsPanel(){
 const{lang,setLang}=useLingxiLang();const c=COPY[lang]??COPY.en;
 const[theme,setTheme]=useState<"light"|"dark">("light");
 useEffect(()=>{const x=(localStorage.getItem("lx-theme")||document.documentElement.dataset.theme||"light")==="dark"?"dark":"light";setTheme(x)},[]);
 function chooseTheme(next:"light"|"dark"){setTheme(next);localStorage.setItem("lx-theme",next);document.documentElement.dataset.theme=next}
 const links=[
  ["/account/notifications",c.notifications,"🔔"],["/ai-wallet",c.balance,"💎"],["/account/withdrawals",c.withdraw,"↩"],
  ["/sasi/connections",c.connections,"✦"],["/account/support",c.support,"💬"],["/privacy",c.privacy,"🔒"],["/terms",c.terms,"📄"],["/release",c.release,"↗"],
 ] as const;
 return <section className="lx-v40-settings">
  <header><span>{c.kicker}</span><h1>{c.title}</h1><p>{c.lead}</p></header>
  <div className="lx-v40-setting-card">
   <div><b>{c.language}</b><select value={lang} onChange={e=>setLang(e.target.value as LingxiLang)}>{(Object.keys(LANG_NAMES) as LingxiLang[]).map(k=><option key={k} value={k}>{LANG_NAMES[k]}</option>)}</select></div>
   <div><b>{c.appearance}</b><div className="lx-v40-segment"><button className={theme==="light"?"is-active":""} onClick={()=>chooseTheme("light")}>☀ {c.light}</button><button className={theme==="dark"?"is-active":""} onClick={()=>chooseTheme("dark")}>☾ {c.dark}</button></div></div>
   <div><b>{c.money}</b><CurrencySelector/><small>{c.moneyNote}</small></div>
  </div>
  <div className="lx-v40-settings-links"><h2>{c.links}</h2>{links.map(([href,label,icon])=><Link key={href} href={href}><span>{icon}</span><b>{label}</b><i>→</i></Link>)}</div>
 </section>;
}
