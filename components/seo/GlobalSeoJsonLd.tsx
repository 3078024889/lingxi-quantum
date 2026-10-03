import {SITE,SEO_LOCALES,type SeoLocale,type GlobalTool,type SeoTopic,topicTitle,localePath,toolTitle,toolDescription} from "@/lib/seo/global-seo";
import {SERVICE_FACTS} from '@/lib/seo/service-facts';
import {toolGeoFact} from '@/lib/seo/site-facts';

export function ToolSeoJsonLd({locale,tool}:{locale:SeoLocale;tool:GlobalTool}){
 const c=SEO_LOCALES[locale];
 const url=`${SITE}${localePath(locale,`/tools/${tool.slug}`)}`;
 const actual=`${SITE}/tools/${tool.slug}`;
 const fact=toolGeoFact(tool.slug,locale);
 const description=fact?.description??toolDescription(locale,tool);
 const application:Record<string,unknown>={
  "@type":"WebApplication","@id":`${actual}#tool`,name:toolTitle(locale,tool),url:actual,description,applicationCategory:"UtilitiesApplication",operatingSystem:"Web",inLanguage:c.hreflang,publisher:{"@id":`${SITE}/#organization`}
 };
 if(fact?.kind==='free-local'){
  application.isAccessibleForFree=true;
  application.offers={"@type":"Offer",price:"0",priceCurrency:"USD"};
 }
 if(fact&&(fact.kind==='paid-local'||fact.kind==='paid-online'))application.isAccessibleForFree=false;
 const graph:Record<string,unknown>[]=[
  {"@type":"WebPage","@id":`${url}#page`,url,name:toolTitle(locale,tool),description,inLanguage:c.hreflang,isPartOf:{"@id":`${SITE}/#website`},about:{"@id":`${actual}#tool`}},
  application,
  {"@type":"BreadcrumbList","itemListElement":[
   {"@type":"ListItem","position":1,"name":c.brand,"item":`${SITE}${localePath(locale,"/")}`},
   {"@type":"ListItem","position":2,"name":c.toolsTitle,"item":`${SITE}${localePath(locale,"/tools")}`},
   {"@type":"ListItem","position":3,"name":toolTitle(locale,tool),"item":url}
  ]}
 ];
 if(fact)graph.push({"@type":"FAQPage","@id":`${url}#faq`,url,inLanguage:c.hreflang,mainEntity:[{"@type":"Question",name:fact.question,acceptedAnswer:{"@type":"Answer",text:fact.answer}}]});
 const data={"@context":"https://schema.org","@graph":graph};
 return <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(data)}}/>;
}

export function TopicSeoJsonLd({locale,topic}:{locale:SeoLocale;topic:SeoTopic}){
 const c=SEO_LOCALES[locale],title=topicTitle(locale,topic),url=`${SITE}${localePath(locale,`/discover/${topic}`)}`;
 const data={"@context":"https://schema.org","@graph":[
  {"@type":"WebPage","@id":`${url}#page`,url,name:title,description:SERVICE_FACTS[topic].description[locale],inLanguage:c.hreflang,isPartOf:{"@id":`${SITE}/#website`}},
  {"@type":"Service","@id":`${url}#service`,name:title,description:SERVICE_FACTS[topic].description[locale],url,provider:{"@id":`${SITE}/#organization`},availableChannel:{"@type":"ServiceChannel","serviceUrl":SITE+SERVICE_FACTS[topic].target}}
 ]};
 return <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(data)}}/>;
}
