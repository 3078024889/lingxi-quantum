import Link from 'next/link';
import type {Language} from '../lib/v2';
import {coverageForSeoGeo,groupedSeoGeo} from '../lib/seo-geo-observations';
const COPY:Record<Language,readonly [string,string,string,string,string,string,string,string,string,string,string,string,string]>={
 zh:["搜索、AI 推荐与历史变化","看看工具在搜索与 AI 回答中的表现","SEO 自然搜索","Google Search Console 统计本站平均排名、曝光与点击；独立 Google/Bing 搜索结果排名另行采样。","GEO AI 引用","AI 回答是否提到或引用产品；逐条记录问题、模型与出处。","用户任务","按视频、图片、代码、语音等真实任务比较能力与费用。","时间变化","查看最近 7 天、30 天的搜索和 AI 推荐变化。","搜索与 AI 推荐榜单正在更新，现在可按用途、价格和地区选择工具。","免费提交厂商与官方资料","赞助推广位不参与自然排名计算"],
 en:["Search, AI citations and trends","Discover how tools appear in search and AI answers","Organic SEO","Google Search Console average position, impressions and clicks for our own pages; independent Google/Bing result ranks are measured separately.","GEO citations","Track actual AI answer mentions and citations by prompt, model and source.","User tasks","Compare real tasks across video, images, code and audio.","History","See changes in search and AI answers over 7 or 30 days.","Search and AI recommendations are coming. Compare by task, price and region now.","Submit publisher evidence for free","Sponsored placement never alters organic ranking"],
 ja:["検索・AI引用・推移","検索とAI回答での紹介状況を見る","自然検索 SEO","Google Search Console による自社ページの平均掲載順位・表示・クリック。独立した Google/Bing 検索順位は別途測定。","GEO 引用","AI 回答での言及・引用を質問、モデル、出典ごとに記録。","利用目的","動画、画像、コード、音声の機能と料金を比較。","履歴","直近7日・30日の検索とAI紹介の変化を見る。","検索・AIのおすすめ情報を更新中。目的、料金、地域で比較できます。","企業・公式資料を無料登録","広告掲載は自然順位に影響しません"],
 ko:["검색, AI 인용, 추이","검색과 AI 답변에서 도구를 찾는 방법","자연 검색 SEO","자사 페이지의 Google Search Console 평균 게재순위·노출·클릭. 독립 Google/Bing 검색결과 순위는 별도로 측정합니다.","GEO 인용","AI 답변에 실제로 언급/인용된 자료를 질문과 모델별 기록.","사용자 작업","영상·이미지·코드·음성 기능과 요금 비교.","변화 추적","최근 7일과 30일간 검색 및 AI 추천 변화를 확인합니다.","검색과 AI 추천 정보를 업데이트 중입니다. 기능과 가격, 지역으로 비교하세요.","기업·공식 자료 무료 제출","광고는 자연 검색 순위에 영향을 주지 않습니다"],
 fr:["Recherche, citations IA et tendances","Découvrez les outils présents dans les recherches et réponses IA","SEO organique","Position moyenne, impressions et clics de nos pages dans Google Search Console ; les positions SERP indépendantes Google/Bing sont mesurées séparément.","Citations GEO","Mentions et citations dans les réponses IA, selon question et modèle.","Besoins réels","Comparer vidéo, image, code, audio et leurs coûts.","Historique","Suivez les changements sur 7 et 30 jours.","Les résultats recherche et IA arrivent. Comparez déjà par usage, prix et pays.","Soumettre les sources officielles gratuitement","Le sponsorisé n’affecte pas les classements organiques"],
 de:["Suche, KI-Zitate und Trends","Entdecken Sie Tools in der Suche und in KI-Antworten","Organische Suche","Durchschnittliche Position, Impressionen und Klicks unserer eigenen Seiten in der Google Search Console; unabhängige Google-/Bing-SERP-Ränge werden separat gemessen.","GEO-Zitate","KI-Antworten nach Frage, Modell, Erwähnung und Quelle messen.","Nutzeraufgaben","Videos, Bilder, Code und Audio samt Kosten vergleichen.","Zeitverlauf","Änderungen der letzten 7 und 30 Tage ansehen.","Such- und KI-Ergebnisse folgen. Vergleichen Sie nach Aufgabe, Preis und Land.","Anbieterquellen kostenlos einreichen","Werbung verändert kein organisches Ranking"],
 es:["Búsqueda, citas IA y tendencias","Descubre herramientas en búsquedas y respuestas de IA","SEO orgánico","Posición media, impresiones y clics de nuestras propias páginas en Google Search Console; las posiciones SERP independientes de Google/Bing se miden por separado.","Citas GEO","Menciones y referencias en respuestas IA por pregunta, modelo y fuente.","Tareas reales","Comparar vídeo, imágenes, código, audio y costes.","Historial","Consulta cambios de búsqueda y recomendaciones IA a 7 y 30 días.","Llegan datos de búsqueda e IA. Compara ahora por uso, precio y país.","Enviar fuentes oficiales gratis","Los anuncios no alteran el ranking orgánico"],
 pt:["Pesquisa, citações IA e tendências","Veja ferramentas na pesquisa e nas respostas de IA","SEO orgânico","Posição média, impressões e cliques das nossas páginas no Google Search Console; posições independentes nos resultados Google/Bing são medidas separadamente.","Citações GEO","Menções em respostas IA por pergunta, modelo e fonte.","Tarefas reais","Comparar vídeo, imagens, código, áudio e custos.","Histórico","Veja as mudanças da pesquisa e da IA em 7 e 30 dias.","Dados de busca e IA em atualização. Compare por tarefa, preço e país.","Enviar fontes oficiais gratuitamente","Anúncios não alteram posição orgânica"],
 ar:["البحث والاستشهادات والاتجاهات","اكتشف الأدوات في نتائج البحث وإجابات الذكاء الاصطناعي","البحث الطبيعي SEO","متوسط موضع صفحاتنا ومرات الظهور والنقر في Google Search Console؛ وتُقاس نتائج Google/Bing المستقلة بشكل منفصل.","الاستشهاد في GEO","تسجيل ذكر المنتج ومصادره في إجابات AI بحسب السؤال والنموذج.","مهام المستخدم","مقارنة الفيديو والصور والبرمجة والصوت والتكلفة.","التغير التاريخي","شاهد التغيرات في البحث وتوصيات الذكاء الاصطناعي خلال 7 و30 يوماً.","يجري تحديث نتائج البحث وتوصيات الذكاء الاصطناعي. قارن الأدوات حسب الاستخدام والسعر والبلد.","أرسل المصادر الرسمية مجاناً","الإعلانات لا تغير الترتيب الطبيعي"]
};
const GSC_COPY:Record<Language,{title:string;impressions:string;clicks:string;ctr:string;position:string;date:string}>={
 zh:{title:'本站 Google 搜索表现',impressions:'曝光',clicks:'点击',ctr:'点击率',position:'平均位置',date:'数据日期'},
 en:{title:'Our Google Search performance',impressions:'Impressions',clicks:'Clicks',ctr:'CTR',position:'Average position',date:'Data date'},
 ja:{title:'自社サイトの Google 検索実績',impressions:'表示回数',clicks:'クリック',ctr:'クリック率',position:'平均掲載順位',date:'データ日'},
 ko:{title:'자사 사이트 Google 검색 실적',impressions:'노출',clicks:'클릭',ctr:'클릭률',position:'평균 게재순위',date:'데이터 날짜'},
 fr:{title:'Performances Google de notre site',impressions:'Impressions',clicks:'Clics',ctr:'Taux de clic',position:'Position moyenne',date:'Date des données'},
 de:{title:'Google-Suchleistung unserer Website',impressions:'Impressionen',clicks:'Klicks',ctr:'Klickrate',position:'Durchschnittliche Position',date:'Datenstand'},
 es:{title:'Rendimiento de búsqueda de nuestro sitio',impressions:'Impresiones',clicks:'Clics',ctr:'CTR',position:'Posición media',date:'Fecha de datos'},
 pt:{title:'Desempenho da pesquisa do nosso site',impressions:'Impressões',clicks:'Cliques',ctr:'CTR',position:'Posição média',date:'Data dos dados'},
 ar:{title:'أداء البحث لموقعنا في Google',impressions:'مرات الظهور',clicks:'النقرات',ctr:'معدل النقر',position:'متوسط الموضع',date:'تاريخ البيانات'}
};
const EMPTY_STATUS:Record<Language,{ownedTitle:string;ownedEmpty:string;serpTitle:string;serpEmpty:string;geoTitle:string;geoEmpty:string}>={
 zh:{ownedTitle:'本站 Google 搜索数据',ownedEmpty:'尚未接入并发布本站 Search Console 实际数据。',serpTitle:'Google / Bing 自然排名',serpEmpty:'暂无经过核验的真实搜索结果排名。',geoTitle:'AI 回答引用',geoEmpty:'暂无经过核验的模型回答与引用记录。'},
 en:{ownedTitle:'Our Google search data',ownedEmpty:'Real Search Console data for our pages has not been connected and published yet.',serpTitle:'Google / Bing organic ranks',serpEmpty:'No independently captured and reviewed search positions are available yet.',geoTitle:'AI answer citations',geoEmpty:'No reviewed model-answer mentions or citations are available yet.'},
 ja:{ownedTitle:'自社サイトの Google 検索データ',ownedEmpty:'Search Console の実測データはまだ接続・公開されていません。',serpTitle:'Google / Bing 自然検索順位',serpEmpty:'検証済みの実際の検索順位データはまだありません。',geoTitle:'AI回答の引用',geoEmpty:'検証済みのAI回答への言及・引用データはまだありません。'},
 ko:{ownedTitle:'자사 Google 검색 데이터',ownedEmpty:'Search Console 실제 데이터가 아직 연결·공개되지 않았습니다.',serpTitle:'Google / Bing 자연 검색 순위',serpEmpty:'검증된 실제 검색 순위 데이터가 아직 없습니다.',geoTitle:'AI 답변 인용',geoEmpty:'검증된 모델 답변 언급·인용 데이터가 아직 없습니다.'},
 fr:{ownedTitle:'Données Google de notre site',ownedEmpty:'Les données réelles de Search Console ne sont pas encore connectées et publiées.',serpTitle:'Positions organiques Google / Bing',serpEmpty:'Aucune position issue d’une capture indépendante vérifiée pour le moment.',geoTitle:'Citations dans les réponses IA',geoEmpty:'Aucune mention ou citation IA vérifiée pour le moment.'},
 de:{ownedTitle:'Google-Suchdaten unserer Website',ownedEmpty:'Echte Search-Console-Daten sind noch nicht verbunden und veröffentlicht.',serpTitle:'Organische Google-/Bing-Ränge',serpEmpty:'Noch liegen keine unabhängig erfassten und geprüften Suchpositionen vor.',geoTitle:'KI-Antwortzitate',geoEmpty:'Noch liegen keine geprüften Erwähnungen oder Zitate aus KI-Antworten vor.'},
 es:{ownedTitle:'Datos de búsqueda de nuestro sitio',ownedEmpty:'Los datos reales de Search Console aún no están conectados ni publicados.',serpTitle:'Posiciones orgánicas Google / Bing',serpEmpty:'Todavía no hay posiciones de búsqueda capturadas y verificadas de forma independiente.',geoTitle:'Citas en respuestas de IA',geoEmpty:'Todavía no hay menciones ni citas verificadas de respuestas de modelos.'},
 pt:{ownedTitle:'Dados de pesquisa do nosso site',ownedEmpty:'Os dados reais do Search Console ainda não foram conectados nem publicados.',serpTitle:'Posições orgânicas Google / Bing',serpEmpty:'Ainda não há posições de pesquisa capturadas e verificadas de forma independente.',geoTitle:'Citações em respostas de IA',geoEmpty:'Ainda não há menções ou citações verificadas de respostas de modelos.'},
 ar:{ownedTitle:'بيانات بحث موقعنا في Google',ownedEmpty:'لم يتم ربط بيانات Search Console الفعلية ونشرها بعد.',serpTitle:'الترتيب الطبيعي في Google / Bing',serpEmpty:'لا توجد حتى الآن مواضع بحث حقيقية تم جمعها والتحقق منها بشكل مستقل.',geoTitle:'الاستشهادات في إجابات الذكاء الاصطناعي',geoEmpty:'لا توجد حتى الآن إشارات أو استشهادات موثقة من إجابات النماذج.'}
};
export default function SeoGeoBoard({language='zh'}:{language?:Language}){
 const t=COPY[language]||COPY.zh;
 const coverage=coverageForSeoGeo(),comparisons=groupedSeoGeo();
 const status=EMPTY_STATUS[language]||EMPTY_STATUS.zh;
 const missing=[
  {key:'owned',ready:coverage.gscObservations>0,title:status.ownedTitle,body:status.ownedEmpty},
  {key:'serp',ready:coverage.independentSerpObservations>0,title:status.serpTitle,body:status.serpEmpty},
  {key:'geo',ready:coverage.geoObservations>0,title:status.geoTitle,body:status.geoEmpty}
 ].filter(x=>!x.ready);
 return <section className="panel seoGeoBoard" aria-label={t[0]}>
  <div className="rankHead"><h2>{t[0]}</h2><span>{t[1]}</span></div>
  {coverage.gscObservations>0&&coverage.gscCtr!==null&&coverage.gscAveragePosition!==null&&coverage.gscLatestDate?<section className="seoGeoOwnedMetrics" aria-label={GSC_COPY[language].title}>
   <strong>{GSC_COPY[language].title}</strong>
   <div>
    <span><b>{new Intl.NumberFormat(language).format(coverage.gscImpressions)}</b><small>{GSC_COPY[language].impressions}</small></span>
    <span><b>{new Intl.NumberFormat(language).format(coverage.gscClicks)}</b><small>{GSC_COPY[language].clicks}</small></span>
    <span><b>{new Intl.NumberFormat(language,{style:'percent',maximumFractionDigits:1}).format(coverage.gscCtr)}</b><small>{GSC_COPY[language].ctr}</small></span>
    <span><b>{coverage.gscAveragePosition.toFixed(1)}</b><small>{GSC_COPY[language].position}</small></span>
   </div>
   <small>{GSC_COPY[language].date}: {new Date(coverage.gscLatestDate+'T00:00:00Z').toLocaleDateString(language)}</small>
  </section>:null}
  {comparisons.length>0?<div className="seoGeoVerifiedComparisons">{comparisons.slice(0,6).map(g=><article key={g.key}><strong>{g.key}</strong>{g.rows.map(r=><p key={r.platformId}><b>{r.platformId}</b> · {r.position!==null?'#'+r.position:r.citations!==null?r.citations+' citations':'—'} · <a href={r.sourceUrl} rel="noopener noreferrer" target="_blank">{language==='zh'?'证据':'Source'} ↗</a></p>)}</article>)}</div>:null}
  <div className="seoGeoCompare">
   <article><strong>{t[2]}</strong><p>{t[3]}</p></article>
   <article><strong>{t[4]}</strong><p>{t[5]}</p></article>
   <article><strong>{t[6]}</strong><p>{t[7]}</p></article>
   <article><strong>{t[8]}</strong><p>{t[9]}</p></article>
  </div>
  {missing.length>0?<div className="seoGeoEmptyStatus" aria-label={t[0]}>
   {missing.map(item=><article key={item.key}><strong>{item.title}</strong><p>{item.body}</p></article>)}
  </div>:null}
  <div className="seoGeoFooter"><Link href="/vendor/claim">{t[11]} ↗</Link><span>{t[12]}</span></div>
 </section>;
}