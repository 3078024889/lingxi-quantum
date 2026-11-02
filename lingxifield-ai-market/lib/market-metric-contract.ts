export type EvidenceMetric={value:number;unit:string;period:string;region:string;sourceUrl:string;checkedAt:string;methodology:string};
export type MarketCard={key:string;title:string;description:string;metric:EvidenceMetric|null};
const definitions=[
 {key:'website_visits',title:'全球 AI 网站访问量',description:'按可核验的网站访问量观测口径'},
 {key:'app_downloads',title:'全球 AI App 下载量',description:'按可核验的 App 下载观测口径'},
 {key:'geo_citation_rate',title:'AI 搜索与 GEO 可见度',description:'按模型、问题和地区的可复现引用测试'},
 {key:'funding',title:'AI 行业融资行情',description:'以公司公告或监管披露为准'},
] as const;
export function evidenceMetric(x:unknown):EvidenceMetric|null{
 if(!x||typeof x!=='object')return null;
 const m=x as Partial<EvidenceMetric>;
 if(typeof m.value!=='number'||!Number.isFinite(m.value)||m.value<0)return null;
 for(const k of ['unit','period','region','sourceUrl','checkedAt','methodology'] as const)
  if(typeof m[k]!=='string'||!m[k]?.trim())return null;
 if(!/^https:\/\//.test(m.sourceUrl!)||!Number.isFinite(Date.parse(m.checkedAt!)))return null;
 return m as EvidenceMetric;
}
export function marketCards(data:Record<string,unknown>={}):MarketCard[]{
 return definitions.map(d=>({key:d.key,title:d.title,description:d.description,metric:evidenceMetric(data[d.key])}));
}
