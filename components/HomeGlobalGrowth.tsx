"use client";

import Link from "next/link";
import LingxiMiniIcon,{type LingxiIconName} from "@/components/LingxiMiniIcon";
import {ALL_TOOLS_PASS_CATALOG} from "@/lib/tools/commerce/all-tools-pass";
import {usePreferredCurrency} from "@/components/CurrencyPreferenceProvider";
import {useLingxiLang,type LingxiLang} from "@/lib/lingxi-i18n";

type GrowthChip={label:string;href?:string};
type GrowthCard={tag:string;title:string;description:string;href:string;cta:string;chips:GrowthChip[]};
type Feature={icon:LingxiIconName;title:string;description:string;href:string};
type ToolCategory={title:string;href:string};
type HomeGrowthCopy={
 features:Feature[];
 growthTitle:string;growthLead:string;growthCards:GrowthCard[];
 flywheelTitle:string;flywheel:string[];
 passTitle:string;passLead:string;passValueLead:string;passBenefits:string[];
 planDays:string[];planDescriptions:string[];planCta:string;popular:string;
 marketSiaiTitle:string;marketSiaiDesc:string;marketSasiTitle:string;marketSasiDesc:string;
 stats:{value:string;label:string}[];
 toolsTitle:string;toolCategories:ToolCategory[];
};

const COPY:Record<LingxiLang,HomeGrowthCopy>={
 zh:{
  features:[
   {icon:"products",title:"全球 SIAI 排行榜",description:"模型能力 · 真实价格 · 免费额度",href:"/siai"},
   {icon:"tools",title:"100+ 实用工具",description:"PDF · 图片 · 视频 · 音频",href:"/tools"},
   {icon:"sasi",title:"SASI 智能软件市场",description:"成品软件 · MT5 EA · 源码授权",href:"/sasi"},
   {icon:"wallet",title:"工具包会员",description:"全场工具 · 无限使用",href:"/tools/pass"},
   {icon:"website",title:"全球增长与合作",description:"内容传播 · 网站合作 · 全球触达",href:"/partners"}
  ],
  growthTitle:"让更多人发现灵犀场，让每项服务都能找到合适用户",
  growthLead:"搜索发现、智能搜索、全球 SIAI 分发、软件交易、网站合作与内容传播相互连接，让用户从发现到使用形成完整路径。",
  growthCards:[
   {tag:"搜索",title:"让正在找答案的人发现灵犀场",description:"覆盖九种语言、124 个工具入口和真实问题教程，让搜索访问直接进入可用服务。",href:"/tools",cta:"浏览工具目录",chips:[{label:"九种语言"},{label:"124 个工具入口"},{label:"问题型教程"}]},
   {tag:"智能搜索",title:"让智能搜索准确理解灵犀场",description:"持续整理平台、产品和工具资料，让智能搜索准确识别服务内容、工具能力与适用场景。",href:"/about",cta:"查看 AI 搜索资料",chips:[{label:"AI 搜索说明",href:"/llms.txt"},{label:"完整平台资料",href:"/llms-full.txt"},{label:"公开数据接口",href:"/siai-openapi.json"}]},
   {tag:"全球排行",title:"帮助用户选到合适的 AI 工具",description:"集中比较模型能力、真实价格、免费额度、可用地区和商用条件，减少反复查找。",href:"/siai",cta:"浏览全球 SIAI 排行榜",chips:[{label:"模型能力"},{label:"价格与免费额度"},{label:"地区和授权"}]},
   {tag:"软件交易",title:"让优质软件安全触达全球用户",description:"浏览成品软件、MT5 EA、交易指标和源码授权，查看版本、教程、授权范围与安全交付。",href:"/sasi",cta:"浏览 SASI 智能软件市场",chips:[{label:"MT5 EA"},{label:"成品软件"},{label:"源码授权"},{label:"自动交付"},{label:"开发者发布",href:"/sasi/seller"},{label:"安装与交付",href:"/sasi/delivery"}]},
   {tag:"合作网络",title:"让工具和排行榜进入更多网站",description:"提供网站插件、嵌入组件、公开数据接口、排行榜更新订阅和二维码分享，让合作网站直接展示灵犀场服务，并统计分享访问来源。",href:"/partners",cta:"了解全球合作",chips:[{label:"WordPress 插件",href:"/downloads/lingxifield-siai-wordpress.zip"},{label:"网站嵌入组件",href:"/widgets/lingxifield-v1.js"},{label:"公开数据接口",href:"/siai-openapi.json"},{label:"排行榜更新订阅",href:"/siai/updates.xml"},{label:"二维码分享",href:"/partners"},{label:"分享来源统计",href:"/partners"}]},
   {tag:"内容传播",title:"用真实问题和教程持续带来访问",description:"通过真实工具问题、使用教程、应用案例和结果展示，让更多人找到能直接使用的答案。",href:"/discoveries",cta:"查看内容与发现",chips:[{label:"奇闻发现"},{label:"真实工具问题"},{label:"使用前后对比"},{label:"应用场景"}]}
  ],
  flywheelTitle:"从发现到使用，让每次体验都有下一步",
  flywheel:["发现","了解","体验","完成任务","分享","再次访问"],
  passTitle:"ToolPass 工具包会员",passLead:"一站畅用 100+ 实用工具，持续处理文件与日常任务更高效。",passValueLead:"先免费完成一项任务；需要持续处理、多文件批量工作时，再选择合适的工具包周期。",
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
   {icon:"products",title:"Global SIAI Rankings",description:"Models · prices · free limits",href:"/siai"},
   {icon:"tools",title:"100+ Practical Tools",description:"PDF · images · video · audio",href:"/tools"},
   {icon:"sasi",title:"SASI Software Marketplace",description:"MT5 EAs · source code · software",href:"/sasi"},
   {icon:"wallet",title:"ToolPass Membership",description:"All tools · unlimited use",href:"/tools/pass"},
   {icon:"website",title:"Global Growth & Partners",description:"SEO · GEO · API · embeds",href:"/partners"}
  ],
  growthTitle:"A global entry point for discovery, products and real-world use",
  growthLead:"Connect search discovery, AI search, SIAI distribution, software commerce, partner networks and useful stories in one coherent journey.",
  growthCards:[
   {tag:"SEO",title:"Search Discovery",description:"Nine-language SEO, 124 tool entries and problem-led landing pages that lead directly to usable tools.",href:"/tools",cta:"Browse the tool directory",chips:[{label:"9 languages"},{label:"124 tool entries"},{label:"Problem pages"}]},
   {tag:"GEO",title:"AI Search Discovery",description:"Help AI systems understand the platform through llms.txt, llms-full.txt and structured product facts.",href:"/about",cta:"View AI search resources",chips:[{label:"llms.txt",href:"/about"},{label:"llms-full.txt",href:"/llms-full.txt"},{label:"Structured facts"}]},
   {tag:"SIAI",title:"Global SIAI Distribution",description:"Rankings, model profiles, real prices, free allowances, regional availability and commercial rights.",href:"/siai",cta:"Explore Global SIAI",chips:[{label:"Rankings"},{label:"Prices & free tiers"},{label:"Regions & rights"}]},
   {tag:"SASI",title:"SASI Business",description:"MT5 EAs, trading source code, finished software, installation guides, licensing and secure automatic delivery.",href:"/sasi",cta:"Browse SASI Marketplace",chips:[{"label":"MT5 EAs","href":"/sasi"},{"label":"Trading source code","href":"/sasi"},{"label":"Buyer guide & delivery","href":"/sasi/delivery"},{"label":"Seller publishing","href":"/sasi/seller"}]},
   {tag:"NETWORK",title:"External Growth Network",description:"WordPress, JS Widget, partner portal, public API, RSS, QR codes and share attribution.",href:"/partners",cta:"Open partner center",chips:[{label:"WordPress",href:"/downloads/lingxifield-siai-wordpress.zip"},{label:"JS Widget",href:"/widgets/lingxifield-v1.js"},{label:"API",href:"/siai-openapi.json"},{label:"RSS",href:"/siai/updates.xml"},{label:"QR",href:"/partners"},{label:"Share attribution",href:"/partners"}]},
   {tag:"STORIES",title:"Content & Discovery",description:"Curiosity-led discoveries, real tool problems, Before / After evidence and practical use cases.",href:"/discoveries",cta:"Start with a real task",chips:[{"label":"Discoveries","href":"/discoveries"},{"label":"Real tool problems","href":"/tools?q=PDF"},{"label":"Before / After","href":"/discoveries#before-after"},{"label":"Use cases","href":"/discoveries#use-cases"}]}
  ],
  flywheelTitle:"From discovery to sharing, every useful result creates a next step",
  flywheel:["Discover","Search","Try","Result","Share","Return"],
  passTitle:"ToolPass Membership",passLead:"Use 100+ practical tools in one place and handle everyday files more efficiently.",passValueLead:"Start with a free task. Choose a pass when you need ongoing work or batch processing.",
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
   {icon:"products",title:"世界の SIAI ランキング",description:"モデル · 価格 · 無料枠",href:"/siai"},
   {icon:"tools",title:"100以上の実用ツール",description:"PDF · 画像 · 動画 · 音声",href:"/tools"},
   {icon:"sasi",title:"SASI ソフトウェア市場",description:"MT5 EA · ソースコード · 完成品",href:"/sasi"},
   {icon:"wallet",title:"ToolPass 会員",description:"全ツール · 無制限利用",href:"/tools/pass"},
   {icon:"website",title:"グローバル連携",description:"SEO · GEO · API · 埋め込み",href:"/partners"}
  ],
  growthTitle:"世界から見つかり、製品と利用シーンをつなぐ入口",
  growthLead:"検索、AI検索、SIAIの情報配信、ソフトウェア取引、パートナー連携、実用コンテンツを一つにつなぎます。",
  growthCards:[
   {tag:"SEO",title:"検索入口",description:"9言語 SEO、124件のツール案内、課題別ランディングページ。",href:"/tools",cta:"ツール一覧を見る",chips:[{label:"9言語"},{label:"124件の入口"},{label:"課題別ページ"}]},
   {tag:"GEO",title:"AI検索入口",description:"llms.txt、llms-full.txt、構造化された製品情報でAI検索を支援。",href:"/about",cta:"AI検索資料を見る",chips:[{label:"llms.txt",href:"/about"},{label:"llms-full.txt",href:"/llms-full.txt"},{label:"構造化情報"}]},
   {tag:"SIAI",title:"世界の SIAI 配信",description:"ランキング、モデル情報、価格、無料枠、地域対応、商用利用条件。",href:"/siai",cta:"SIAIランキングを見る",chips:[{label:"ランキング"},{label:"価格と無料枠"},{label:"地域と権利"}]},
   {tag:"SASI",title:"SASI ビジネス入口",description:"MT5 EA、取引ソースコード、完成ソフト、導入ガイド、ライセンスと安全な納品。",href:"/sasi",cta:"SASI市場を見る",chips:[{"label":"MT5 EA","href":"/sasi"},{"label":"取引ソース","href":"/sasi"},{"label":"導入・納品ガイド","href":"/sasi/delivery"},{"label":"開発者出品","href":"/sasi/seller"}]},
   {tag:"NETWORK",title:"外部連携ネットワーク",description:"WordPress、JS Widget、パートナー、API、RSS、QR、共有経由の分析。",href:"/partners",cta:"パートナーセンター",chips:[{label:"WordPress",href:"/downloads/lingxifield-siai-wordpress.zip"},{label:"JS Widget",href:"/widgets/lingxifield-v1.js"},{label:"API",href:"/siai-openapi.json"},{label:"RSS",href:"/siai/updates.xml"},{label:"QR",href:"/partners"},{label:"共有分析",href:"/partners"}]},
   {tag:"STORIES",title:"発見とコンテンツ",description:"不思議な発見、実際のツール課題、Before / After、利用シーン。",href:"/discoveries",cta:"実際の課題から始める",chips:[{"label":"発見","href":"/discoveries"},{"label":"実際のツール課題","href":"/tools?q=PDF"},{"label":"Before / After","href":"/discoveries#before-after"},{"label":"利用シーン","href":"/discoveries#use-cases"}]}
  ],
  flywheelTitle:"発見から共有まで、役立つ体験を次につなぐ",
  flywheel:["発見","検索","体験","結果","共有","再訪"],
  passTitle:"ToolPass ツール会員",passLead:"100以上の実用ツールを一か所で利用し、日常のファイル作業を効率化。",passValueLead:"まず無料で一つの作業を完了。継続利用や複数ファイルの一括処理が必要になったらプランを選べます。",
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
   {icon:"products",title:"글로벌 SIAI 순위",description:"모델 · 가격 · 무료 한도",href:"/siai"},
   {icon:"tools",title:"실용 도구 100+",description:"PDF · 이미지 · 영상 · 오디오",href:"/tools"},
   {icon:"sasi",title:"SASI 소프트웨어 마켓",description:"MT5 EA · 소스 코드 · 완성품",href:"/sasi"},
   {icon:"wallet",title:"ToolPass 멤버십",description:"전체 도구 · 무제한 사용",href:"/tools/pass"},
   {icon:"website",title:"글로벌 성장과 협력",description:"SEO · GEO · API · 임베드",href:"/partners"}
  ],
  growthTitle:"전 세계 사용자가 찾고 제품과 활용 사례가 연결되는 입구",
  growthLead:"검색, AI 검색, SIAI 정보 배포, 소프트웨어 거래, 파트너 네트워크와 실제 활용 콘텐츠를 하나로 연결합니다.",
  growthCards:[
   {tag:"SEO",title:"검색 입구",description:"9개 언어 SEO, 124개 도구 디렉터리와 문제 해결 랜딩 페이지.",href:"/tools",cta:"도구 디렉터리 보기",chips:[{label:"9개 언어"},{label:"124개 도구"},{label:"문제 페이지"}]},
   {tag:"GEO",title:"AI 검색 입구",description:"llms.txt, llms-full.txt와 구조화된 제품 정보로 AI 검색을 지원합니다.",href:"/about",cta:"AI 검색 자료 보기",chips:[{label:"llms.txt",href:"/about"},{label:"llms-full.txt",href:"/llms-full.txt"},{label:"구조화 정보"}]},
   {tag:"SIAI",title:"글로벌 SIAI 배포",description:"순위, 모델 정보, 실제 가격, 무료 한도, 지역 지원과 상업적 권리.",href:"/siai",cta:"SIAI 순위 보기",chips:[{label:"순위"},{label:"가격과 무료 한도"},{label:"지역과 권리"}]},
   {tag:"SASI",title:"SASI 비즈니스 입구",description:"MT5 EA, 트레이딩 소스 코드, 완성 소프트웨어, 설치 안내, 라이선스와 안전한 자동 전달.",href:"/sasi",cta:"SASI 마켓 보기",chips:[{"label":"MT5 EA","href":"/sasi"},{"label":"트레이딩 소스","href":"/sasi"},{"label":"설치·전달 안내","href":"/sasi/delivery"},{"label":"개발자 판매 등록","href":"/sasi/seller"}]},
   {tag:"NETWORK",title:"외부 성장 네트워크",description:"WordPress, JS Widget, 파트너, API, RSS, QR 코드와 공유 유입 분석.",href:"/partners",cta:"파트너 센터 열기",chips:[{label:"WordPress",href:"/downloads/lingxifield-siai-wordpress.zip"},{label:"JS Widget",href:"/widgets/lingxifield-v1.js"},{label:"API",href:"/siai-openapi.json"},{label:"RSS",href:"/siai/updates.xml"},{label:"QR",href:"/partners"},{label:"공유 분석",href:"/partners"}]},
   {tag:"STORIES",title:"콘텐츠 확산",description:"흥미로운 발견, 실제 도구 문제, Before / After와 실사용 사례.",href:"/discoveries",cta:"실제 문제부터 시작",chips:[{"label":"발견","href":"/discoveries"},{"label":"실제 도구 문제","href":"/tools?q=PDF"},{"label":"Before / After","href":"/discoveries#before-after"},{"label":"활용 사례","href":"/discoveries#use-cases"}]}
  ],
  flywheelTitle:"발견에서 공유까지, 유용한 경험을 다음 단계로 연결",
  flywheel:["발견","검색","체험","결과","공유","재방문"],
  passTitle:"ToolPass 도구 멤버십",passLead:"100개 이상의 실용 도구를 한곳에서 사용하고 파일 작업을 효율적으로 처리하세요.",passValueLead:"먼저 무료로 작업을 완료하세요. 지속 사용이나 여러 파일의 일괄 처리가 필요할 때 패스를 선택하세요.",
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
   {icon:"products",title:"Classement SIAI mondial",description:"Modèles · prix · quotas gratuits",href:"/siai"},
   {icon:"tools",title:"100+ outils pratiques",description:"PDF · images · vidéo · audio",href:"/tools"},
   {icon:"sasi",title:"Marché logiciel SASI",description:"EA MT5 · code source · logiciels",href:"/sasi"},
   {icon:"wallet",title:"Abonnement ToolPass",description:"Tous les outils · sans limite",href:"/tools/pass"},
   {icon:"website",title:"Croissance et partenaires",description:"SEO · GEO · API · intégration",href:"/partners"}
  ],
  growthTitle:"Une porte mondiale entre découverte, produits et usages réels",
  growthLead:"Reliez recherche, recherche IA, diffusion SIAI, commerce logiciel, partenaires et contenus utiles dans un parcours cohérent.",
  growthCards:[
   {tag:"SEO",title:"Entrée par la recherche",description:"SEO en 9 langues, 124 outils répertoriés et pages dédiées aux problèmes réels.",href:"/tools",cta:"Voir les outils",chips:[{label:"9 langues"},{label:"124 outils"},{label:"Pages-problèmes"}]},
   {tag:"GEO",title:"Entrée par la recherche IA",description:"llms.txt, llms-full.txt et données produit structurées pour aider les systèmes IA à comprendre le service.",href:"/about",cta:"Voir les ressources IA",chips:[{label:"llms.txt",href:"/about"},{label:"llms-full.txt",href:"/llms-full.txt"},{label:"Données structurées"}]},
   {tag:"SIAI",title:"Diffusion mondiale SIAI",description:"Classements, fiches modèles, prix réels, quotas gratuits, régions et droits commerciaux.",href:"/siai",cta:"Explorer SIAI",chips:[{label:"Classements"},{label:"Prix et quotas"},{label:"Régions et droits"}]},
   {tag:"SASI",title:"Entrée commerciale SASI",description:"EA MT5, code source de trading, logiciels finis, guides, licences et livraison automatique sécurisée.",href:"/sasi",cta:"Voir le marché SASI",chips:[{"label":"EA MT5","href":"/sasi"},{"label":"Code de trading","href":"/sasi"},{"label":"Guide d’installation et livraison","href":"/sasi/delivery"},{"label":"Publication vendeur","href":"/sasi/seller"}]},
   {tag:"NETWORK",title:"Réseau de croissance externe",description:"WordPress, JS Widget, partenaires, API, RSS, QR codes et attribution des partages.",href:"/partners",cta:"Centre partenaires",chips:[{label:"WordPress",href:"/downloads/lingxifield-siai-wordpress.zip"},{label:"JS Widget",href:"/widgets/lingxifield-v1.js"},{label:"API",href:"/siai-openapi.json"},{label:"RSS",href:"/siai/updates.xml"},{label:"QR",href:"/partners"},{label:"Attribution",href:"/partners"}]},
   {tag:"STORIES",title:"Découverte et diffusion",description:"Découvertes étonnantes, problèmes concrets, Before / After et cas d'usage réels.",href:"/discoveries",cta:"Partir d'un besoin réel",chips:[{"label":"Découvertes","href":"/discoveries"},{"label":"Problèmes réels","href":"/tools?q=PDF"},{"label":"Before / After","href":"/discoveries#before-after"},{"label":"Cas d’usage","href":"/discoveries#use-cases"}]}
  ],
  flywheelTitle:"De la découverte au partage, chaque résultat ouvre une suite",
  flywheel:["Découvrir","Rechercher","Essayer","Résultat","Partager","Revenir"],
  passTitle:"Abonnement ToolPass",passLead:"Plus de 100 outils pratiques au même endroit pour traiter les fichiers plus efficacement.",passValueLead:"Commencez par une tâche gratuite. Choisissez un pass lorsque vous avez besoin d’un usage continu ou du traitement par lots.",
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
   {icon:"products",title:"Globales SIAI-Ranking",description:"Modelle · Preise · Gratis-Kontingente",href:"/siai"},
   {icon:"tools",title:"100+ praktische Tools",description:"PDF · Bilder · Video · Audio",href:"/tools"},
   {icon:"sasi",title:"SASI-Softwaremarkt",description:"MT5-EAs · Quellcode · Software",href:"/sasi"},
   {icon:"wallet",title:"ToolPass-Mitgliedschaft",description:"Alle Tools · unbegrenzt nutzen",href:"/tools/pass"},
   {icon:"website",title:"Wachstum und Partner",description:"SEO · GEO · API · Einbindung",href:"/partners"}
  ],
  growthTitle:"Ein globaler Zugang für Entdeckung, Produkte und echte Anwendungen",
  growthLead:"Suchzugang, KI-Suche, SIAI-Verteilung, Softwarehandel, Partnernetzwerk und hilfreiche Inhalte werden zu einem Weg verbunden.",
  growthCards:[
   {tag:"SEO",title:"Sucheinstieg",description:"SEO in neun Sprachen, 124 Tool-Einträge und problemorientierte Landingpages.",href:"/tools",cta:"Tool-Verzeichnis öffnen",chips:[{label:"9 Sprachen"},{label:"124 Tools"},{label:"Problemseiten"}]},
   {tag:"GEO",title:"KI-Sucheinstieg",description:"llms.txt, llms-full.txt und strukturierte Produktdaten helfen KI-Systemen, das Angebot zu verstehen.",href:"/about",cta:"KI-Suchdaten ansehen",chips:[{label:"llms.txt",href:"/about"},{label:"llms-full.txt",href:"/llms-full.txt"},{label:"Strukturierte Daten"}]},
   {tag:"SIAI",title:"Globale SIAI-Verteilung",description:"Rankings, Modellprofile, echte Preise, Gratis-Kontingente, Regionen und kommerzielle Rechte.",href:"/siai",cta:"SIAI-Ranking öffnen",chips:[{label:"Rankings"},{label:"Preise und Gratislimits"},{label:"Regionen und Rechte"}]},
   {tag:"SASI",title:"SASI-Geschäftseinstieg",description:"MT5-EAs, Trading-Quellcode, fertige Software, Anleitungen, Lizenzen und sichere automatische Lieferung.",href:"/sasi",cta:"SASI-Markt öffnen",chips:[{"label":"MT5-EAs","href":"/sasi"},{"label":"Trading-Quellcode","href":"/sasi"},{"label":"Installation & Lieferung","href":"/sasi/delivery"},{"label":"Verkäufer werden","href":"/sasi/seller"}]},
   {tag:"NETWORK",title:"Externes Wachstumsnetzwerk",description:"WordPress, JS Widget, Partner, API, RSS, QR-Codes und Share-Attribution.",href:"/partners",cta:"Partnerbereich öffnen",chips:[{label:"WordPress",href:"/downloads/lingxifield-siai-wordpress.zip"},{label:"JS Widget",href:"/widgets/lingxifield-v1.js"},{label:"API",href:"/siai-openapi.json"},{label:"RSS",href:"/siai/updates.xml"},{label:"QR",href:"/partners"},{label:"Attribution",href:"/partners"}]},
   {tag:"STORIES",title:"Inhalte und Entdeckungen",description:"Spannende Entdeckungen, echte Tool-Probleme, Before / After und konkrete Anwendungsfälle.",href:"/discoveries",cta:"Mit einer Aufgabe beginnen",chips:[{"label":"Entdeckungen","href":"/discoveries"},{"label":"Echte Tool-Probleme","href":"/tools?q=PDF"},{"label":"Before / After","href":"/discoveries#before-after"},{"label":"Anwendungsfälle","href":"/discoveries#use-cases"}]}
  ],
  flywheelTitle:"Von der Entdeckung zum Teilen: jedes Ergebnis führt weiter",
  flywheel:["Entdecken","Suchen","Testen","Ergebnis","Teilen","Zurückkehren"],
  passTitle:"ToolPass-Mitgliedschaft",passLead:"Mehr als 100 praktische Tools an einem Ort für effiziente Datei- und Alltagsarbeit.",passValueLead:"Erledige zuerst eine Aufgabe kostenlos. Wähle einen Pass erst bei regelmäßigem Bedarf oder Stapelverarbeitung.",
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
   {icon:"products",title:"Ranking SIAI global",description:"Modelos · precios · límites gratis",href:"/siai"},
   {icon:"tools",title:"Más de 100 herramientas",description:"PDF · imágenes · vídeo · audio",href:"/tools"},
   {icon:"sasi",title:"Mercado de software SASI",description:"EA MT5 · código fuente · software",href:"/sasi"},
   {icon:"wallet",title:"Membresía ToolPass",description:"Todas las herramientas · uso ilimitado",href:"/tools/pass"},
   {icon:"website",title:"Crecimiento y socios",description:"SEO · GEO · API · integración",href:"/partners"}
  ],
  growthTitle:"Una entrada global para descubrir, conectar productos y mostrar usos reales",
  growthLead:"Conecta búsqueda, búsqueda con IA, distribución SIAI, comercio de software, socios y contenidos útiles.",
  growthCards:[
   {tag:"SEO",title:"Entrada de búsqueda",description:"SEO en nueve idiomas, 124 herramientas y páginas de destino basadas en problemas reales.",href:"/tools",cta:"Ver directorio de herramientas",chips:[{label:"9 idiomas"},{label:"124 herramientas"},{label:"Páginas de problemas"}]},
   {tag:"GEO",title:"Entrada de búsqueda IA",description:"llms.txt, llms-full.txt y datos estructurados ayudan a los sistemas de IA a comprender el servicio.",href:"/about",cta:"Ver recursos de IA",chips:[{label:"llms.txt",href:"/about"},{label:"llms-full.txt",href:"/llms-full.txt"},{label:"Datos estructurados"}]},
   {tag:"SIAI",title:"Distribución global SIAI",description:"Rankings, fichas de modelos, precios reales, límites gratuitos, regiones y derechos comerciales.",href:"/siai",cta:"Explorar SIAI",chips:[{label:"Rankings"},{label:"Precios y límites"},{label:"Regiones y derechos"}]},
   {tag:"SASI",title:"Entrada comercial SASI",description:"EA MT5, código fuente de trading, software terminado, tutoriales, licencias y entrega automática segura.",href:"/sasi",cta:"Ver mercado SASI",chips:[{"label":"EA MT5","href":"/sasi"},{"label":"Código de trading","href":"/sasi"},{"label":"Guía de instalación y entrega","href":"/sasi/delivery"},{"label":"Publicar como vendedor","href":"/sasi/seller"}]},
   {tag:"NETWORK",title:"Red externa de crecimiento",description:"WordPress, JS Widget, socios, API, RSS, códigos QR y atribución de compartidos.",href:"/partners",cta:"Abrir centro de socios",chips:[{label:"WordPress",href:"/downloads/lingxifield-siai-wordpress.zip"},{label:"JS Widget",href:"/widgets/lingxifield-v1.js"},{label:"API",href:"/siai-openapi.json"},{label:"RSS",href:"/siai/updates.xml"},{label:"QR",href:"/partners"},{label:"Atribución",href:"/partners"}]},
   {tag:"STORIES",title:"Contenido y descubrimiento",description:"Descubrimientos curiosos, problemas reales, Before / After y casos prácticos.",href:"/discoveries",cta:"Empezar por un problema real",chips:[{"label":"Descubrimientos","href":"/discoveries"},{"label":"Problemas reales","href":"/tools?q=PDF"},{"label":"Before / After","href":"/discoveries#before-after"},{"label":"Casos de uso","href":"/discoveries#use-cases"}]}
  ],
  flywheelTitle:"De descubrir a compartir: cada resultado abre el siguiente paso",
  flywheel:["Descubrir","Buscar","Probar","Resultado","Compartir","Volver"],
  passTitle:"Membresía ToolPass",passLead:"Más de 100 herramientas prácticas en un solo lugar para procesar archivos con mayor eficiencia.",passValueLead:"Empieza con una tarea gratuita. Elige un pase cuando necesites uso continuo o procesamiento por lotes.",
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
   {icon:"products",title:"Ranking SIAI global",description:"Modelos · preços · limites grátis",href:"/siai"},
   {icon:"tools",title:"Mais de 100 ferramentas",description:"PDF · imagens · vídeo · áudio",href:"/tools"},
   {icon:"sasi",title:"Mercado de software SASI",description:"EA MT5 · código-fonte · software",href:"/sasi"},
   {icon:"wallet",title:"Assinatura ToolPass",description:"Todas as ferramentas · uso ilimitado",href:"/tools/pass"},
   {icon:"website",title:"Crescimento e parceiros",description:"SEO · GEO · API · integração",href:"/partners"}
  ],
  growthTitle:"Uma entrada global para descoberta, produtos e aplicações reais",
  growthLead:"Conecte busca, busca por IA, distribuição SIAI, comércio de software, parceiros e conteúdos úteis.",
  growthCards:[
   {tag:"SEO",title:"Entrada de busca",description:"SEO em nove idiomas, 124 ferramentas e páginas de destino orientadas por problemas reais.",href:"/tools",cta:"Ver diretório de ferramentas",chips:[{label:"9 idiomas"},{label:"124 ferramentas"},{label:"Páginas de problemas"}]},
   {tag:"GEO",title:"Entrada de busca por IA",description:"llms.txt, llms-full.txt e dados estruturados ajudam sistemas de IA a entender o serviço.",href:"/about",cta:"Ver recursos de IA",chips:[{label:"llms.txt",href:"/about"},{label:"llms-full.txt",href:"/llms-full.txt"},{label:"Dados estruturados"}]},
   {tag:"SIAI",title:"Distribuição global SIAI",description:"Rankings, perfis de modelos, preços reais, limites gratuitos, regiões e direitos comerciais.",href:"/siai",cta:"Explorar SIAI",chips:[{label:"Rankings"},{label:"Preços e limites"},{label:"Regiões e direitos"}]},
   {tag:"SASI",title:"Entrada comercial SASI",description:"EA MT5, código-fonte de trading, software pronto, tutoriais, licenças e entrega automática segura.",href:"/sasi",cta:"Ver mercado SASI",chips:[{"label":"EA MT5","href":"/sasi"},{"label":"Código de trading","href":"/sasi"},{"label":"Guia de instalação e entrega","href":"/sasi/delivery"},{"label":"Publicar como vendedor","href":"/sasi/seller"}]},
   {tag:"NETWORK",title:"Rede externa de crescimento",description:"WordPress, JS Widget, parceiros, API, RSS, QR e atribuição de compartilhamentos.",href:"/partners",cta:"Abrir centro de parceiros",chips:[{label:"WordPress",href:"/downloads/lingxifield-siai-wordpress.zip"},{label:"JS Widget",href:"/widgets/lingxifield-v1.js"},{label:"API",href:"/siai-openapi.json"},{label:"RSS",href:"/siai/updates.xml"},{label:"QR",href:"/partners"},{label:"Atribuição",href:"/partners"}]},
   {tag:"STORIES",title:"Conteúdo e descoberta",description:"Descobertas curiosas, problemas reais, Before / After e cenários de aplicação.",href:"/discoveries",cta:"Começar por um problema real",chips:[{"label":"Descobertas","href":"/discoveries"},{"label":"Problemas reais","href":"/tools?q=PDF"},{"label":"Before / After","href":"/discoveries#before-after"},{"label":"Casos de uso","href":"/discoveries#use-cases"}]}
  ],
  flywheelTitle:"Da descoberta ao compartilhamento, cada resultado abre o próximo passo",
  flywheel:["Descobrir","Buscar","Testar","Resultado","Compartilhar","Voltar"],
  passTitle:"Assinatura ToolPass",passLead:"Mais de 100 ferramentas práticas em um só lugar para lidar com arquivos com eficiência.",passValueLead:"Comece com uma tarefa gratuita. Escolha um passe quando precisar de uso contínuo ou processamento em lote.",
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
   {icon:"products",title:"تصنيف SIAI العالمي",description:"النماذج · الأسعار · الحصص المجانية",href:"/siai"},
   {icon:"tools",title:"أكثر من 100 أداة عملية",description:"PDF · الصور · الفيديو · الصوت",href:"/tools"},
   {icon:"sasi",title:"سوق برامج SASI",description:"MT5 EA · الشيفرة المصدرية · البرامج",href:"/sasi"},
   {icon:"wallet",title:"عضوية ToolPass",description:"كل الأدوات · استخدام غير محدود",href:"/tools/pass"},
   {icon:"website",title:"النمو والشراكات العالمية",description:"SEO · GEO · API · التضمين",href:"/partners"}
  ],
  growthTitle:"مدخل عالمي للاكتشاف والمنتجات والتطبيقات الحقيقية",
  growthLead:"اربط البحث والبحث بالذكاء الاصطناعي وتوزيع SIAI وتجارة البرامج والشراكات والمحتوى العملي في مسار واحد.",
  growthCards:[
   {tag:"SEO",title:"مدخل البحث",description:"تحسين البحث بتسع لغات، و124 مدخلاً للأدوات وصفحات مخصصة للمشكلات الحقيقية.",href:"/tools",cta:"استعرض دليل الأدوات",chips:[{label:"9 لغات"},{label:"124 أداة"},{label:"صفحات المشكلات"}]},
   {tag:"GEO",title:"مدخل بحث الذكاء الاصطناعي",description:"ملفات llms.txt وllms-full.txt وبيانات المنتجات المنظمة لتسهيل فهم الخدمات.",href:"/about",cta:"عرض موارد البحث",chips:[{label:"llms.txt",href:"/about"},{label:"llms-full.txt",href:"/llms-full.txt"},{label:"بيانات منظمة"}]},
   {tag:"SIAI",title:"توزيع SIAI العالمي",description:"التصنيفات وملفات النماذج والأسعار الحقيقية والحصص المجانية والمناطق والحقوق التجارية.",href:"/siai",cta:"استكشف تصنيف SIAI",chips:[{label:"التصنيفات"},{label:"الأسعار والحصص"},{label:"المناطق والحقوق"}]},
   {tag:"SASI",title:"مدخل SASI التجاري",description:"MT5 EA وشيفرات التداول والبرامج الجاهزة والدروس والتراخيص والتسليم الآمن التلقائي.",href:"/sasi",cta:"استعرض سوق SASI",chips:[{"label":"MT5 EA","href":"/sasi"},{"label":"شيفرات التداول","href":"/sasi"},{"label":"دليل التثبيت والتسليم","href":"/sasi/delivery"},{"label":"النشر كبائع","href":"/sasi/seller"}]},
   {tag:"NETWORK",title:"شبكة النمو الخارجية",description:"WordPress وJS Widget والشركاء وAPI وRSS ورموز QR وإسناد المشاركات.",href:"/partners",cta:"مركز الشركاء",chips:[{label:"WordPress",href:"/downloads/lingxifield-siai-wordpress.zip"},{label:"JS Widget",href:"/widgets/lingxifield-v1.js"},{label:"API",href:"/siai-openapi.json"},{label:"RSS",href:"/siai/updates.xml"},{label:"QR",href:"/partners"},{label:"إسناد المشاركة",href:"/partners"}]},
   {tag:"STORIES",title:"المحتوى والاكتشاف",description:"اكتشافات مميزة ومشكلات أدوات حقيقية وBefore / After وسيناريوهات تطبيقية.",href:"/discoveries",cta:"ابدأ بمشكلة حقيقية",chips:[{"label":"اكتشافات","href":"/discoveries"},{"label":"مشكلات أدوات حقيقية","href":"/tools?q=PDF"},{"label":"Before / After","href":"/discoveries#before-after"},{"label":"حالات استخدام","href":"/discoveries#use-cases"}]}
  ],
  flywheelTitle:"من الاكتشاف إلى المشاركة، كل نتيجة تفتح خطوة جديدة",
  flywheel:["اكتشاف","بحث","تجربة","نتيجة","مشاركة","عودة"],
  passTitle:"عضوية ToolPass",passLead:"أكثر من 100 أداة عملية في مكان واحد لإنجاز الملفات والمهام اليومية بكفاءة.",passValueLead:"ابدأ بمهمة مجانية. اختر الباقة عندما تحتاج إلى استخدام مستمر أو معالجة الملفات دفعة واحدة.",
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
 return <div className="lx-home-hero-art" aria-hidden="true"><img src="/images/global-scene-20261114.webp" width={2172} height={724} alt="" fetchPriority="high" decoding="async"/></div>;
}

const SECURITY_COPY:Record<LingxiLang,{title:string;description:string}>={
 zh:{title:"安全可靠服务",description:"数据保护 · 稳定高效 · 可依赖"},
 en:{title:"Secure & Reliable",description:"Data protection · stability · dependable service"},
 ja:{title:"安全と信頼",description:"データ保護 · 安定性 · 信頼できるサービス"},
 ko:{title:"안전하고 신뢰할 수 있는 서비스",description:"데이터 보호 · 안정성 · 신뢰"},
 fr:{title:"Sécurité et fiabilité",description:"Protection des données · stabilité · confiance"},
 de:{title:"Sicher & zuverlässig",description:"Datenschutz · Stabilität · Verlässlichkeit"},
 es:{title:"Seguridad y confianza",description:"Protección de datos · estabilidad · confianza"},
 pt:{title:"Segurança e confiabilidade",description:"Proteção de dados · estabilidade · confiança"},
 ar:{title:"خدمات آمنة وموثوقة",description:"حماية البيانات · الاستقرار · الثقة"}
};
const DISTRIBUTION_COPY:Record<LingxiLang,{title:string;steps:string[]}>={
 zh:{title:"全球智能分发与合作",steps:["搜索入口","AI 搜索","全球分发","内容传播","合作网络","访问回流"]},
 en:{title:"Global Distribution & Partnerships",steps:["Search","AI discovery","Distribution","Content","Partners","Return visits"]},
 ja:{title:"グローバル配信とパートナーシップ",steps:["検索","AI検索","グローバル配信","コンテンツ","パートナー","再訪問"]},
 ko:{title:"글로벌 배포 및 파트너십",steps:["검색","AI 검색","글로벌 배포","콘텐츠","파트너","재방문"]},
 fr:{title:"Distribution mondiale et partenariats",steps:["Recherche","Recherche IA","Distribution","Contenu","Partenaires","Retour"]},
 de:{title:"Globale Verteilung & Partnerschaften",steps:["Suche","KI-Suche","Verteilung","Inhalte","Partner","Rückkehr"]},
 es:{title:"Distribución global y alianzas",steps:["Búsqueda","Búsqueda IA","Distribución","Contenido","Socios","Regreso"]},
 pt:{title:"Distribuição global e parcerias",steps:["Pesquisa","Pesquisa IA","Distribuição","Conteúdo","Parceiros","Retorno"]},
 ar:{title:"التوزيع العالمي والشراكات",steps:["البحث","بحث الذكاء الاصطناعي","التوزيع","المحتوى","الشركاء","العودة"]}
};

export function HomeGlobalGrowth({lang}:{lang:LingxiLang}){
 const copy=COPY[lang]||COPY.en;
 const security=SECURITY_COPY[lang]||SECURITY_COPY.en;
 const distribution=DISTRIBUTION_COPY[lang]||DISTRIBUTION_COPY.en;
 const features:Feature[]=[...copy.features,{icon:"privacy",title:security.title,description:security.description,href:"/privacy"}];
 const growthCardIcons:LingxiIconName[]=["recognition","sparkles","compare","sasi","connections","book"];
 const marketIcons:LingxiIconName[]=["recognition","sparkles","compare","book","connections"];
 return (
  <section id="global-growth-entrances" className="lx-home-growth-stack" aria-label={copy.growthTitle} data-growth-inventory="九语言搜索入口;124 个工具目录;AI 搜索资料;全球 SIAI 排行榜;SASI 智能软件市场;100+ 实用工具;网站合作;内容传播;二维码分享;分享来源统计;工具包无限使用;隐私与安全">
   <div className="lx-home-feature-strip">
    {features.map(item=>(
     <Link className="lx-home-feature-card" href={item.href} key={item.href}>
      <LingxiMiniIcon name={item.icon} size="title" className="lx-home-feature-icon"/>
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
       <div className="lx-home-growth-card-top"><LingxiMiniIcon name={growthCardIcons[index]||"tools"} size="title" className="lx-home-growth-card-icon"/><b>{item.tag}</b></div>
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
   </section>
   <HomeToolPassMembership/>
   <section className="lx-home-distribution" aria-labelledby="lx-home-distribution-title">
    <div className="lx-home-distribution-heading">
     <div><p className="lx-home-section-eyebrow">{lang==="zh"?"全球用户连接":"GLOBAL REACH"}</p><h2 id="lx-home-distribution-title">{lang==="zh"?"全球智能分发与合作":distribution.title}</h2><p>{lang==="zh"?"连接搜索入口、智能推荐、全球排行榜、内容传播与合作伙伴，让更多用户从发现走向实际使用。":"Connect discovery, intelligent search, global rankings, useful content and partners so more people can move from discovery to real use."}</p></div>
     <div className="lx-home-distribution-globe" aria-hidden="true"><svg viewBox="0 0 260 220" role="presentation">
      <defs><radialGradient id="lx-distribution-globe-fill" cx="35%" cy="28%" r="80%"><stop offset="0%" stopColor="#d9f5ff"/><stop offset="55%" stopColor="#8e9df5"/><stop offset="100%" stopColor="#6544c9"/></radialGradient><filter id="lx-distribution-glow"><feGaussianBlur stdDeviation="5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
      <g fill="none" strokeLinecap="round"><ellipse cx="130" cy="112" rx="119" ry="35" stroke="#9c86ef" strokeWidth="2" opacity=".7" transform="rotate(-17 130 112)"/><ellipse cx="130" cy="112" rx="108" ry="55" stroke="#d6b76f" strokeWidth="1.5" opacity=".65" transform="rotate(22 130 112)"/><ellipse cx="130" cy="112" rx="94" ry="94" stroke="#9aabff" strokeWidth="1.5" opacity=".5"/></g>
      <circle cx="130" cy="105" r="68" fill="url(#lx-distribution-globe-fill)" stroke="#fff" strokeWidth="2" filter="url(#lx-distribution-glow)"/><ellipse cx="130" cy="105" rx="30" ry="68" fill="none" stroke="#fff" strokeOpacity=".65"/><ellipse cx="130" cy="105" rx="68" ry="25" fill="none" stroke="#fff" strokeOpacity=".6"/>
      <path d="M94 75l17-12 17 5 8 15-8 11-18-2-8 12-16-9 2-13z M151 88l15-7 13 12-7 16-15 5-8-12z M113 126l17-7 13 12-4 17-17 4-13-13z" fill="#d5f5e9" fillOpacity=".62" stroke="#fff" strokeOpacity=".4"/>
      <g fill="#fff" filter="url(#lx-distribution-glow)"><circle cx="91" cy="104" r="3"/><circle cx="165" cy="73" r="3"/><circle cx="151" cy="145" r="2.5"/></g>
     </svg></div>
    </div>
    <nav className="lx-home-market-strip" aria-label={lang==="zh"?"全球分发与合作入口":"Global discovery and partner links"}>
     <Link className="lx-home-market-card" href="/tools"><LingxiMiniIcon name={marketIcons[0]} size="tiny" className="lx-home-market-icon"/><span><strong>{lang==="zh"?"搜索入口":"Search discovery"}</strong><small>{lang==="zh"?"按真实问题找到对应工具与教程":"Find tools and guides by task"}</small></span><b>→</b></Link>
     <Link className="lx-home-market-card" href="/about"><LingxiMiniIcon name={marketIcons[1]} size="tiny" className="lx-home-market-icon"/><span><strong>{lang==="zh"?"智能搜索入口":"Intelligent search"}</strong><small>{lang==="zh"?"让智能搜索准确了解平台与服务":"Help search services understand the platform"}</small></span><b>→</b></Link>
     <Link className="lx-home-market-card" href="/siai"><LingxiMiniIcon name={marketIcons[2]} size="tiny" className="lx-home-market-icon"/><span><strong>{lang==="zh"?"全球分发":"Global distribution"}</strong><small>{lang==="zh"?"比较模型能力、价格和使用条件":"Compare models, prices and access conditions"}</small></span><b>→</b></Link>
     <Link className="lx-home-market-card" href="/discoveries"><LingxiMiniIcon name={marketIcons[3]} size="tiny" className="lx-home-market-icon"/><span><strong>{lang==="zh"?"内容传播":"Useful content"}</strong><small>{lang==="zh"?"通过实用教程与真实场景持续分享":"Share practical guides and real use cases"}</small></span><b>→</b></Link>
     <Link className="lx-home-market-card" href="/partners"><LingxiMiniIcon name={marketIcons[4]} size="tiny" className="lx-home-market-icon"/><span><strong>{lang==="zh"?"全球合作网络":"Partner network"}</strong><small>{lang==="zh"?"连接网站、创作者与产品合作伙伴":"Connect websites, creators and product teams"}</small></span><b>→</b></Link>
    </nav>
    <div className="lx-home-growth-flywheel" aria-label={copy.flywheelTitle}><strong>{copy.flywheelTitle}</strong><div>{copy.flywheel.map((step,index)=><span key={step}><b>{step}</b>{index<copy.flywheel.length-1&&<i aria-hidden="true">→</i>}</span>)}</div></div>
   </section>
   <section className="lx-home-popular-tools" aria-labelledby="lx-home-tools-title">
    <div><h2 id="lx-home-tools-title">{copy.toolsTitle}</h2><p>{copy.passLead}</p></div>
    <nav>{copy.toolCategories.map(item=><Link href={item.href} key={item.title}>{item.title} <span aria-hidden="true">→</span></Link>)}</nav>
   </section>
  </section>
 );
}


export function HomeToolPassMembership(){
 const {lang}=useLingxiLang();
 const copy=COPY[lang]||COPY.en;
 const {currency}=usePreferredCurrency();
 const symbol=currency==="CNY"?"¥":"$";
 return (
  <section className="lx-home-toolpass-wrap" aria-label={copy.passTitle}>
   <section className="lx-home-toolpass" id="toolpass-membership" aria-labelledby="lx-home-toolpass-title">
    <div className="lx-home-toolpass-intro">
     <span className="lx-home-toolpass-crown" aria-hidden="true">♛</span>
     <p className="lx-home-section-eyebrow">TOOLPASS · ALL PRACTICAL TOOLS</p>
     <h2 id="lx-home-toolpass-title">{copy.passTitle}</h2>
     <p>{copy.passValueLead}</p>
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
  </section>
 );
}
