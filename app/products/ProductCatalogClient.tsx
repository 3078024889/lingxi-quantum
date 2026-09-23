"use client";

import Link from "next/link";
import { useLingxiLang, type LingxiLang } from "@/lib/lingxi-i18n";
import { getProduct } from "@/lib/plans";
import { productCatalogText } from "@/lib/product-catalog-i18n";

type Localized = Record<LingxiLang, string>;
const l=(zh:string,en:string,ja:string,ko:string,fr:string,de:string,es:string,pt:string,ar:string):Localized=>({zh,en,ja,ko,fr,de,es,pt,ar});

const ITEMS=[
  {id:"life-map-report",href:"/life-map",name:l("生命图谱完整报告","Full Life Map Report","生命図 完全レポート","생명 지도 전체 보고서","Rapport complet de carte de vie","Vollständiger Lebenskarte-Bericht","Informe completo de mapa vital","Relatório completo de mapa de vida","تقرير خريطة الحياة الكامل"),kind:"report" as const},
  {id:"relationship-resonance",href:"/relationship",name:l("关系共振图谱","Relationship Resonance Map","関係共鳴マップ","관계 공명 지도","Carte de résonance relationnelle","Beziehungsresonanz-Karte","Mapa de resonancia relacional","Mapa de ressonância relacional","خريطة رنين العلاقات"),kind:"report" as const},
  {id:"qian-reading",href:"/qian",name:l("生命灵签 · 场域解读","Life Oracle · Field Reading","生命オラクル · フィールド解読","생명 오라클 · 필드 리딩","Oracle de vie · Lecture du champ","Lebensorakel · Felddeutung","Oráculo de vida · Lectura de campo","Oráculo da vida · Leitura de campo","أوراكل الحياة · قراءة المجال"),kind:"report" as const},
  {id:"tarot-reading",href:"/mirror",name:l("量子生命镜像 · 深度解读","Quantum Life Mirror · Deep Reading","量子生命ミラー · 深層解読","양자 생명 거울 · 심층 해석","Miroir quantique de vie · Lecture approfondie","Quanten-Lebensspiegel · Tiefendeutung","Espejo cuántico de vida · Lectura profunda","Espelho quântico da vida · Leitura profunda","مرآة الحياة الكمية · قراءة عميقة"),kind:"report" as const},
  {id:"resilience-report",href:"/resilience",name:l("生命韧性指数 · 完整档案","Life Resilience Index · Full Archive","生命レジリエンス指数 · 完全アーカイブ","생명 회복탄력성 지수 · 전체 아카이브","Indice de résilience de vie · Archive complète","Lebensresilienz-Index · Vollständiges Archiv","Índice de resiliencia vital · Archivo completo","Índice de resiliência da vida · Arquivo completo","مؤشر مرونة الحياة · الأرشيف الكامل"),kind:"report" as const},
  {id:"romance-report",href:"/romance",name:l("桃花磁场指数 · 完整档案","Romance Resonance Index · Full Archive","恋愛磁場指数 · 完全アーカイブ","연애 공명 지수 · 전체 아카이브","Indice de résonance romantique · Archive complète","Romanzresonanz-Index · Vollständiges Archiv","Índice de resonancia romántica · Archivo completo","Índice de ressonância romântica · Arquivo completo","مؤشر الرنين العاطفي · الأرشيف الكامل"),kind:"report" as const},
  {id:"daily-tide-report",href:"/daily",name:l("今日潮汐 · 深度报告","Today’s Tide · Deep Report","今日の潮流 · 詳細レポート","오늘의 흐름 · 심층 보고서","Marée du jour · Rapport approfondi","Tagesrhythmus · Tiefenbericht","Marea de hoy · Informe profundo","Maré de hoje · Relatório profundo","مدّ اليوم · تقرير متعمق"),kind:"report" as const},
  {id:"wealth-report",href:"/wealth",name:l("财富创造地图 · 完整档案","Wealth Creation Map · Full Archive","富の創造マップ · 完全アーカイブ","부 창조 지도 · 전체 아카이브","Carte de création de richesse · Archive complète","Wohlstands-Schöpfungskarte · Vollständiges Archiv","Mapa de creación de riqueza · Archivo completo","Mapa de criação de riqueza · Arquivo completo","خريطة صنع الثروة · الأرشيف الكامل"),kind:"report" as const},
  {id:"day",href:"/membership#manifestation",name:l("一念显化 · 单日体验","Manifestation · One-Day Pass","顕現 · 1日体験","현현 · 1일 이용권","Manifestation · Pass 1 jour","Manifestation · Tagespass","Manifestación · Pase de un día","Manifestação · Passe de um dia","التجلّي · دخول ليوم واحد"),kind:"access" as const},
  {id:"month",href:"/membership#manifestation",name:l("一念显化 · 月度服务","Manifestation · Monthly","顕現 · 月間","현현 · 월간","Manifestation · Mensuel","Manifestation · Monatlich","Manifestación · Mensual","Manifestação · Mensal","التجلّي · شهري"),kind:"access" as const},
  {id:"year",href:"/membership#manifestation",name:l("一念显化 · 年度服务","Manifestation · Yearly","顕現 · 年間","현현 · 연간","Manifestation · Annuel","Manifestation · Jährlich","Manifestación · Anual","Manifestação · Anual","التجلّي · سنوي"),kind:"access" as const},
];

const POLICY_LINKS:{
  href:string;
  label:Localized;
}[]=[
  {href:"/terms",label:l("用户服务协议","Terms","利用規約","이용약관","Conditions","Nutzungsbedingungen","Términos","Termos","الشروط")},
  {href:"/refunds",label:l("充值与退款","Refunds","チャージと返金","충전 및 환불","Remboursements","Rückerstattungen","Reembolsos","Reembolsos","الاسترداد")},
  {href:"/privacy",label:l("隐私政策","Privacy","プライバシー","개인정보","Confidentialité","Datenschutz","Privacidad","Privacidade","الخصوصية")},
  {href:"/account/orders",label:l("我的订单","Orders","注文履歴","내 주문","Commandes","Bestellungen","Pedidos","Pedidos","الطلبات")},
];

export default function ProductCatalogClient(){
  const {lang}=useLingxiLang();
  const t=(k:Parameters<typeof productCatalogText>[1])=>productCatalogText(lang,k);

  return <main className="lx11-page lx-products-page">
    <div className="lx11-wrap">
      <section className="lx-products-hero">
        <p>{t("kicker")}</p>
        <h1>{t("title")}</h1>
        <div>{t("lead")}</div>
      </section>

      <section className="lx-products-wrap">
        <div className="lx-products-heading">
          <h2>{t("catalog")}</h2>
          <p>{t("notice")}</p>
        </div>

        <div className="lx-products-grid">
          {ITEMS.map(item=>{
            const p=getProduct(item.id);
            if(!p)return null;
            return <article key={item.id} className="lx-product-card">
              <div className="lx-product-card-top">
                <div>
                  <small>DIGITAL SERVICE</small>
                  <h3>{item.name[lang]||item.name.en}</h3>
                </div>
                <strong>¥{p.priceRmb}</strong>
              </div>
              <p>{lang==="zh"?p.note:p.noteEn}</p>
              <dl>
                <div><dt>{t("price")}</dt><dd>¥{p.priceRmb}</dd></div>
                <div><dt>{t("delivery")}</dt><dd>{item.kind==="access"?t("deliveryAccess"):t("deliveryReport")}</dd></div>
              </dl>
              <Link href={item.href}>{t("enter")} →</Link>
            </article>;
          })}
        </div>

        <aside className="lx-products-policy">
          <h2>{t("refund")}</h2>
          <p>{t("support")}</p>
          <div>
            {POLICY_LINKS.map(item=><Link key={item.href} href={item.href}>{item.label[lang]||item.label.en}</Link>)}
          </div>
        </aside>
      </section>
    </div>
  </main>;
}
