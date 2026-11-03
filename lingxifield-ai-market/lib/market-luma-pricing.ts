import type {Language} from './v2';
/** Publisher-sourced subscription facts. Monthly figures are NOT an API per-call rate. */
export const LUMA_PLANS={
 source:'https://lumalabs.ai/pricing',
 modelSource:'https://lumalabs.ai/llm-info',
 checkedAt:'2026-11-01',
 currency:'USD',
 plans:[
  {id:'plus',name:'Plus',monthly:30,annualTotal:300},
  {id:'pro',name:'Pro',monthly:90,annualTotal:900},
  {id:'ultra',name:'Ultra',monthly:300,annualTotal:3000}
 ],
 business:'Team and Enterprise require a quote',
 api:'Developer API uses separate model-based credits',
 free:'Free trial credits are available; usage limits depend on plan',
 models:['Ray3.2','UNI-1.1']
} as const;

const PLAN_COPY:Record<Language,{monthly:string;year:string;team:string;api:string;free:string;models:string}>={
 zh:{monthly:'月',year:'年付',team:'Team / Enterprise 询价',api:'API 积分独立计费',free:'提供免费试用积分；具体额度随套餐变化',models:'Ray3.2 视频 · UNI-1.1 图像'},
 en:{monthly:'month',year:'billed yearly',team:'Team / Enterprise: contact sales',api:'API credits billed separately',free:'Free trial credits; allowance depends on plan',models:'Ray3.2 video · UNI-1.1 image'},
 ja:{monthly:'月',year:'年間払い',team:'Team / Enterprise は見積もり',api:'APIクレジット別料金',free:'無料トライアルクレジットあり・利用上限はプラン別',models:'Ray3.2 動画 · UNI-1.1 画像'},
 ko:{monthly:'월',year:'연간 청구',team:'Team / Enterprise 별도 문의',api:'API 크레딧 별도 과금',free:'무료 체험 크레딧 제공; 한도는 요금제별',models:'Ray3.2 동영상 · UNI-1.1 이미지'},
 fr:{monthly:'mois',year:'facturé annuellement',team:'Team / Enterprise sur devis',api:'Crédits API facturés séparément',free:'Crédits d’essai gratuits; limite selon l’offre',models:'Vidéo Ray3.2 · image UNI-1.1'},
 de:{monthly:'Monat',year:'jährliche Abrechnung',team:'Team / Enterprise auf Anfrage',api:'API-Credits separat abgerechnet',free:'Gratis-Testguthaben; Limit je Tarif',models:'Ray3.2 Video · UNI-1.1 Bild'},
 es:{monthly:'mes',year:'facturación anual',team:'Team / Enterprise: consultar precio',api:'Créditos API por separado',free:'Créditos de prueba gratis; límites según plan',models:'Vídeo Ray3.2 · imagen UNI-1.1'},
 pt:{monthly:'mês',year:'cobrança anual',team:'Team / Enterprise sob consulta',api:'Créditos de API cobrados à parte',free:'Créditos gratuitos de teste; limites conforme o plano',models:'Vídeo Ray3.2 · imagem UNI-1.1'},
 ar:{monthly:'شهر',year:'الدفع سنوياً',team:'Team / Enterprise حسب العرض',api:'رصيد API يُحاسب بشكل مستقل',free:'أرصدة تجربة مجانية؛ تختلف الحدود حسب الخطة',models:'فيديو Ray3.2 · صور UNI-1.1'}
};
export function lumaSubscription(language:Language):string{
 const t=PLAN_COPY[language];
 return LUMA_PLANS.plans.map(p=>language==='zh'
  ?`${p.name} $${p.monthly}/月或 $${p.annualTotal}/年`
  :`${p.name} $${p.monthly}/${t.monthly} ($${p.annualTotal} ${t.year})`).join(' · ')+` · ${t.team} · ${t.api}`;
}
export function lumaFree(language:Language){return PLAN_COPY[language].free}
export function lumaModels(language:Language){return PLAN_COPY[language].models}
