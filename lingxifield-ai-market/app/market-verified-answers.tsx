import type {Language} from '../lib/v2';
import type {Platform} from '../lib/data';
import {localizedCatalogFact} from '../lib/market-fact-locale';
import {researchedFact,MARKET_RESEARCH_CHECKED_AT} from '../lib/market-researched-facts';
import {commercialEvidence} from '../lib/market-commercial-evidence';
import {paymentFactsFor} from '../lib/market-payment-facts';
import {globalRegionSummary} from '../lib/region-presentation';
import {localizedPaymentName} from '../lib/market-localized-payment';
import {codexFor,CODEX_OFFICIAL} from '../lib/market-codex-product';
import {capabilityProfile} from '../lib/capability-profiles';
import {localizedProductSummary} from '../lib/market-product-locale';

/** Answers are sourced snapshots, not inferred live vendor checkout, SEO rank or legal advice. */
const WORDS:Record<Language,{heading:string,free:string,price:string,models:string,payments:string,countries:string,commercial:string,source:string,unknown:string,local:string,scope:string}>={
 zh:{heading:'关心的问题，直接给答案',free:'免费额度',price:'实际价格',models:'模型与功能',payments:'支持哪些付款方式',countries:'国家/地区可用性',commercial:'是否支持商用',source:'官方资料',unknown:'具体方式以所选套餐与地区结算页为准',local:'核心开源软件可自行部署，无平台订阅付款',scope:'信息更新'},
 en:{heading:'Answers before you visit',free:'Free allowance',price:'Real pricing',models:'Models and functions',payments:'Payment methods',countries:'Country and region',commercial:'Commercial rights',source:'Publisher source',unknown:'Options depend on your country and plan',local:'Open-source core can run locally without platform subscription',scope:'Updated'},
 ja:{heading:'利用前にわかる回答',free:'無料枠',price:'料金',models:'モデルと機能',payments:'決済方法',countries:'対応地域',commercial:'商用利用',source:'公式情報',unknown:'料金プランと国によって異なります',local:'オープンソースはローカルで利用可能',scope:'更新日'},
 ko:{heading:'방문 전에 확인하는 답변',free:'무료 한도',price:'실제 가격',models:'모델과 기능',payments:'결제 수단',countries:'국가 및 지역',commercial:'상업 이용',source:'공식 출처',unknown:'요금제와 국가에 따라 다릅니다',local:'오픈소스 핵심은 로컬 설치 가능',scope:'업데이트'},
 fr:{heading:'Réponses avant de visiter',free:'Offre gratuite',price:'Prix réel',models:'Modèles et fonctions',payments:'Paiement',countries:'Pays disponibles',commercial:'Usage commercial',source:'Source officielle',unknown:'Selon le pays et la formule',local:'Logiciel open source utilisable en local',scope:'Mise à jour'},
 de:{heading:'Antworten vor dem Besuch',free:'Kostenlose Nutzung',price:'Preis',models:'Modelle und Funktionen',payments:'Zahlungsmethoden',countries:'Länder',commercial:'Kommerzielle Nutzung',source:'Offizielle Quelle',unknown:'Abhängig von Land und Tarif',local:'Open Source lokal nutzbar',scope:'Aktualisiert'},
 es:{heading:'Respuestas antes de visitar',free:'Uso gratuito',price:'Precio real',models:'Modelos y funciones',payments:'Métodos de pago',countries:'Países',commercial:'Uso comercial',source:'Fuente oficial',unknown:'Depende del país y del plan',local:'Código abierto disponible en local',scope:'Actualizado'},
 pt:{heading:'Respostas antes de visitar',free:'Limite grátis',price:'Preço real',models:'Modelos e funções',payments:'Métodos de pagamento',countries:'Países',commercial:'Uso comercial',source:'Fonte oficial',unknown:'Depende do país e do plano',local:'Código aberto disponível localmente',scope:'Atualizado'},
 ar:{heading:'إجابات قبل زيارة الموقع',free:'الاستخدام المجاني',price:'السعر الفعلي',models:'النماذج والوظائف',payments:'طرق الدفع',countries:'الدول والمناطق',commercial:'الترخيص التجاري',source:'المصدر الرسمي',unknown:'تختلف الخيارات بحسب البلد والخطة',local:'يمكن تشغيل البرنامج المفتوح المصدر محلياً',scope:'آخر تحديث'}
};
const LOCAL=new Set(['ollama','llamacpp','vllm','langchain','llamaindex','transformers','comfyui','automatic1111','whisper','fasterwhisper','openwebui','dify','n8n','openai-python','anthropic-sdk-python']);
export default function MarketVerifiedAnswers({platform,language}:{platform:Platform;language:Language}){
 const f=researchedFact(platform.id),w=WORDS[language],license=commercialEvidence(platform.id,language),pay=paymentFactsFor(platform.id,'GLOBAL'),profile=capabilityProfile(platform.id);
 const tasks=language==='zh'?profile?.capabilities.slice(0,5).map(x=>x.name+'：'+x.outcome).join('；'):localizedProductSummary(platform.id,language);
 const price=language==='zh'?(f?.price||platform.price):localizedCatalogFact(platform.id,language,'price',f?.price||platform.price);
 const free=language==='zh'?(f?.free||platform.free):localizedCatalogFact(platform.id,language,'free',f?.free||platform.free);
 const models=language==='zh'?(f?.models||profile?.headline||platform.name):localizedCatalogFact(platform.id,language,'models',f?.models||localizedProductSummary(platform.id,language)||profile?.headline||platform.name);
 const method=pay.methods.length?pay.methods.map(p=>localizedPaymentName(p,language)).join(' · '):LOCAL.has(platform.id)?w.local:w.unknown;
 const rows=[
  {key:'tasks',name:({zh:'功能和适用任务',en:'What you can do',ja:'できること',ko:'수행 가능한 작업',fr:'Fonctions et tâches',de:'Funktionen und Aufgaben',es:'Funciones y tareas',pt:'Funções e tarefas',ar:'الوظائف والمهام'} as Record<Language,string>)[language],answer:tasks||platform.about,source:profile?.capabilities[0]?.source},
  {key:'free',name:w.free,answer:free,source:f?.freeSource},
  {key:'price',name:w.price,answer:price,source:f?.priceSource},
  {key:'models',name:w.models,answer:models,source:f?.modelsSource},
  ...(platform.id==='chatgpt'?[{key:'codex',name:'Codex',answer:codexFor(language).intro,source:CODEX_OFFICIAL.product}]:[]),
  {key:'payments',name:w.payments,answer:method,source:pay.source||f?.paymentSource},
  {key:'countries',name:w.countries,answer:language==='zh'?(f?.region||globalRegionSummary(platform.id,language)):globalRegionSummary(platform.id,language),source:f?.regionSource},
  {key:'commercial',name:w.commercial,answer:license?[license.label,license.condition].join(' · '):language==='zh'?(f?.commercial||w.unknown):w.unknown,source:license?.source||f?.commercialSource},
 ];
 return <section className="panel marketVerifiedAnswers" aria-label={w.heading}><h2>{w.heading}</h2>
  <div className="marketVerifiedAnswerGrid">{rows.map(row=><article key={row.key} data-answer-kind={row.key}>
   <h3>{row.name}</h3><p>{row.answer||w.unknown}</p>
   {row.key==='payments'&&pay.methodEvidence.length>0?<div className="marketPaymentEvidence">{pay.methodEvidence.map(x=><a key={x.method} href={x.source} target="_blank" rel="noopener noreferrer" title={x.checkedAt||w.source}>{localizedPaymentName(x.method,language)} · {w.source} ↗</a>)}</div>:row.source&&/^https:\/\//.test(row.source)&&<a href={row.source} target="_blank" rel="noopener noreferrer">{w.source} ↗</a>}
  </article>)}</div><small className="marketVerifiedAnswerScope">{w.scope} · {MARKET_RESEARCH_CHECKED_AT}</small>
 </section>;
}
