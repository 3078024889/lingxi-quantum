import type {Language} from './v2';

/** Scope-specific official-policy extracts. Never infer content rights from a software SDK license. */
export type CommercialEvidence={label:string;condition:string;source:string;checkedAt:string;scope:string};
type SourceFact={source:string;checkedAt:string;scope:string;labels:Record<Language,string>;conditions:Record<Language,string>};
const FACTS:Record<string,SourceFact>={
 chatgpt:{
  source:'https://openai.com/policies/row-terms-of-use/',checkedAt:'2026-10-31',scope:'ChatGPT consumer-generated output, subject to applicable terms',
  labels:{zh:'支持合规商用',en:'Commercial use allowed',ja:'適法な商用利用が可能',ko:'약관 준수 시 상업적 사용 가능',fr:'Usage commercial autorisé',de:'Gewerbliche Nutzung erlaubt',es:'Uso comercial permitido',pt:'Uso comercial permitido',ar:'الاستخدام التجاري مسموح وفق الشروط'},
  conditions:{zh:'用户在适用法律范围内拥有输出；使用前须拥有输入素材权利并遵守服务条款。',en:'Ownership of output is subject to applicable law; you must have rights to your input and comply with the terms.',ja:'出力の権利は適用法と規約に従い、入力素材の権利も必要です。',ko:'출력 권리는 관련 법령과 약관에 따르며 입력 자료의 권리도 필요합니다.',fr:'Les droits sur les résultats dépendent du droit applicable et des droits sur les contenus fournis.',de:'Ausgaberechte gelten im Rahmen des Rechts und erfordern Rechte an den Eingaben.',es:'Los derechos del resultado están sujetos a la ley y a los derechos del material de entrada.',pt:'Os direitos sobre os resultados dependem da lei e dos direitos sobre as entradas.',ar:'ملكية المخرجات تخضع للقانون ويجب امتلاك حقوق مواد الإدخال.'}
 },
 runway:{
  source:'https://help.runwayml.com/hc/en-us/articles/18927776141715-Usage-rights',checkedAt:'2026-10-31',scope:'Content generated in Runway (subject to provider policies and third-party rights)',
  labels:{zh:'支持商用',en:'Commercial use allowed',ja:'商用利用に対応',ko:'상업적 사용 허용',fr:'Usage commercial autorisé',de:'Gewerbliche Nutzung erlaubt',es:'Uso comercial permitido',pt:'Uso comercial permitido',ar:'يسمح بالاستخدام التجاري'},
  conditions:{zh:'Runway 官方允许将生成作品用于广告、短视频及商业发布；第三方素材权利仍需自行确认。',en:'Runway permits commercial use including ads and short videos; third-party content rights remain your responsibility.',ja:'広告や短編動画での商用利用を認めています。第三者の権利は別途確認してください。',ko:'광고와 짧은 영상의 상업적 이용을 허용하나 제3자 권리는 별도 확인해야 합니다.',fr:'Usage autorisé pour publicités et vidéos, sous réserve des droits des tiers.',de:'Kommerzielle Werbung und Videos erlaubt; Rechte Dritter bleiben zu prüfen.',es:'Permite anuncios y vídeos comerciales, sujeto a derechos de terceros.',pt:'Permite anúncios e vídeos comerciais, respeitando direitos de terceiros.',ar:'يسمح بالإعلانات والفيديو التجاري مع احترام حقوق الأطراف الثالثة.'}
 }
};
export function commercialEvidence(id:string,language:Language):CommercialEvidence|null{
 const f=FACTS[id];return f?{label:f.labels[language],condition:f.conditions[language],source:f.source,checkedAt:f.checkedAt,scope:f.scope}:null;
}
