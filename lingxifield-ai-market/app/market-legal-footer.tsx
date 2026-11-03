import type {CSSProperties} from 'react';
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
export function verifiedFiling(value:string|undefined,kind:'icp'|'police'):string|null{
 const s=(value||'').trim();
 if(s.length>64||/[<>]/.test(s))return null;
 if(kind==='icp')return /^.{0,8}ICP(?:备|证)\s*\d{5,12}号?$/u.test(s)?s:null;
 return /^[\p{Script=Han}]{1,6}公网安备\s*\d{13,15}号?$/u.test(s)?s:null;
}
const row:CSSProperties={display:'flex',flexWrap:'wrap',gap:'12px 18px',justifyContent:'center',alignItems:'center',padding:'22px 18px',fontSize:13,lineHeight:1.8,borderTop:'1px solid rgba(148,163,184,.28)',color:'inherit'};
export default function MarketLegalFooter({language='zh'}:{language?:string}){
 const t=COPY[language as Locale]||COPY.zh;
 // Numbers are displayed only after official approval and explicit deployment configuration.
 const icp=verifiedFiling(process.env.NEXT_PUBLIC_GLOBALSIAI_ICP_NUMBER,'icp');
 const police=verifiedFiling(process.env.NEXT_PUBLIC_GLOBALSIAI_POLICE_NUMBER,'police');
 return <footer aria-label={t.brand} dir={language==='ar'?'rtl':'ltr'} style={row}>
  <span>© {new Date().getFullYear()} LINGXIFIELD · {t.brand}</span>
  <a href="https://lingxifield.com/" rel="noopener noreferrer">{t.parent}</a>
  {icp&&<a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">{icp}</a>}
  {police&&<a href="https://beian.mps.gov.cn/" target="_blank" rel="noopener noreferrer">{police}</a>}
 </footer>;
}
