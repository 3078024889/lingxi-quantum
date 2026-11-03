'use client';
import {useEffect,useState} from 'react';
import type {Language} from '../lib/v2';
type Status={status:'live'|'unavailable'|'invalid';curatedProfiles:number};
const COPY:Record<Language,{title:string;curated:string;source:string}>={
 zh:{title:'精选 AI 工具',curated:'可比较的工具',source:'查看每项官方资料与实际使用条件'},
 en:{title:'Selected AI tools',curated:'Tools to compare',source:'Explore official sources and use conditions'},
 ja:{title:'AIツール比較',curated:'比較できるツール',source:'各ツールの公式資料と利用条件'},
 ko:{title:'추천 AI 도구',curated:'비교할 도구',source:'공식 자료 및 이용 조건 확인'},
 fr:{title:'Outils IA sélectionnés',curated:'Outils à comparer',source:'Consultez les sources et les conditions'},
 de:{title:'Ausgewählte KI-Tools',curated:'Tools vergleichen',source:'Offizielle Quellen und Nutzungsbedingungen'},
 es:{title:'Herramientas IA',curated:'Herramientas para comparar',source:'Consulta fuentes y condiciones oficiales'},
 pt:{title:'Ferramentas de IA',curated:'Ferramentas para comparar',source:'Veja fontes e condições oficiais'},
 ar:{title:'أدوات الذكاء الاصطناعي',curated:'أدوات للمقارنة',source:'اطلع على المصادر والشروط الرسمية'}
};
export default function MarketEvidenceStatus({language}:{language:Language}){
 const [state,setState]=useState<Status|null>(null);
 useEffect(()=>{const c=new AbortController();fetch('/api/market/evidence-status',{signal:c.signal,cache:'no-store'}).then(async r=>{if(!r.ok)return;const data=await r.json();if(!c.signal.aborted)setState(data);}).catch(()=>{});return()=>c.abort()},[]);
 if(!state||state.status!=='live'||!Number.isSafeInteger(state.curatedProfiles)||state.curatedProfiles<=0)return null;
 const t=COPY[language]||COPY.zh;
 return <section className="marketEvidenceStatus" aria-label={t.title} dir={language==='ar'?'rtl':'ltr'}>
  <strong>{t.title}</strong><span>{t.curated}: <b>{state.curatedProfiles}</b></span><small>{t.source}</small>
 </section>;
}
