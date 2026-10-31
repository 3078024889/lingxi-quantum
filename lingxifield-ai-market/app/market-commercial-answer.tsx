import type {Language} from '../lib/v2';
import {commercialEvidence} from '../lib/market-commercial-evidence';
const TITLE:Record<Language,string>={zh:'可以商用吗？',en:'Can I use it commercially?',ja:'商用利用できますか？',ko:'상업적으로 사용할 수 있나요?',fr:'Puis-je l’utiliser commercialement ?',de:'Ist die gewerbliche Nutzung erlaubt?',es:'¿Se puede usar comercialmente?',pt:'É permitido o uso comercial?',ar:'هل يسمح بالاستخدام التجاري؟'};
const SOURCE:Record<Language,string>={zh:'查看厂商官方条款',en:'Official provider policy',ja:'公式利用規約',ko:'공식 이용 약관',fr:'Conditions officielles',de:'Offizielle Bedingungen',es:'Condiciones oficiales',pt:'Condições oficiais',ar:'شروط المزود الرسمية'};
export default function MarketCommercialAnswer({id,language}:{id:string;language:Language}){
 const fact=commercialEvidence(id,language);
 if(!fact)return null;
 return <section className="lxCommercialFact" aria-label={TITLE[language]}>
   <strong>{TITLE[language]} {fact.label}</strong>
   <p>{fact.condition}</p>
   <a href={fact.source} target="_blank" rel="noopener noreferrer">{SOURCE[language]} ↗</a>
   <small> · {fact.checkedAt}</small>
 </section>;
}
