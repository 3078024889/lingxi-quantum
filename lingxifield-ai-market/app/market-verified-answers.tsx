import type {Language} from '../lib/v2';
import type {Platform} from '../lib/data';
import {localizedCatalogFact} from '../lib/market-fact-locale';
import {researchedFact,MARKET_RESEARCH_CHECKED_AT} from '../lib/market-researched-facts';
import {commercialEvidence} from '../lib/market-commercial-evidence';
import {paymentFactsFor} from '../lib/market-payment-facts';
import {globalRegionSummary} from '../lib/region-presentation';
import {localizedPaymentName} from '../lib/market-localized-payment';

/** Answers are sourced snapshots, not inferred live vendor checkout, SEO rank or legal advice. */
const WORDS:Record<Language,{heading:string,free:string,price:string,models:string,payments:string,countries:string,commercial:string,source:string,unknown:string,local:string,scope:string}>={
 zh:{heading:'关心的问题，直接给答案',free:'免费额度',price:'实际价格',models:'模型与功能',payments:'支持哪些付款方式',countries:'国家/地区可用性',commercial:'是否支持商用',source:'官方资料',unknown:'暂无可核验的厂商公开规则',local:'核心开源软件可自行部署，无平台订阅付款',scope:'官方资料快照；特定套餐和地区以标注来源为准'},
 en:{heading:'Answers before you visit',free:'Free allowance',price:'Real pricing',models:'Models and functions',payments:'Payment methods',countries:'Country and region',commercial:'Commercial rights',source:'Publisher source',unknown:'No verified publisher rule recorded',local:'Open-source core can run locally without platform subscription',scope:'Sourced publisher snapshot; plan and region matter'},
 ja:{heading:'利用前にわかる回答',free:'無料枠',price:'料金',models:'モデルと機能',payments:'決済方法',countries:'対応地域',commercial:'商用利用',source:'公式情報',unknown:'確認済みの公式情報なし',local:'オープンソースはローカルで利用可能',scope:'公式資料の記録。プラン・地域別の条件を確認'},
 ko:{heading:'방문 전에 확인하는 답변',free:'무료 한도',price:'실제 가격',models:'모델과 기능',payments:'결제 수단',countries:'국가 및 지역',commercial:'상업 이용',source:'공식 출처',unknown:'검증된 공식 규칙 없음',local:'오픈소스 핵심은 로컬 설치 가능',scope:'공식 출처 요약; 요금제와 지역별로 다름'},
 fr:{heading:'Réponses avant de visiter',free:'Offre gratuite',price:'Prix réel',models:'Modèles et fonctions',payments:'Paiement',countries:'Pays disponibles',commercial:'Usage commercial',source:'Source officielle',unknown:'Règle officielle non vérifiée',local:'Logiciel open source utilisable en local',scope:'Données officielles datées; conditions par pays et offre'},
 de:{heading:'Antworten vor dem Besuch',free:'Kostenlose Nutzung',price:'Preis',models:'Modelle und Funktionen',payments:'Zahlungsmethoden',countries:'Länder',commercial:'Kommerzielle Nutzung',source:'Offizielle Quelle',unknown:'Keine geprüfte Anbieterregel',local:'Open Source lokal nutzbar',scope:'Datierte Anbieterinformationen; je Tarif und Land'},
 es:{heading:'Respuestas antes de visitar',free:'Uso gratuito',price:'Precio real',models:'Modelos y funciones',payments:'Métodos de pago',countries:'Países',commercial:'Uso comercial',source:'Fuente oficial',unknown:'Sin regla oficial verificada',local:'Código abierto disponible en local',scope:'Datos oficiales fechados; condiciones por país y plan'},
 pt:{heading:'Respostas antes de visitar',free:'Limite grátis',price:'Preço real',models:'Modelos e funções',payments:'Métodos de pagamento',countries:'Países',commercial:'Uso comercial',source:'Fonte oficial',unknown:'Sem regra oficial verificada',local:'Código aberto disponível localmente',scope:'Dados oficiais datados; dependem do plano e país'},
 ar:{heading:'إجابات قبل زيارة الموقع',free:'الاستخدام المجاني',price:'السعر الفعلي',models:'النماذج والوظائف',payments:'طرق الدفع',countries:'الدول والمناطق',commercial:'الترخيص التجاري',source:'المصدر الرسمي',unknown:'لا توجد قاعدة رسمية موثقة',local:'يمكن تشغيل البرنامج المفتوح المصدر محلياً',scope:'معلومات رسمية مؤرخة؛ تختلف حسب الخطة والدولة'}
};
const LOCAL=new Set(['ollama','llamacpp','vllm','langchain','llamaindex','transformers','comfyui','automatic1111','whisper','fasterwhisper','openwebui','dify','n8n','openai-python','anthropic-sdk-python']);
export default function MarketVerifiedAnswers({platform,language}:{platform:Platform;language:Language}){
 const f=researchedFact(platform.id),w=WORDS[language],license=commercialEvidence(platform.id,language),pay=paymentFactsFor(platform.id,'GLOBAL');
 const price=language==='zh'?(f?.price||platform.price):localizedCatalogFact(platform.id,language,'price',platform.price);
 const free=language==='zh'?(f?.free||platform.free):localizedCatalogFact(platform.id,language,'free',platform.free);
 const models=language==='zh'?(f?.models||platform.name):localizedCatalogFact(platform.id,language,'models',platform.name);
 const method=pay.methods.length?pay.methods.map(p=>localizedPaymentName(p,language)).join(' · '):LOCAL.has(platform.id)?w.local:w.unknown;
 const rows=[
  {key:'free',name:w.free,answer:free,source:f?.freeSource},
  {key:'price',name:w.price,answer:price,source:f?.priceSource},
  {key:'models',name:w.models,answer:models,source:f?.modelsSource},
  {key:'payments',name:w.payments,answer:method,source:pay.source||undefined},
  {key:'countries',name:w.countries,answer:language==='zh'?(f?.region||globalRegionSummary(platform.id,language)):globalRegionSummary(platform.id,language),source:f?.regionSource},
  {key:'commercial',name:w.commercial,answer:license?[license.label,license.condition].join(' · '):language==='zh'?(f?.commercial||w.unknown):w.unknown,source:license?.source||f?.commercialSource},
 ];
 return <section className="panel marketVerifiedAnswers" aria-label={w.heading}><h2>{w.heading}</h2>
  <div className="marketVerifiedAnswerGrid">{rows.map(row=><article key={row.key} data-answer-kind={row.key}>
   <h3>{row.name}</h3><p>{row.answer||w.unknown}</p>
   {row.source&&/^https:\/\//.test(row.source)&&<a href={row.source} target="_blank" rel="noopener noreferrer">{w.source} ↗</a>}
  </article>)}</div><small className="marketVerifiedAnswerScope">{w.scope} · {MARKET_RESEARCH_CHECKED_AT}</small>
 </section>;
}
