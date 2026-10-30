export const supportedLocales=['en','ja','ko','fr','de','es','pt','ar','zh'] as const;
export type Locale=typeof supportedLocales[number];
type Localized={headline:string;subtitle:string;home:string;search:string;empty:string;source:string;company:string;pricing:string};
export const localeCopy:Record<Locale,Localized>={
 en:{headline:'Global AI market intelligence',subtitle:'Find AI tools, compare capabilities, and inspect sourced evidence.',home:'Market home',search:'Catalog',empty:'No verified catalog entries have been imported.',source:'Source and verification status',company:'Company',pricing:'Pricing'},
 ja:{headline:'世界のAI市場インテリジェンス',subtitle:'AIツールの機能を比較し、出典を確認できます。',home:'市場トップ',search:'ツール一覧',empty:'確認済みの製品データはまだありません。',source:'出典と検証状況',company:'企業',pricing:'価格'},
 ko:{headline:'글로벌 AI 시장 정보',subtitle:'AI 도구를 찾고 기능과 출처를 비교하세요.',home:'시장 홈',search:'도구 목록',empty:'검증된 도구 데이터가 아직 등록되지 않았습니다.',source:'출처 및 검증 상태',company:'회사',pricing:'가격'},
 fr:{headline:'Observatoire mondial des outils IA',subtitle:'Trouvez des outils IA et comparez leurs capacités avec des sources.',home:'Accueil',search:'Catalogue',empty:'Aucune fiche vérifiée importée.',source:'Sources et vérification',company:'Entreprise',pricing:'Tarifs'},
 de:{headline:'Globaler KI-Marktüberblick',subtitle:'KI-Tools finden, Funktionen vergleichen und Quellen prüfen.',home:'Startseite',search:'Katalog',empty:'Noch keine verifizierten Einträge importiert.',source:'Quellen und Prüfung',company:'Unternehmen',pricing:'Preise'},
 es:{headline:'Panorama global del mercado de IA',subtitle:'Encuentra herramientas de IA, compara funciones y fuentes.',home:'Inicio',search:'Catálogo',empty:'Aún no se han importado fichas verificadas.',source:'Fuentes y verificación',company:'Empresa',pricing:'Precios'},
 pt:{headline:'Panorama global de ferramentas de IA',subtitle:'Encontre ferramentas de IA e compare recursos e fontes.',home:'Início',search:'Catálogo',empty:'Nenhum registro verificado foi importado.',source:'Fontes e verificação',company:'Empresa',pricing:'Preços'},
 ar:{headline:'دليل سوق أدوات الذكاء الاصطناعي العالمي',subtitle:'اكتشف أدوات الذكاء الاصطناعي وقارن القدرات والمصادر.',home:'الرئيسية',search:'الدليل',empty:'لم يتم استيراد سجلات موثقة بعد.',source:'المصادر والتحقق',company:'الشركة',pricing:'الأسعار'},
 zh:{headline:'全球SI AI工具行情平台',subtitle:'搜全球 AI 工具，比较功能、价格、公司背景与可核验数据。',home:'行情首页',search:'工具目录',empty:'尚未导入经过核验的产品档案。',source:'数据来源与核验状态',company:'所属公司',pricing:'收费信息'}
};
