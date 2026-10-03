import type{LingxifieldLocale}from"@/lib/platform/locales";

export const LINGXIFIELD_BRAND={
 brand:"LINGXIFIELD",
 brandZh:"灵犀场",
 sasi:"SASI",
 canonicalDomain:"lingxifield.com",
 chinaDomain:"lingxifield.cn",
} as const;

export type SasiPublicMode="drama"|"website"|"book"|"learning"|"research";
export const SASI_MODE_LABELS:Record<LingxifieldLocale,Record<SasiPublicMode,string>>={
 zh:{drama:"短剧",website:"网站",book:"书本",learning:"学习",research:"科研"},
 en:{drama:"Drama",website:"Website",book:"Book",learning:"Learning",research:"Research"},
 ja:{drama:"短編",website:"サイト",book:"本",learning:"学習",research:"研究"},
 ko:{drama:"드라마",website:"웹사이트",book:"책",learning:"학습",research:"연구"},
 fr:{drama:"Série",website:"Site",book:"Livre",learning:"Apprentissage",research:"Recherche"},
 de:{drama:"Drama",website:"Website",book:"Buch",learning:"Lernen",research:"Forschung"},
 es:{drama:"Drama",website:"Web",book:"Libro",learning:"Aprendizaje",research:"Investigación"},
 pt:{drama:"Drama",website:"Site",book:"Livro",learning:"Aprendizado",research:"Pesquisa"},
 ar:{drama:"دراما",website:"موقع",book:"كتاب",learning:"تعلم",research:"بحث"},
};
export function sasiModeLabel(locale:LingxifieldLocale,mode:SasiPublicMode){return SASI_MODE_LABELS[locale]?.[mode]??SASI_MODE_LABELS.en[mode]}
