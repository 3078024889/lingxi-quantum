import type {Language} from './v2';
import type {RegionCode} from './global-region-market';
import {regionName,globalRegionFact} from './global-region-market';
import {officialCountrySnapshot,officialSupportCountries} from './official-country-lists';
import {researchedFact} from './market-researched-facts';
const copy:Record<Language,{top:string;more:string;empty:string;partial:string;complete:string;visit:string;feedback:string;access:string;note:string}> = {
 zh:{top:'官网支持的主要地区',more:'展开其他',empty:'本站尚未收录该产品的官方地区清单',partial:'已核实的部分地区（非完整名单）',complete:'官方支持地区名单',visit:'查看来源',feedback:'提供实际使用反馈',access:'网络能打开不等于官方支持',note:'本列只列厂商公开的支持国家/地区；注册、付款与商业许可分别核对'},
 en:{top:'Key supported regions',more:'Show more',empty:'No publisher country list recorded here',partial:'Verified examples (not exhaustive)',complete:'Publisher supported regions',visit:'View source',feedback:'Share an access report',access:'A working connection is not official eligibility',note:'Country list is from publisher policy; signup, payment and license are separate'},
 ja:{top:'主な対応地域',more:'他の地域を表示',empty:'公式の地域一覧を未収録',partial:'確認済みの地域（一部）',complete:'公式対応地域',visit:'出典',feedback:'利用体験を共有',access:'接続できても公式対応とは限りません',note:'公式の対応国一覧です。登録・決済・商用条件は別途確認します'},
 ko:{top:'주요 지원 지역',more:'다른 지역 보기',empty:'공식 국가 목록 미수록',partial:'확인된 일부 지역',complete:'공식 지원 국가',visit:'출처',feedback:'사용 경험 공유',access:'접속 가능과 공식 지원은 다릅니다',note:'공식 지원 국가 목록이며 가입·결제·상업 이용은 별도로 확인합니다'},
 fr:{top:'Principales régions',more:'Voir les autres',empty:'Liste officielle non collectée ici',partial:'Exemples officiels non exhaustifs',complete:'Régions officielles',visit:'Source',feedback:'Partager une expérience',access:'Accès réseau ≠ prise en charge officielle',note:'Pays listés par l’éditeur ; inscription, paiement et licence sont distincts'},
 de:{top:'Wichtige Regionen',more:'Weitere anzeigen',empty:'Offizielle Liste hier noch nicht erfasst',partial:'Bestätigte Auswahl, nicht vollständig',complete:'Offizielle Regionen',visit:'Quelle',feedback:'Erfahrung teilen',access:'Erreichbar heißt nicht offiziell unterstützt',note:'Offizielle Länderliste; Registrierung, Zahlung und Lizenz separat prüfen'},
 es:{top:'Regiones principales',more:'Ver otras',empty:'Lista oficial aún no recopilada',partial:'Ejemplos verificados, lista parcial',complete:'Regiones oficiales',visit:'Fuente',feedback:'Compartir experiencia',access:'Conectarse no implica disponibilidad oficial',note:'Lista oficial; registro, pago y licencia se comprueban por separado'},
 pt:{top:'Principais regiões',more:'Ver outras',empty:'Lista oficial ainda não coletada',partial:'Exemplos verificados, lista parcial',complete:'Regiões oficiais',visit:'Fonte',feedback:'Relatar experiência',access:'Conectar não significa suporte oficial',note:'Lista oficial; cadastro, pagamento e licença são verificados em separado'},
 ar:{top:'المناطق الرئيسية',more:'عرض المزيد',empty:'لم نجمع القائمة الرسمية بعد',partial:'مناطق مؤكدة وليست القائمة الكاملة',complete:'المناطق الرسمية',visit:'المصدر',feedback:'شارك تجربة الوصول',access:'إمكانية الاتصال لا تعني الدعم الرسمي',note:'هذه قائمة الدول الرسمية؛ التسجيل والدفع والترخيص أمور منفصلة'}
};
export function regionPresentation(id:string,language:Language){
 const priority=(id==='gemini'?['HK','US','JP','SG','GB','AU']:['US','JP','SG','GB','AU','DE','FR','CA']).concat(['KR','IN','BR','TW','HK']);
 const snapshot=officialCountrySnapshot(id);
 const complete=!(snapshot&&'isComplete' in snapshot&&snapshot.isComplete===false);
 const countries=officialSupportCountries(id);
 const sorted=countries.sort((a,b)=>{
  const x=priority.indexOf(a),y=priority.indexOf(b);
  return (x<0?100:x)-(y<0?100:y)||regionName(a as RegionCode,language).localeCompare(regionName(b as RegionCode,language));
 });
 return {words:copy[language],top:sorted.slice(0,8),other:sorted.slice(8),total:sorted.length,
  complete,source:snapshot?.source||null,checkedAt:snapshot?.checkedAt||null};
}
export function globalRegionSummary(id:string,language:Language){
 const info=regionPresentation(id,language);
 if(info.top.length){
  const prefix=id==='anthropic-sdk-python'?(language==='zh'?'Claude API 支持：':'Claude API: '):'';
  const remaining=info.other.length?(language==='zh'?' · 另'+info.other.length+'个': ' · +'+info.other.length):'';
  return prefix+info.top.map(x=>regionName(x as RegionCode,language)).join(' · ')+remaining+(!info.complete?(language==='zh'?'（部分名单）':' (partial list)'):'');
 }
 // Specific offline products are not tied to the publisher's web support country list.
 const research=researchedFact(id);
 if(research?.regionSource&&research.region){
  if(language==='zh')return research.region;
  const kinds=['langchain','llamaindex','llamacpp','dify','n8n','comfyui','automatic1111','fasterwhisper','openai-python','whisper','vllm','transformers','openwebui'];
  return kinds.includes(id)?({
   en:'Self-hosted / local software; cloud and model rules separate',
   ja:'自己ホスト・ローカル利用可。クラウドとモデルは別',
   ko:'자체 호스팅·로컬 가능, 클라우드·모델 정책 별도',
   fr:'Logiciel local ; règles cloud et modèles distinctes',
   de:'Lokale Nutzung; Cloud- und Modellregeln separat',
   es:'Uso local; reglas de nube y modelos por separado',
   pt:'Uso local; regras de nuvem e modelos separadas',
   ar:'البرنامج محلي؛ شروط السحابة والنماذج منفصلة',
   zh:research.region
  } as Record<Language,string>)[language]:({
   en:'Publisher app / web access; country-specific checkout varies',
   ja:'公式Web・アプリ。国ごとの決済条件は別',
   ko:'공식 웹·앱, 국가별 결제 조건은 별도',
   fr:'Application officielle ; paiement selon le pays',
   de:'Offizielle App; Zahlung je nach Land',
   es:'App oficial; el pago depende del país',
   pt:'App oficial; pagamento varia por país',
   ar:'تطبيق رسمي؛ الدفع يختلف حسب البلد',
   zh:research.region
  } as Record<Language,string>)[language];
 }
 if(globalRegionFact(id,'HK').policy.status==='local')return language==='zh'?'可本地安装运行；云服务另议':copy[language].access;
 return info.words.empty;
}
export function chosenRegionSummary(id:string,region:RegionCode,language:Language){
 if(region==='GLOBAL')return globalRegionSummary(id,language);
 return regionName(region,language)+' · '+globalRegionFact(id,region).policy.status;
}
