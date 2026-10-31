import type {Language} from './v2';
import type {RegionCode} from './global-region-market';
import {regionName,globalRegionFact} from './global-region-market';
import {officialCountrySnapshot,officialSupportCountries} from './official-country-lists';
const copy:Record<Language,{top:string;more:string;empty:string;partial:string;complete:string;visit:string;feedback:string;access:string;note:string}> = {
 zh:{top:'官网支持的主要地区',more:'展开其他',empty:'本站尚未收录该产品的官方地区清单',partial:'已核实的部分地区（非完整名单）',complete:'官方支持地区名单',visit:'查看来源',feedback:'提供实际使用反馈',access:'网络能打开不等于官方支持',note:'VPN 出口、账号注册地及付款地区可能不同，不能据此推断官方许可'},
 en:{top:'Key supported regions',more:'Show more',empty:'No publisher country list recorded here',partial:'Verified examples (not exhaustive)',complete:'Publisher supported regions',visit:'View source',feedback:'Share an access report',access:'A working connection is not official eligibility',note:'VPN exit, account and billing regions can differ'},
 ja:{top:'主な対応地域',more:'他の地域を表示',empty:'公式の地域一覧を未収録',partial:'確認済みの地域（一部）',complete:'公式対応地域',visit:'出典',feedback:'利用体験を共有',access:'接続できても公式対応とは限りません',note:'VPNの出口と登録・決済地域は異なる場合があります'},
 ko:{top:'주요 지원 지역',more:'다른 지역 보기',empty:'공식 국가 목록 미수록',partial:'확인된 일부 지역',complete:'공식 지원 국가',visit:'출처',feedback:'사용 경험 공유',access:'접속 가능과 공식 지원은 다릅니다',note:'VPN 출구, 계정 및 결제 지역은 다를 수 있습니다'},
 fr:{top:'Principales régions',more:'Voir les autres',empty:'Liste officielle non collectée ici',partial:'Exemples officiels non exhaustifs',complete:'Régions officielles',visit:'Source',feedback:'Partager une expérience',access:'Accès réseau ≠ prise en charge officielle',note:'Régions VPN, compte et paiement peuvent différer'},
 de:{top:'Wichtige Regionen',more:'Weitere anzeigen',empty:'Offizielle Liste hier noch nicht erfasst',partial:'Bestätigte Auswahl, nicht vollständig',complete:'Offizielle Regionen',visit:'Quelle',feedback:'Erfahrung teilen',access:'Erreichbar heißt nicht offiziell unterstützt',note:'VPN, Konto und Zahlregion können abweichen'},
 es:{top:'Regiones principales',more:'Ver otras',empty:'Lista oficial aún no recopilada',partial:'Ejemplos verificados, lista parcial',complete:'Regiones oficiales',visit:'Fuente',feedback:'Compartir experiencia',access:'Conectarse no implica disponibilidad oficial',note:'VPN, cuenta y región de pago pueden diferir'},
 pt:{top:'Principais regiões',more:'Ver outras',empty:'Lista oficial ainda não coletada',partial:'Exemplos verificados, lista parcial',complete:'Regiões oficiais',visit:'Fonte',feedback:'Relatar experiência',access:'Conectar não significa suporte oficial',note:'VPN, conta e país de pagamento podem diferir'},
 ar:{top:'المناطق الرئيسية',more:'عرض المزيد',empty:'لم نجمع القائمة الرسمية بعد',partial:'مناطق مؤكدة وليست القائمة الكاملة',complete:'المناطق الرسمية',visit:'المصدر',feedback:'شارك تجربة الوصول',access:'إمكانية الاتصال لا تعني الدعم الرسمي',note:'قد تختلف دولة VPN والحساب والدفع'}
};
export function regionPresentation(id:string,language:Language){
 const priority=(id==='gemini'?['HK','US','JP','SG','GB','AU']:['US','JP','SG','GB','AU','HK']).concat(['DE','FR','KR','CA','IN','BR','TW']);
 const snapshot=officialCountrySnapshot(id);
 const complete=!(snapshot&&'isComplete' in snapshot&&snapshot.isComplete===false);
 const countries=officialSupportCountries(id);
 const sorted=countries.sort((a,b)=>{
  const x=priority.indexOf(a),y=priority.indexOf(b);
  return (x<0?100:x)-(y<0?100:y)||regionName(a as RegionCode,language).localeCompare(regionName(b as RegionCode,language));
 });
 return {words:copy[language],top:sorted.slice(0,5),other:sorted.slice(5),total:sorted.length,
  complete,source:snapshot?.source||null,checkedAt:snapshot?.checkedAt||null};
}
export function globalRegionSummary(id:string,language:Language){
 const info=regionPresentation(id,language);
 if(info.top.length)return info.top.map(x=>regionName(x as RegionCode,language)).join(' · ') +(info.other.length?' +'+info.other.length:'')+(!info.complete?' *':'');
 // Specific offline products are not tied to the publisher's web support country list.
 if(globalRegionFact(id,'HK').policy.status==='local')return language==='zh'?'本地安装运行 · 不限官网服务地区':copy[language].access;
 return info.words.empty;
}
export function chosenRegionSummary(id:string,region:RegionCode,language:Language){
 if(region==='GLOBAL')return globalRegionSummary(id,language);
 return regionName(region,language)+' · '+globalRegionFact(id,region).policy.status;
}
