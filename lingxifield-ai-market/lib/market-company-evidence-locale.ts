import type {Language} from './v2';
import type {CompanyEvidence} from './market-company-evidence';

// One source of financial facts, multiple language presentations. Text is never
// machine-translated at runtime; values absent from the publisher ledger stay absent.
const ORDER=['zh','en','ja','ko','fr','de','es','pt','ar'] as const;
type Key='anthropic.funding'|'suno.funding'|'replit.funding'|'comfy.funding'|'google.listing'|'alibaba.listing'|'kuaishou.listing'|'kuaishou.projectStarted'|'runway.projectStarted'|'comfy.projectStarted'|'dify.funding'|'langchain.projectStarted'|'suno.scale'|'xai.funding'|'xai.scale'|'langchain.funding'|'langchain.scale'|'llamaindex.funding'|'llamaindex.projectStarted'|'llamaindex.scale'|'lovable.funding'|'lovable.projectStarted'|'lovable.scale'|'midjourney.funding'|'midjourney.scale'|'ollama.scale'|'huggingface.scale'|'runway.funding'|'elevenlabs.funding'|'huggingface.funding';
const texts:Record<Key,readonly string[]>={
 'runway.funding':[
  '2026年2月 E 轮融资 3.15 亿美元（单轮）','February 2026: US$315M Series E (one round)',
  '2026年2月：シリーズEで3.15億米ドル調達','2026년 2월: 시리즈 E 투자 3억 1,500만 달러(단일 라운드)',
  'Février 2026 : série E de 315 M$ US (un seul tour)','Februar 2026: Series E über 315 Mio. US-Dollar (eine Runde)',
  'Febrero de 2026: serie E de 315 MUSD (una ronda)','Fevereiro de 2026: série E de US$ 315 milhões (uma rodada)',
  'فبراير 2026: جولة E بقيمة 315 مليون دولار (جولة واحدة)'
 ],
 'elevenlabs.funding':[
  '2026年2月 D 轮融资 5 亿美元；公告时累计 7.81 亿美元','February 2026: US$500M Series D; US$781M cumulative as announced',
  '2026年2月：シリーズDで5億米ドル、発表時点の累計7.81億米ドル','2026년 2월: 시리즈 D 5억 달러, 발표 당시 누적 7억 8,100만 달러',
  'Février 2026 : série D de 500 M$ US ; cumul annoncé de 781 M$ US','Februar 2026: Series D 500 Mio. US-Dollar; damals kumuliert 781 Mio.',
  'Febrero de 2026: serie D de 500 MUSD; total anunciado 781 MUSD','Fevereiro de 2026: série D de US$ 500 milhões; acumulado anunciado US$ 781 milhões',
  'فبراير 2026: جولة D بقيمة 500 مليون دولار؛ الإجمالي المعلن 781 مليون دولار'
 ],
 'huggingface.funding':[
  '2023年8月 D 轮融资 2.35 亿美元（单轮）','August 2023: US$235M Series D (one round)',
  '2023年8月：シリーズDで2.35億米ドル調達','2023년 8월: 시리즈 D 2억 3,500만 달러(단일 라운드)',
  'Août 2023 : série D de 235 M$ US (un tour)','August 2023: Series D über 235 Mio. US-Dollar (eine Runde)',
  'Agosto de 2023: serie D de 235 MUSD (una ronda)','Agosto de 2023: série D de US$ 235 milhões (uma rodada)',
  'أغسطس 2023: جولة D بقيمة 235 مليون دولار (جولة واحدة)'
 ],
 'dify.funding':[
  '2026 年 3 月 Pre-A 轮融资 3000 万美元（单轮）','March 2026: US$30M Pre-A funding round (not cumulative)',
  '2026年3月：プレAラウンドで3,000万米ドル調達','2026년 3월: Pre-A 투자 3천만 달러(단일 라운드)',
  'Mars 2026 : tour pré-série A de 30 M$ US','März 2026: Pre-A-Finanzierungsrunde über 30 Mio. US-Dollar',
  'Marzo de 2026: ronda Pre-A de 30 MUSD','Março de 2026: rodada Pré-A de US$ 30 milhões','مارس 2026: جولة تمويل Pre-A بقيمة 30 مليون دولار'
 ],
 'langchain.projectStarted':[
  'LangChain 开源项目始于 2022 年末；公司于 2023 年成立','LangChain open-source project began in late 2022; company founded in 2023',
  'LangChainのOSSは2022年末、会社は2023年に発足','LangChain 오픈소스 프로젝트는 2022년 말, 회사는 2023년 시작',
  'Projet open source lancé fin 2022 ; société fondée en 2023','Open-Source-Projekt seit Ende 2022; Firma 2023 gegründet',
  'Proyecto abierto iniciado a finales de 2022; empresa fundada en 2023','Projeto aberto iniciado no fim de 2022; empresa fundada em 2023','بدأ المشروع مفتوح المصدر أواخر 2022 وتأسست الشركة في 2023'
 ],
 'anthropic.funding':[
  '2022 年 B 轮融资 5.8 亿美元（非累计）','2022 Series B: US$580M (not cumulative)','2022年シリーズB：5.8億米ドル（累計ではありません）','2022년 시리즈 B: 미화 5억 8천만 달러(누적 아님)',
  'Série B en 2022 : 580 M$ US (non cumulés)','Serie B 2022: 580 Mio. US-Dollar (nicht kumuliert)','Serie B de 2022: 580 MUSD (no acumulados)','Série B de 2022: US$ 580 milhões (não acumulados)','الجولة B في 2022: مبلغ 580 مليون دولار (ليست حصيلة تراكمية)'
 ],
 'suno.funding':[
  '官方公布累计融资超过 7.75 亿美元','Over US$775M in cumulative funding, per Suno','公式発表の累計調達額は7.75億米ドル超','공식 발표 누적 투자 유치액 7억 7,500만 달러 초과',
  'Plus de 775 M$ US de financements cumulés selon Suno','Laut Suno über 775 Mio. US-Dollar Gesamtfinanzierung','Más de 775 MUSD de financiación acumulada según Suno','Mais de US$ 775 milhões em financiamento acumulado, segundo a Suno','أعلنت Suno أن التمويل التراكمي يتجاوز 775 مليون دولار'
 ],
 'suno.scale':[
  '超过 1 亿人创作过音乐；团队 250+ 人；官方称在 35 个国家/地区位列音乐应用第一',
  '100M+ people have made music on Suno; 250+ team members; Suno says it is the No. 1 music app in 35 countries',
  '1億人以上がSunoで音楽を制作。チームは250人超。35か国で音楽アプリ第1位と公式発表',
  '1억 명 이상이 Suno에서 음악을 제작; 팀 250명 이상; 35개국 음악 앱 1위라고 공식 발표',
  'Plus de 100 millions de créateurs ; équipe de plus de 250 personnes ; n° 1 des applications musicales dans 35 pays selon Suno',
  'Über 100 Mio. Menschen haben Musik erstellt; Team mit mehr als 250 Personen; laut Suno Musik-App Nr. 1 in 35 Ländern',
  'Más de 100 millones de personas han creado música; equipo de más de 250 personas; Suno afirma ser la app musical n.º 1 en 35 países',
  'Mais de 100 milhões de pessoas criaram música; equipe com mais de 250 pessoas; a Suno afirma ser o app de música nº 1 em 35 países',
  'أكثر من 100 مليون شخص أنشأوا الموسيقى؛ فريق يتجاوز 250 شخصاً؛ وتقول Suno إنها تطبيق الموسيقى الأول في 35 دولة'
 ],
 'replit.funding':[
  '2026 年 3 月公布 4 亿美元融资（单轮）','US$400M financing announced March 2026 (this round)','2026年3月発表の調達額4億米ドル（単独ラウンド）','2026년 3월 발표 4억 달러 투자 유치(해당 라운드)',
  'Levée de 400 M$ US annoncée en mars 2026 (ce tour)','Finanzierungsrunde über 400 Mio. US-Dollar, März 2026','Ronda de financiación de 400 MUSD anunciada en marzo de 2026','Rodada de US$ 400 milhões anunciada em março de 2026','جولة تمويل بقيمة 400 مليون دولار أُعلنت في مارس 2026'
 ],
 'comfy.funding':[
  '2026 年 4 月本轮融资 3000 万美元，累计 4700 万美元','April 2026: US$30M round; US$47M raised cumulatively','2026年4月：当該ラウンド3,000万米ドル、累計4,700万米ドル','2026년 4월: 이번 라운드 3천만 달러, 누적 4천7백만 달러',
  'Avril 2026 : levée de 30 M$ US ; cumul 47 M$ US','April 2026: Runde über 30 Mio. US-Dollar; gesamt 47 Mio.','Abril de 2026: ronda de 30 MUSD; acumulado de 47 MUSD','Abril de 2026: rodada de US$ 30 mi; acumulado de US$ 47 mi','أبريل 2026: جولة بقيمة 30 مليون دولار وإجمالي 47 مليون دولار'
 ],
 'google.listing':[
  'Alphabet 上市集团旗下产品；NASDAQ: GOOGL / GOOG','Product of publicly traded Alphabet; NASDAQ: GOOGL / GOOG','上場企業Alphabet傘下の製品：NASDAQ GOOGL / GOOG','상장사 Alphabet 산하 제품: NASDAQ GOOGL / GOOG',
  'Produit du groupe coté Alphabet : NASDAQ GOOGL / GOOG','Produkt des börsennotierten Alphabet-Konzerns: NASDAQ GOOGL / GOOG','Producto del grupo cotizado Alphabet: NASDAQ GOOGL / GOOG','Produto do grupo listado Alphabet: NASDAQ GOOGL / GOOG','منتج تابع لمجموعة Alphabet المدرجة: ناسداك GOOGL / GOOG'
 ],
 'alibaba.listing':[
  '阿里巴巴集团旗下产品；NYSE: BABA / HKEX: 9988','Alibaba Group product; NYSE: BABA / HKEX: 9988','アリババグループ傘下：NYSE BABA / HKEX 9988','알리바바 그룹 산하 제품: NYSE BABA / HKEX 9988',
  'Produit d’Alibaba Group : NYSE BABA / HKEX 9988','Produkt der Alibaba Group: NYSE BABA / HKEX 9988','Producto de Alibaba Group: NYSE BABA / HKEX 9988','Produto do Alibaba Group: NYSE BABA / HKEX 9988','منتج تابع لمجموعة علي بابا: NYSE BABA / HKEX 9988'
 ],
 'kuaishou.listing':[
  '母公司快手科技于 2021 年 2 月 5 日在港交所上市（1024.HK）','Parent Kuaishou Technology listed on HKEX Feb 5, 2021 (1024.HK)','親会社の快手科技は2021年2月5日に香港上場（1024.HK）','모기업 Kuaishou Technology는 2021년 2월 5일 홍콩 상장(1024.HK)',
  'Société mère Kuaishou Technology cotée à Hong Kong depuis le 5 février 2021 (1024.HK)','Mutter Kuaishou Technology seit 5. Februar 2021 an der HKEX notiert (1024.HK)','Matriz Kuaishou Technology cotiza en Hong Kong desde el 5 de febrero de 2021 (1024.HK)','Controladora Kuaishou Technology listada em Hong Kong desde 5/2/2021 (1024.HK)','الشركة الأم Kuaishou Technology مدرجة في بورصة هونغ كونغ منذ 5 فبراير 2021 (1024.HK)'
 ],
 'kuaishou.projectStarted':[
  '快手应用最早于 2011 年推出（不是可灵发布日期）','Kuaishou app launched in 2011 (not the Kling launch date)','快手アプリは2011年公開（Klingの公開年ではありません）','콰이쇼우 앱은 2011년 출시(Kling 출시 연도와 다름)',
  'Application Kuaishou lancée en 2011 (pas Kling)','Kuaishou-App seit 2011 (nicht das Startjahr von Kling)','App Kuaishou lanzada en 2011 (no es la fecha de Kling)','Aplicativo Kuaishou lançado em 2011 (não é a data do Kling)','أطلق تطبيق Kuaishou في 2011 (وليس هذا تاريخ إطلاق Kling)'
 ],
 'runway.projectStarted':[
  '自 2018 年开展生成式媒体研究','Generative media research since 2018','2018年から生成メディアを研究','2018년부터 생성형 미디어 연구',
  'Recherche sur les médias génératifs depuis 2018','Forschung zu generativen Medien seit 2018','Investigación en medios generativos desde 2018','Pesquisa em mídia generativa desde 2018','أبحاث الوسائط التوليدية منذ 2018'
 ],
 'comfy.projectStarted':[
  'ComfyUI 开源项目始于 2023 年 1 月','ComfyUI open-source project began January 2023','ComfyUIのオープンソースプロジェクトは2023年1月開始','ComfyUI 오픈소스 프로젝트는 2023년 1월 시작',
  'Projet open source ComfyUI lancé en janvier 2023','ComfyUI-Open-Source-Projekt startete im Januar 2023','Proyecto abierto ComfyUI iniciado en enero de 2023','Projeto aberto ComfyUI iniciado em janeiro de 2023','بدأ مشروع ComfyUI مفتوح المصدر في يناير 2023'
 ],
 'xai.funding':[
  'xAI 于 2026 年 1 月 6 日公布 200 亿美元 Series E；这是加入 SpaceX 前的历史融资轮',
  'xAI announced a US$20B Series E on 6 Jan 2026; historical funding before joining SpaceX',
  'xAIは2026年1月6日に200億米ドルのSeries Eを発表。SpaceX参加前の歴史的な資金調達',
  'xAI는 2026년 1월 6일 200억 달러 Series E를 발표했습니다. SpaceX 합류 전의 과거 투자 라운드입니다',
  'xAI a annoncé une série E de 20 Md$ le 6 janvier 2026, avant son intégration à SpaceX',
  'xAI meldete am 6. Januar 2026 eine Series-E-Finanzierung über 20 Mrd. US-Dollar, vor dem Beitritt zu SpaceX',
  'xAI anunció una ronda Serie E de 20.000 millones de USD el 6 de enero de 2026, antes de unirse a SpaceX',
  'A xAI anunciou uma rodada Série E de US$ 20 bilhões em 6 de janeiro de 2026, antes de integrar a SpaceX',
  'أعلنت xAI عن جولة Series E بقيمة 20 مليار دولار في 6 يناير 2026، قبل انضمامها إلى SpaceX'
 ],
 'xai.scale':[
  '官方公司页面披露 Colossus 计算设施规模为 200,000 GPUs',
  'xAI joined SpaceX on 2 Feb 2026; the official company page reports 200,000 GPUs in the Colossus facility',
  'xAIは2026年2月2日にSpaceXへ参加。公式ページによるとColossusは200,000 GPU規模',
  'xAI는 2026년 2월 2일 SpaceX에 합류했습니다. 공식 페이지는 Colossus 시설이 GPU 200,000개 규모라고 밝힙니다',
  'xAI a rejoint SpaceX le 2 février 2026 ; la page officielle indique 200 000 GPU dans l’infrastructure Colossus',
  'xAI trat SpaceX am 2. Februar 2026 bei; die offizielle Seite nennt 200.000 GPUs für Colossus',
  'xAI se unió a SpaceX el 2 de febrero de 2026; la página oficial indica 200.000 GPU en Colossus',
  'A xAI integrou-se à SpaceX em 2 de fevereiro de 2026; a página oficial informa 200.000 GPUs no Colossus',
  'انضمت xAI إلى SpaceX في 2 فبراير 2026؛ وتذكر الصفحة الرسمية أن منشأة Colossus تضم 200,000 وحدة GPU'
 ],
 'langchain.funding':[
  '2025 年 10 月 20 日公布 1.25 亿美元融资，估值 12.5 亿美元（该轮融资）',
  'Announced US$125M funding at a US$1.25B valuation on 20 Oct 2025 (that round)',
  '2025年10月20日発表：1億2,500万米ドルの資金調達、評価額12.5億米ドル（当該ラウンド）',
  '2025년 10월 20일 발표: 1억 2,500만 달러 투자 유치, 기업가치 12억 5,000만 달러(해당 라운드)',
  'Financement de 125 M$ US annoncé le 20 octobre 2025, valorisation de 1,25 Md$ US',
  'Am 20. Oktober 2025 angekündigte Finanzierung über 125 Mio. US-Dollar bei einer Bewertung von 1,25 Mrd.',
  'Financiación de 125 MUSD anunciada el 20 de octubre de 2025, valoración de 1.250 MUSD',
  'Financiamento de US$ 125 milhões anunciado em 20 de outubro de 2025, avaliação de US$ 1,25 bilhão',
  'تم الإعلان عن تمويل بقيمة 125 مليون دولار في 20 أكتوبر 2025 وتقييم بقيمة 1.25 مليار دولار'
 ],
 'langchain.scale':[
  '官方披露：服务 35%《财富》500 强企业；开源下载超过 10 亿次；LangSmith 每日处理超过 10 亿条事件',
  'Official figures: used by 35% of Fortune 500; 1B+ open-source downloads; LangSmith ingests 1B+ events daily',
  '公式発表：Fortune 500企業の35%が利用。OSSダウンロード10億回超、LangSmithは1日10億件超のイベントを処理',
  '공식 수치: Fortune 500 기업의 35%가 사용, 오픈소스 다운로드 10억 회 이상, LangSmith는 매일 10억 건 이상의 이벤트 처리',
  'Chiffres officiels : 35 % du Fortune 500, plus d’un milliard de téléchargements open source et plus d’un milliard d’événements LangSmith par jour',
  'Offizielle Angaben: 35 % der Fortune-500-Unternehmen; über 1 Mrd. Open-Source-Downloads; mehr als 1 Mrd. LangSmith-Ereignisse täglich',
  'Cifras oficiales: 35 % de Fortune 500; más de 1.000 millones de descargas open source; más de 1.000 millones de eventos diarios en LangSmith',
  'Dados oficiais: 35% das empresas Fortune 500; mais de 1 bilhão de downloads open source; mais de 1 bilhão de eventos por dia no LangSmith',
  'أرقام رسمية: 35% من شركات Fortune 500؛ أكثر من مليار تنزيل مفتوح المصدر؛ وأكثر من مليار حدث يومياً في LangSmith'
 ],
 'llamaindex.funding':[
  '2025 年 3 月 4 日公布 1900 万美元 A 轮融资；公告时累计融资 2750 万美元',
  'Announced a US$19M Series A on 4 Mar 2025; US$27.5M total raised at that announcement',
  '2025年3月4日発表：シリーズAで1,900万米ドル、発表時の累計調達額は2,750万米ドル',
  '2025년 3월 4일 발표: Series A 1,900만 달러, 발표 당시 누적 조달액 2,750만 달러',
  'Série A de 19 M$ US annoncée le 4 mars 2025 ; 27,5 M$ US levés au total à cette date',
  'Am 4. März 2025 angekündigte Series A über 19 Mio. US-Dollar; insgesamt 27,5 Mio. US-Dollar zum Zeitpunkt der Meldung',
  'Serie A de 19 MUSD anunciada el 4 de marzo de 2025; 27,5 MUSD acumulados en ese momento',
  'Série A de US$ 19 milhões anunciada em 4 de março de 2025; US$ 27,5 milhões acumulados naquela data',
  'أعلنت جولة Series A بقيمة 19 مليون دولار في 4 مارس 2025؛ وبلغ إجمالي التمويل 27.5 مليون دولار حينها'
 ],
 'llamaindex.projectStarted':[
  'LlamaIndex 开源框架于 2022 年末推出',
  'LlamaIndex open-source framework launched in late 2022',
  'LlamaIndexのオープンソースフレームワークは2022年末に公開',
  'LlamaIndex 오픈소스 프레임워크는 2022년 말 출시',
  'Le framework open source LlamaIndex a été lancé fin 2022',
  'Das Open-Source-Framework LlamaIndex startete Ende 2022',
  'El framework de código abierto LlamaIndex se lanzó a finales de 2022',
  'O framework de código aberto LlamaIndex foi lançado no fim de 2022',
  'أُطلق إطار LlamaIndex مفتوح المصدر في أواخر عام 2022'
 ],
 'llamaindex.scale':[
  '官网当前披露：每月 2500 万+ 软件包下载、30 万+ LlamaParse 用户、1500+ 贡献者、2 万+ 社区成员',
  'Official figures: 25M+ package downloads/month, 300K+ LlamaParse users, 1.5K+ contributors and 20K+ community members',
  '公式発表：月間パッケージダウンロード2,500万回超、LlamaParseユーザー30万人超、貢献者1,500人超、コミュニティ2万人超',
  '공식 수치: 월간 패키지 다운로드 2,500만 회 이상, LlamaParse 사용자 30만 명 이상, 기여자 1,500명 이상, 커뮤니티 회원 2만 명 이상',
  'Chiffres officiels : plus de 25 M de téléchargements mensuels, 300 000 utilisateurs LlamaParse, 1 500 contributeurs et 20 000 membres',
  'Offizielle Angaben: über 25 Mio. Paketdownloads pro Monat, 300.000 LlamaParse-Nutzer, 1.500 Mitwirkende und 20.000 Community-Mitglieder',
  'Cifras oficiales: más de 25 millones de descargas mensuales, 300.000 usuarios de LlamaParse, 1.500 colaboradores y 20.000 miembros',
  'Dados oficiais: mais de 25 milhões de downloads mensais, 300 mil usuários LlamaParse, 1,5 mil contribuidores e 20 mil membros',
  'أرقام رسمية: أكثر من 25 مليون تنزيل للحزم شهرياً، و300 ألف مستخدم لـLlamaParse، و1,500 مساهم، و20 ألف عضو مجتمع'
 ],
 'lovable.funding':[
  '2026 年 8 月 12 日公布 4 亿美元 C 轮融资，估值 133 亿美元（该轮融资）',
  'Announced US$400M Series C at a US$13.3B valuation on 12 Aug 2026 (that round)',
  '2026年8月12日発表：シリーズCで4億米ドルを調達、評価額133億米ドル（当該ラウンド）',
  '2026년 8월 12일 발표: Series C 4억 달러, 기업가치 133억 달러(해당 라운드)',
  'Série C de 400 M$ US annoncée le 12 août 2026, valorisation de 13,3 Md$ US',
  'Am 12. August 2026 angekündigte Series C über 400 Mio. US-Dollar bei 13,3 Mrd. Bewertung',
  'Serie C de 400 MUSD anunciada el 12 de agosto de 2026, valoración de 13.300 MUSD',
  'Série C de US$ 400 milhões anunciada em 12 de agosto de 2026, avaliação de US$ 13,3 bilhões',
  'أعلنت جولة Series C بقيمة 400 مليون دولار في 12 أغسطس 2026 وتقييم 13.3 مليار دولار'
 ],
 'lovable.projectStarted':[
  'Lovable 产品于 2024 年 11 月上线（产品上线时间，不等同于公司注册日期）',
  'Lovable product launched in November 2024 (product launch, not company incorporation date)',
  'Lovable製品は2024年11月に公開（製品公開日であり法人設立日ではありません）',
  'Lovable 제품은 2024년 11월 출시(제품 출시일이며 법인 설립일은 아님)',
  'Produit Lovable lancé en novembre 2024 (date de lancement du produit, pas de création juridique)',
  'Lovable-Produktstart im November 2024 (Produktstart, nicht Gründungsdatum der Gesellschaft)',
  'El producto Lovable se lanzó en noviembre de 2024 (no es la fecha de constitución de la empresa)',
  'O produto Lovable foi lançado em novembro de 2024 (não é a data de constituição da empresa)',
  'أُطلق منتج Lovable في نوفمبر 2024 (تاريخ إطلاق المنتج وليس تاريخ تأسيس الشركة)'
 ],
 'lovable.scale':[
  '官方披露：累计创建超过 6000 万个项目；Lovable 应用每月访问量超过 9 亿次',
  'Official figures: 60M+ projects created; Lovable-built apps receive 900M+ visits per month',
  '公式発表：6,000万件以上のプロジェクトが作成され、Lovable製アプリは月間9億回以上訪問',
  '공식 수치: 6천만 개 이상의 프로젝트 생성, Lovable 제작 앱 월 방문 9억 회 이상',
  'Chiffres officiels : plus de 60 millions de projets créés et 900 millions de visites mensuelles sur les applications Lovable',
  'Offizielle Angaben: über 60 Mio. erstellte Projekte und 900 Mio. monatliche Besuche auf Lovable-Apps',
  'Cifras oficiales: más de 60 millones de proyectos creados y 900 millones de visitas mensuales a apps de Lovable',
  'Dados oficiais: mais de 60 milhões de projetos criados e 900 milhões de visitas mensais a apps Lovable',
  'أرقام رسمية: أكثر من 60 مليون مشروع تم إنشاؤه و900 مليون زيارة شهرية لتطبيقات Lovable'
 ],
 'midjourney.funding':[
  '官网将 Midjourney 描述为 community-funded research lab；该页面未公布融资金额',
  'Official site describes Midjourney as a community-funded research lab; no funding amount is stated there',
  '公式サイトはMidjourneyをcommunity-funded research labと説明。調達額は掲載されていません',
  '공식 사이트는 Midjourney를 community-funded research lab으로 설명하며 투자 금액은 공개하지 않습니다',
  'Le site officiel décrit Midjourney comme un laboratoire de recherche financé par sa communauté, sans montant indiqué',
  'Die offizielle Website beschreibt Midjourney als community-finanziertes Forschungslabor; ein Betrag wird nicht genannt',
  'El sitio oficial describe Midjourney como un laboratorio de investigación financiado por su comunidad; no indica un importe',
  'O site oficial descreve a Midjourney como laboratório de pesquisa financiado pela comunidade, sem divulgar valor',
  'يصف الموقع الرسمي Midjourney بأنه مختبر أبحاث ممول من المجتمع دون ذكر مبلغ'
 ],
 'midjourney.scale':[
  '官网 About 页面披露团队规模为 60 人',
  'Official About page reports a 60-person team',
  '公式Aboutページによるとチームは60人',
  '공식 About 페이지에 따르면 팀 규모는 60명입니다',
  'La page About officielle indique une équipe de 60 personnes',
  'Die offizielle About-Seite nennt ein Team von 60 Personen',
  'La página About oficial indica un equipo de 60 personas',
  'A página About oficial informa uma equipe de 60 pessoas',
  'تذكر صفحة About الرسمية أن الفريق يضم 60 شخصاً'
 ],
 'ollama.scale':[
  '官网当前展示：每月安装量 900 万+、模型下载量 10 亿+、累计服务 Token 200T+',
  'Official site figures: 9M+ monthly installs, 1B+ model downloads and 200T+ tokens served',
  '公式サイトの数値：月間インストール900万超、モデルダウンロード10億超、提供トークン200T超',
  '공식 사이트 수치: 월간 설치 900만 건 이상, 모델 다운로드 10억 건 이상, 처리 토큰 200T 이상',
  'Chiffres officiels : 9 M+ installations mensuelles, 1 Md+ téléchargements de modèles et 200 T+ tokens servis',
  'Offizielle Angaben: 9 Mio.+ monatliche Installationen, 1 Mrd.+ Modelldownloads und 200 Bio.+ bereitgestellte Tokens',
  'Cifras oficiales: más de 9 millones de instalaciones mensuales, 1.000 millones de descargas de modelos y 200 billones de tokens servidos',
  'Dados oficiais: mais de 9 milhões de instalações mensais, 1 bilhão de downloads de modelos e 200 trilhões de tokens servidos',
  'أرقام رسمية: أكثر من 9 ملايين تثبيت شهرياً، ومليار تنزيل للنماذج، و200 تريليون رمز تمت معالجته'
 ],
 'huggingface.scale':[
  '官网当前展示：2M+ 模型、1M+ AI 应用、500K+ 数据集',
  'Current official homepage figures: 2M+ models, 1M+ AI apps and 500K+ datasets',
  '公式ホームページの現在の表示：2M以上のモデル、1M以上のAIアプリ、500K以上のデータセット',
  '공식 홈페이지 현재 수치: 모델 2M+, AI 앱 1M+, 데이터셋 500K+',
  'Chiffres actuels de la page officielle : 2 M+ modèles, 1 M+ applications IA et 500 k+ jeux de données',
  'Aktuelle Angaben der offiziellen Startseite: 2 Mio.+ Modelle, 1 Mio.+ KI-Apps und 500.000+ Datensätze',
  'Cifras actuales de la página oficial: más de 2 millones de modelos, 1 millón de apps de IA y 500.000 conjuntos de datos',
  'Dados atuais da página oficial: mais de 2 milhões de modelos, 1 milhão de apps de IA e 500 mil conjuntos de dados',
  'الأرقام الحالية على الصفحة الرسمية: أكثر من مليوني نموذج، ومليون تطبيق ذكاء اصطناعي، و500 ألف مجموعة بيانات'
 ]
};
const identity:Record<string,string>={
 grok:'xai',transformers:'huggingface',
 chatgpt:'openai','openai-python':'openai',whisper:'openai',
 claude:'anthropic','anthropic-sdk-python':'anthropic',gemini:'google',qwen:'alibaba',
 jimeng:'bytedance',doubao:'bytedance',kling:'kuaishou',
 comfyui:'comfy',runway:'runway',luma:'luma',replit:'replit',suno:'suno'
};
const locations:Record<string,{country:string,city:string,openaiAddress?:boolean}>={
 openai:{country:'US',city:'San Francisco',openaiAddress:true},
 anthropic:{country:'US',city:'San Francisco'},
 google:{country:'US',city:'Mountain View'},
 alibaba:{country:'CN',city:'Hangzhou'},
 bytedance:{country:'CN',city:'Beijing'},
 luma:{country:'US',city:'Redwood City'},
 replit:{country:'US',city:'San Francisco'},
 langchain:{country:'US',city:'San Francisco'},
 xai:{country:'US',city:'Austin'},
 lovable:{country:'SE',city:'Stockholm'},
 n8n:{country:'DE',city:'Berlin'},
 kuaishou:{country:'CN',city:'Beijing'},
 runway:{country:'US',city:'New York'},
 elevenlabs:{country:'GB',city:'London'},
 suno:{country:'US',city:'Cambridge, MA'},
 midjourney:{country:'US',city:'San Francisco'},
 perplexity:{country:'US',city:'San Francisco'},
 dify:{country:'US',city:'Menlo Park'}
};
const locationQualifiers:Partial<Record<string,Record<Language,string>>>={
 runway:{zh:'2022年SEC申报营业地',en:'2022 SEC principal business address',ja:'2022年SEC申告の所在地',ko:'2022년 SEC 신고 영업 주소',fr:'adresse déclarée à la SEC en 2022',de:'2022 bei der SEC gemeldete Adresse',es:'domicilio declarado a la SEC en 2022',pt:'endereço declarado à SEC em 2022',ar:'عنوان العمل المسجل لدى SEC في 2022'},
 elevenlabs:{zh:'欧洲总部',en:'European HQ',ja:'欧州本部',ko:'유럽 본부',fr:'siège européen',de:'Europazentrale',es:'sede europea',pt:'sede europeia',ar:'المقر الأوروبي'},
 perplexity:{zh:'官网法务联系地址',en:'official legal contact address',ja:'公式法務連絡先住所',ko:'공식 법률 연락처',fr:'adresse de contact juridique officielle',de:'offizielle juristische Kontaktadresse',es:'dirección de contacto jurídico oficial',pt:'endereço oficial para contato jurídico',ar:'عنوان الاتصال القانوني الرسمي'}
};
const originWords:Record<Language,string>={zh:'公司起源',en:'company origin',ja:'会社の起源',ko:'기업 출발지',fr:'origine de la société',de:'Unternehmensursprung',es:'origen de la empresa',pt:'origem da empresa',ar:'منشأ الشركة'};
const labels:Record<Language,string>={
 zh:'公司地址',en:'OpCo address',ja:'運営会社の住所',ko:'운영사 주소',fr:'adresse de la société exploitante',
 de:'Adresse der Betreibergesellschaft',es:'domicilio de la sociedad operadora',
 pt:'endereço da empresa operadora',ar:'عنوان الشركة المشغلة'
};
export function localizeCompanyEvidence(id:string,language:Language,fact:CompanyEvidence|undefined):CompanyEvidence|undefined{
 if(!fact||language==='zh')return fact;
 const owner=identity[id]||id,local:CompanyEvidence={...fact};
 if(fact.headquarters){
  const place=locations[owner];
  if(place){
   const country=new Intl.DisplayNames([language],{type:'region'}).of(place.country)||place.country;
   local.headquarters={...fact.headquarters,text:country+' · '+place.city+(place.openaiAddress?' ('+labels[language]+')':owner==='bytedance'?' ('+originWords[language]+')':locationQualifiers[owner]?' ('+locationQualifiers[owner]![language]+')':'')};
  }else local.headquarters=undefined;
 }
 for(const field of ['funding','listing','projectStarted','scale'] as const){
  if(!fact[field])continue;
  const key=(owner+'.'+field) as Key;
  const alternatives=texts[key];
  const idx=ORDER.indexOf(language);
  if(alternatives&&idx>=0&&alternatives[idx]){
   local[field]={...fact[field]!,text:alternatives[idx]};
  }else{
   // Avoid mixing unreviewed Chinese factual prose into international SEO.
   local[field]=undefined;
  }
 }
 return local;
}
