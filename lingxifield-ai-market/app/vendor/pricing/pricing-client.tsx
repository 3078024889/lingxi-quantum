'use client';
import {useState} from 'react';
import type {Currency,Language} from '../../../lib/v2';
import {LANGUAGES} from '../../../lib/v2';
import {VENDOR_PLANS} from '../../../lib/vendor-price-catalog.mjs';
const TEXT:Record<Language,{title:string;intro:string;currency:string;free:string;period:string;apply:string;pending:string;note:string;back:string;plans:string[];details:string[]}>={
 zh:{title:'厂商合作与推广服务',intro:'让用户发现你的真实优势。商业展示与客观排名分开。',currency:'支付币种',free:'长期免费',period:'服务周期',apply:'免费认领／提交产品',pending:'支付接口正在接入，暂不收款',note:'所有付费位置明确标注推广，不影响自然排名；订单确认后才可支付。',back:'返回行情首页',plans:['基础收录','品牌展示','新品推荐','分类推广'],details:['免费认领最多 3 款产品，提交官方资料并回应评价','每产品每年，增强详情、官方案例及更新','7 天新品赞助推荐，展示推广标识','30 天分类赞助展示及可核验统计']},
 en:{title:'Vendor services & promotions',intro:'Show real product strengths. Promotions never change organic rankings.',currency:'Billing currency',free:'Free forever',period:'Duration',apply:'Claim or submit a product',pending:'Payments are not yet enabled',note:'Paid placements are labeled and separate from organic rankings.',back:'Back to market',plans:['Free listing','Brand profile','New launch','Category promotion'],details:['Claim up to 3 products and manage verified facts','Per product, per year: enhanced profile and updates','7-day labeled sponsored launch placement','30-day labeled category promotion']},
 ja:{title:'企業向け掲載・宣伝サービス',intro:'製品の強みを紹介。広告と自然ランキングは別管理。',currency:'決済通貨',free:'ずっと無料',period:'期間',apply:'製品を登録・申請',pending:'決済は準備中です',note:'有料広告は明示され、自然ランキングに影響しません。',back:'一覧に戻る',plans:['無料掲載','ブランド紹介','新製品紹介','カテゴリ広告'],details:['最大3製品を無料登録','製品ごとに年間、紹介と更新を充実','7日間の広告表示','30日間のカテゴリ広告']},
 ko:{title:'기업 등록 및 홍보 서비스',intro:'제품의 강점을 알리세요. 광고와 자연 순위는 분리됩니다.',currency:'결제 통화',free:'계속 무료',period:'기간',apply:'제품 등록 신청',pending:'결제 기능 준비 중',note:'유료 노출은 광고로 표시되며 자연 순위에 영향을 주지 않습니다.',back:'목록으로',plans:['무료 등록','브랜드 소개','신제품 홍보','카테고리 홍보'],details:['최대 3개 제품 무료 등록','제품별 연간 프로필 및 소식','7일 광고 노출','30일 카테고리 광고']},
 fr:{title:'Services pour éditeurs',intro:'Présentez vos atouts. Les publicités sont séparées du classement naturel.',currency:'Devise de paiement',free:'Gratuit',period:'Durée',apply:'Revendiquer un produit',pending:'Paiements non activés',note:'Les promotions sont identifiées et ne modifient pas le classement naturel.',back:'Retour au catalogue',plans:['Référencement gratuit','Profil de marque','Lancement','Promotion catégorie'],details:['Jusqu’à 3 produits gratuits','Profil enrichi par produit et par an','Annonce sponsorisée 7 jours','Annonce de catégorie 30 jours']},
 de:{title:'Anbieter- und Werbeleistungen',intro:'Zeigen Sie Produktstärken. Werbung beeinflusst keine organischen Rankings.',currency:'Zahlungswährung',free:'Dauerhaft kostenlos',period:'Laufzeit',apply:'Produkt anmelden',pending:'Zahlungen noch nicht freigeschaltet',note:'Bezahlte Platzierungen sind gekennzeichnet und beeinflussen Rankings nicht.',back:'Zur Übersicht',plans:['Kostenloser Eintrag','Markenprofil','Produktstart','Kategorie-Werbung'],details:['Bis zu 3 Produkte kostenlos','Erweitertes Profil pro Produkt/Jahr','7 Tage gekennzeichnete Werbung','30 Tage Kategorie-Werbung']},
 es:{title:'Servicios para proveedores',intro:'Presenta las ventajas reales. Los anuncios no afectan la clasificación orgánica.',currency:'Moneda de pago',free:'Gratis para siempre',period:'Duración',apply:'Registrar producto',pending:'Pagos aún no habilitados',note:'Las posiciones patrocinadas se identifican y no alteran el ranking orgánico.',back:'Volver al catálogo',plans:['Listado gratuito','Perfil de marca','Nuevo lanzamiento','Promoción de categoría'],details:['Hasta 3 productos gratuitos','Perfil ampliado por producto/año','Promoción señalada de 7 días','Promoción de categoría por 30 días']},
 pt:{title:'Serviços para fornecedores',intro:'Destaque seus produtos. Anúncios não alteram rankings orgânicos.',currency:'Moeda de pagamento',free:'Gratuito',period:'Duração',apply:'Cadastrar produto',pending:'Pagamentos ainda indisponíveis',note:'Posições patrocinadas são identificadas e independentes do ranking orgânico.',back:'Voltar ao catálogo',plans:['Listagem gratuita','Perfil de marca','Lançamento','Promoção por categoria'],details:['Até 3 produtos gratuitos','Perfil aprimorado por produto/ano','Divulgação identificada por 7 dias','Promoção de categoria por 30 dias']},
 ar:{title:'خدمات الشركات والترويج',intro:'اعرض مزايا منتجك الحقيقية. الإعلان منفصل عن الترتيب الطبيعي.',currency:'عملة الدفع',free:'مجاني دائمًا',period:'المدة',apply:'تسجيل منتج',pending:'الدفع غير مفعّل حاليًا',note:'تُعلّم المواضع المدفوعة بوضوح ولا تؤثر على الترتيب الطبيعي.',back:'العودة إلى القائمة',plans:['إدراج مجاني','ملف العلامة','إطلاق منتج','ترويج فئة'],details:['حتى 3 منتجات مجانًا','ملف موسع لكل منتج سنويًا','إعلان موضّح لمدة 7 أيام','إعلان فئة لمدة 30 يومًا']}
};
export default function VendorPricingClient({initialCurrency}:{initialCurrency:Currency}){
 const [currency,setCurrency]=useState<Currency>(initialCurrency);
 const [language,setLanguage]=useState<Language>('zh');
 const t=TEXT[language];
 return <main className="vendorPricingPage" dir={language==='ar'?'rtl':'ltr'}>
  <a href="/" className="vendorPricingBack">← {t.back}</a>
  <header className="vendorPricingHeader"><h1>{t.title}</h1><p>{t.intro}</p>
   <div className="vendorPricingControls">
    <label>{t.currency}<select aria-label={t.currency} value={currency} onChange={e=>setCurrency(e.target.value as Currency)}>
     <option value="CNY">CNY · ¥</option><option value="USD">USD · $</option></select></label>
    <label>Language<select aria-label="Language" value={language} onChange={e=>setLanguage(e.target.value as Language)}>{LANGUAGES.map(lang=><option key={lang.code} value={lang.code}>{lang.label}</option>)}</select></label>
   </div>
  </header>
  <div className="vendorPricingCards">{VENDOR_PLANS.map((plan,i)=><article key={plan.id}>
   <h2>{t.plans[i]}</h2><div className="vendorPricingAmount">{currency==='CNY'?'¥':'$'}{plan.amount}</div>
   <p className="vendorPricingDuration">{plan.durationDays?plan.durationDays===365?({zh:'每产品／年',en:'per product / year',ja:'製品ごと／年',ko:'제품별 / 연간',fr:'par produit / an',de:'pro Produkt / Jahr',es:'por producto / año',pt:'por produto / ano',ar:'لكل منتج / سنة'} as Record<Language,string>)[language]:plan.durationDays+' '+({zh:'天',en:'days',ja:'日',ko:'일',fr:'jours',de:'Tage',es:'días',pt:'dias',ar:'يوم'} as Record<Language,string>)[language]:t.free}</p>
   <p>{t.details[i]}</p><a href="/vendor/claim">{t.apply}</a>
  </article>)}</div>
  <p className="vendorPricingPending" role="status">{t.pending}</p><p className="vendorPricingNote">{t.note}</p>
 </main>;
}
