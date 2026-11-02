import type {Language} from '../lib/v2';
import type {companyPresentationFor} from '../lib/market-company-evidence';

type Publisher=ReturnType<typeof companyPresentationFor>;
type Labels={company:string;maintainer:string;legal:string;parentLegal:string;listing:string;founded:string;started:string;
 unverified:string;notApplicable:string;listedParent:string;notConfirmed:string;ipoFiled:string;source:string};
export const COMPANY_IDENTITY_LABELS:Record<Language,Labels>={
 zh:{company:'公司名称',maintainer:'维护方',legal:'法人主体',parentLegal:'集团法人主体',listing:'是否上市',founded:'成立时间',started:'项目始于',unverified:'—',notApplicable:'不适用',listedParent:'所属集团已上市',notConfirmed:'未确认上市',ipoFiled:'已递交 IPO 申请，尚未上市',source:'官方资料'},
 en:{company:'Company',maintainer:'Maintainer',legal:'Legal entity',parentLegal:'Parent legal entity',listing:'Listed?',founded:'Founded',started:'Project since',unverified:'—',notApplicable:'N/A',listedParent:'Listed parent group',notConfirmed:'Not confirmed listed',ipoFiled:'IPO filing; not yet listed',source:'Official source'},
 ja:{company:'会社名',maintainer:'管理者',legal:'法人名',parentLegal:'親会社法人名',listing:'上場状況',founded:'設立',started:'開始年',unverified:'—',notApplicable:'対象外',listedParent:'上場企業グループ',notConfirmed:'上場未確認',ipoFiled:'IPO申請済・未上場',source:'公式資料'},
 ko:{company:'회사명',maintainer:'관리 주체',legal:'법인명',parentLegal:'모기업 법인명',listing:'상장 여부',founded:'설립',started:'프로젝트 시작',unverified:'—',notApplicable:'해당 없음',listedParent:'상장 그룹 소속',notConfirmed:'상장 확인 안 됨',ipoFiled:'IPO 신청 제출·미상장',source:'공식 출처'},
 fr:{company:'Entreprise',maintainer:'Responsable',legal:'Entité juridique',parentLegal:'Entité mère',listing:'Cotée ?',founded:'Fondation',started:'Projet depuis',unverified:'—',notApplicable:'Sans objet',listedParent:'Groupe coté',notConfirmed:'Cotation non confirmée',ipoFiled:'Introduction demandée, non cotée',source:'Source officielle'},
 de:{company:'Unternehmen',maintainer:'Betreiber',legal:'Rechtsträger',parentLegal:'Muttergesellschaft',listing:'Börsennotiert?',founded:'Gründung',started:'Projekt seit',unverified:'—',notApplicable:'Nicht zutreffend',listedParent:'Börsennotierte Mutter',notConfirmed:'Nicht bestätigt',ipoFiled:'Börsengang beantragt, noch nicht notiert',source:'Offizielle Quelle'},
 es:{company:'Empresa',maintainer:'Responsable',legal:'Entidad jurídica',parentLegal:'Matriz legal',listing:'¿Cotiza?',founded:'Fundación',started:'Proyecto desde',unverified:'—',notApplicable:'No aplica',listedParent:'Grupo cotizado',notConfirmed:'Sin confirmar',ipoFiled:'OPV solicitada, aún no cotiza',source:'Fuente oficial'},
 pt:{company:'Empresa',maintainer:'Responsável',legal:'Entidade legal',parentLegal:'Entidade controladora',listing:'Listada?',founded:'Fundação',started:'Projeto desde',unverified:'—',notApplicable:'Não se aplica',listedParent:'Grupo listado',notConfirmed:'Não confirmado',ipoFiled:'IPO solicitada, ainda não listada',source:'Fonte oficial'},
 ar:{company:'اسم الشركة',maintainer:'الجهة المطوّرة',legal:'الكيان القانوني',parentLegal:'الشركة الأم القانونية',listing:'الإدراج',founded:'تاريخ التأسيس',started:'بداية المشروع',unverified:'—',notApplicable:'لا ينطبق',listedParent:'المجموعة الأم مدرجة',notConfirmed:'الإدراج غير مؤكد',ipoFiled:'تم تقديم طلب اكتتاب ولم يتم الإدراج',source:'المصدر الرسمي'}
};
/**
 * Four independent company identity facts; never infer legal entities from
 * brand names, or infer "private" from the absence of a listing announcement.
 * Consumer and parent-company legal entities are explicitly distinguished.
 */
export default function MarketPublisherFacts({publisher:p,language,showSources=false,compact=false}:{
 publisher:Publisher;language:Language;showSources?:boolean;compact?:boolean
}){
 const t=COMPANY_IDENTITY_LABELS[language],company=p.kind==='company';
 const listing=company?(p.ipoFiling?t.ipoFiled:p.listingState==='listed_parent'?t.listedParent:t.notConfirmed):t.notApplicable;
 const rows=[
  {label:company?t.company:t.maintainer,value:p.name,source:p.companySource},
  {label:p.legalEntityScope==='group_parent'?t.parentLegal:t.legal,value:company?(p.legalEntity||t.unverified):t.notApplicable,source:p.legalEntitySource},
  {label:t.listing,value:listing,source:p.ipoFilingSource||p.listingSource},
  {label:company?t.founded:t.started,value:p.year||t.unverified,source:p.yearSource}
 ];
 return <dl className={'marketPublisherFactStack'+(compact?' marketPublisherFactStackCompact':'')} aria-label={t.company}>
  {rows.map(row=><div className="marketPublisherFact" key={row.label}>
    <dt>{row.label}</dt><dd><span>{row.value}</span>{showSources&&row.source&&
     <a href={row.source} target="_blank" rel="noopener noreferrer" aria-label={t.source+'：'+row.label}>{t.source} ↗</a>}</dd>
   </div>)}
 </dl>;
}
