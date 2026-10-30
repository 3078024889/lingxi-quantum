import type {Language} from './v2';
// Column headings are localized; unverified manufacturer claims are kept in their source language.
export const MATRIX_HEADINGS:Record<Language,string[]> = {
  zh:['序号','AI 工具 · 厂商','主打能力 · 优势','代表模型 · 版本','推理 · 理解','适合谁 · 做什么','新手上手','免费额度','实际价格','限制 · 失败扣费','地区可用性','商用 · 隐私','登录 · 付款','SEO · GEO','官网 · 下载','详情 · 对比'],
  en:['No.','AI product · Maker','Strengths','Models · Versions','Reasoning','Best for','Getting started','Free allowance','Pricing','Limits · Failed tasks','Regions','Commercial · Privacy','Sign-in · Payment','SEO · GEO','Official · Download','Details · Compare'],
  ja:['番号','AI製品・企業','強み','代表モデル','推論・理解','用途','初心者向け','無料枠','料金','制限・失敗時','地域','商用・プライバシー','ログイン・決済','SEO・GEO','公式・ダウンロード','詳細・比較'],
  ko:['번호','AI 제품 · 기업','강점','대표 모델','추론 · 이해','추천 용도','시작 방법','무료 한도','가격','제한 · 실패 비용','지역','상업적 이용 · 개인정보','로그인 · 결제','SEO · GEO','공식 · 다운로드','상세 · 비교'],
  fr:['N°','Produit · Éditeur','Atouts','Modèles','Raisonnement','Pour qui','Débuter','Gratuit','Tarifs','Limites · Échecs','Régions','Usage commercial · Vie privée','Connexion · Paiement','SEO · GEO','Officiel · Téléchargement','Détails · Comparer'],
  de:['Nr.','KI-Tool · Anbieter','Stärken','Modelle','Schlussfolgern','Geeignet für','Einstieg','Freikontingent','Preis','Grenzen · Fehlversuche','Regionen','Kommerziell · Datenschutz','Login · Zahlung','SEO · GEO','Offiziell · Download','Details · Vergleich'],
  es:['N.º','Producto · Empresa','Ventajas','Modelos','Razonamiento','Usos','Primeros pasos','Gratis','Precio','Límites · Fallos','Regiones','Comercial · Privacidad','Acceso · Pago','SEO · GEO','Oficial · Descarga','Detalles · Comparar'],
  pt:['N.º','Produto · Empresa','Vantagens','Modelos','Raciocínio','Indicado para','Primeiros passos','Grátis','Preço','Limites · Falhas','Regiões','Comercial · Privacidade','Login · Pagamento','SEO · GEO','Oficial · Download','Detalhes · Comparar'],
  ar:['رقم','المنتج والشركة','المزايا','النماذج','الاستدلال والفهم','مناسب لـ','البدء','المجاني','السعر','القيود والفشل','المناطق','الاستخدام التجاري والخصوصية','الدخول والدفع','SEO وGEO','الرسمي والتنزيل','التفاصيل والمقارنة']
};

export const MATRIX_COLUMN_COUNT=16;
