"use client";

import Link from "next/link";
import {ALL_TOOLS_PASS_CATALOG} from "@/lib/tools/commerce/all-tools-pass";
import {usePreferredCurrency} from "@/components/CurrencyPreferenceProvider";
import type {LingxiLang} from "@/lib/lingxi-i18n";

type GrowthChip={label:string;href?:string};
type GrowthCard={tag:string;title:string;description:string;href:string;cta:string;chips:GrowthChip[]};
type Feature={icon:string;title:string;description:string;href:string};
type ToolCategory={title:string;href:string};
type HomeGrowthCopy={
 features:Feature[];
 growthTitle:string;growthLead:string;growthCards:GrowthCard[];
 flywheelTitle:string;flywheel:string[];
 passTitle:string;passLead:string;passBenefits:string[];
 planDays:string[];planDescriptions:string[];planCta:string;popular:string;
 marketSiaiTitle:string;marketSiaiDesc:string;marketSasiTitle:string;marketSasiDesc:string;
 stats:{value:string;label:string}[];
 toolsTitle:string;toolCategories:ToolCategory[];
};

const COPY:Record<LingxiLang,HomeGrowthCopy>={
 zh:{
  features:[
   {icon:"◉",title:"全球 SIAI 排行榜",description:"模型 · 价格 · 免费额度",href:"/siai"},
   {icon:"▦",title:"100+ 实用工具",description:"PDF · 图片 · 视频 · 音频",href:"/tools"},
   {icon:"◈",title:"SASI 智能软件市场",description:"MT5 EA · 量化源码 · 成品软件",href:"/sasi"},
   {icon:"∞",title:"工具包会员",description:"全场工具 · 无限使用",href:"/tools/pass"},
   {icon:"✧",title:"全球增长与合作",description:"SEO · GEO · API · 嵌入",href:"/partners"}
  ],
  growthTitle:"让全球用户找到灵犀场，也让灵犀场连接更多产品与场景",
  growthLead:"从搜索发现、AI 搜索、全球产品分发，到软件交易、合作网络与真实应用内容，形成完整的全球入口。",
  growthCards:[
   {tag:"SEO",title:"搜索入口",description:"九语言 SEO、124 个工具目录与问题型落地页，让真实需求直接进入可用工具。",href:"/tools",cta:"浏览工具目录",chips:[{label:"九种语言"},{label:"124 个工具入口"},{label:"问题型页面"}]},
   {tag:"GEO",title:"AI 搜索入口",description:"通过 llms.txt、llms-full.txt 与结构化产品资料，让 AI 准确理解平台、工具和服务。",href:"/llms.txt",cta:"查看 AI 搜索资料",chips:[{label:"llms.txt",href:"/llms.txt"},{label:"llms-full.txt",href:"/llms-full.txt"},{label:"结构化资料"}]},
   {tag:"SIAI",title:"全球 SIAI 分发",description:"集中呈现排行榜、模型资料、真实价格、免费额度、地区可用性与商业授权。",href:"/siai",cta:"进入全球 SIAI 排行榜",chips:[{label:"排行榜"},{label:"价格与免费额度"},{label:"地区及商用条件"}]},
   {tag:"SASI",title:"SASI 商业入口",description:"覆盖 MT5 EA、量化交易源码、其他成品软件、安装教程、授权说明与安全自动交付。",href:"/sasi",cta:"浏览 SASI 智能软件市场",chips:[{label:"MT5 EA"},{label:"量化源码"},{label:"授权与自动交付"}]},
   {tag:"NETWORK",title:"外部增长网络",description:"连接 WordPress、JS Widget、合作伙伴、开放 API、RSS、二维码与分享归因。",href:"/partners",cta:"进入合作伙伴中心",chips:[{label:"WordPress",href:"/partners"},{label:"JS Widget",href:"/widgets/lingxifield-v1.js"},{label:"API",href:"/siai-openapi.json"},{label:"RSS",href:"/siai/updates.xml"},{label:"二维码"},{label:"分享归因"}]},
   {tag:"STORIES",title:"内容传播",description:"以奇闻发现吸引关注，以真实工具问题提供答案，再用 Before / After 和实际应用场景展示结果。",href:"/tools",cta:"从真实问题开始",chips:[{label:"奇闻发现"},{label:"真实工具问题"},{label:"Before / After"},{label:"实际应用场景"}]}
  ],
  flywheelTitle:"从发现到分享，让每次体验都有下一步",
  flywheel:["发现","搜索","体验","结果","分享","再回来"],
  passTitle:"ToolPass 工具包会员",passLead:"一站畅用 100+ 实用工具，持续处理文件与日常任务更高效。",
  passBenefits:["全场 100+ 工具 · 无限使用","多文件批量处理 · 提升效率","持续更新新工具 · 覆盖更多场景","一个账户 · 双站可用（.com / .cn）"],
  planDays:["7 天体验","30 天","90 天","365 天"],
  planDescriptions:["短期使用 · 轻松上手","畅享全站工具","更优惠 · 更省心","长期使用 · 超值之选"],
  planCta:"查看方案",popular:"热门推荐",
  marketSiaiTitle:"全球 SIAI 排行榜",marketSiaiDesc:"全球 AI / SI 模型与工具的权威参考，比较能力、价格、免费额度与可用地区。",
  marketSasiTitle:"SASI 智能软件市场",marketSasiDesc:"MT5 EA、量化源码、成品软件、版本授权与自动交付。",
  stats:[{value:"100+",label:"在线实用工具"},{value:"∞",label:"工具包无限使用"},{value:"9",label:"多语言全球访问"}],
  toolsTitle:"热门工具与真实应用场景",
  toolCategories:[{title:"PDF 处理",href:"/tools?q=PDF"},{title:"图片处理",href:"/tools?q=图片"},{title:"视频音频",href:"/tools?q=视频"},{title:"文件转换",href:"/tools?q=转换"},{title:"隐私工具",href:"/tools?q=隐私"},{title:"日常实用",href:"/tools"}]
 },
 en:{
  features:[
   {icon:"◉",title:"Global SIAI Rankings",description:"Models · prices · free limits",href:"/siai"},
   {icon:"▦",title:"100+ Practical Tools",description:"PDF · images · video · audio",href:"/tools"},
   {icon:"◈",title:"SASI Software Marketplace",description:"MT5 EAs · source code · software",href:"/sasi"},
   {icon:"∞",title:"ToolPass Membership",description:"All tools · unlimited use",href:"/tools/pass"},
   {icon:"✧",title:"Global Growth & Partners",description:"SEO · GEO · API · embeds",href:"/partners"}
  ],
  growthTitle:"A global entry point for discovery, products and real-world use",
  growthLead:"Connect search discovery, AI search, SIAI distribution, software commerce, partner networks and useful stories in one coherent journey.",
  growthCards:[
   {tag:"SEO",title:"Search Discovery",description:"Nine-language SEO, 124 tool entries and problem-led landing pages that lead directly to usable tools.",href:"/tools",cta:"Browse the tool directory",chips:[{label:"9 languages"},{label:"124 tool entries"},{label:"Problem pages"}]},
   {tag:"GEO",title:"AI Search Discovery",description:"Help AI systems understand the platform through llms.txt, llms-full.txt and structured product facts.",href:"/llms.txt",cta:"View AI search resources",chips:[{label:"llms.txt",href:"/llms.txt"},{label:"llms-full.txt",href:"/llms-full.txt"},{label:"Structured facts"}]},
   {tag:"SIAI",title:"Global SIAI Distribution",description:"Rankings, model profiles, real prices, free allowances, regional availability and commercial rights.",href:"/siai",cta:"Explore Global SIAI",chips:[{label:"Rankings"},{label:"Prices & free tiers"},{label:"Regions & rights"}]},
   {tag:"SASI",title:"SASI Business",description:"MT5 EAs, trading source code, finished software, installation guides, licensing and secure automatic delivery.",href:"/sasi",cta:"Browse SASI Marketplace",chips:[{label:"MT5 EAs"},{label:"Trading source code"},{label:"Licensing & delivery"}]},
   {tag:"NETWORK",title:"External Growth Network",description:"WordPress, JS Widget, partner portal, public API, RSS, QR codes and share attribution.",href:"/partners",cta:"Open partner center",chips:[{label:"WordPress",href:"/partners"},{label:"JS Widget",href:"/widgets/lingxifield-v1.js"},{label:"API",href:"/siai-openapi.json"},{label:"RSS",href:"/siai/updates.xml"},{label:"QR"},{label:"Share attribution"}]},
   {tag:"STORIES",title:"Content & Discovery",description:"Curiosity-led discoveries, real tool problems, Before / After evidence and practical use cases.",href:"/tools",cta:"Start with a real task",chips:[{label:"Discoveries"},{label:"Real problems"},{label:"Before / After"},{label:"Use cases"}]}
  ],
  flywheelTitle:"From discovery to sharing, every useful result creates a next step",
  flywheel:["Discover","Search","Try","Result","Share","Return"],
  passTitle:"ToolPass Membership",passLead:"Use 100+ practical tools in one place and handle everyday files more efficiently.",
  passBenefits:["100+ practical tools · unlimited use","Batch file workflows · save time","New tools added continuously","One account · .com and .cn"],
  planDays:["7-day trial","30 days","90 days","365 days"],
  planDescriptions:["A simple way to start","Access all practical tools","Better value over time","Best for long-term use"],
  planCta:"View plans",popular:"Popular",
  marketSiaiTitle:"Global SIAI Rankings",marketSiaiDesc:"Compare global AI / SI models and tools by capability, pricing, free limits and regional access.",
  marketSasiTitle:"SASI Software Marketplace",marketSasiDesc:"MT5 EAs, trading source code, finished software, licenses and automatic delivery.",
  stats:[{value:"100+",label:"Online practical tools"},{value:"∞",label:"Unlimited with ToolPass"},{value:"9",label:"Languages worldwide"}],
  toolsTitle:"Popular tools and real use cases",
  toolCategories:[{title:"PDF",href:"/tools?q=PDF"},{title:"Images",href:"/tools?q=images"},{title:"Video & audio",href:"/tools?q=video"},{title:"File conversion",href:"/tools?q=convert"},{title:"Privacy",href:"/tools?q=privacy"},{title:"Everyday tools",href:"/tools"}]
 },
 ja:{
  features:[
   {icon:"◉",title:"世界の SIAI ランキング",description:"モデル · 価格 · 無料枠",href:"/siai"},
   {icon:"▦",title:"100以上の実用ツール",description:"PDF · 画像 · 動画 · 音声",href:"/tools"},
   {icon:"◈",title:"SASI ソフトウェア市場",description:"MT5 EA · ソースコード · 完成品",href:"/sasi"},
   {icon:"∞",title:"ToolPass 会員",description:"全ツール · 無制限利用",href:"/tools/pass"},
   {icon:"✧",title:"グローバル連携",description:"SEO · GEO · API · 埋め込み",href:"/partners"}
  ],
  growthTitle:"世界から見つかり、製品と利用シーンをつなぐ入口",
  growthLead:"検索、AI検索、SIAIの情報配信、ソフトウェア取引、パートナー連携、実用コンテンツを一つにつなぎます。",
  growthCards:[
   {tag:"SEO",title:"検索入口",description:"9言語 SEO、124件のツール案内、課題別ランディングページ。",href:"/tools",cta:"ツール一覧を見る",chips:[{label:"9言語"},{label:"124件の入口"},{label:"課題別ページ"}]},
   {tag:"GEO",title:"AI検索入口",description:"llms.txt、llms-full.txt、構造化された製品情報でAI検索を支援。",href:"/llms.txt",cta:"AI検索資料を見る",chips:[{label:"llms.txt",href:"/llms.txt"},{label:"llms-full.txt",href:"/llms-full.txt"},{label:"構造化情報"}]},
   {tag:"SIAI",title:"世界の SIAI 配信",description:"ランキング、モデル情報、価格、無料枠、地域対応、商用利用条件。",href:"/siai",cta:"SIAIランキングを見る",chips:[{label:"ランキング"},{label:"価格と無料枠"},{label:"地域と権利"}]},
   {tag:"SASI",title:"SASI ビジネス入口",description:"MT5 EA、取引ソースコード、完成ソフト、導入ガイド、ライセンスと安全な納品。",href:"/sasi",cta:"SASI市場を見る",chips:[{label:"MT5 EA"},{label:"取引ソース"},{label:"ライセンスと納品"}]},
   {tag:"NETWORK",title:"外部連携ネットワーク",description:"WordPress、JS Widget、パートナー、API、RSS、QR、共有経由の分析。",href:"/partners",cta:"パートナーセンター",chips:[{label:"WordPress",href:"/partners"},{label:"JS Widget",href:"/widgets/lingxifield-v1.js"},{label:"API",href:"/siai-openapi.json"},{label:"RSS",href:"/siai/updates.xml"},{label:"QR"},{label:"共有分析"}]},
   {tag:"STORIES",title:"発見とコンテンツ",description:"不思議な発見、実際のツール課題、Before / After、利用シーン。",href:"/tools",cta:"実際の課題から始める",chips:[{label:"発見"},{label:"実際の課題"},{label:"Before / After"},{label:"利用シーン"}]}
  ],
  flywheelTitle:"発見から共有まで、役立つ体験を次につなぐ",
  flywheel:["発見","検索","体験","結果","共有","再訪"],
  passTitle:"ToolPass ツール会員",passLead:"100以上の実用ツールを一か所で利用し、日常のファイル作業を効率化。",
  passBenefits:["100以上のツール · 無制限利用","複数ファイル処理 · 効率向上","新しいツールを継続追加","1アカウント · .com / .cn"],
  planDays:["7日体験","30日","90日","365日"],
  planDescriptions:["まずは気軽に","全ツールを利用","長期利用でお得","長期利用に最適"],
  planCta:"プランを見る",popular:"人気",
  marketSiaiTitle:"世界の SIAI ランキング",marketSiaiDesc:"AI / SIモデルとツールの性能、価格、無料枠、地域対応を比較。",
  marketSasiTitle:"SASI ソフトウェア市場",marketSasiDesc:"MT5 EA、取引ソースコード、完成ソフト、ライセンスと自動納品。",
  stats:[{value:"100+",label:"オンラインツール"},{value:"∞",label:"ToolPass無制限"},{value:"9",label:"多言語対応"}],
  toolsTitle:"人気ツールと実際の利用シーン",
  toolCategories:[{title:"PDF処理",href:"/tools?q=PDF"},{title:"画像",href:"/tools?q=画像"},{title:"動画・音声",href:"/tools?q=動画"},{title:"ファイル変換",href:"/tools?q=変換"},{title:"プライバシー",href:"/tools?q=プライバシー"},{title:"日常ツール",href:"/tools"}]
 },
 ko:{
  features:[
   {icon:"◉",title:"글로벌 SIAI 순위",description:"모델 · 가격 · 무료 한도",href:"/siai"},
   {icon:"▦",title:"실용 도구 100+",description:"PDF · 이미지 · 영상 · 오디오",href:"/tools"},
   {icon:"◈",title:"SASI 소프트웨어 마켓",description:"MT5 EA · 소스 코드 · 완성품",href:"/sasi"},
   {icon:"∞",title:"ToolPass 멤버십",description:"전체 도구 · 무제한 사용",href:"/tools/pass"},
   {icon:"✧",title:"글로벌 성장과 협력",description:"SEO · GEO · API · 임베드",href:"/partners"}
  ],
  growthTitle:"전 세계 사용자가 찾고 제품과 활용 사례가 연결되는 입구",
  growthLead:"검색, AI 검색, SIAI 정보 배포, 소프트웨어 거래, 파트너 네트워크와 실제 활용 콘텐츠를 하나로 연결합니다.",
  growthCards:[
   {tag:"SEO",title:"검색 입구",description:"9개 언어 SEO, 124개 도구 디렉터리와 문제 해결 랜딩 페이지.",href:"/tools",cta:"도구 디렉터리 보기",chips:[{label:"9개 언어"},{label:"124개 도구"},{label:"문제 페이지"}]},
   {tag:"GEO",title:"AI 검색 입구",description:"llms.txt, llms-full.txt와 구조화된 제품 정보로 AI 검색을 지원합니다.",href:"/llms.txt",cta:"AI 검색 자료 보기",chips:[{label:"llms.txt",href:"/llms.txt"},{label:"llms-full.txt",href:"/llms-full.txt"},{label:"구조화 정보"}]},
   {tag:"SIAI",title:"글로벌 SIAI 배포",description:"순위, 모델 정보, 실제 가격, 무료 한도, 지역 지원과 상업적 권리.",href:"/siai",cta:"SIAI 순위 보기",chips:[{label:"순위"},{label:"가격과 무료 한도"},{label:"지역과 권리"}]},
   {tag:"SASI",title:"SASI 비즈니스 입구",description:"MT5 EA, 트레이딩 소스 코드, 완성 소프트웨어, 설치 안내, 라이선스와 안전한 자동 전달.",href:"/sasi",cta:"SASI 마켓 보기",chips:[{label:"MT5 EA"},{label:"트레이딩 소스"},{label:"라이선스와 전달"}]},
   {tag:"NETWORK",title:"외부 성장 네트워크",description:"WordPress, JS Widget, 파트너, API, RSS, QR 코드와 공유 유입 분석.",href:"/partners",cta:"파트너 센터 열기",chips:[{label:"WordPress",href:"/partners"},{label:"JS Widget",href:"/widgets/lingxifield-v1.js"},{label:"API",href:"/siai-openapi.json"},{label:"RSS",href:"/siai/updates.xml"},{label:"QR"},{label:"공유 분석"}]},
   {tag:"STORIES",title:"콘텐츠 확산",description:"흥미로운 발견, 실제 도구 문제, Before / After와 실사용 사례.",href:"/tools",cta:"실제 문제부터 시작",chips:[{label:"발견"},{label:"실제 문제"},{label:"Before / After"},{label:"활용 사례"}]}
  ],
  flywheelTitle:"발견에서 공유까지, 유용한 경험을 다음 단계로 연결",
  flywheel:["발견","검색","체험","결과","공유","재방문"],
  passTitle:"ToolPass 도구 멤버십",passLead:"100개 이상의 실용 도구를 한곳에서 사용하고 파일 작업을 효율적으로 처리하세요.",
  passBenefits:["실용 도구 100+ · 무제한 사용","여러 파일 일괄 처리 · 효율 향상","새 도구 지속 추가","하나의 계정 · .com / .cn"],
  planDays:["7일 체험","30일","90일","365일"],
  planDescriptions:["가볍게 시작","전체 도구 이용","더 경제적인 선택","장기 이용에 적합"],
  planCta:"요금제 보기",popular:"인기",
  marketSiaiTitle:"글로벌 SIAI 순위",marketSiaiDesc:"AI / SI 모델과 도구의 성능, 가격, 무료 한도 및 지역 지원을 비교하세요.",
  marketSasiTitle:"SASI 소프트웨어 마켓",marketSasiDesc:"MT5 EA, 트레이딩 소스 코드, 완성 소프트웨어, 라이선스와 자동 전달.",
  stats:[{value:"100+",label:"온라인 실용 도구"},{value:"∞",label:"ToolPass 무제한"},{value:"9",label:"다국어 지원"}],
  toolsTitle:"인기 도구와 실제 활용 사례",
  toolCategories:[{title:"PDF 처리",href:"/tools?q=PDF"},{title:"이미지",href:"/tools?q=이미지"},{title:"영상·오디오",href:"/tools?q=영상"},{title:"파일 변환",href:"/tools?q=변환"},{title:"개인정보 보호",href:"/tools?q=개인정보"},{title:"일상 도구",href:"/tools"}]
 },
 fr:{
  features:[
   {icon:"◉",title:"Classement SIAI mondial",description:"Modèles · prix · quotas gratuits",href:"/siai"},
   {icon:"▦",title:"100+ outils pratiques",description:"PDF · images · vidéo · audio",href:"/tools"},
   {icon:"◈",title:"Marché logiciel SASI",description:"EA MT5 · code source · logiciels",href:"/sasi"},
   {icon:"∞",title:"Abonnement ToolPass",description:"Tous les outils · sans limite",href:"/tools/pass"},
   {icon:"✧",title:"Croissance et partenaires",description:"SEO · GEO · API · intégration",href:"/partners"}
  ],
  growthTitle:"Une porte mondiale entre découverte, produits et usages réels",
  growthLead:"Reliez recherche, recherche IA, diffusion SIAI, commerce logiciel, partenaires et contenus utiles dans un parcours cohérent.",
  growthCards:[
   {tag:"SEO",title:"Entrée par la recherche",description:"SEO en 9 langues, 124 outils répertoriés et pages dédiées aux problèmes réels.",href:"/tools",cta:"Voir les outils",chips:[{label:"9 langues"},{label:"124 outils"},{label:"Pages-problèmes"}]},
   {tag:"GEO",title:"Entrée par la recherche IA",description:"llms.txt, llms-full.txt et données produit structurées pour aider les systèmes IA à comprendre le service.",href:"/llms.txt",cta:"Voir les ressources IA",chips:[{label:"llms.txt",href:"/llms.txt"},{label:"llms-full.txt",href:"/llms-full.txt"},{label:"Données structurées"}]},
   {tag:"SIAI",title:"Diffusion mondiale SIAI",description:"Classements, fiches modèles, prix réels, quotas gratuits, régions et droits commerciaux.",href:"/siai",cta:"Explorer SIAI",chips:[{label:"Classements"},{label:"Prix et quotas"},{label:"Régions et droits"}]},
   {tag:"SASI",title:"Entrée commerciale SASI",description:"EA MT5, code source de trading, logiciels finis, guides, licences et livraison automatique sécurisée.",href:"/sasi",cta:"Voir le marché SASI",chips:[{label:"EA MT5"},{label:"Code de trading"},{label:"Licences et livraison"}]},
   {tag:"NETWORK",title:"Réseau de croissance externe",description:"WordPress, JS Widget, partenaires, API, RSS, QR codes et attribution des partages.",href:"/partners",cta:"Centre partenaires",chips:[{label:"WordPress",href:"/partners"},{label:"JS Widget",href:"/widgets/lingxifield-v1.js"},{label:"API",href:"/siai-openapi.json"},{label:"RSS",href:"/siai/updates.xml"},{label:"QR"},{label:"Attribution"}]},
   {tag:"STORIES",title:"Découverte et diffusion",description:"Découvertes étonnantes, problèmes concrets, Before / After et cas d'usage réels.",href:"/tools",cta:"Partir d'un besoin réel",chips:[{label:"Découvertes"},{label:"Problèmes réels"},{label:"Before / After"},{label:"Cas d'usage"}]}
  ],
  flywheelTitle:"De la découverte au partage, chaque résultat ouvre une suite",
  flywheel:["Découvrir","Rechercher","Essayer","Résultat","Partager","Revenir"],
  passTitle:"Abonnement ToolPass",passLead:"Plus de 100 outils pratiques au même endroit pour traiter les fichiers plus efficacement.",
  passBenefits:["100+ outils · utilisation illimitée","Traitement par lots · gain de temps","Nouveaux outils ajoutés en continu","Un compte · .com et .cn"],
  planDays:["Essai 7 jours","30 jours","90 jours","365 jours"],
  planDescriptions:["Pour commencer","Tous les outils","Plus avantageux","Idéal à long terme"],
  planCta:"Voir les offres",popular:"Populaire",
  marketSiaiTitle:"Classement mondial SIAI",marketSiaiDesc:"Comparez modèles et outils IA / SI par capacités, prix, quotas gratuits et disponibilité régionale.",
  marketSasiTitle:"Marché logiciel SASI",marketSasiDesc:"EA MT5, code source de trading, logiciels finis, licences et livraison automatique.",
  stats:[{value:"100+",label:"Outils en ligne"},{value:"∞",label:"ToolPass illimité"},{value:"9",label:"Langues prises en charge"}],
  toolsTitle:"Outils populaires et cas d'usage réels",
  toolCategories:[{title:"PDF",href:"/tools?q=PDF"},{title:"Images",href:"/tools?q=images"},{title:"Vidéo et audio",href:"/tools?q=video"},{title:"Conversion",href:"/tools?q=convert"},{title:"Confidentialité",href:"/tools?q=privacy"},{title:"Outils quotidiens",href:"/tools"}]
 },
 de:{
  features:[
   {icon:"◉",title:"Globales SIAI-Ranking",description:"Modelle · Preise · Gratis-Kontingente",href:"/siai"},
   {icon:"▦",title:"100+ praktische Tools",description:"PDF · Bilder · Video · Audio",href:"/tools"},
   {icon:"◈",title:"SASI-Softwaremarkt",description:"MT5-EAs · Quellcode · Software",href:"/sasi"},
   {icon:"∞",title:"ToolPass-Mitgliedschaft",description:"Alle Tools · unbegrenzt nutzen",href:"/tools/pass"},
   {icon:"✧",title:"Wachstum und Partner",description:"SEO · GEO · API · Einbindung",href:"/partners"}
  ],
  growthTitle:"Ein globaler Zugang für Entdeckung, Produkte und echte Anwendungen",
  growthLead:"Suchzugang, KI-Suche, SIAI-Verteilung, Softwarehandel, Partnernetzwerk und hilfreiche Inhalte werden zu einem Weg verbunden.",
  growthCards:[
   {tag:"SEO",title:"Sucheinstieg",description:"SEO in neun Sprachen, 124 Tool-Einträge und problemorientierte Landingpages.",href:"/tools",cta:"Tool-Verzeichnis öffnen",chips:[{label:"9 Sprachen"},{label:"124 Tools"},{label:"Problemseiten"}]},
   {tag:"GEO",title:"KI-Sucheinstieg",description:"llms.txt, llms-full.txt und strukturierte Produktdaten helfen KI-Systemen, das Angebot zu verstehen.",href:"/llms.txt",cta:"KI-Suchdaten ansehen",chips:[{label:"llms.txt",href:"/llms.txt"},{label:"llms-full.txt",href:"/llms-full.txt"},{label:"Strukturierte Daten"}]},
   {tag:"SIAI",title:"Globale SIAI-Verteilung",description:"Rankings, Modellprofile, echte Preise, Gratis-Kontingente, Regionen und kommerzielle Rechte.",href:"/siai",cta:"SIAI-Ranking öffnen",chips:[{label:"Rankings"},{label:"Preise und Gratislimits"},{label:"Regionen und Rechte"}]},
   {tag:"SASI",title:"SASI-Geschäftseinstieg",description:"MT5-EAs, Trading-Quellcode, fertige Software, Anleitungen, Lizenzen und sichere automatische Lieferung.",href:"/sasi",cta:"SASI-Markt öffnen",chips:[{label:"MT5-EAs"},{label:"Trading-Quellcode"},{label:"Lizenz und Lieferung"}]},
   {tag:"NETWORK",title:"Externes Wachstumsnetzwerk",description:"WordPress, JS Widget, Partner, API, RSS, QR-Codes und Share-Attribution.",href:"/partners",cta:"Partnerbereich öffnen",chips:[{label:"WordPress",href:"/partners"},{label:"JS Widget",href:"/widgets/lingxifield-v1.js"},{label:"API",href:"/siai-openapi.json"},{label:"RSS",href:"/siai/updates.xml"},{label:"QR"},{label:"Attribution"}]},
   {tag:"STORIES",title:"Inhalte und Entdeckungen",description:"Spannende Entdeckungen, echte Tool-Probleme, Before / After und konkrete Anwendungsfälle.",href:"/tools",cta:"Mit einer Aufgabe beginnen",chips:[{label:"Entdeckungen"},{label:"Echte Probleme"},{label:"Before / After"},{label:"Anwendungsfälle"}]}
  ],
  flywheelTitle:"Von der Entdeckung zum Teilen: jedes Ergebnis führt weiter",
  flywheel:["Entdecken","Suchen","Testen","Ergebnis","Teilen","Zurückkehren"],
  passTitle:"ToolPass-Mitgliedschaft",passLead:"Mehr als 100 praktische Tools an einem Ort für effiziente Datei- und Alltagsarbeit.",
  passBenefits:["100+ Tools · unbegrenzte Nutzung","Stapelverarbeitung · Zeit sparen","Neue Tools kommen laufend hinzu","Ein Konto · .com und .cn"],
  planDays:["7-Tage-Test","30 Tage","90 Tage","365 Tage"],
  planDescriptions:["Einfach starten","Alle Tools nutzen","Mehr Preisvorteil","Für langfristige Nutzung"],
  planCta:"Tarife ansehen",popular:"Beliebt",
  marketSiaiTitle:"Globales SIAI-Ranking",marketSiaiDesc:"Vergleiche KI-/SI-Modelle und Tools nach Fähigkeiten, Preisen, Gratislimits und regionaler Verfügbarkeit.",
  marketSasiTitle:"SASI-Softwaremarkt",marketSasiDesc:"MT5-EAs, Trading-Quellcode, fertige Software, Lizenzen und automatische Lieferung.",
  stats:[{value:"100+",label:"Online-Tools"},{value:"∞",label:"Unbegrenzt mit ToolPass"},{value:"9",label:"Sprachen weltweit"}],
  toolsTitle:"Beliebte Tools und echte Anwendungsfälle",
  toolCategories:[{title:"PDF",href:"/tools?q=PDF"},{title:"Bilder",href:"/tools?q=images"},{title:"Video & Audio",href:"/tools?q=video"},{title:"Dateikonvertierung",href:"/tools?q=convert"},{title:"Datenschutz",href:"/tools?q=privacy"},{title:"Alltagstools",href:"/tools"}]
 },
 es:{
  features:[
   {icon:"◉",title:"Ranking SIAI global",description:"Modelos · precios · límites gratis",href:"/siai"},
   {icon:"▦",title:"Más de 100 herramientas",description:"PDF · imágenes · vídeo · audio",href:"/tools"},
   {icon:"◈",title:"Mercado de software SASI",description:"EA MT5 · código fuente · software",href:"/sasi"},
   {icon:"∞",title:"Membresía ToolPass",description:"Todas las herramientas · uso ilimitado",href:"/tools/pass"},
   {icon:"✧",title:"Crecimiento y socios",description:"SEO · GEO · API · integración",href:"/partners"}
  ],
  growthTitle:"Una entrada global para descubrir, conectar productos y mostrar usos reales",
  growthLead:"Conecta búsqueda, búsqueda con IA, distribución SIAI, comercio de software, socios y contenidos útiles.",
  growthCards:[
   {tag:"SEO",title:"Entrada de búsqueda",description:"SEO en nueve idiomas, 124 herramientas y páginas de destino basadas en problemas reales.",href:"/tools",cta:"Ver directorio de herramientas",chips:[{label:"9 idiomas"},{label:"124 herramientas"},{label:"Páginas de problemas"}]},
   {tag:"GEO",title:"Entrada de búsqueda IA",description:"llms.txt, llms-full.txt y datos estructurados ayudan a los sistemas de IA a comprender el servicio.",href:"/llms.txt",cta:"Ver recursos de IA",chips:[{label:"llms.txt",href:"/llms.txt"},{label:"llms-full.txt",href:"/llms-full.txt"},{label:"Datos estructurados"}]},
   {tag:"SIAI",title:"Distribución global SIAI",description:"Rankings, fichas de modelos, precios reales, límites gratuitos, regiones y derechos comerciales.",href:"/siai",cta:"Explorar SIAI",chips:[{label:"Rankings"},{label:"Precios y límites"},{label:"Regiones y derechos"}]},
   {tag:"SASI",title:"Entrada comercial SASI",description:"EA MT5, código fuente de trading, software terminado, tutoriales, licencias y entrega automática segura.",href:"/sasi",cta:"Ver mercado SASI",chips:[{label:"EA MT5"},{label:"Código de trading"},{label:"Licencias y entrega"}]},
   {tag:"NETWORK",title:"Red externa de crecimiento",description:"WordPress, JS Widget, socios, API, RSS, códigos QR y atribución de compartidos.",href:"/partners",cta:"Abrir centro de socios",chips:[{label:"WordPress",href:"/partners"},{label:"JS Widget",href:"/widgets/lingxifield-v1.js"},{label:"API",href:"/siai-openapi.json"},{label:"RSS",href:"/siai/updates.xml"},{label:"QR"},{label:"Atribución"}]},
   {tag:"STORIES",title:"Contenido y descubrimiento",description:"Descubrimientos curiosos, problemas reales, Before / After y casos prácticos.",href:"/tools",cta:"Empezar por un problema real",chips:[{label:"Descubrimientos"},{label:"Problemas reales"},{label:"Before / After"},{label:"Casos de uso"}]}
  ],
  flywheelTitle:"De descubrir a compartir: cada resultado abre el siguiente paso",
  flywheel:["Descubrir","Buscar","Probar","Resultado","Compartir","Volver"],
  passTitle:"Membresía ToolPass",passLead:"Más de 100 herramientas prácticas en un solo lugar para procesar archivos con mayor eficiencia.",
  passBenefits:["100+ herramientas · uso ilimitado","Procesamiento por lotes · más eficiencia","Nuevas herramientas continuamente","Una cuenta · .com y .cn"],
  planDays:["Prueba 7 días","30 días","90 días","365 días"],
  planDescriptions:["Para empezar","Todas las herramientas","Más ahorro","Ideal a largo plazo"],
  planCta:"Ver planes",popular:"Popular",
  marketSiaiTitle:"Ranking SIAI global",marketSiaiDesc:"Compara modelos y herramientas IA / SI por capacidad, precio, límites gratuitos y disponibilidad regional.",
  marketSasiTitle:"Mercado de software SASI",marketSasiDesc:"EA MT5, código fuente de trading, software terminado, licencias y entrega automática.",
  stats:[{value:"100+",label:"Herramientas online"},{value:"∞",label:"Uso ilimitado ToolPass"},{value:"9",label:"Idiomas disponibles"}],
  toolsTitle:"Herramientas populares y usos reales",
  toolCategories:[{title:"PDF",href:"/tools?q=PDF"},{title:"Imágenes",href:"/tools?q=images"},{title:"Vídeo y audio",href:"/tools?q=video"},{title:"Conversión",href:"/tools?q=convert"},{title:"Privacidad",href:"/tools?q=privacy"},{title:"Uso diario",href:"/tools"}]
 },
 pt:{
  features:[
   {icon:"◉",title:"Ranking SIAI global",description:"Modelos · preços · limites grátis",href:"/siai"},
   {icon:"▦",title:"Mais de 100 ferramentas",description:"PDF · imagens · vídeo · áudio",href:"/tools"},
   {icon:"◈",title:"Mercado de software SASI",description:"EA MT5 · código-fonte · software",href:"/sasi"},
   {icon:"∞",title:"Assinatura ToolPass",description:"Todas as ferramentas · uso ilimitado",href:"/tools/pass"},
   {icon:"✧",title:"Crescimento e parceiros",description:"SEO · GEO · API · integração",href:"/partners"}
  ],
  growthTitle:"Uma entrada global para descoberta, produtos e aplicações reais",
  growthLead:"Conecte busca, busca por IA, distribuição SIAI, comércio de software, parceiros e conteúdos úteis.",
  growthCards:[
   {tag:"SEO",title:"Entrada de busca",description:"SEO em nove idiomas, 124 ferramentas e páginas de destino orientadas por problemas reais.",href:"/tools",cta:"Ver diretório de ferramentas",chips:[{label:"9 idiomas"},{label:"124 ferramentas"},{label:"Páginas de problemas"}]},
   {tag:"GEO",title:"Entrada de busca por IA",description:"llms.txt, llms-full.txt e dados estruturados ajudam sistemas de IA a entender o serviço.",href:"/llms.txt",cta:"Ver recursos de IA",chips:[{label:"llms.txt",href:"/llms.txt"},{label:"llms-full.txt",href:"/llms-full.txt"},{label:"Dados estruturados"}]},
   {tag:"SIAI",title:"Distribuição global SIAI",description:"Rankings, perfis de modelos, preços reais, limites gratuitos, regiões e direitos comerciais.",href:"/siai",cta:"Explorar SIAI",chips:[{label:"Rankings"},{label:"Preços e limites"},{label:"Regiões e direitos"}]},
   {tag:"SASI",title:"Entrada comercial SASI",description:"EA MT5, código-fonte de trading, software pronto, tutoriais, licenças e entrega automática segura.",href:"/sasi",cta:"Ver mercado SASI",chips:[{label:"EA MT5"},{label:"Código de trading"},{label:"Licenças e entrega"}]},
   {tag:"NETWORK",title:"Rede externa de crescimento",description:"WordPress, JS Widget, parceiros, API, RSS, QR e atribuição de compartilhamentos.",href:"/partners",cta:"Abrir centro de parceiros",chips:[{label:"WordPress",href:"/partners"},{label:"JS Widget",href:"/widgets/lingxifield-v1.js"},{label:"API",href:"/siai-openapi.json"},{label:"RSS",href:"/siai/updates.xml"},{label:"QR"},{label:"Atribuição"}]},
   {tag:"STORIES",title:"Conteúdo e descoberta",description:"Descobertas curiosas, problemas reais, Before / After e cenários de aplicação.",href:"/tools",cta:"Começar por um problema real",chips:[{label:"Descobertas"},{label:"Problemas reais"},{label:"Before / After"},{label:"Casos de uso"}]}
  ],
  flywheelTitle:"Da descoberta ao compartilhamento, cada resultado abre o próximo passo",
  flywheel:["Descobrir","Buscar","Testar","Resultado","Compartilhar","Voltar"],
  passTitle:"Assinatura ToolPass",passLead:"Mais de 100 ferramentas práticas em um só lugar para lidar com arquivos com eficiência.",
  passBenefits:["100+ ferramentas · uso ilimitado","Processamento em lote · mais eficiência","Novas ferramentas adicionadas sempre","Uma conta · .com e .cn"],
  planDays:["Teste de 7 dias","30 dias","90 dias","365 dias"],
  planDescriptions:["Para começar","Todas as ferramentas","Mais economia","Ideal para longo prazo"],
  planCta:"Ver planos",popular:"Popular",
  marketSiaiTitle:"Ranking SIAI global",marketSiaiDesc:"Compare modelos e ferramentas IA / SI por capacidade, preço, limites gratuitos e disponibilidade regional.",
  marketSasiTitle:"Mercado de software SASI",marketSasiDesc:"EA MT5, código-fonte de trading, software pronto, licenças e entrega automática.",
  stats:[{value:"100+",label:"Ferramentas online"},{value:"∞",label:"Uso ilimitado ToolPass"},{value:"9",label:"Idiomas disponíveis"}],
  toolsTitle:"Ferramentas populares e aplicações reais",
  toolCategories:[{title:"PDF",href:"/tools?q=PDF"},{title:"Imagens",href:"/tools?q=images"},{title:"Vídeo e áudio",href:"/tools?q=video"},{title:"Conversão",href:"/tools?q=convert"},{title:"Privacidade",href:"/tools?q=privacy"},{title:"Uso diário",href:"/tools"}]
 },
 ar:{
  features:[
   {icon:"◉",title:"تصنيف SIAI العالمي",description:"النماذج · الأسعار · الحصص المجانية",href:"/siai"},
   {icon:"▦",title:"أكثر من 100 أداة عملية",description:"PDF · الصور · الفيديو · الصوت",href:"/tools"},
   {icon:"◈",title:"سوق برامج SASI",description:"MT5 EA · الشيفرة المصدرية · البرامج",href:"/sasi"},
   {icon:"∞",title:"عضوية ToolPass",description:"كل الأدوات · استخدام غير محدود",href:"/tools/pass"},
   {icon:"✧",title:"النمو والشراكات العالمية",description:"SEO · GEO · API · التضمين",href:"/partners"}
  ],
  growthTitle:"مدخل عالمي للاكتشاف والمنتجات والتطبيقات الحقيقية",
  growthLead:"اربط البحث والبحث بالذكاء الاصطناعي وتوزيع SIAI وتجارة البرامج والشراكات والمحتوى العملي في مسار واحد.",
  growthCards:[
   {tag:"SEO",title:"مدخل البحث",description:"تحسين البحث بتسع لغات، و124 مدخلاً للأدوات وصفحات مخصصة للمشكلات الحقيقية.",href:"/tools",cta:"استعرض دليل الأدوات",chips:[{label:"9 لغات"},{label:"124 أداة"},{label:"صفحات المشكلات"}]},
   {tag:"GEO",title:"مدخل بحث الذكاء الاصطناعي",description:"ملفات llms.txt وllms-full.txt وبيانات المنتجات المنظمة لتسهيل فهم الخدمات.",href:"/llms.txt",cta:"عرض موارد البحث",chips:[{label:"llms.txt",href:"/llms.txt"},{label:"llms-full.txt",href:"/llms-full.txt"},{label:"بيانات منظمة"}]},
   {tag:"SIAI",title:"توزيع SIAI العالمي",description:"التصنيفات وملفات النماذج والأسعار الحقيقية والحصص المجانية والمناطق والحقوق التجارية.",href:"/siai",cta:"استكشف تصنيف SIAI",chips:[{label:"التصنيفات"},{label:"الأسعار والحصص"},{label:"المناطق والحقوق"}]},
   {tag:"SASI",title:"مدخل SASI التجاري",description:"MT5 EA وشيفرات التداول والبرامج الجاهزة والدروس والتراخيص والتسليم الآمن التلقائي.",href:"/sasi",cta:"استعرض سوق SASI",chips:[{label:"MT5 EA"},{label:"شيفرات التداول"},{label:"التراخيص والتسليم"}]},
   {tag:"NETWORK",title:"شبكة النمو الخارجية",description:"WordPress وJS Widget والشركاء وAPI وRSS ورموز QR وإسناد المشاركات.",href:"/partners",cta:"مركز الشركاء",chips:[{label:"WordPress",href:"/partners"},{label:"JS Widget",href:"/widgets/lingxifield-v1.js"},{label:"API",href:"/siai-openapi.json"},{label:"RSS",href:"/siai/updates.xml"},{label:"QR"},{label:"إسناد المشاركة"}]},
   {tag:"STORIES",title:"المحتوى والاكتشاف",description:"اكتشافات مميزة ومشكلات أدوات حقيقية وBefore / After وسيناريوهات تطبيقية.",href:"/tools",cta:"ابدأ بمشكلة حقيقية",chips:[{label:"اكتشافات"},{label:"مشكلات حقيقية"},{label:"Before / After"},{label:"حالات استخدام"}]}
  ],
  flywheelTitle:"من الاكتشاف إلى المشاركة، كل نتيجة تفتح خطوة جديدة",
  flywheel:["اكتشاف","بحث","تجربة","نتيجة","مشاركة","عودة"],
  passTitle:"عضوية ToolPass",passLead:"أكثر من 100 أداة عملية في مكان واحد لإنجاز الملفات والمهام اليومية بكفاءة.",
  passBenefits:["أكثر من 100 أداة · استخدام غير محدود","معالجة ملفات متعددة · كفاءة أعلى","إضافة أدوات جديدة باستمرار","حساب واحد · .com و.cn"],
  planDays:["تجربة 7 أيام","30 يوماً","90 يوماً","365 يوماً"],
  planDescriptions:["للبداية","جميع الأدوات","قيمة أفضل","للاستخدام الطويل"],
  planCta:"عرض الباقات",popular:"الأكثر شعبية",
  marketSiaiTitle:"تصنيف SIAI العالمي",marketSiaiDesc:"قارن نماذج وأدوات الذكاء الاصطناعي حسب القدرات والأسعار والحصص المجانية والمناطق.",
  marketSasiTitle:"سوق برامج SASI",marketSasiDesc:"MT5 EA وشيفرات التداول والبرامج الجاهزة والتراخيص والتسليم التلقائي.",
  stats:[{value:"100+",label:"أدوات عملية عبر الإنترنت"},{value:"∞",label:"استخدام غير محدود مع ToolPass"},{value:"9",label:"لغات عالمية"}],
  toolsTitle:"أدوات شائعة وسيناريوهات استخدام حقيقية",
  toolCategories:[{title:"PDF",href:"/tools?q=PDF"},{title:"الصور",href:"/tools?q=images"},{title:"الفيديو والصوت",href:"/tools?q=video"},{title:"تحويل الملفات",href:"/tools?q=convert"},{title:"الخصوصية",href:"/tools?q=privacy"},{title:"أدوات يومية",href:"/tools"}]
 }
};

export function HomeHeroVisual(){
 return (
  <div className="lx-home-hero-art" role="img" aria-label="灵犀场全球智能服务、SIAI 排行榜与 SASI 智能软件市场">
   <svg viewBox="0 0 760 440" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
    <defs>
     <radialGradient id="lx-world-fill" cx="38%" cy="28%" r="78%">
      <stop offset="0%" stopColor="#c9f1ff" stopOpacity=".96"/>
      <stop offset="46%" stopColor="#7f9fff" stopOpacity=".66"/>
      <stop offset="100%" stopColor="#7a55d8" stopOpacity=".12"/>
     </radialGradient>
     <linearGradient id="lx-gold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stopColor="#fff7c8"/><stop offset="45%" stopColor="#eab75b"/><stop offset="100%" stopColor="#a66b22"/>
     </linearGradient>
     <linearGradient id="lx-lotus" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stopColor="#fff0ff"/><stop offset="48%" stopColor="#b58cff"/><stop offset="100%" stopColor="#6d62e9"/>
     </linearGradient>
     <linearGradient id="lx-glass" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stopColor="#ffffff" stopOpacity=".92"/><stop offset="100%" stopColor="#c6d4ff" stopOpacity=".24"/>
     </linearGradient>
     <filter id="lx-soft-glow" x="-80%" y="-80%" width="260%" height="260%">
      <feGaussianBlur stdDeviation="9" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
     </filter>
    </defs>
    <g className="lx-home-art-orbits" fill="none" strokeLinecap="round">
     <ellipse cx="382" cy="310" rx="345" ry="74" stroke="#a89aff" strokeOpacity=".34" strokeWidth="2"/>
     <ellipse cx="382" cy="310" rx="296" ry="54" stroke="#f1d58f" strokeOpacity=".55" strokeWidth="1.5" transform="rotate(-8 382 310)"/>
     <ellipse cx="470" cy="188" rx="258" ry="178" stroke="#b6b8ff" strokeOpacity=".23" strokeWidth="1.4" transform="rotate(-22 470 188)"/>
     <path d="M42 290 C190 70 550 20 716 176" stroke="#ffffff" strokeOpacity=".62" strokeWidth="2"/>
     <path d="M22 338 C220 166 524 112 740 246" stroke="#e6c98c" strokeOpacity=".46" strokeWidth="1.5"/>
    </g>
    <g className="lx-home-art-globe">
     <circle cx="520" cy="157" r="120" fill="url(#lx-world-fill)" stroke="#ffffff" strokeOpacity=".82" strokeWidth="2"/>
     <circle cx="520" cy="157" r="127" fill="none" stroke="#9a9bff" strokeOpacity=".55" strokeWidth="2"/>
     <ellipse cx="520" cy="157" rx="53" ry="120" fill="none" stroke="#ffffff" strokeOpacity=".58" strokeWidth="1.5"/>
     <ellipse cx="520" cy="157" rx="91" ry="120" fill="none" stroke="#ffffff" strokeOpacity=".36" strokeWidth="1.2"/>
     <ellipse cx="520" cy="157" rx="120" ry="38" fill="none" stroke="#ffffff" strokeOpacity=".56" strokeWidth="1.4"/>
     <ellipse cx="520" cy="157" rx="120" ry="77" fill="none" stroke="#ffffff" strokeOpacity=".35" strokeWidth="1.2"/>
     <path d="M451 104l19-19 24 5 13 20-9 14 13 13-8 19-20 6-6 23-21-10-6-23-22-15 7-18-9-15z M539 91l21-12 28 9 9 17-15 14 4 17-17 9-12-12-20 4-8-17 11-13z M558 173l18-10 18 12-2 20-20 10-19-12z" fill="#c9f4f2" fillOpacity=".52" stroke="#ffffff" strokeOpacity=".35" strokeWidth="1"/>
     <g fill="#ffffff" filter="url(#lx-soft-glow)">
      <circle cx="469" cy="102" r="3"/><circle cx="566" cy="118" r="3"/><circle cx="542" cy="194" r="2.8"/><circle cx="490" cy="178" r="2.5"/><circle cx="587" cy="165" r="2.4"/>
     </g>
    </g>
    <g className="lx-home-art-lotus" transform="translate(162 230)">
     <ellipse cx="0" cy="52" rx="98" ry="20" fill="#a88aff" fillOpacity=".18" filter="url(#lx-soft-glow)"/>
     <path d="M0 42 C-65 6-72-42-32-56 C-8-30-2 2 0 42z" fill="url(#lx-lotus)" stroke="#ffffff" strokeOpacity=".85" strokeWidth="2"/>
     <path d="M0 42 C-40-35-15-90 12-92 C31-48 18-1 0 42z" fill="url(#lx-lotus)" stroke="#ffffff" strokeOpacity=".9" strokeWidth="2"/>
     <path d="M0 42 C28-34 65-56 82-29 C70 13 34 35 0 42z" fill="url(#lx-lotus)" stroke="#ffffff" strokeOpacity=".86" strokeWidth="2"/>
     <path d="M0 42 C-88 32-112-4-91-25 C-49-22-18 6 0 42z" fill="#c9b5ff" fillOpacity=".85" stroke="#ffffff" strokeOpacity=".75" strokeWidth="1.5"/>
     <path d="M0 42 C78 30 112-3 94-26 C52-20 19 8 0 42z" fill="#b3a4ff" fillOpacity=".84" stroke="#ffffff" strokeOpacity=".75" strokeWidth="1.5"/>
     <circle cx="0" cy="38" r="10" fill="#ffe6a3" filter="url(#lx-soft-glow)"/>
     <path d="M-72 54 Q0 76 76 53" fill="none" stroke="#f1d58f" strokeWidth="2" strokeOpacity=".8"/>
    </g>
    <g className="lx-home-art-trophy" transform="translate(328 100)">
     <path d="M-31-30h62v36c0 24-13 41-31 41S-31 30-31 6z" fill="url(#lx-gold)" stroke="#fff3c4" strokeWidth="2"/>
     <path d="M-31-17c-29-8-37 8-26 28 5 9 15 13 27 13 M31-17c29-8 37 8 26 28-5 9-15 13-27 13" fill="none" stroke="#dcae5a" strokeWidth="7" strokeLinecap="round"/>
     <path d="M-13 48h26v16h-26z" fill="#c38a3c"/><path d="M-42 64h84v13h-84z" fill="url(#lx-gold)" stroke="#fff0b9" strokeWidth="1.5"/>
     <text x="0" y="4" textAnchor="middle" fill="#fff8dd" fontSize="19" fontWeight="800">SIAI</text>
     <text x="0" y="74" textAnchor="middle" fill="#fff9d8" fontSize="10" fontWeight="800">GLOBAL</text>
     <path d="M-42-42l-7-12 M42-42l7-12 M0-52v-12" stroke="#ffe4a5" strokeWidth="2" strokeLinecap="round"/>
    </g>
    <g className="lx-home-art-sasi-panel">
     <rect x="420" y="15" width="155" height="73" rx="17" fill="url(#lx-glass)" fillOpacity=".78" stroke="#ffffff" strokeOpacity=".9" strokeWidth="2"/>
     <rect x="429" y="24" width="137" height="55" rx="12" fill="#7967e8" fillOpacity=".13" stroke="#9b8cff" strokeOpacity=".42"/>
     <path d="M445 47l15-10 15 10-15 10z M445 57l15 10 15-10" fill="none" stroke="#7160d8" strokeWidth="3" strokeLinejoin="round"/>
     <text x="510" y="50" textAnchor="middle" fill="#5542bc" fontSize="22" fontWeight="900" letterSpacing="2">SASI</text>
     <text x="510" y="67" textAnchor="middle" fill="#4d4d96" fontSize="10" fontWeight="700">智能软件市场</text>
    </g>
    <g className="lx-home-art-laptop">
     <path d="M414 244l37-132q4-13 17-13h180q13 0 10 14l-34 131z" fill="#253a73" fillOpacity=".9" stroke="#ffffff" strokeWidth="3"/>
     <path d="M430 236l33-119q2-7 10-7h154q8 0 6 8l-31 118z" fill="#102a5e"/>
     <circle cx="548" cy="174" r="52" fill="url(#lx-world-fill)" stroke="#8edcff" strokeWidth="2"/>
     <ellipse cx="548" cy="174" rx="22" ry="52" fill="none" stroke="#e5f8ff" strokeOpacity=".8"/>
     <ellipse cx="548" cy="174" rx="52" ry="18" fill="none" stroke="#e5f8ff" strokeOpacity=".75"/>
     <path d="M487 253h190l25 15q7 5-4 9H421q-10-4-3-10z" fill="url(#lx-glass)" stroke="#ffffff" strokeWidth="2"/>
     <path d="M512 262h114" stroke="#7b79dc" strokeWidth="2" strokeLinecap="round"/>
     <circle cx="548" cy="174" r="5" fill="#ffffff" filter="url(#lx-soft-glow)"/>
    </g>
    <g className="lx-home-art-data">
     <rect x="606" y="104" width="106" height="54" rx="12" fill="url(#lx-glass)" stroke="#ffffff" strokeOpacity=".9"/>
     <path d="M620 143l16-14 13 6 17-19 15 9" fill="none" stroke="#6d66df" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
     <circle cx="620" cy="143" r="3" fill="#f1c96f"/><circle cx="681" cy="125" r="3" fill="#f1c96f"/>
     <rect x="37" y="95" width="102" height="50" rx="12" fill="url(#lx-glass)" stroke="#ffffff" strokeOpacity=".8"/>
     <path d="M55 130v-12h11v12 M74 130v-22h11v22 M93 130v-31h11v31" fill="none" stroke="#6c66dd" strokeWidth="4" strokeLinecap="round"/>
    </g>
    <g className="lx-home-art-stars" fill="#fff">
     <circle cx="94" cy="64" r="3"/><circle cx="226" cy="72" r="2.5"/><circle cx="382" cy="25" r="2.5"/><circle cx="658" cy="64" r="2.7"/><circle cx="704" cy="206" r="2.2"/><circle cx="265" cy="304" r="2.4"/><circle cx="380" cy="355" r="2.2"/>
    </g>
    <g className="lx-home-art-signature">
     <text x="574" y="355" fill="#6542b9" fontSize="23" fontFamily="cursive" fontStyle="italic">Celestial 小仙女</text>
     <path d="M566 365 Q635 378 722 349 M690 371l8-8 6 7" fill="none" stroke="#8063d5" strokeWidth="1.7" strokeLinecap="round"/>
    </g>
   </svg>
  </div>
 );
}

export function HomeGlobalGrowth({lang}:{lang:LingxiLang}){
 const copy=COPY[lang]||COPY.en;
 const {currency}=usePreferredCurrency();
 const symbol=currency==="CNY"?"¥":"$";
 return (
  <section className="lx-home-growth-stack" aria-label={copy.growthTitle}>
   <div className="lx-home-feature-strip">
    {copy.features.map(item=>(
     <Link className="lx-home-feature-card" href={item.href} key={item.href}>
      <span className="lx-home-feature-icon" aria-hidden="true">{item.icon}</span>
      <span className="lx-home-feature-copy"><strong>{item.title}</strong><small>{item.description}</small></span>
     </Link>
    ))}
   </div>
   <section className="lx-home-growth-network" aria-labelledby="lx-home-growth-title">
    <div className="lx-home-growth-heading">
     <p className="lx-home-section-eyebrow">LINGXIFIELD · GLOBAL DISCOVERY</p>
     <h2 id="lx-home-growth-title">{copy.growthTitle}</h2>
     <p>{copy.growthLead}</p>
    </div>
    <div className="lx-home-growth-grid">
     {copy.growthCards.map((item,index)=>(
      <article className="lx-home-growth-card" key={item.tag}>
       <div className="lx-home-growth-card-top"><span>{String(index+1).padStart(2,"0")}</span><b>{item.tag}</b></div>
       <h3>{item.title}</h3>
       <p>{item.description}</p>
       <div className="lx-home-growth-chips">
        {item.chips.map(chip=>chip.href?
         <Link href={chip.href} key={chip.label}>{chip.label}</Link>:
         <span key={chip.label}>{chip.label}</span>
        )}
       </div>
       <Link className="lx-home-growth-cta" href={item.href}>{item.cta} <span aria-hidden="true">→</span></Link>
      </article>
     ))}
    </div>
    <div className="lx-home-growth-flywheel" aria-label={copy.flywheelTitle}>
     <strong>{copy.flywheelTitle}</strong>
     <div>{copy.flywheel.map((step,index)=><span key={step}><b>{step}</b>{index<copy.flywheel.length-1&&<i aria-hidden="true">→</i>}</span>)}</div>
    </div>
   </section>
   <section className="lx-home-toolpass" aria-labelledby="lx-home-toolpass-title">
    <div className="lx-home-toolpass-intro">
     <span className="lx-home-toolpass-crown" aria-hidden="true">♛</span>
     <p className="lx-home-section-eyebrow">TOOLPASS · ALL PRACTICAL TOOLS</p>
     <h2 id="lx-home-toolpass-title">{copy.passTitle}</h2>
     <p>{copy.passLead}</p>
     <ul>{copy.passBenefits.map(item=><li key={item}><span aria-hidden="true">✓</span>{item}</li>)}</ul>
     <Link href="/tools/pass" className="lx-home-toolpass-link">{copy.planCta} <span aria-hidden="true">→</span></Link>
    </div>
    <div className="lx-home-plan-grid">
     {ALL_TOOLS_PASS_CATALOG.map((offer,index)=>(
      <article className={index===1?"lx-home-plan-card is-featured":"lx-home-plan-card"} key={offer.sku}>
       {index===1&&<span className="lx-home-plan-badge">✦ {copy.popular}</span>}
       <h3>{copy.planDays[index]}</h3>
       <strong>{symbol}{offer.price}</strong>
       <p>{copy.planDescriptions[index]}</p>
       <Link href="/tools/pass">{copy.planCta} <span aria-hidden="true">→</span></Link>
      </article>
     ))}
    </div>
   </section>
   <section className="lx-home-market-strip" aria-label={copy.marketSiaiTitle+" / "+copy.marketSasiTitle}>
    <Link className="lx-home-market-card" href="/siai">
     <span className="lx-home-market-icon" aria-hidden="true">🏆</span>
     <span><strong>{copy.marketSiaiTitle}</strong><small>{copy.marketSiaiDesc}</small></span>
     <b aria-hidden="true">→</b>
    </Link>
    <Link className="lx-home-market-card" href="/sasi">
     <span className="lx-home-market-icon" aria-hidden="true">◈</span>
     <span><strong>{copy.marketSasiTitle}</strong><small>{copy.marketSasiDesc}</small></span>
     <b aria-hidden="true">→</b>
    </Link>
    <div className="lx-home-stats">
     {copy.stats.map(item=><div key={item.label}><strong>{item.value}</strong><span>{item.label}</span></div>)}
    </div>
   </section>
   <section className="lx-home-popular-tools" aria-labelledby="lx-home-tools-title">
    <div><h2 id="lx-home-tools-title">{copy.toolsTitle}</h2><p>{copy.passLead}</p></div>
    <nav>{copy.toolCategories.map(item=><Link href={item.href} key={item.title}>{item.title} <span aria-hidden="true">→</span></Link>)}</nav>
   </section>
  </section>
 );
}
