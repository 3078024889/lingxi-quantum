'use client';
import {useEffect,useState} from 'react';
import type {Language} from '../lib/v2';
const COPY:Record<Language,string[]>={"zh":["合作推广","精选品牌展示","推广内容 · Sponsored","推广","访问官网","合作展示不会改变自然排名、用户评价、实际价格或访问数据。"],"en":["Sponsored","Featured publishers","Paid placement · Sponsored","Sponsored","Official site","Sponsored placement does not affect organic rank, reviews, prices or traffic data."],"ja":["広告","注目ブランド","スポンサー表示","広告","公式サイト","広告は自然順位、レビュー、価格、アクセス実績に影響しません。"],"ko":["광고","추천 브랜드","스폰서 콘텐츠","광고","공식 사이트","광고는 자연 순위·리뷰·가격·트래픽에 영향을 주지 않습니다."],"fr":["Sponsorisé","Éditeurs mis en avant","Placement sponsorisé","Sponsorisé","Site officiel","La promotion ne modifie ni classement naturel, avis, prix ou trafic."],"de":["Gesponsert","Vorgestellte Anbieter","Gesponserte Platzierung","Anzeige","Offizielle Website","Werbung verändert keine organischen Ränge, Bewertungen, Preise oder Besuchszahlen."],"es":["Patrocinado","Proveedores destacados","Anuncio patrocinado","Anuncio","Sitio oficial","El patrocinio no altera clasificación orgánica, opiniones, precios ni tráfico."],"pt":["Patrocinado","Fornecedores em destaque","Anúncio patrocinado","Anúncio","Site oficial","Publicidade não altera rankings naturais, avaliações, preços nem tráfego."],"ar":["إعلان ممول","شركات مختارة","موضع ممول","إعلان","الموقع الرسمي","الإعلان لا يغير الترتيب الطبيعي أو التقييمات أو الأسعار أو الزيارات."]};
type Item={projectId:string;label:string;targetUrl:string;sponsored:true};
export default function SponsoredFeatures({language='zh'}:{language?:Language}){
 const t=COPY[language]||COPY.zh;
 const [items,setItems]=useState<Item[]>([]);
 useEffect(()=>{const controller=new AbortController();fetch('/api/v1/sponsored',{signal:controller.signal})
 .then(r=>r.ok?r.json():null).then(d=>{if(!controller.signal.aborted&&d?.affectsOrganicRank===false&&Array.isArray(d.items))setItems(d.items)})
 .catch(()=>{});return()=>controller.abort();},[]);
 if(!items.length)return null;
 return <section className="panel sponsoredArea" aria-label={t[0]}><h2>{t[1]} <small>{t[2]}</small></h2>
  <div className="sponsoredCards">{items.map(x=><a key={x.projectId} href={x.targetUrl} rel="noopener noreferrer sponsored nofollow" target="_blank">
   <span className="sponsoredTag">{t[3]}</span><strong>{x.label}</strong><span>{t[4]} ↗</span></a>)}</div>
  <p>{t[5]}</p></section>;
}
