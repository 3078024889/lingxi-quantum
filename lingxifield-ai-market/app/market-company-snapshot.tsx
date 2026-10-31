import type {Language} from '../lib/v2';
import type {Platform} from '../lib/data';
import {platformLinks} from '../lib/official-platform-links';
import {localizedProductSummary} from '../lib/market-product-locale';
type Copy={title:string,company:string,created:string,location:string,funding:string,listed:string,site:string,about:string,team:string};
const WORDS:Record<Language,Copy>={
 zh:{title:'公司简介',company:'公司',created:'成立',location:'总部/地区',funding:'融资',listed:'上市',site:'官网',about:'主要业务',team:'团队'},
 en:{title:'Company overview',company:'Company',created:'Founded',location:'Headquarters',funding:'Funding',listed:'Listing',site:'Website',about:'What it does',team:'Team'},
 ja:{title:'企業概要',company:'企業',created:'設立',location:'所在地',funding:'調達',listed:'上場',site:'公式サイト',about:'事業',team:'チーム'},
 ko:{title:'기업 소개',company:'회사',created:'설립',location:'본사',funding:'투자',listed:'상장',site:'공식 사이트',about:'주요 사업',team:'팀'},
 fr:{title:'Profil de l’entreprise',company:'Entreprise',created:'Fondée',location:'Siège',funding:'Financement',listed:'Cotation',site:'Site officiel',about:'Activité',team:'Équipe'},
 de:{title:'Firmenprofil',company:'Firma',created:'Gegründet',location:'Sitz',funding:'Finanzierung',listed:'Börse',site:'Website',about:'Geschäft',team:'Team'},
 es:{title:'Empresa',company:'Empresa',created:'Fundación',location:'Sede',funding:'Financiación',listed:'Cotización',site:'Web oficial',about:'Actividad',team:'Equipo'},
 pt:{title:'Empresa',company:'Empresa',created:'Fundação',location:'Sede',funding:'Investimento',listed:'Bolsa',site:'Site oficial',about:'Atividade',team:'Equipe'},
 ar:{title:'نبذة عن الشركة',company:'الشركة',created:'تأسست',location:'المقر',funding:'التمويل',listed:'الإدراج',site:'الموقع',about:'النشاط',team:'الفريق'}
};
const good=(s:string|undefined)=>Boolean(s&&s.trim()&&!/^(待核验|暂无|—|-|unknown|n\/a|未公开|not verified)$/i.test(s.trim()));
export default function MarketCompanySnapshot({platform:p,language}:{platform:Platform,language:Language}){
 const t=WORDS[language],links=platformLinks(p.id),team=links.team;
 const facts=[
  {name:t.company,value:p.company},
  {name:t.created,value:p.year},
  {name:t.location,value:p.location},
  {name:t.funding,value:p.funding},
  {name:t.listed,value:p.listing},
 ].filter(x=>good(x.value));
 const about=localizedProductSummary(p.id,language)||p.about;
 return <section className="panel marketCompanySnapshot" aria-label={t.title}>
  <h2>{t.title}</h2><p className="marketCompanySummary">{about}</p>
  <div className="marketCompanyFacts">{facts.map(f=><div key={f.name}><small>{f.name}</small><strong>{f.value}</strong></div>)}
   <div><small>{t.site}</small><a href={p.website} target="_blank" rel="noopener noreferrer">{p.domain} ↗</a></div>
  </div>
  {team&&good(team.summary)&&<div className="marketCompanyTeam"><strong>{t.team}</strong><p>{language==='zh'?team.summary:p.company}</p><a href={team.source} target="_blank" rel="noopener noreferrer">{t.site} ↗</a></div>}
 </section>;
}
