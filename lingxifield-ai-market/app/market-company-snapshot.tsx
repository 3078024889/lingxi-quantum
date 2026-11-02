import type {Language} from '../lib/v2';
import type {Platform} from '../lib/data';
import {platformLinks} from '../lib/official-platform-links';
import {localizedProductSummary} from '../lib/market-product-locale';
import {companyEvidenceFor,companyPresentationFor} from '../lib/market-company-evidence';
import {capabilityProfile} from '../lib/capability-profiles';
import {localizeCompanyEvidence} from '../lib/market-company-evidence-locale';
import MarketPublisherFacts from './market-publisher-facts';
type Copy={title:string,company:string,created:string,location:string,funding:string,listed:string,scale:string,site:string,about:string,team:string};
const WORDS:Record<Language,Copy>={
 zh:{title:'公司简介',company:'公司',created:'成立',location:'总部/地区',funding:'融资',listed:'上市',scale:'公司规模',site:'官网',about:'主要业务',team:'团队'},
 en:{title:'Company overview',company:'Company',created:'Founded',location:'Headquarters',funding:'Funding',listed:'Listing',scale:'Scale',site:'Website',about:'What it does',team:'Team'},
 ja:{title:'企業概要',company:'企業',created:'設立',location:'所在地',funding:'調達',listed:'上場',scale:'企業規模',site:'公式サイト',about:'事業',team:'チーム'},
 ko:{title:'기업 소개',company:'회사',created:'설립',location:'본사',funding:'투자',listed:'상장',scale:'기업 규모',site:'공식 사이트',about:'주요 사업',team:'팀'},
 fr:{title:'Profil de l’entreprise',company:'Entreprise',created:'Fondée',location:'Siège',funding:'Financement',listed:'Cotation',scale:'Taille de l’entreprise',site:'Site officiel',about:'Activité',team:'Équipe'},
 de:{title:'Firmenprofil',company:'Firma',created:'Gegründet',location:'Sitz',funding:'Finanzierung',listed:'Börse',scale:'Unternehmensgröße',site:'Website',about:'Geschäft',team:'Team'},
 es:{title:'Empresa',company:'Empresa',created:'Fundación',location:'Sede',funding:'Financiación',listed:'Cotización',scale:'Tamaño de la empresa',site:'Web oficial',about:'Actividad',team:'Equipo'},
 pt:{title:'Empresa',company:'Empresa',created:'Fundação',location:'Sede',funding:'Investimento',listed:'Bolsa',scale:'Dimensão da empresa',site:'Site oficial',about:'Atividade',team:'Equipe'},
 ar:{title:'نبذة عن الشركة',company:'الشركة',created:'تأسست',location:'المقر',funding:'التمويل',listed:'الإدراج',scale:'حجم الشركة',site:'الموقع',about:'النشاط',team:'الفريق'}
};
const good=(s:string|undefined)=>Boolean(s&&s.trim()&&!/^(待核验|暂无|—|-|unknown|n\/a|未公开|not verified)$/i.test(s.trim()));
export default function MarketCompanySnapshot({platform:p,language}:{platform:Platform,language:Language}){
 const t=WORDS[language],links=platformLinks(p.id),team=links.team,evidence=localizeCompanyEvidence(p.id,language,companyEvidenceFor(p.id));
 const publisher=companyPresentationFor(p.id,p.company),profile=capabilityProfile(p.id);
 const listingLabels:Record<Language,{parent:string;undisclosed:string;project:string;noYear:string;operates:string;projectMaintainer:string;forWho:string}>={
 zh:{parent:'母公司已上市',undisclosed:'未见公开上市公告',project:'开源项目，不独立上市',noYear:'官方未公布年份',operates:'开发及运营',projectMaintainer:'维护',forWho:'适合'},
 en:{parent:'Publicly listed parent',undisclosed:'No confirmed public listing',project:'Open-source project; not separately listed',noYear:'Year not published',operates:'Develops and publishes',projectMaintainer:'Maintains',forWho:'For'},
 ja:{parent:'親会社は上場',undisclosed:'上場情報は未公表',project:'OSSプロジェクト',noYear:'年未公表',operates:'開発・運営',projectMaintainer:'保守',forWho:'対象'},
 ko:{parent:'모기업 상장',undisclosed:'상장 발표 없음',project:'오픈소스 프로젝트',noYear:'연도 미공개',operates:'개발·운영',projectMaintainer:'유지관리',forWho:'대상'},
 fr:{parent:'Groupe coté en bourse',undisclosed:'Aucune cotation confirmée',project:'Projet open source',noYear:'Année non publiée',operates:'Édite',projectMaintainer:'Maintient',forWho:'Pour'},
 de:{parent:'Mutterkonzern börsennotiert',undisclosed:'Keine bestätigte Börsennotierung',project:'Open-Source-Projekt',noYear:'Jahr nicht veröffentlicht',operates:'Entwickelt',projectMaintainer:'Pflegt',forWho:'Für'},
 es:{parent:'Matriz cotizada',undisclosed:'Cotización no confirmada',project:'Proyecto de código abierto',noYear:'Año no publicado',operates:'Desarrolla',projectMaintainer:'Mantiene',forWho:'Para'},
 pt:{parent:'Controladora listada',undisclosed:'Cotação não confirmada',project:'Projeto de código aberto',noYear:'Ano não publicado',operates:'Desenvolve',projectMaintainer:'Mantém',forWho:'Para'},
 ar:{parent:'الشركة الأم مدرجة',undisclosed:'لم يتم تأكيد الإدراج',project:'مشروع مفتوح المصدر',noYear:'السنة غير معلنة',operates:'تطور وتشغّل',projectMaintainer:'تصون',forWho:'مناسب لـ'}
 };
 const s=listingLabels[language];
 const facts=[
  {name:t.location,value:evidence?.headquarters?.text,source:evidence?.headquarters?.source},
  {name:t.funding,value:evidence?.funding?.text,source:evidence?.funding?.source},
  {name:t.scale,value:evidence?.scale?.text,source:evidence?.scale?.source},
  {name:language==='zh'?'项目起源':'Project origin',value:evidence?.projectStarted?.text,source:evidence?.projectStarted?.source},
 ].filter(x=>good(x.value));
 const productSummary=language==='zh'?(profile?.differentiator||profile?.headline||p.about):(localizedProductSummary(p.id,language)||p.about);
 const about=language==='zh'
  ?publisher.name+(publisher.kind==='company'?' 开发及运营 ':' 维护 ')+p.name+'。'+productSummary+(profile?' 适合：'+profile.audience+'。':'')
  :publisher.name+' · '+s.operates+' '+p.name+'. '+productSummary;
 return <section className="panel marketCompanySnapshot" aria-label={t.title}>
  <h2>{t.title}</h2><p className="marketCompanySummary">{about}</p>
  <MarketPublisherFacts publisher={publisher} language={language} showSources/>
  <div className="marketCompanyFacts">{facts.map(f=><div key={f.name}><small>{f.name}</small><strong>{f.value}</strong>{f.source&&<a href={f.source} target="_blank" rel="noopener noreferrer">{language==='zh'?'出处':'Source'} ↗</a>}</div>)}
   <div><small>{t.site}</small><a href={p.website} target="_blank" rel="noopener noreferrer">{p.domain} ↗</a></div>
  </div>
  {team&&good(team.summary)&&<div className="marketCompanyTeam"><strong>{t.team}</strong>{language==='zh'&&<p>{team.summary}</p>}<a href={team.source} target="_blank" rel="noopener noreferrer">{t.site} ↗</a></div>}
 </section>;
}
