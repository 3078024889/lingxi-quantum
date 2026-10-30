'use client';
import type {Platform} from '../lib/data';
import type {Language} from '../lib/v2';
import {platformLinks,safePublisherLink} from '../lib/official-platform-links';

export function claimUrl(platform:Pick<Platform,'id'|'name'>){
 return '/vendor/claim?'+new URLSearchParams({product:platform.id,name:platform.name}).toString();
}
const copy:Record<Language,{web:string,detail:string,compare:string,selected:string,download:string,code:string,docs:string}>={
 zh:{web:'访问官网',detail:'详情',compare:'加入对比',selected:'已选对比',download:'官方下载',code:'源代码',docs:'官方文档'},
 en:{web:'Official site',detail:'Details',compare:'Compare',selected:'Selected',download:'Download',code:'Source code',docs:'Documentation'},
 ja:{web:'公式サイト',detail:'詳細',compare:'比較する',selected:'選択済み',download:'ダウンロード',code:'ソースコード',docs:'公式文書'},
 ko:{web:'공식 사이트',detail:'자세히',compare:'비교',selected:'선택됨',download:'다운로드',code:'소스 코드',docs:'공식 문서'},
 fr:{web:'Site officiel',detail:'Détails',compare:'Comparer',selected:'Sélectionné',download:'Télécharger',code:'Code source',docs:'Documentation'},
 de:{web:'Offizielle Seite',detail:'Details',compare:'Vergleichen',selected:'Ausgewählt',download:'Download',code:'Quellcode',docs:'Dokumentation'},
 es:{web:'Sitio oficial',detail:'Detalles',compare:'Comparar',selected:'Elegido',download:'Descargar',code:'Código fuente',docs:'Documentación'},
 pt:{web:'Site oficial',detail:'Detalhes',compare:'Comparar',selected:'Selecionado',download:'Baixar',code:'Código-fonte',docs:'Documentação'},
 ar:{web:'الموقع الرسمي',detail:'التفاصيل',compare:'مقارنة',selected:'تم اختياره',download:'تنزيل',code:'المصدر',docs:'الوثائق'}
};
export default function MarketRowActions({platform,onDetail,onToggleCompare,isCompared,language='zh'}:{
 platform:Platform;onDetail:()=>void;onToggleCompare:()=>void;isCompared:boolean;language?:Language;
}){
 const t=copy[language];
 const links=platformLinks(platform.id).links.filter(safePublisherLink);
 const download=links.find(l=>l.kind==='desktop'||l.kind==='ios'||l.kind==='android');
 const webLabel=platform.websiteKind==='repository'?t.code:platform.websiteKind==='documentation'?t.docs:t.web;
 return <div className="marketRowActions" aria-label={platform.name+' '+t.detail}>
  <a href={platform.website} className="rowPrimary" target="_blank" rel="noopener noreferrer">{webLabel} ↗</a>
  <button type="button" onClick={onDetail}>{t.detail}</button>
  <button type="button" className={isCompared?'rowCompareActive':''} onClick={onToggleCompare}>{isCompared?t.selected:t.compare}</button>
  {download&&<a className="marketRowDownload" href={download.url} target="_blank" rel="noopener noreferrer">{t.download} ↗</a>}
 </div>;
}
