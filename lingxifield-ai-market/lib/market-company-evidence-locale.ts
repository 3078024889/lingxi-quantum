import type {Language} from './v2';
import type {CompanyEvidence} from './market-company-evidence';

// One source of financial facts, multiple language presentations. Text is never
// machine-translated at runtime; values absent from the publisher ledger stay absent.
const ORDER=['zh','en','ja','ko','fr','de','es','pt','ar'] as const;
type Key='anthropic.funding'|'suno.funding'|'replit.funding'|'comfy.funding'|'google.listing'|'alibaba.listing'|'kuaishou.listing'|'kuaishou.projectStarted'|'runway.projectStarted'|'comfy.projectStarted';
const texts:Record<Key,readonly string[]>={
 'anthropic.funding':[
  '2022 年 B 轮融资 5.8 亿美元（非累计）','2022 Series B: US$580M (not cumulative)','2022年シリーズB：5.8億米ドル（累計ではありません）','2022년 시리즈 B: 미화 5억 8천만 달러(누적 아님)',
  'Série B en 2022 : 580 M$ US (non cumulés)','Serie B 2022: 580 Mio. US-Dollar (nicht kumuliert)','Serie B de 2022: 580 MUSD (no acumulados)','Série B de 2022: US$ 580 milhões (não acumulados)','الجولة B في 2022: مبلغ 580 مليون دولار (ليست حصيلة تراكمية)'
 ],
 'suno.funding':[
  '官方公布累计融资超过 7.75 亿美元','Over US$775M in cumulative funding, per Suno','公式発表の累計調達額は7.75億米ドル超','공식 발표 누적 투자 유치액 7억 7,500만 달러 초과',
  'Plus de 775 M$ US de financements cumulés selon Suno','Laut Suno über 775 Mio. US-Dollar Gesamtfinanzierung','Más de 775 MUSD de financiación acumulada según Suno','Mais de US$ 775 milhões em financiamento acumulado, segundo a Suno','أعلنت Suno أن التمويل التراكمي يتجاوز 775 مليون دولار'
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
 ]
};
const identity:Record<string,string>={
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
 replit:{country:'US',city:'San Francisco'}
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
   local.headquarters={...fact.headquarters,text:country+' · '+place.city+(place.openaiAddress?' ('+labels[language]+')':owner==='bytedance'?' ('+originWords[language]+')':'')};
  }else local.headquarters=undefined;
 }
 for(const field of ['funding','listing','projectStarted'] as const){
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
