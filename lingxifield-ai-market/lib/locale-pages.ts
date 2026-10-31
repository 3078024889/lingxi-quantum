export const supportedLocales=['en','ja','ko','fr','de','es','pt','ar','zh'] as const;
export type Locale=typeof supportedLocales[number];
type Localized={headline:string;subtitle:string;home:string;search:string;empty:string;source:string;company:string;pricing:string};
export const localeCopy:Record<Locale,Localized>={
 en:{headline:"Global SI AI intelligence market",subtitle:"Find AI partners, compare capabilities and prices, and inspect verified sources.",home:'Market home',search:'Catalog',empty:'No verified catalog entries have been imported.',source:'Source and verification status',company:'Company',pricing:'Pricing'},
 ja:{headline:"世界の SI AI インテリジェンス市場",subtitle:"AIパートナーの機能・料金・公式資料を比較します。",home:'市場トップ',search:'ツール一覧',empty:'確認済みの製品データはまだありません。',source:'出典と検証状況',company:'企業',pricing:'価格'},
 ko:{headline:"글로벌 SI AI 인텔리전스 시장",subtitle:"AI 파트너의 기능과 가격 및 공식 근거를 비교하세요.",home:'시장 홈',search:'도구 목록',empty:'검증된 도구 데이터가 아직 등록되지 않았습니다.',source:'출처 및 검증 상태',company:'회사',pricing:'가격'},
 fr:{headline:"Marché mondial de l’intelligence SI AI",subtitle:"Comparez les partenaires IA, leurs tarifs et leurs sources officielles.",home:'Accueil',search:'Catalogue',empty:'Aucune fiche vérifiée importée.',source:'Sources et vérification',company:'Entreprise',pricing:'Tarifs'},
 de:{headline:"Globaler SI AI-Intelligenzmarkt",subtitle:"KI-Partner, Preise, Leistungen und offizielle Quellen vergleichen.",home:'Startseite',search:'Katalog',empty:'Noch keine verifizierten Einträge importiert.',source:'Quellen und Prüfung',company:'Unternehmen',pricing:'Preise'},
 es:{headline:"Mercado mundial de inteligencia SI AI",subtitle:"Compara socios de IA, capacidades, precios y fuentes verificadas.",home:'Inicio',search:'Catálogo',empty:'Aún no se han importado fichas verificadas.',source:'Fuentes y verificación',company:'Empresa',pricing:'Precios'},
 pt:{headline:"Mercado global de inteligência SI AI",subtitle:"Compare parceiros de IA, recursos, preços e fontes verificadas.",home:'Início',search:'Catálogo',empty:'Nenhum registro verificado foi importado.',source:'Fontes e verificação',company:'Empresa',pricing:'Preços'},
 ar:{headline:"سوق الذكاء العالمي SI AI",subtitle:"قارن شركاء الذكاء الاصطناعي والأسعار والقدرات والمصادر الموثقة.",home:'الرئيسية',search:'الدليل',empty:'لم يتم استيراد سجلات موثقة بعد.',source:'المصادر والتحقق',company:'الشركة',pricing:'الأسعار'},
 zh:{headline:"全球 SI AI 行情平台",subtitle:"比较全球 SI AI 智能伙伴、产品、模型、价格、官方支持地区及商用授权。",home:'行情首页',search:'工具目录',empty:'尚未导入经过核验的产品档案。',source:'数据来源与核验状态',company:'所属公司',pricing:'收费信息'}
};
