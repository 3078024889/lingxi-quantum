import type {CSSProperties} from 'react';
import {headers} from 'next/headers';
import {verifiedFiling,chinaMarketHost} from '../lib/market-filing';
export {verifiedFiling} from '../lib/market-filing';
type Locale='zh'|'en'|'ja'|'ko'|'fr'|'de'|'es'|'pt'|'ar';
const COPY:Record<Locale,{brand:string;parent:string}>={
 zh:{brand:'全球 SIAI 排行榜',parent:'灵犀场主站'},
 en:{brand:'Global SIAI Rankings',parent:'LINGXIFIELD home'},
 ja:{brand:'グローバル SIAI ランキング',parent:'LINGXIFIELD ホーム'},
 ko:{brand:'글로벌 SIAI 순위',parent:'LINGXIFIELD 홈'},
 fr:{brand:'Classement mondial SIAI',parent:'Accueil LINGXIFIELD'},
 de:{brand:'Globales SIAI Ranking',parent:'LINGXIFIELD Startseite'},
 es:{brand:'Ranking global SIAI',parent:'Inicio LINGXIFIELD'},
 pt:{brand:'Ranking global SIAI',parent:'Início LINGXIFIELD'},
 ar:{brand:'تصنيف SIAI العالمي',parent:'LINGXIFIELD الرئيسية'}
};
const row:CSSProperties={display:'flex',flexWrap:'wrap',gap:'12px 18px',justifyContent:'center',alignItems:'center',padding:'22px 18px',fontSize:13,lineHeight:1.8,borderTop:'1px solid rgba(148,163,184,.28)',color:'inherit'};
export default async function MarketLegalFooter({language='zh'}:{language?:string}){
 const t=COPY[language as Locale]||COPY.zh;
 // Numbers are displayed only after official approval and explicit deployment configuration.
 const host=(await headers()).get('host');
 const cn=chinaMarketHost(host);
 const icp=cn?verifiedFiling(process.env.GLOBALSIAI_CN_ICP_NUMBER,'icp'):null;
 const police=cn?verifiedFiling(process.env.GLOBALSIAI_CN_POLICE_NUMBER,'police'):null;
 return <footer aria-label={t.brand} dir={language==='ar'?'rtl':'ltr'} style={row}>
  <span>© {new Date().getFullYear()} LINGXIFIELD · {t.brand}</span>
  <a href="https://lingxifield.com/" rel="noopener noreferrer">{t.parent}</a>
  {icp&&<a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">{icp}</a>}
  {police&&<a href="https://beian.mps.gov.cn/" target="_blank" rel="noopener noreferrer">{police}</a>}
 </footer>;
}
