'use client';
import {useEffect,useState} from 'react';
import type {Language} from '../lib/v2';
type EvidenceData={candidateCount:number;approvedCandidateCount:number;sourceItemCount:number;reviewNeededCount:number;syncRunCount:number;latestObservedAt:string|null};
type Status={status:'live'|'unavailable'|'invalid';curatedProfiles:number;verifiedGeoMetrics:number;data:EvidenceData|null};
const COPY:Record<Language,{title:string;curated:string;candidate:string;review:string;sync:string;geo:string;noGeo:string;last:string;notice:string;offline:string}>={
 zh:{title:'数据状态',curated:'现有产品档案',candidate:'待核验候选',review:'待复核来源',sync:'同步批次',geo:'已核验行情指标',noGeo:'尚无',last:'最近采集',notice:'候选不等于已审核产品，也不是搜索热度或 SEO/GEO 排名。',offline:'来源数据暂未连接'},
 en:{title:'Data coverage',curated:'Curated profiles',candidate:'Unverified candidates',review:'Sources awaiting review',sync:'Sync runs',geo:'Verified market metrics',noGeo:'None yet',last:'Last observation',notice:'Candidates are not approved products or search/AI visibility ranks.',offline:'Source data unavailable'},
 ja:{title:'データ状況',curated:'製品プロファイル',candidate:'未確認候補',review:'確認待ち資料',sync:'同期回数',geo:'検証済み指標',noGeo:'未取得',last:'最新観測',notice:'候補は承認済み製品や検索順位ではありません。',offline:'データ接続なし'},
 ko:{title:'데이터 현황',curated:'제품 프로필',candidate:'미확인 후보',review:'검토 대기 출처',sync:'동기화 실행',geo:'검증된 지표',noGeo:'없음',last:'마지막 수집',notice:'후보는 승인된 제품이나 검색 순위가 아닙니다.',offline:'데이터 연결 불가'},
 fr:{title:'Données',curated:'Fiches produits',candidate:'Candidats non vérifiés',review:'Sources à vérifier',sync:'Synchronisations',geo:'Indicateurs vérifiés',noGeo:'Aucun',last:'Dernière collecte',notice:'Les candidats ne sont pas des produits approuvés ni des classements.',offline:'Sources indisponibles'},
 de:{title:'Datenstatus',curated:'Produktprofile',candidate:'Ungeprüfte Kandidaten',review:'Quellen in Prüfung',sync:'Synchronisationen',geo:'Geprüfte Messwerte',noGeo:'Noch keine',last:'Letzte Erfassung',notice:'Kandidaten sind keine zugelassenen Produkte oder Rankings.',offline:'Quelldaten nicht verfügbar'},
 es:{title:'Estado de datos',curated:'Fichas de productos',candidate:'Candidatos sin verificar',review:'Fuentes pendientes',sync:'Sincronizaciones',geo:'Métricas verificadas',noGeo:'Ninguna',last:'Última captura',notice:'Los candidatos no son productos aprobados ni posiciones de búsqueda.',offline:'Fuentes no disponibles'},
 pt:{title:'Estado dos dados',curated:'Perfis de produtos',candidate:'Candidatos não verificados',review:'Fontes pendentes',sync:'Sincronizações',geo:'Métricas verificadas',noGeo:'Nenhuma',last:'Última coleta',notice:'Candidatos não são produtos aprovados nem rankings.',offline:'Fontes indisponíveis'},
 ar:{title:'حالة البيانات',curated:'ملفات المنتجات',candidate:'عناصر غير مؤكدة',review:'مصادر قيد المراجعة',sync:'عمليات المزامنة',geo:'مقاييس موثقة',noGeo:'لا يوجد',last:'آخر رصد',notice:'العناصر المرشحة ليست منتجات معتمدة ولا تصنيفات بحث.',offline:'المصادر غير متاحة'}
};
export default function MarketEvidenceStatus({language}:{language:Language}){
 const [state,setState]=useState<Status|null>(null);
 useEffect(()=>{const c=new AbortController();fetch('/api/market/evidence-status',{signal:c.signal,cache:'no-store'}).then(async r=>{const data=await r.json();if(!c.signal.aborted)setState(data);}).catch(()=>{});return()=>c.abort()},[]);
 if(!state)return null;
 const t=COPY[language],d=state.data;
 return <section className="marketEvidenceStatus" aria-label={t.title} dir={language==='ar'?'rtl':'ltr'}>
  <strong>{t.title}</strong>
  <span>{t.curated}: <b>{state.curatedProfiles}</b></span>
  {state.status==='live'&&d?<><span>{t.candidate}: <b>{d.candidateCount}</b></span><span>{t.review}: <b>{d.reviewNeededCount}</b></span><span>{t.sync}: <b>{d.syncRunCount}</b></span></>:<span>{t.offline}</span>}
  <span>{t.geo}: <b>{state.verifiedGeoMetrics===0?t.noGeo:state.verifiedGeoMetrics}</b></span>
  <small>{t.notice}{d?.latestObservedAt?' · '+t.last+': '+d.latestObservedAt.slice(0,10):''}</small>
 </section>;
}