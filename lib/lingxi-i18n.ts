"use client";

import { useEffect, useState } from "react";
import {usePathname} from "next/navigation";

export type LingxiLang="zh"|"en"|"ja"|"ko"|"fr"|"de"|"es"|"pt"|"ar";
export const LANG_NAMES:Record<LingxiLang,string>={
  zh:"中文",en:"English",ja:"日本語",ko:"한국어",fr:"Français",de:"Deutsch",es:"Español",pt:"Português",ar:"العربية"
};

const ZH={
 brand:"灵犀场",brandFull:"灵犀场 LINGXIFIELD",sasiBrand:"灵犀场 SASI",
 newTask:"新任务",search:"搜索工具、功能或输入问题…",create:"开始使用",recharge:"充值",account:"账户",updates:"更新",
 start:"开始",sasi:"SASI",fieldGroup:"灵犀场",
 home:"首页",tools:"实用工具",studio:"SASI 智能软件市场",books:"文档工具",learning:"工具包",research:"全球 SIAI 排行榜",
 wallet:"余额",myField:"账户",
 light:"浅色",dark:"深色",language:"语言",
 footerLine:"易懂易做，一键即达。让一个念头找到路径，让想法从这里开始生长。",
 follow:"关注灵犀场",service:"服务号",miniapp:"小程序",terms:"用户服务协议",privacy:"隐私政策",declaration:"系统声明",refunds:"充值与退款",sasiRules:"SASI 创作规则",
 homeKicker:"一键创造，一念即达。",homeTitle:"今天想让什么开始发生？",
 homeLead:"不必先知道该选哪个工具，也不用绕过复杂步骤。把问题、资料或一个还没成形的念头带进来，灵犀场帮你找到入口，再把下一步交到你手里。",
 homePlaceholder:"例如：压缩一份 PDF；识别扫描合同中的文字；把多张图片拼成长图；或比较不同 AI 模型的真实价格……",
 begin:"开始 →",betterFrom:"更适合从",specificProblem:"先解决一个具体问题",growIdea:"让一个想法开始生长",
 fromHere:"从这里开始",easyReach:"易懂易做，一键即达",homeSectionLead:"不把功能堆给你，而是把入口整理好。需要什么，就从对应的门进去。",
 continueIn:"继续向内",changePath:"让变化有路径，也有回声",changePathLead:"有些问题需要被处理，有些问题需要被看见。灵犀场把两者放在同一座场里。",
 homeNoteA:"灵犀场不是一排按钮。",homeNoteB:"它更像一条从念头到结果的路。",homeNoteC:"实用工具处理文件，全球 SIAI 排行榜帮助比较模型，SASI 智能软件市场负责软件展示、审核与交付。",
 open:"进入 →",expand:"继续展开 →",
 toolsHero:"常用文件与媒体问题，直接处理。",toolsLead:"PDF、图片、视频、字幕、表格、网页、隐私文件与日常识别，打开即可处理并得到结果。",
 toolCount:"项实用工具",toolSearch:"搜索：PDF 压缩、图片去水印、视频转文字、表格转换…",all:"全部",local:"本地处理",online:"在线能力",
 noTool:"没有找到完全匹配的工具。",noToolLead:"你也可以直接在顶部搜索框描述问题，灵犀场会继续帮你找到入口。",
 sasiKicker:"灵犀场 SASI",sasiTitle:"浏览、发布与交付软件",sasiLead:"SASI 智能软件市场面向成品软件与源码产品，支持卖家提交资料、平台审核、订单支付与安全自动交付。",
 sasiPlaceholder:"例如：发布一个 MT5 EA 源码包，补充版本、适用环境、安装说明与授权范围；或查找已审核的软件产品。",
 attachment:"附件",connections:"连接",auto:"自动判断",visual:"视频与音频工具",webapp:"软件产品",researchMode:"模型对比",
 creationEntry:"软件发布入口",wantResult:"想完成什么，就从哪里开始。",oldExit:"当前公开入口统一指向软件市场与实用工具，历史订单和已取得权益按原规则保留。",
 available:"可进入",coming:"待上线",connecting:"正在接入 →",
 skillsLead:"按任务选择工具，查看支持格式、处理限制和结果交付方式。",connectTitle:"需要外部能力时，再把它接进来。",
 connectLead:"GitHub、Vercel、Supabase、模型 API 与其他服务不再散落在多个页面。连接入口统一放在这里。",
 openConnect:"打开连接中心 →",balanceTitle:"工具与平台服务统一余额入口",balanceLead:"在线工具与平台服务按实际权益结算；软件市场订单按订单支付渠道处理。",viewBalance:"查看余额与充值 →",
 walletTitle:"余额与订单记录",walletLead:"在线工具和平台服务按实际权益结算；软件市场订单按订单支付渠道处理。",
 current:"当前可用",principal:"充值本金",bonus:"赠送额度",refundable:"未使用可退款本金",balanceState:"余额状态",
 topupKicker:"补充余额",topupTitle:"按需充值，按实际权益使用",topupLead:"充值用于在线工具与平台服务，支付记录和权益发放可在账户中核对。",
 common:"常用",thisTopup:"这次补充",continueTopup:"继续充值 →",topupFine:"支付成功后会回到这里。余额到账后无需再次开通任何会员或套餐。",
 intelligence:"工具权益",intTitle:"按任务选择合适的工具",intLead:"查看每项工具支持的格式、处理限制、权益范围与结果交付方式。",
 lite:"轻量",standard:"标准",high:"高智能",invite:"邀请",inviteTitle:"把入口分享给真正会用到的人。",records:"退款与记录",recordsTitle:"未使用的充值本金，按原充值记录核对。",
 generateInvite:"生成邀请链接",copy:"复制",orders:"查看充值记录 →",refundRules:"查看退款规则 →",
 updateTitle:"灵犀场更新",update1:"全球 SIAI 排行榜、100+ 实用工具与 SASI 软件市场持续更新。",update2:"订单、支付与工具处理记录统一归档，文件结果可按权限下载。"
} as const;
type Key=keyof typeof ZH;

const EN:Partial<Record<Key,string>>={
 brand:"LINGXIFIELD",brandFull:"LINGXIFIELD",sasiBrand:"LINGXIFIELD SASI",newTask:"New task",search:"Search tools, features, or describe your problem…",create:"Get started",recharge:"Top up",account:"Account",updates:"Updates",
 start:"Start",fieldGroup:"LingxiField",home:"Home",tools:"Tools",studio:"SASI Software Marketplace",books:"Document tools",learning:"ToolPass",research:"Global SIAI Rankings",wallet:"Balance",myField:"My Account",light:"Light",dark:"Dark",language:"Language",
 footerLine:"Easy to understand, easy to do, one step closer. Give an idea a path and let it begin to grow.",follow:"Follow LingxiField",service:"WeChat",miniapp:"Mini Program",terms:"Terms",privacy:"Privacy",declaration:"System Notice",refunds:"Top-ups & Refunds",sasiRules:"SASI Rules",
 homeKicker:"One thought · One path",homeTitle:"What would you like to set in motion today?",homeLead:"You do not need to know the right tool first. Bring a problem, a document, or an unfinished idea. LingxiField finds the entry point and hands you the next step.",homePlaceholder:"For example: compress a PDF; extract text from a scanned contract with OCR; stitch images into one long image; or compare real AI model pricing…",begin:"Start →",betterFrom:"Best place to start",specificProblem:"Solve one concrete problem",growIdea:"Let an idea begin to grow",fromHere:"Start here",easyReach:"Clear, simple, within reach",homeSectionLead:"We do not dump features on you. We arrange the entrances so you can step directly into what you need.",continueIn:"Go deeper",changePath:"Give change a path and an echo",changePathLead:"Some problems need action; others need to be seen. LingxiField keeps both in the same space.",homeNoteA:"LingxiField is not a wall of buttons.",homeNoteB:"It is a path from thought to result.",homeNoteC:"Practical tools handle files, Global SIAI Rankings compare models, and the SASI Software Marketplace handles software listings, review and delivery.",open:"Open →",expand:"Explore →",
 toolsHero:"One less detour makes everything faster.",toolsLead:"Images, PDFs, video, subtitles, privacy and everyday file problems all start here. If it can stay in your browser, we keep it there.",toolCount:"entries on the surface",toolSearch:"Search: PDF compression, watermark cleanup, calories, video transcription…",all:"All",local:"Local",online:"Online",noTool:"No exact tool match found.",noToolLead:"Describe the problem in the top search box and LingxiField will keep looking for the right entrance.",
 sasiKicker:"LINGXIFIELD SASI",sasiTitle:"Browse, publish and deliver software",sasiLead:"SASI is a marketplace for finished software and source packages, with seller submissions, platform review, verified payments and secure digital delivery.",sasiPlaceholder:"For example: publish an MT5 EA source package with version, compatibility, installation instructions and license scope; or browse reviewed software.",attachment:"Attachment",connections:"Connections",auto:"Auto",visual:"Video and audio tools",webapp:"Software products",researchMode:"Model comparison",creationEntry:"Software publishing",wantResult:"Start from the result you want.",oldExit:"Public entry points now focus on the software marketplace and practical tools; existing orders and entitlements remain preserved.",available:"Available",coming:"Coming soon",connecting:"Connecting →",skillsLead:"Choose a tool by task and review supported formats, processing limits and result delivery.",connectTitle:"Connect external capability only when you need it.",connectLead:"GitHub, Vercel, Supabase, model APIs and other services now share one connection center.",openConnect:"Open connection center →",balanceTitle:"One balance for tools and platform services",balanceLead:"Online tools and platform services follow their stated entitlements; software-market orders use the payment channel shown on each order.",viewBalance:"View balance & top up →",
 walletTitle:"Balance and order history",walletLead:"Online tools and platform services follow their stated entitlements; software-market orders use the payment channel shown on each order.",current:"Available now",principal:"Top-up principal",bonus:"Bonus balance",refundable:"Unused refundable principal",balanceState:"Balance state",topupKicker:"Add balance",topupTitle:"Add balance when needed",topupLead:"Top-ups are used for online tools and platform services; payment records and entitlements can be checked in the account.",common:"Common",thisTopup:"This top-up",continueTopup:"Continue →",topupFine:"After payment you return here. No membership or package needs to be activated.",intelligence:"Tool entitlements",intTitle:"Choose the right tool for each task",intLead:"Review supported formats, processing limits, entitlement scope and result delivery for each tool.",lite:"Light",standard:"Standard",high:"High",invite:"Invite",inviteTitle:"Share the entrance with someone who will actually use it.",records:"Refunds & records",recordsTitle:"Unused principal is checked against the original top-up record.",generateInvite:"Create invite link",copy:"Copy",orders:"View top-up records →",refundRules:"View refund rules →",updateTitle:"LingxiField updates",update1:"Global SIAI Rankings, 100+ practical tools and the SASI Software Marketplace are continuously updated.",update2:"Orders, payments and tool-processing records are organized together; file results can be downloaded according to access rights."
};

const commonNav=(home:string,tools:string,studio:string,books:string,learning:string,research:string,field:string,manifest:string,sub:string,practice:string,wallet:string,myField:string,newTask:string,search:string,create:string,recharge:string,account:string,updates:string,start:string,fieldGroup:string,light:string,dark:string,language:string)=>({home,tools,studio,books,learning,research,field,manifest,subconscious:sub,practice,wallet,myField,newTask,search,create,recharge,account,updates,start,fieldGroup,light,dark,language});
const JA:Partial<Record<Key,string>>={
 brand:"霊犀場",brandFull:"霊犀場 LINGXIFIELD",sasiBrand:"霊犀場 SASI",
 newTask:"新しいタスク",search:"ツールや機能を検索、または質問を入力…",create:"利用開始",recharge:"チャージ",account:"アカウント",updates:"更新",
 start:"開始",sasi:"SASI",fieldGroup:"霊犀場",
 home:"ホーム",tools:"実用ツール",studio:"SASIソフトウェア市場",books:"文書ツール",learning:"ツールパッケージ",research:"グローバルSIAIランキング",
 wallet:"残高",myField:"マイアカウント",
 light:"ライト",dark:"ダーク",language:"言語",
 footerLine:"わかりやすく、すぐに実行へ。ひとつの思いに道筋を与え、ここから形にしていきます。",
 follow:"霊犀場をフォロー",service:"公式アカウント",miniapp:"ミニアプリ",terms:"利用規約",privacy:"プライバシーポリシー",declaration:"システム声明",refunds:"チャージと返金",sasiRules:"SASI 制作ルール",
 homeKicker:"一念即達 · 一念顕化",homeTitle:"今日は何を動かしたいですか？",
 homeLead:"最初から正しいツールを知っている必要はありません。問題、資料、まだ形になっていないアイデアを持ち込めば、霊犀場が入口を見つけ、次の一歩につなげます。",
 homePlaceholder:"例：PDFを圧縮する／スキャンした契約書からOCRで文字を抽出する／複数画像を長い画像に結合する／AIモデルの実価格を比較する…",
 begin:"始める →",betterFrom:"ここから始めるのがおすすめ",specificProblem:"具体的な問題をひとつ解決する",growIdea:"アイデアを育て始める",
 fromHere:"ここから始める",easyReach:"わかりやすく、すぐ届く",homeSectionLead:"機能を並べるのではなく、必要な入口を整理しています。目的に合う扉から、そのまま入れます。",
 continueIn:"さらに深く",changePath:"変化に道筋と反響を",changePathLead:"行動が必要な問題もあれば、まず見つめる必要がある問題もあります。霊犀場はその両方をひとつの場に置きます。",
 homeNoteA:"霊犀場は、ただのボタン一覧ではありません。",homeNoteB:"思いから結果へ進むための道に近い存在です。",homeNoteC:"実用ツールでファイルを処理し、グローバルSIAIランキングでモデルを比較し、SASIソフトウェア市場で商品掲載・審査・納品を行います。",
 open:"開く →",expand:"さらに見る →",
 toolsHero:"ひと手間減らせば、もっと速く進めます。",toolsLead:"画像、PDF、動画、字幕、プライバシー、日常のファイル問題をここから解決できます。ブラウザ内で完結できるものは、できるだけアップロードしません。",
 toolCount:"個の入口を公開中",toolSearch:"検索：PDF 圧縮、画像透かし除去、カロリー、動画文字起こし…",all:"すべて",local:"ローカル処理",online:"オンライン",
 noTool:"完全に一致するツールが見つかりません。",noToolLead:"上部の検索欄に困りごとをそのまま書けば、霊犀場が引き続き入口を探します。",
 sasiKicker:"霊犀場 SASI",sasiTitle:"ソフトウェアを閲覧・公開・納品",sasiLead:"SASIは完成ソフトウェアとソースパッケージの市場です。出品申請、プラットフォーム審査、決済確認、安全なデジタル納品に対応します。",
 sasiPlaceholder:"例：バージョン、対応環境、インストール手順、ライセンス範囲を記載してMT5 EAソースを公開する、または審査済みソフトを探す。",
 attachment:"添付",connections:"接続",auto:"自動判断",visual:"動画・音声ツール",webapp:"ソフトウェア製品",researchMode:"モデル比較",
 creationEntry:"ソフトウェア公開",wantResult:"やりたいことから、そのまま始める。",oldExit:"公開入口はソフトウェア市場と実用ツールに統一し、過去の注文と権利は従来の規則に従って保持します。",
 available:"利用可能",coming:"近日公開",connecting:"接続中 →",
 skillsLead:"タスクに応じてツールを選び、対応形式・処理制限・結果の受け取り方を確認できます。",connectTitle:"外部能力が必要な時だけ接続します。",
 connectLead:"GitHub、Vercel、Supabase、モデル API などを複数ページに散らさず、接続入口をひとつにまとめています。",
 openConnect:"接続センターを開く →",balanceTitle:"ツールとプラットフォームサービスの共通残高",balanceLead:"オンラインツールとプラットフォームサービスは表示された権利に従い、ソフトウェア市場の注文は注文ごとの決済手段で処理します。",viewBalance:"残高とチャージを見る →",
 walletTitle:"残高と注文履歴",walletLead:"オンラインツールとプラットフォームサービスは表示された権利に従い、ソフトウェア市場の注文は注文ごとの決済手段で処理します。",
 current:"現在利用可能",principal:"チャージ元金",bonus:"ボーナス残高",refundable:"未使用・返金可能元金",balanceState:"残高状態",
 topupKicker:"残高を追加",topupTitle:"必要な分だけチャージ",topupLead:"チャージはオンラインツールとプラットフォームサービスに使用され、支払い記録と権利はアカウントで確認できます。",
 common:"よく使う",thisTopup:"今回の追加",continueTopup:"チャージを続ける →",topupFine:"支払い後はこのページに戻ります。別の会員登録やプラン開通は不要です。",
 intelligence:"ツールの利用権",intTitle:"タスクに合ったツールを選択",intLead:"各ツールの対応形式、処理制限、利用権の範囲、結果の受け取り方を確認できます。",
 lite:"軽量",standard:"標準",high:"高知能",invite:"招待",inviteTitle:"本当に使う人に入口を共有する。",records:"返金と記録",recordsTitle:"未使用元金は元のチャージ記録に基づいて確認します。",
 generateInvite:"招待リンクを作成",copy:"コピー",orders:"チャージ履歴を見る →",refundRules:"返金ルールを見る →",
 updateTitle:"霊犀場の更新",update1:"グローバルSIAIランキング、100以上の実用ツール、SASIソフトウェア市場を継続更新します。",update2:"注文・支払い・ツール処理記録を一元管理し、権限に応じて結果ファイルをダウンロードできます。"
};

const KO:Partial<Record<Key,string>>={
 brand:"링시필드",brandFull:"링시필드 LINGXIFIELD",sasiBrand:"링시필드 SASI",
 newTask:"새 작업",search:"도구와 기능을 검색하거나 질문을 입력하세요…",create:"시작하기",recharge:"충전",account:"계정",updates:"업데이트",
 start:"시작",sasi:"SASI",fieldGroup:"링시필드",
 home:"홈",tools:"실용 도구",studio:"SASI 소프트웨어 마켓",books:"문서 도구",learning:"도구 패키지",research:"글로벌 SIAI 순위",
 wallet:"잔액",myField:"내 계정",
 light:"라이트",dark:"다크",language:"언어",
 footerLine:"쉽게 이해하고 바로 실행하세요. 하나의 생각에 길을 만들고 여기서부터 자라게 합니다.",
 follow:"링시필드 팔로우",service:"공식 계정",miniapp:"미니앱",terms:"이용약관",privacy:"개인정보 처리방침",declaration:"시스템 안내",refunds:"충전 및 환불",sasiRules:"SASI 제작 규칙",
 homeKicker:"한 생각 · 한 경로",homeTitle:"오늘 무엇을 움직이게 하고 싶나요?",
 homeLead:"처음부터 어떤 도구를 써야 할지 알 필요는 없습니다. 문제, 자료, 아직 형태가 없는 아이디어를 가져오면 링시필드가 입구를 찾고 다음 단계로 연결합니다.",
 homePlaceholder:"예: PDF 압축, 스캔 계약서에서 OCR로 텍스트 추출, 여러 이미지를 긴 이미지로 결합, AI 모델의 실제 가격 비교…",
 begin:"시작 →",betterFrom:"여기서 시작하는 것이 좋아요",specificProblem:"구체적인 문제 하나 해결하기",growIdea:"아이디어를 키우기 시작하기",
 fromHere:"여기서 시작",easyReach:"쉽고 명확하게, 바로 도달",homeSectionLead:"기능을 쌓아두지 않고 필요한 입구를 정리했습니다. 원하는 문으로 바로 들어가세요.",
 continueIn:"더 깊이",changePath:"변화에 경로와 메아리를",changePathLead:"어떤 문제는 행동이 필요하고, 어떤 문제는 먼저 바라봐야 합니다. 링시필드는 두 가지를 같은 공간에 둡니다.",
 homeNoteA:"링시필드는 버튼 목록이 아닙니다.",homeNoteB:"생각에서 결과로 가는 하나의 길에 가깝습니다.",homeNoteC:"실용 도구로 파일을 처리하고 글로벌 SIAI 순위로 모델을 비교하며 SASI 소프트웨어 마켓에서 상품 등록·심사·전달을 제공합니다.",
 open:"열기 →",expand:"더 보기 →",
 toolsHero:"한 단계를 줄이면 더 빨라집니다.",toolsLead:"이미지, PDF, 영상, 자막, 개인정보, 일상 파일 문제를 여기서 해결하세요. 브라우저 안에서 끝낼 수 있는 것은 되도록 업로드하지 않습니다.",
 toolCount:"개의 입구 공개",toolSearch:"검색: PDF 압축, 이미지 워터마크 제거, 칼로리, 영상 전사…",all:"전체",local:"로컬 처리",online:"온라인",
 noTool:"정확히 일치하는 도구를 찾지 못했습니다.",noToolLead:"상단 검색창에 문제를 그대로 적으면 링시필드가 계속 입구를 찾아드립니다.",
 sasiKicker:"링시필드 SASI",sasiTitle:"소프트웨어 탐색·게시·전달",sasiLead:"SASI는 완성 소프트웨어와 소스 패키지 마켓입니다. 판매자 제출, 플랫폼 심사, 결제 확인 및 안전한 디지털 전달을 지원합니다.",
 sasiPlaceholder:"예: 버전, 호환 환경, 설치 안내, 라이선스 범위를 기재해 MT5 EA 소스 패키지를 게시하거나 심사 완료 소프트웨어를 찾아보세요.",
 attachment:"첨부",connections:"연결",auto:"자동 판단",visual:"영상·오디오 도구",webapp:"소프트웨어 제품",researchMode:"모델 비교",
 creationEntry:"소프트웨어 게시",wantResult:"원하는 결과에서 바로 시작하세요.",oldExit:"공개 진입점은 소프트웨어 마켓과 실용 도구로 통합되며 기존 주문과 권리는 기존 규칙에 따라 보존됩니다.",
 available:"사용 가능",coming:"곧 공개",connecting:"연결 중 →",
 skillsLead:"작업에 맞는 도구를 선택하고 지원 형식, 처리 제한, 결과 전달 방식을 확인하세요.",connectTitle:"외부 기능이 필요할 때만 연결하세요.",
 connectLead:"GitHub, Vercel, Supabase, 모델 API와 기타 서비스를 여러 페이지에 흩어놓지 않고 한 곳에서 연결합니다.",
 openConnect:"연결 센터 열기 →",balanceTitle:"도구 및 플랫폼 서비스 통합 잔액",balanceLead:"온라인 도구와 플랫폼 서비스는 표시된 권한에 따라 처리하며 소프트웨어 마켓 주문은 주문별 결제 수단으로 처리합니다.",viewBalance:"잔액 및 충전 보기 →",
 walletTitle:"잔액 및 주문 내역",walletLead:"온라인 도구와 플랫폼 서비스는 표시된 권한에 따라 처리하며 소프트웨어 마켓 주문은 주문별 결제 수단으로 처리합니다.",
 current:"현재 사용 가능",principal:"충전 원금",bonus:"보너스 잔액",refundable:"미사용 환불 가능 원금",balanceState:"잔액 상태",
 topupKicker:"잔액 추가",topupTitle:"필요할 때 잔액 충전",topupLead:"충전 잔액은 온라인 도구와 플랫폼 서비스에 사용되며 결제 기록과 권한은 계정에서 확인할 수 있습니다.",
 common:"자주 사용",thisTopup:"이번 충전",continueTopup:"계속 충전 →",topupFine:"결제 후 이곳으로 돌아옵니다. 별도의 멤버십이나 패키지 활성화가 필요하지 않습니다.",
 intelligence:"도구 이용 권한",intTitle:"작업에 맞는 도구 선택",intLead:"각 도구의 지원 형식, 처리 제한, 이용 권한 및 결과 전달 방식을 확인하세요.",
 lite:"라이트",standard:"표준",high:"고지능",invite:"초대",inviteTitle:"실제로 사용할 사람에게 입구를 공유하세요.",records:"환불 및 기록",recordsTitle:"미사용 원금은 원래 충전 기록을 기준으로 확인합니다.",
 generateInvite:"초대 링크 생성",copy:"복사",orders:"충전 기록 보기 →",refundRules:"환불 규정 보기 →",
 updateTitle:"링시필드 업데이트",update1:"글로벌 SIAI 순위, 100개 이상의 실용 도구 및 SASI 소프트웨어 마켓을 지속적으로 업데이트합니다.",update2:"주문, 결제 및 도구 처리 기록을 통합 관리하고 권한에 따라 결과 파일을 다운로드할 수 있습니다."
};

const FR:Partial<Record<Key,string>>={
 brand:"LINGXIFIELD",brandFull:"LINGXIFIELD",sasiBrand:"LINGXIFIELD SASI",
 newTask:"Nouvelle tâche",search:"Recherchez un outil, une fonction ou décrivez votre besoin…",create:"Commencer",recharge:"Recharger",account:"Compte",updates:"Nouveautés",
 start:"Départ",sasi:"SASI",fieldGroup:"LingxiField",
 home:"Accueil",tools:"Outils",studio:"Marché de logiciels SASI",books:"Outils documentaires",learning:"Pack d’outils",research:"Classement SIAI mondial",
 wallet:"Solde",myField:"Mon compte",
 light:"Clair",dark:"Sombre",language:"Langue",
 footerLine:"Simple à comprendre, simple à faire. Donnez un chemin à une idée et laissez-la commencer à grandir ici.",
 follow:"Suivre LingxiField",service:"Compte officiel",miniapp:"Mini-programme",terms:"Conditions d’utilisation",privacy:"Confidentialité",declaration:"Avis système",refunds:"Recharges et remboursements",sasiRules:"Règles SASI",
 homeKicker:"Une idée · Un chemin",homeTitle:"Que voulez-vous mettre en mouvement aujourd’hui ?",
 homeLead:"Vous n’avez pas besoin de connaître le bon outil à l’avance. Apportez un problème, un document ou une idée encore floue : LingxiField trouve l’entrée adaptée et vous donne l’étape suivante.",
 homePlaceholder:"Ex. : compresser un PDF ; extraire le texte d’un contrat numérisé avec OCR ; assembler des images en une longue image ; comparer les prix réels des modèles IA…",
 begin:"Commencer →",betterFrom:"Bon point de départ",specificProblem:"Résoudre un problème concret",growIdea:"Faire grandir une idée",
 fromHere:"Commencer ici",easyReach:"Clair, simple, à portée de main",homeSectionLead:"Nous n’empilons pas les fonctions. Nous organisons les entrées pour que vous puissiez aller directement à ce dont vous avez besoin.",
 continueIn:"Aller plus loin",changePath:"Donner un chemin et un écho au changement",changePathLead:"Certains problèmes demandent une action, d’autres demandent d’abord d’être vus. LingxiField réunit les deux dans un même espace.",
 homeNoteA:"LingxiField n’est pas un mur de boutons.",homeNoteB:"C’est plutôt un chemin qui va de l’idée au résultat.",homeNoteC:"Les outils pratiques traitent les fichiers, le classement SIAI compare les modèles et le marché SASI gère les annonces, l’examen et la livraison.",
 open:"Ouvrir →",expand:"Explorer →",
 toolsHero:"Un détour de moins, et tout va plus vite.",toolsLead:"Images, PDF, vidéo, sous-titres, confidentialité et fichiers du quotidien : tout commence ici. Ce qui peut rester dans le navigateur y reste autant que possible.",
 toolCount:"entrées disponibles",toolSearch:"Rechercher : compression PDF, suppression de filigrane, calories, transcription vidéo…",all:"Tout",local:"Local",online:"En ligne",
 noTool:"Aucun outil ne correspond exactement.",noToolLead:"Décrivez votre besoin dans la barre de recherche et LingxiField continuera à chercher la bonne entrée.",
 sasiKicker:"LINGXIFIELD SASI",sasiTitle:"Parcourir, publier et livrer des logiciels",sasiLead:"SASI est un marché de logiciels finis et de sources, avec dépôt vendeur, examen de la plateforme, paiement vérifié et livraison numérique sécurisée.",
 sasiPlaceholder:"Ex. : publier un package source MT5 EA avec version, compatibilité, installation et licence, ou parcourir les logiciels vérifiés.",
 attachment:"Pièce jointe",connections:"Connexions",auto:"Auto",visual:"Outils vidéo et audio",webapp:"Produits logiciels",researchMode:"Comparaison de modèles",
 creationEntry:"Publication de logiciels",wantResult:"Partez du résultat que vous voulez.",oldExit:"Les accès publics sont désormais centrés sur le marché logiciel et les outils pratiques ; les commandes et droits existants sont conservés.",
 available:"Disponible",coming:"Bientôt",connecting:"Connexion →",
 skillsLead:"Choisissez un outil par tâche et vérifiez les formats, limites et modalités de livraison du résultat.",connectTitle:"Connectez une capacité externe seulement quand vous en avez besoin.",
 connectLead:"GitHub, Vercel, Supabase, les API de modèles et les autres services sont réunis dans un seul centre de connexion.",
 openConnect:"Ouvrir le centre de connexion →",balanceTitle:"Solde commun pour les outils et services",balanceLead:"Les outils et services suivent les droits affichés ; les commandes du marché logiciel utilisent le moyen de paiement indiqué.",viewBalance:"Voir le solde et recharger →",
 walletTitle:"Solde et historique des commandes",walletLead:"Les outils et services suivent les droits affichés ; les commandes du marché logiciel utilisent le moyen de paiement indiqué.",
 current:"Disponible maintenant",principal:"Principal rechargé",bonus:"Solde bonus",refundable:"Principal inutilisé remboursable",balanceState:"État du solde",
 topupKicker:"Ajouter du solde",topupTitle:"Recharger selon les besoins",topupLead:"Les recharges servent aux outils en ligne et aux services de la plateforme ; les paiements et droits sont consultables dans le compte.",
 common:"Courant",thisTopup:"Cette recharge",continueTopup:"Continuer →",topupFine:"Après le paiement, vous revenez ici. Aucun abonnement ni forfait supplémentaire n’est à activer.",
 intelligence:"Droits d’utilisation des outils",intTitle:"Choisir l’outil adapté à chaque tâche",intLead:"Consultez les formats pris en charge, les limites, les droits et les modalités de livraison du résultat.",
 lite:"Léger",standard:"Standard",high:"Haute intelligence",invite:"Inviter",inviteTitle:"Partagez l’entrée avec les personnes qui en auront réellement besoin.",records:"Remboursements et historique",recordsTitle:"Le principal inutilisé est vérifié par rapport à la recharge d’origine.",
 generateInvite:"Créer un lien d’invitation",copy:"Copier",orders:"Voir les recharges →",refundRules:"Voir les règles de remboursement →",
 updateTitle:"Nouveautés LingxiField",update1:"Le classement SIAI, plus de 100 outils et le marché SASI sont mis à jour en continu.",update2:"Les commandes, paiements et traitements sont centralisés ; les fichiers sont téléchargeables selon les droits."
};

const DE:Partial<Record<Key,string>>={
 brand:"LINGXIFIELD",brandFull:"LINGXIFIELD",sasiBrand:"LINGXIFIELD SASI",
 newTask:"Neue Aufgabe",search:"Werkzeuge und Funktionen suchen oder Frage eingeben…",create:"Loslegen",recharge:"Aufladen",account:"Konto",updates:"Neuigkeiten",
 start:"Start",sasi:"SASI",fieldGroup:"LingxiField",
 home:"Startseite",tools:"Werkzeuge",studio:"SASI-Softwaremarkt",books:"Dokumentwerkzeuge",learning:"Tool-Paket",research:"Globales SIAI-Ranking",
 wallet:"Guthaben",myField:"Mein Konto",
 light:"Hell",dark:"Dunkel",language:"Sprache",
 footerLine:"Leicht zu verstehen, leicht umzusetzen. Gib einer Idee einen Weg und lass sie hier wachsen.",
 follow:"LingxiField folgen",service:"Offizielles Konto",miniapp:"Mini-App",terms:"Nutzungsbedingungen",privacy:"Datenschutz",declaration:"Systemhinweis",refunds:"Aufladungen & Erstattungen",sasiRules:"SASI-Regeln",
 homeKicker:"Ein Gedanke · Ein Weg",homeTitle:"Was möchten Sie heute in Bewegung bringen?",
 homeLead:"Sie müssen nicht vorher wissen, welches Werkzeug das richtige ist. Bringen Sie ein Problem, ein Dokument oder eine unfertige Idee mit — LingxiField findet den Einstieg und den nächsten Schritt.",
 homePlaceholder:"Zum Beispiel: ein PDF komprimieren; Text aus einem gescannten Vertrag per OCR extrahieren; Bilder zu einem langen Bild zusammenfügen; echte KI-Modellpreise vergleichen…",
 begin:"Start →",betterFrom:"Guter Ausgangspunkt",specificProblem:"Ein konkretes Problem lösen",growIdea:"Eine Idee wachsen lassen",
 fromHere:"Hier beginnen",easyReach:"Klar, einfach, direkt erreichbar",homeSectionLead:"Wir stapeln keine Funktionen. Wir ordnen die Eingänge so, dass Sie direkt zu dem gelangen, was Sie brauchen.",
 continueIn:"Tiefer gehen",changePath:"Veränderung braucht einen Weg und ein Echo",changePathLead:"Manche Probleme brauchen Handlung, andere müssen zuerst gesehen werden. LingxiField bringt beides in denselben Raum.",
 homeNoteA:"LingxiField ist keine Wand aus Buttons.",homeNoteB:"Es ist eher ein Weg vom Gedanken zum Ergebnis.",homeNoteC:"Praktische Tools bearbeiten Dateien, das SIAI-Ranking vergleicht Modelle und der SASI-Softwaremarkt verwaltet Angebote, Prüfung und Auslieferung.",
 open:"Öffnen →",expand:"Mehr entdecken →",
 toolsHero:"Ein Umweg weniger macht alles schneller.",toolsLead:"Bilder, PDFs, Videos, Untertitel, Datenschutz und alltägliche Dateiprobleme beginnen hier. Was im Browser bleiben kann, bleibt möglichst dort.",
 toolCount:"Einstiege verfügbar",toolSearch:"Suchen: PDF komprimieren, Wasserzeichen entfernen, Kalorien, Video-Transkription…",all:"Alle",local:"Lokal",online:"Online",
 noTool:"Kein exakt passendes Werkzeug gefunden.",noToolLead:"Beschreiben Sie das Problem oben in der Suche; LingxiField sucht weiter nach dem richtigen Einstieg.",
 sasiKicker:"LINGXIFIELD SASI",sasiTitle:"Software entdecken, veröffentlichen und ausliefern",sasiLead:"SASI ist ein Marktplatz für fertige Software und Quellpakete mit Anbieter-Einreichung, Plattformprüfung, bestätigter Zahlung und sicherer digitaler Auslieferung.",
 sasiPlaceholder:"Zum Beispiel ein MT5-EA-Quellpaket mit Version, Kompatibilität, Installation und Lizenz veröffentlichen oder geprüfte Software durchsuchen.",
 attachment:"Anhang",connections:"Verbindungen",auto:"Automatisch",visual:"Video- und Audiowerkzeuge",webapp:"Softwareprodukte",researchMode:"Modellvergleich",
 creationEntry:"Software veröffentlichen",wantResult:"Starten Sie mit dem Ergebnis, das Sie möchten.",oldExit:"Öffentliche Einstiege konzentrieren sich jetzt auf Softwaremarkt und praktische Tools; bestehende Bestellungen und Ansprüche bleiben erhalten.",
 available:"Verfügbar",coming:"Demnächst",connecting:"Wird verbunden →",
 skillsLead:"Wählen Sie ein Tool nach Aufgabe und prüfen Sie Formate, Grenzen und Ergebnisbereitstellung.",connectTitle:"Externe Fähigkeiten nur bei Bedarf verbinden.",
 connectLead:"GitHub, Vercel, Supabase, Modell-APIs und andere Dienste sind in einem einzigen Verbindungszentrum gebündelt.",
 openConnect:"Verbindungszentrum öffnen →",balanceTitle:"Ein Guthaben für Tools und Plattformdienste",balanceLead:"Online-Tools und Plattformdienste richten sich nach den ausgewiesenen Ansprüchen; Softwaremarkt-Bestellungen verwenden den jeweiligen Zahlungsweg.",viewBalance:"Guthaben & Aufladen →",
 walletTitle:"Guthaben und Bestellverlauf",walletLead:"Online-Tools und Plattformdienste richten sich nach den ausgewiesenen Ansprüchen; Softwaremarkt-Bestellungen verwenden den jeweiligen Zahlungsweg.",
 current:"Jetzt verfügbar",principal:"Aufladebetrag",bonus:"Bonusguthaben",refundable:"Nicht genutzter erstattbarer Betrag",balanceState:"Guthabenstatus",
 topupKicker:"Guthaben hinzufügen",topupTitle:"Guthaben bei Bedarf aufladen",topupLead:"Aufladungen dienen Online-Tools und Plattformdiensten; Zahlungen und Ansprüche sind im Konto einsehbar.",
 common:"Beliebt",thisTopup:"Diese Aufladung",continueTopup:"Weiter →",topupFine:"Nach der Zahlung kehren Sie hierher zurück. Keine zusätzliche Mitgliedschaft oder Paketaktivierung nötig.",
 intelligence:"Tool-Nutzungsrechte",intTitle:"Das passende Tool für jede Aufgabe wählen",intLead:"Prüfen Sie unterstützte Formate, Verarbeitungsgrenzen, Nutzungsrechte und Ergebnisbereitstellung.",
 lite:"Leicht",standard:"Standard",high:"Hoch",invite:"Einladen",inviteTitle:"Teilen Sie den Einstieg mit Menschen, die ihn wirklich nutzen.",records:"Erstattungen & Verlauf",recordsTitle:"Nicht genutzter Betrag wird anhand der ursprünglichen Aufladung geprüft.",
 generateInvite:"Einladungslink erstellen",copy:"Kopieren",orders:"Aufladungen ansehen →",refundRules:"Erstattungsregeln ansehen →",
 updateTitle:"LingxiField Updates",update1:"Globales SIAI-Ranking, über 100 praktische Tools und der SASI-Softwaremarkt werden laufend aktualisiert.",update2:"Bestellungen, Zahlungen und Tool-Verarbeitungen werden zentral erfasst; Dateien sind entsprechend den Rechten abrufbar."
};

const ES:Partial<Record<Key,string>>={
 brand:"LINGXIFIELD",brandFull:"LINGXIFIELD",sasiBrand:"LINGXIFIELD SASI",
 newTask:"Nueva tarea",search:"Busca herramientas y funciones o escribe tu pregunta…",create:"Empezar",recharge:"Recargar",account:"Cuenta",updates:"Novedades",
 start:"Inicio",sasi:"SASI",fieldGroup:"LingxiField",
 home:"Inicio",tools:"Herramientas",studio:"Mercado de software SASI",books:"Herramientas de documentos",learning:"Paquete de herramientas",research:"Ranking SIAI global",
 wallet:"Saldo",myField:"Mi cuenta",
 light:"Claro",dark:"Oscuro",language:"Idioma",
 footerLine:"Fácil de entender, fácil de hacer. Dale un camino a una idea y deja que empiece a crecer aquí.",
 follow:"Seguir LingxiField",service:"Cuenta oficial",miniapp:"Mini programa",terms:"Términos de uso",privacy:"Privacidad",declaration:"Aviso del sistema",refunds:"Recargas y reembolsos",sasiRules:"Reglas SASI",
 homeKicker:"Una idea · Un camino",homeTitle:"¿Qué quieres poner en marcha hoy?",
 homeLead:"No necesitas saber de antemano cuál es la herramienta correcta. Trae un problema, un documento o una idea aún incompleta; LingxiField encuentra la entrada adecuada y te da el siguiente paso.",
 homePlaceholder:"Por ejemplo: comprimir un PDF; extraer texto de un contrato escaneado con OCR; unir imágenes en una imagen larga; comparar precios reales de modelos de IA…",
 begin:"Empezar →",betterFrom:"Mejor punto de partida",specificProblem:"Resolver un problema concreto",growIdea:"Hacer crecer una idea",
 fromHere:"Empieza aquí",easyReach:"Claro, simple y al alcance",homeSectionLead:"No amontonamos funciones. Organizamos las entradas para que puedas ir directamente a lo que necesitas.",
 continueIn:"Ir más profundo",changePath:"Dale a cada cambio un camino y un eco",changePathLead:"Algunos problemas necesitan acción; otros necesitan ser vistos primero. LingxiField mantiene ambos en el mismo espacio.",
 homeNoteA:"LingxiField no es una pared de botones.",homeNoteB:"Se parece más a un camino que va de la idea al resultado.",homeNoteC:"Las herramientas prácticas procesan archivos, el ranking SIAI compara modelos y el mercado SASI gestiona publicaciones, revisión y entrega.",
 open:"Abrir →",expand:"Explorar →",
 toolsHero:"Un rodeo menos hace todo más rápido.",toolsLead:"Imágenes, PDF, vídeo, subtítulos, privacidad y archivos cotidianos empiezan aquí. Si algo puede quedarse en el navegador, intentamos no subirlo.",
 toolCount:"entradas disponibles",toolSearch:"Buscar: comprimir PDF, quitar marcas de agua, calorías, transcripción de vídeo…",all:"Todo",local:"Local",online:"En línea",
 noTool:"No encontramos una herramienta que coincida exactamente.",noToolLead:"Describe el problema en la búsqueda superior y LingxiField seguirá buscando la entrada adecuada.",
 sasiKicker:"LINGXIFIELD SASI",sasiTitle:"Explorar, publicar y entregar software",sasiLead:"SASI es un mercado de software terminado y paquetes fuente, con envío de vendedores, revisión de la plataforma, pago verificado y entrega digital segura.",
 sasiPlaceholder:"Por ejemplo: publicar un paquete fuente MT5 EA con versión, compatibilidad, instalación y licencia, o explorar software revisado.",
 attachment:"Adjunto",connections:"Conexiones",auto:"Automático",visual:"Herramientas de vídeo y audio",webapp:"Productos de software",researchMode:"Comparación de modelos",
 creationEntry:"Publicación de software",wantResult:"Empieza desde el resultado que quieres.",oldExit:"Los accesos públicos se centran ahora en el mercado de software y las herramientas prácticas; se conservan los pedidos y derechos existentes.",
 available:"Disponible",coming:"Próximamente",connecting:"Conectando →",
 skillsLead:"Elige un herramienta por tarea y consulta formatos, límites y entrega del resultado.",connectTitle:"Conecta capacidades externas solo cuando las necesites.",
 connectLead:"GitHub, Vercel, Supabase, las API de modelos y otros servicios se concentran ahora en un único centro de conexiones.",
 openConnect:"Abrir centro de conexiones →",balanceTitle:"Un saldo para herramientas y servicios de la plataforma",balanceLead:"Las herramientas y servicios siguen las prestaciones indicadas; los pedidos del mercado usan el método de pago mostrado.",viewBalance:"Ver saldo y recargar →",
 walletTitle:"Saldo e historial de pedidos",walletLead:"Las herramientas y servicios siguen las prestaciones indicadas; los pedidos del mercado usan el método de pago mostrado.",
 current:"Disponible ahora",principal:"Principal recargado",bonus:"Saldo extra",refundable:"Principal no usado y reembolsable",balanceState:"Estado del saldo",
 topupKicker:"Añadir saldo",topupTitle:"Añade saldo cuando lo necesites",topupLead:"Las recargas se usan para herramientas online y servicios de la plataforma; los pagos y prestaciones se consultan en la cuenta.",
 common:"Habitual",thisTopup:"Esta recarga",continueTopup:"Continuar →",topupFine:"Después del pago volverás aquí. No necesitas activar ninguna membresía ni paquete adicional.",
 intelligence:"Derechos de uso de herramientas",intTitle:"Elige la herramienta adecuada para cada tarea",intLead:"Consulta formatos compatibles, límites de procesamiento, prestaciones y entrega del resultado.",
 lite:"Ligero",standard:"Estándar",high:"Alto",invite:"Invitar",inviteTitle:"Comparte la entrada con quien realmente la vaya a usar.",records:"Reembolsos e historial",recordsTitle:"El principal no utilizado se verifica contra la recarga original.",
 generateInvite:"Crear enlace de invitación",copy:"Copiar",orders:"Ver recargas →",refundRules:"Ver reglas de reembolso →",
 updateTitle:"Novedades de LingxiField",update1:"El ranking SIAI, más de 100 herramientas y el mercado de software SASI se actualizan continuamente.",update2:"Los pedidos, pagos y procesos de herramientas se organizan juntos; los archivos se descargan según los permisos."
};

const PT:Partial<Record<Key,string>>={
 brand:"LINGXIFIELD",brandFull:"LINGXIFIELD",sasiBrand:"LINGXIFIELD SASI",
 newTask:"Nova tarefa",search:"Pesquise ferramentas e funções ou escreva sua pergunta…",create:"Começar",recharge:"Recarregar",account:"Conta",updates:"Novidades",
 start:"Início",sasi:"SASI",fieldGroup:"LingxiField",
 home:"Início",tools:"Ferramentas",studio:"Mercado de software SASI",books:"Ferramentas de documentos",learning:"Pacote de ferramentas",research:"Ranking SIAI global",
 wallet:"Saldo",myField:"Minha conta",
 light:"Claro",dark:"Escuro",language:"Idioma",
 footerLine:"Fácil de entender, fácil de fazer. Dê um caminho a uma ideia e deixe-a começar a crescer aqui.",
 follow:"Seguir LingxiField",service:"Conta oficial",miniapp:"Mini programa",terms:"Termos de uso",privacy:"Privacidade",declaration:"Aviso do sistema",refunds:"Recargas e reembolsos",sasiRules:"Regras SASI",
 homeKicker:"Uma ideia · Um caminho",homeTitle:"O que você quer colocar em movimento hoje?",
 homeLead:"Você não precisa saber de antemão qual é a ferramenta certa. Traga um problema, um documento ou uma ideia ainda incompleta; o LingxiField encontra a entrada e entrega o próximo passo.",
 homePlaceholder:"Ex.: comprimir um PDF; extrair texto de um contrato digitalizado com OCR; juntar imagens em uma imagem longa; comparar preços reais de modelos de IA…",
 begin:"Começar →",betterFrom:"Bom ponto de partida",specificProblem:"Resolver um problema concreto",growIdea:"Fazer uma ideia crescer",
 fromHere:"Comece aqui",easyReach:"Claro, simples e ao alcance",homeSectionLead:"Não empilhamos recursos. Organizamos as entradas para você ir direto ao que precisa.",
 continueIn:"Ir mais fundo",changePath:"Dê um caminho e um eco à mudança",changePathLead:"Alguns problemas pedem ação; outros precisam primeiro ser vistos. O LingxiField mantém os dois no mesmo espaço.",
 homeNoteA:"LingxiField não é uma parede de botões.",homeNoteB:"É mais parecido com um caminho da ideia ao resultado.",homeNoteC:"As ferramentas práticas processam arquivos, o ranking SIAI compara modelos e o mercado SASI gerencia anúncios, análise e entrega.",
 open:"Abrir →",expand:"Explorar →",
 toolsHero:"Um desvio a menos torna tudo mais rápido.",toolsLead:"Imagens, PDFs, vídeos, legendas, privacidade e arquivos do dia a dia começam aqui. Se puder ficar no navegador, tentamos não enviar.",
 toolCount:"entradas disponíveis",toolSearch:"Buscar: compactar PDF, remover marca d’água, calorias, transcrição de vídeo…",all:"Tudo",local:"Local",online:"Online",
 noTool:"Nenhuma ferramenta corresponde exatamente.",noToolLead:"Descreva o problema na busca superior e o LingxiField continuará procurando a entrada certa.",
 sasiKicker:"LINGXIFIELD SASI",sasiTitle:"Explorar, publicar e entregar software",sasiLead:"SASI é um mercado de software pronto e pacotes-fonte, com envio de vendedores, análise da plataforma, pagamento verificado e entrega digital segura.",
 sasiPlaceholder:"Ex.: publicar um pacote-fonte MT5 EA com versão, compatibilidade, instalação e licença, ou explorar software revisado.",
 attachment:"Anexo",connections:"Conexões",auto:"Automático",visual:"Ferramentas de vídeo e áudio",webapp:"Produtos de software",researchMode:"Comparação de modelos",
 creationEntry:"Publicação de software",wantResult:"Comece pelo resultado que você quer.",oldExit:"As entradas públicas agora se concentram no mercado de software e nas ferramentas práticas; pedidos e direitos existentes são preservados.",
 available:"Disponível",coming:"Em breve",connecting:"Conectando →",
 skillsLead:"Escolha uma ferramenta por tarefa e consulte formatos, limites e entrega do resultado.",connectTitle:"Conecte recursos externos apenas quando precisar.",
 connectLead:"GitHub, Vercel, Supabase, APIs de modelos e outros serviços agora ficam reunidos em um único centro de conexões.",
 openConnect:"Abrir centro de conexões →",balanceTitle:"Um saldo para ferramentas e serviços da plataforma",balanceLead:"Ferramentas e serviços seguem os direitos exibidos; pedidos do mercado usam o meio de pagamento indicado.",viewBalance:"Ver saldo e recarregar →",
 walletTitle:"Saldo e histórico de pedidos",walletLead:"Ferramentas e serviços seguem os direitos exibidos; pedidos do mercado usam o meio de pagamento indicado.",
 current:"Disponível agora",principal:"Principal recarregado",bonus:"Saldo bônus",refundable:"Principal não usado e reembolsável",balanceState:"Estado do saldo",
 topupKicker:"Adicionar saldo",topupTitle:"Adicione saldo quando precisar",topupLead:"As recargas são usadas em ferramentas online e serviços da plataforma; pagamentos e direitos podem ser consultados na conta.",
 common:"Comum",thisTopup:"Esta recarga",continueTopup:"Continuar →",topupFine:"Após o pagamento você volta para cá. Nenhuma assinatura ou pacote adicional precisa ser ativado.",
 intelligence:"Direitos de uso das ferramentas",intTitle:"Escolha a ferramenta certa para cada tarefa",intLead:"Consulte formatos suportados, limites de processamento, direitos e entrega do resultado.",
 lite:"Leve",standard:"Padrão",high:"Alto",invite:"Convidar",inviteTitle:"Compartilhe a entrada com quem realmente vai usar.",records:"Reembolsos e histórico",recordsTitle:"O principal não utilizado é conferido com a recarga original.",
 generateInvite:"Criar link de convite",copy:"Copiar",orders:"Ver recargas →",refundRules:"Ver regras de reembolso →",
 updateTitle:"Novidades do LingxiField",update1:"O ranking SIAI, mais de 100 ferramentas e o mercado de software SASI são atualizados continuamente.",update2:"Pedidos, pagamentos e processamentos de ferramentas são organizados juntos; arquivos podem ser baixados conforme as permissões."
};

const AR:Partial<Record<Key,string>>={
 brand:"LINGXIFIELD",brandFull:"LINGXIFIELD",sasiBrand:"LINGXIFIELD SASI",
 newTask:"مهمة جديدة",search:"ابحث عن أداة أو ميزة أو اكتب سؤالك…",create:"ابدأ",recharge:"شحن",account:"الحساب",updates:"التحديثات",
 start:"ابدأ",sasi:"SASI",fieldGroup:"LingxiField",
 home:"الرئيسية",tools:"الأدوات",studio:"سوق برامج SASI",books:"أدوات المستندات",learning:"حزمة الأدوات",research:"تصنيف SIAI العالمي",
 wallet:"الرصيد",myField:"حسابي",
 light:"فاتح",dark:"داكن",language:"اللغة",
 footerLine:"سهل الفهم وسهل التنفيذ. امنح الفكرة مسارًا ودعها تبدأ بالنمو من هنا.",
 follow:"تابع LingxiField",service:"الحساب الرسمي",miniapp:"التطبيق المصغر",terms:"شروط الاستخدام",privacy:"الخصوصية",declaration:"إشعار النظام",refunds:"الشحن والاسترداد",sasiRules:"قواعد SASI",
 homeKicker:"فكرة واحدة · مسار واحد",homeTitle:"ما الذي تريد أن تبدأ حركته اليوم؟",
 homeLead:"لست بحاجة إلى معرفة الأداة الصحيحة مسبقًا. أحضر مشكلة أو مستندًا أو فكرة غير مكتملة، وسيجد LingxiField المدخل المناسب ويعطيك الخطوة التالية.",
 homePlaceholder:"مثال: ضغط ملف PDF؛ استخراج نص عقد ممسوح ضوئيًا باستخدام OCR؛ دمج الصور في صورة طويلة؛ مقارنة الأسعار الفعلية لنماذج الذكاء الاصطناعي…",
 begin:"ابدأ →",betterFrom:"أفضل نقطة بداية",specificProblem:"حل مشكلة محددة",growIdea:"ابدأ بتنمية فكرة",
 fromHere:"ابدأ من هنا",easyReach:"واضح وبسيط وفي المتناول",homeSectionLead:"لا نكدس الميزات أمامك، بل ننظم المداخل لتصل مباشرة إلى ما تحتاجه.",
 continueIn:"اذهب أعمق",changePath:"امنح التغيير مسارًا وصدى",changePathLead:"بعض المشكلات تحتاج إلى فعل، وأخرى تحتاج أولًا إلى أن تُرى. يجمع LingxiField الاثنين في مساحة واحدة.",
 homeNoteA:"LingxiField ليس جدارًا من الأزرار.",homeNoteB:"إنه أقرب إلى مسار من الفكرة إلى النتيجة.",homeNoteC:"تعالج الأدوات العملية الملفات، ويقارن تصنيف SIAI النماذج، ويدير سوق SASI عرض البرامج ومراجعتها وتسليمها.",
 open:"فتح →",expand:"استكشاف →",
 toolsHero:"اختصار خطوة واحدة يجعل كل شيء أسرع.",toolsLead:"الصور وPDF والفيديو والترجمة والخصوصية ومشكلات الملفات اليومية تبدأ من هنا. وما يمكن أن يبقى داخل المتصفح نحاول ألا نرفعه.",
 toolCount:"مداخل متاحة",toolSearch:"بحث: ضغط PDF، إزالة العلامة المائية، السعرات، تفريغ الفيديو…",all:"الكل",local:"محلي",online:"عبر الإنترنت",
 noTool:"لم نجد أداة مطابقة تمامًا.",noToolLead:"اكتب المشكلة في شريط البحث العلوي وسيواصل LingxiField البحث عن المدخل الأنسب.",
 sasiKicker:"LINGXIFIELD SASI",sasiTitle:"استعراض البرامج ونشرها وتسليمها",sasiLead:"SASI سوق للبرامج الجاهزة وحزم المصدر، مع تقديم البائعين ومراجعة المنصة والتحقق من الدفع والتسليم الرقمي الآمن.",
 sasiPlaceholder:"مثال: نشر حزمة مصدر MT5 EA مع الإصدار والتوافق وتعليمات التثبيت ونطاق الترخيص، أو استعراض البرامج التي تمت مراجعتها.",
 attachment:"مرفق",connections:"الاتصالات",auto:"تلقائي",visual:"أدوات الفيديو والصوت",webapp:"منتجات البرامج",researchMode:"مقارنة النماذج",
 creationEntry:"نشر البرامج",wantResult:"ابدأ من النتيجة التي تريدها.",oldExit:"تركز المداخل العامة الآن على سوق البرامج والأدوات العملية، مع الاحتفاظ بالطلبات والحقوق الحالية.",
 available:"متاح",coming:"قريبًا",connecting:"جارٍ الاتصال →",
 skillsLead:"اختر الأداة حسب المهمة وراجع الصيغ المدعومة وحدود المعالجة وطريقة استلام النتيجة.",connectTitle:"صل القدرات الخارجية فقط عند الحاجة.",
 connectLead:"GitHub وVercel وSupabase وواجهات النماذج والخدمات الأخرى أصبحت مجمعة في مركز اتصال واحد.",
 openConnect:"فتح مركز الاتصالات →",balanceTitle:"رصيد موحد للأدوات وخدمات المنصة",balanceLead:"تتبع الأدوات والخدمات المزايا المعروضة، وتستخدم طلبات سوق البرامج وسيلة الدفع المحددة.",viewBalance:"عرض الرصيد والشحن →",
 walletTitle:"الرصيد وسجل الطلبات",walletLead:"تتبع الأدوات والخدمات المزايا المعروضة، وتستخدم طلبات سوق البرامج وسيلة الدفع المحددة.",
 current:"المتاح الآن",principal:"أصل الشحن",bonus:"رصيد إضافي",refundable:"أصل غير مستخدم قابل للاسترداد",balanceState:"حالة الرصيد",
 topupKicker:"إضافة رصيد",topupTitle:"أضف رصيدًا عند الحاجة",topupLead:"تُستخدم التعبئة للأدوات عبر الإنترنت وخدمات المنصة، ويمكن مراجعة المدفوعات والمزايا في الحساب.",
 common:"شائع",thisTopup:"هذا الشحن",continueTopup:"متابعة →",topupFine:"بعد الدفع ستعود إلى هنا. لا حاجة إلى تفعيل عضوية أو باقة أخرى.",
 intelligence:"حقوق استخدام الأدوات",intTitle:"اختر الأداة المناسبة لكل مهمة",intLead:"راجع الصيغ المدعومة وحدود المعالجة ونطاق المزايا وطريقة استلام النتيجة.",
 lite:"خفيف",standard:"قياسي",high:"عالٍ",invite:"دعوة",inviteTitle:"شارك المدخل مع من سيستخدمه فعلًا.",records:"الاسترداد والسجل",recordsTitle:"يتم التحقق من الأصل غير المستخدم مقابل سجل الشحن الأصلي.",
 generateInvite:"إنشاء رابط دعوة",copy:"نسخ",orders:"عرض سجلات الشحن →",refundRules:"عرض قواعد الاسترداد →",
 updateTitle:"تحديثات LingxiField",update1:"يتم تحديث تصنيف SIAI العالمي وأكثر من 100 أداة عملية وسوق SASI باستمرار.",update2:"تُنظم الطلبات والمدفوعات وسجلات معالجة الأدوات معًا، ويمكن تنزيل الملفات وفق الصلاحيات."
};

const dictionaries:Record<LingxiLang,Partial<Record<Key,string>>>={zh:ZH,en:EN,ja:JA,ko:KO,fr:FR,de:DE,es:ES,pt:PT,ar:AR};
export function tr(lang:LingxiLang,key:Key){return dictionaries[lang][key]??EN[key]??ZH[key]}
function isLingxiLang(value:unknown):value is LingxiLang{return typeof value==="string"&&Object.prototype.hasOwnProperty.call(LANG_NAMES,value)}
export function setLingxiLang(lang:LingxiLang){
 const safe: LingxiLang = isLingxiLang(lang) ? lang : "zh";
 try{localStorage.setItem("lx-lang",safe)}catch{}
 const root=document.documentElement;
 root.lang=safe==="zh"?"zh-CN":safe;
 root.dir=safe==="ar"?"rtl":"ltr";
 root.dataset.lang=safe;
 root.classList.remove("lang-en");
 window.dispatchEvent(new CustomEvent("lingxi:lang",{detail:safe}));
}
export function useLingxiLang(){
 const pathname=usePathname();
 const[lang,setLangState]=useState<LingxiLang>(()=>{
  const routeLang=pathname?.split("/")[1] as LingxiLang;
  return isLingxiLang(routeLang)?routeLang:"zh";
 });
 useEffect(()=>{
  const routeLang=pathname?.split("/")[1] as LingxiLang;
  const requested=new URLSearchParams(location.search).get("lang") as LingxiLang;
  let stored:LingxiLang="zh";try{stored=(localStorage.getItem("lx-lang")||"zh") as LingxiLang}catch{}
  const next=isLingxiLang(routeLang)?routeLang:isLingxiLang(requested)?requested:isLingxiLang(stored)?stored:"zh";
  const h=(e:Event)=>setLangState((e as CustomEvent<LingxiLang>).detail);
  window.addEventListener("lingxi:lang",h);setLangState(next);setLingxiLang(next);
  return()=>window.removeEventListener("lingxi:lang",h);
 },[pathname]);
 return{lang,setLang:setLingxiLang,t:(key:Key)=>tr(lang,key)};
}
