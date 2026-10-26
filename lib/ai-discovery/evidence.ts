/** Strict normalization for editorial evidence; this module never publishes or approves records. */
export const METRICS=["website_visits","app_downloads","monthly_active_users","benchmark_score","user_rating"] as const;
export type Metric=typeof METRICS[number];
export type EvidenceInput={toolSlug:string;metricKey:Metric;value:number;unit:string;geography:string;periodStart:string;periodEnd:string;sourceUrl:string;sourceName:string;kind:"official"|"third_party"|"estimate";observedAt:string};
export type EvidenceValidation={ok:true;record:EvidenceInput}|{ok:false;errors:string[]};
const datePattern=/^\d{4}-\d{2}-\d{2}$/;
const validDate=(v:string)=>datePattern.test(v)&&!Number.isNaN(Date.parse(v))&&new Date(v+"T00:00:00Z").toISOString().slice(0,10)===v;
export function validateEvidence(x:EvidenceInput,knownSlugs:ReadonlySet<string>):EvidenceValidation{
 const errors:string[]=[];
 if(!knownSlugs.has(x.toolSlug))errors.push("Unknown platform");
 if(!METRICS.includes(x.metricKey))errors.push("Unsupported metric");
 if(!Number.isFinite(x.value)||x.value<0)errors.push("Metric must be finite and nonnegative");
 if(!x.unit||x.unit.length>40)errors.push("Invalid unit");
 if(!x.geography||x.geography.length>80)errors.push("Invalid geography");
 if(!validDate(x.periodStart)||!validDate(x.periodEnd)||x.periodStart>x.periodEnd)errors.push("Invalid measurement period");
 let url:URL|undefined;try{url=new URL(x.sourceUrl);}catch{}
 if(!url||url.protocol!=="https:"||!url.hostname.includes(".")||url.username||url.password)errors.push("Source must be a public HTTPS URL");
 if(!x.sourceName.trim()||x.sourceName.length>160)errors.push("Source name required");
 if(!["official","third_party","estimate"].includes(x.kind))errors.push("Invalid evidence kind");
 const observed=new Date(x.observedAt);
 if(!Number.isFinite(observed.getTime())||observed.getTime()>Date.now()+86400000)errors.push("Invalid observation timestamp");
 if(errors.length)return {ok:false,errors};
 return {ok:true,record:{...x,sourceUrl:url!.toString(),sourceName:x.sourceName.trim()}};
}
export function evidenceComparable(a:EvidenceInput,b:EvidenceInput):boolean{
 return a.metricKey===b.metricKey&&a.unit===b.unit&&a.geography===b.geography&&a.periodStart===b.periodStart&&a.periodEnd===b.periodEnd;
}
