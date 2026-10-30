'use client';
import type {Platform} from '../lib/data';
import type {Language} from '../lib/v2';
import {Scale,ArrowUpRight,BookOpen} from 'lucide-react';

export const MATRIX_COLUMNS = [
  'index','product','advantages','models','reasoning','useCases','beginner',
  'free','price','limits','regions','rights','access','visibility','official','actions'
] as const;

const headers:Record<Language,string[]> = {
  zh:['序号','AI 工具 · 厂商','主打能力 · 优势','代表模型 · 版本','推理 · 理解','适合谁 · 做什么','新手上手','免费额度','实际价格','限制 · 失败扣费','地区可用性','商用 · 隐私','登录 · 付款','SEO · GEO','官网 · 下载','详情 · 对比'],
  en:['No.','AI product · Maker','Strengths','Models · Versions','Reasoning','Best for','Getting started','Free allowance','Pricing','Limits · Failed tasks','Regions','Commercial · Privacy','Sign-in · Payment','SEO · GEO','Official · Download','Details · Compare'],
  ja:['番号','AI製品・企業','強み','代表モデル','推論・理解','用途','初心者向け','無料枠','料金','制限・失敗時','地域','商用・プライバシー','ログイン・決済','SEO・GEO','公式・ダウンロード','詳細・比較'],
  ko:['번호','AI 제품 · 기업','강점','대표 모델','추론 · 이해','추천 용도','시작 방법','무료 한도','가격','제한 · 실패 비용','지역','상업적 이용 · 개인정보','로그인 · 결제','SEO · GEO','공식 · 다운로드','상세 · 비교'],
  fr:['N°','Produit · Éditeur','Atouts','Modèles','Raisonnement','Pour qui','Débuter','Gratuit','Tarifs','Limites · Échecs','Régions','Usage commercial · Vie privée','Connexion · Paiement','SEO · GEO','Officiel · Téléchargement','Détails · Comparer'],
  de:['Nr.','KI-Tool · Anbieter','Stärken','Modelle','Schlussfolgern','Geeignet für','Einstieg','Freikontingent','Preis','Grenzen · Fehlversuche','Regionen','Kommerziell · Datenschutz','Login · Zahlung','SEO · GEO','Offiziell · Download','Details · Vergleich'],
  es:['N.º','Producto · Empresa','Ventajas','Modelos','Razonamiento','Usos','Primeros pasos','Gratis','Precio','Límites · Fallos','Regiones','Comercial · Privacidad','Acceso · Pago','SEO · GEO','Oficial · Descarga','Detalles · Comparar'],
  pt:['N.º','Produto · Empresa','Vantagens','Modelos','Raciocínio','Indicado para','Primeiros passos','Grátis','Preço','Limites · Falhas','Regiões','Comercial · Privacidade','Login · Pagamento','SEO · GEO','Oficial · Download','Detalhes · Comparar'],
  ar:['رقم','المنتج والشركة','المزايا','النماذج','الاستدلال والفهم','مناسب لـ','البدء','المجاني','السعر','القيود والفشل','المناطق','الاستخدام التجاري والخصوصية','الدخول والدفع','SEO وGEO','الرسمي والتنزيل','التفاصيل والمقارنة']
};
const labels:Record<Language,{unknown:string;models:string;reasoning:string;newbie:string;technical:string;notRated:string;notTested:string;login:string;payment:string;open:string;repository:string;download:string;more:string;compare:string;remove:string;hint:string;source:string;scope:string;help:string;noTest:string;}> = {
 zh:{unknown:'待核验',models:'代表模型待核验',reasoning:'暂无可比推理评测',newbie:'在线使用路径；注册门槛待核验',technical:'本地部署 / 开发配置',notRated:'暂无可比 SEO/GEO 排名',notTested:'未做统一实测',login:'登录要求待核验',payment:'付款方式待核验',open:'打开官网',repository:'查看开源仓库',download:'下载入口待核验',more:'查看详情',compare:'加入对比',remove:'取消对比',hint:'左右滑动查看更多列。序号不代表热度或性能排名。',source:'核验依据',scope:'适用条件',help:'先了解适用任务、免费额度和限制，再打开官方入口',noTest:'资料介绍 ≠ 独立测评'},
 en:{unknown:'Unverified',models:'Model version unverified',reasoning:'No comparable benchmark',newbie:'Web route; sign-up unverified',technical:'Local / developer setup',notRated:'No comparable SEO/GEO ranking',notTested:'Not independently tested',login:'Sign-in unverified',payment:'Payments unverified',open:'Official site',repository:'Source repository',download:'Download link unverified',more:'Details',compare:'Compare',remove:'Remove',hint:'Scroll sideways for more columns. Row numbers are not rankings.',source:'Evidence',scope:'Scope',help:'Check the task, free allowance and limitations first',noTest:'Catalog description ≠ independent testing'},
 ja:{unknown:'未確認',models:'モデル未確認',reasoning:'比較可能な評価なし',newbie:'Web利用・登録未確認',technical:'ローカル設定が必要',notRated:'検証済み順位なし',notTested:'実測なし',login:'ログイン未確認',payment:'決済未確認',open:'公式サイト',repository:'公式リポジトリ',download:'ダウンロード未確認',more:'詳細',compare:'比較',remove:'削除',hint:'横にスクロール。番号は順位ではありません。',source:'出典',scope:'適用範囲',help:'無料枠と制限を確認',noTest:'説明は独立評価ではありません'},
 ko:{unknown:'미확인',models:'모델 미확인',reasoning:'비교 평가 없음',newbie:'웹 경로 · 가입 미확인',technical:'로컬/개발자 설정',notRated:'검증된 순위 없음',notTested:'독립 테스트 없음',login:'로그인 미확인',payment:'결제 미확인',open:'공식 사이트',repository:'공식 저장소',download:'다운로드 미확인',more:'상세',compare:'비교',remove:'해제',hint:'가로로 스크롤하세요. 번호는 순위가 아닙니다.',source:'출처',scope:'적용 범위',help:'무료 한도와 제한부터 확인',noTest:'제품 설명은 독립 평가가 아닙니다'},
 fr:{unknown:'À vérifier',models:'Modèle non vérifié',reasoning:'Pas de test comparable',newbie:'Web ; inscription à vérifier',technical:'Installation technique',notRated:'Aucun classement vérifié',notTested:'Non testé',login:'Connexion à vérifier',payment:'Paiement à vérifier',open:'Site officiel',repository:'Dépôt officiel',download:'Téléchargement à vérifier',more:'Détails',compare:'Comparer',remove:'Retirer',hint:'Défilez horizontalement. Les numéros ne sont pas des rangs.',source:'Source',scope:'Portée',help:'Vérifiez le gratuit et les limites',noTest:'Description ≠ test indépendant'},
 de:{unknown:'Ungeprüft',models:'Modell ungeprüft',reasoning:'Kein vergleichbarer Test',newbie:'Web; Anmeldung ungeprüft',technical:'Lokale Entwickler-Einrichtung',notRated:'Keine verifizierte Rangliste',notTested:'Nicht getestet',login:'Login ungeprüft',payment:'Zahlung ungeprüft',open:'Offizielle Seite',repository:'Offizielles Repository',download:'Download ungeprüft',more:'Details',compare:'Vergleichen',remove:'Entfernen',hint:'Horizontal scrollen. Nummern sind keine Rangplätze.',source:'Quelle',scope:'Geltung',help:'Gratisumfang und Grenzen prüfen',noTest:'Beschreibung ≠ unabhängiger Test'},
 es:{unknown:'Sin verificar',models:'Modelo no verificado',reasoning:'Sin evaluación comparable',newbie:'Web; registro por verificar',technical:'Instalación técnica',notRated:'Sin clasificación verificada',notTested:'Sin prueba independiente',login:'Acceso no verificado',payment:'Pago no verificado',open:'Sitio oficial',repository:'Repositorio oficial',download:'Descarga no verificada',more:'Detalles',compare:'Comparar',remove:'Quitar',hint:'Deslice horizontalmente. Los números no son posiciones.',source:'Fuente',scope:'Alcance',help:'Revise la cuota gratis y los límites',noTest:'Descripción ≠ prueba independiente'},
 pt:{unknown:'Não verificado',models:'Modelo não verificado',reasoning:'Sem avaliação comparável',newbie:'Web; cadastro não verificado',technical:'Configuração técnica local',notRated:'Sem classificação verificada',notTested:'Sem teste independente',login:'Login não verificado',payment:'Pagamento não verificado',open:'Site oficial',repository:'Repositório oficial',download:'Download não verificado',more:'Detalhes',compare:'Comparar',remove:'Remover',hint:'Deslize para os lados. Números não são posições.',source:'Fonte',scope:'Escopo',help:'Confira o uso grátis e os limites',noTest:'Descrição ≠ teste independente'},
 ar:{unknown:'غير موثق',models:'النموذج غير موثق',reasoning:'لا تقييم قابل للمقارنة',newbie:'الموقع متاح؛ التسجيل غير موثق',technical:'إعداد محلي أو للمطورين',notRated:'لا تصنيف موثق',notTested:'لم يُختبر مستقلاً',login:'الدخول غير موثق',payment:'الدفع غير موثق',open:'الموقع الرسمي',repository:'المستودع الرسمي',download:'رابط التنزيل غير موثق',more:'التفاصيل',compare:'مقارنة',remove:'إزالة',hint:'مرّر أفقياً. الأرقام ليست ترتيباً.',source:'المصدر',scope:'النطاق',help:'افحص الحد المجاني والقيود أولاً',noTest:'وصف المنتج ليس اختباراً مستقلاً'}
};
type Condition=NonNullable<Platform['conditions']>[number];
function fact(p:Platform,terms:string[]):Condition|undefined{return p.conditions?.find(c=>terms.some(term=>c.label.includes(term)));}
function evidenceCell(c:Condition|undefined,unknown:string){return c?<><span className="matrixLine">{c.text}</span><a className="matrixEvidence" href={c.source} target="_blank" rel="noopener noreferrer" title={c.scope+' · '+c.checkedAt}>{c.checkedAt.slice(0,10)} · ↗</a></>:<span className="matrixUnknown">{unknown}</span>;}
export function isDeveloperEntry(p:Platform){try{return new URL(p.website).hostname==='github.com';}catch{return false;}}
export function beginnerCandidates(rows:Platform[]){return rows.filter(p=>!isDeveloperEntry(p));}
export default function MarketMatrix({rows,language,startIndex,onOpen,onCompare,compared}:{rows:Platform[];language:Language;startIndex:number;onOpen:(p:Platform)=>void;onCompare:(id:string)=>void;compared:string[];}){
 const c=labels[language]||labels.zh;
 const h=headers[language]||headers.zh;
 return <div className="matrixShell" dir={language==='ar'?'rtl':'ltr'}>
  <div className="matrixIntro"><span><BookOpen size={15} aria-hidden="true"/>{c.help}</span><small>{c.hint} · {c.noTest}</small></div>
  <div className="tableScroll marketMatrixScroll" role="region" aria-label="AI product comparison table" tabIndex={0}>
   <table className="marketMatrixTable">
    <caption className="visuallyHidden">{c.hint}</caption>
    <thead><tr>{MATRIX_COLUMNS.map((key,i)=><th key={key} scope="col" className={i===0?'matrixOrdinal':i===1?'matrixIdentity':''}>{h[i]}</th>)}</tr></thead>
    <tbody>{rows.map((p,i)=>{
     const model=fact(p,['模型与用量','模型','版本']),reasoning=fact(p,['推理与理解能力','推理','理解']),region=fact(p,['地区','区域']),rights=fact(p,['商用','商业授权','隐私']),failure=fact(p,['失败扣费']),payments=fact(p,['支付','付款','结算']),login=fact(p,['登录','手机号','信用卡']);
     const isRepo=isDeveloperEntry(p),picked=compared.includes(p.id);
     return <tr key={p.id}>
      <td className="matrixOrdinal"><span className="matrixNumber">{startIndex+i+1}</span></td>
      <td className="matrixIdentity"><button type="button" className="matrixProduct" onClick={()=>onOpen(p)}><span className="brandIcon" aria-hidden="true">{p.symbol}</span><span><strong>{p.name}</strong><small>{p.company}</small></span></button><span className="matrixCategory">{p.category}</span></td>
      <td><strong className="matrixEmphasis">{p.features.slice(0,2).join(' · ')||p.category}</strong><span className="matrixLine clamp3">{p.about}</span></td>
      <td>{evidenceCell(model,c.models)}</td>
      <td>{evidenceCell(reasoning,c.reasoning)}<span className="matrixLine matrixMuted">{c.notTested}</span></td>
      <td><span className="matrixLine">{p.features.slice(0,3).join(' · ')||p.category}</span></td>
      <td><span className="matrixLine">{isRepo?c.technical:c.newbie}</span><span className="matrixLine matrixMuted">{c.notTested}</span></td>
      <td>{evidenceCell(fact(p,['免费额度','免费']),c.unknown)}</td>
      <td>{evidenceCell(fact(p,['价格','费用']),c.unknown)}</td>
      <td>{evidenceCell(failure,p.restrictions!=='待核验'?p.restrictions:c.unknown)}</td>
      <td>{evidenceCell(region,c.unknown)}</td>
      <td>{evidenceCell(rights,c.unknown)}</td>
      <td><span className="matrixLine">{login?login.text:c.login}</span><span className="matrixLine matrixMuted">{payments?payments.text:c.payment}</span></td>
      <td><span className="matrixUnknown">{c.notRated}</span></td>
      <td><a className="matrixOfficial" href={p.website} target="_blank" rel="noopener noreferrer">{isRepo?c.repository:c.open}<ArrowUpRight size={13} aria-hidden="true"/></a><small className="matrixLine matrixMuted">{isRepo?c.technical:c.download}</small></td>
      <td><div className="matrixActions"><button type="button" onClick={()=>onOpen(p)}>{c.more}</button><button type="button" aria-pressed={picked} className={picked?'picked':''} onClick={()=>onCompare(p.id)} title={picked?c.remove:c.compare}><Scale size={14}/><span>{picked?c.remove:c.compare}</span></button></div></td>
     </tr>;
    })}</tbody>
   </table>
  </div>
 </div>;
}
