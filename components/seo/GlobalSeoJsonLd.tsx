import {SITE,SEO_LOCALES,type SeoLocale,type GlobalTool,type SeoTopic,topicTitle,localePath} from "@/lib/seo/global-seo";

export function ToolSeoJsonLd({locale,tool}:{locale:SeoLocale;tool:GlobalTool}){
 const c=SEO_LOCALES[locale];
 const url=`${SITE}${localePath(locale,`/tools/${tool.slug}`)}`;
 const actual=`${SITE}/tools/${tool.slug}`;
 const data={
  "@context":"https://schema.org",
  "@graph":[
   {"@type":"WebPage","@id":`${url}#page`,url,name:locale==="zh"?tool.zh:tool.en,inLanguage:c.hreflang,isPartOf:{"@id":`${SITE}/#website`},about:{"@id":`${url}#tool`}},
   {"@type":"WebApplication","@id":`${url}#tool`,name:locale==="zh"?tool.zh:tool.en,url:actual,applicationCategory:"UtilitiesApplication",operatingSystem:"Web",inLanguage:c.hreflang,publisher:{"@id":`${SITE}/#organization`}},
   {"@type":"BreadcrumbList","itemListElement":[
    {"@type":"ListItem","position":1,"name":c.brand,"item":`${SITE}${localePath(locale,"/")}`},
    {"@type":"ListItem","position":2,"name":c.toolsTitle,"item":`${SITE}${localePath(locale,"/tools")}`},
    {"@type":"ListItem","position":3,"name":locale==="zh"?tool.zh:tool.en,"item":url}
   ]}
  ]
 };
 return <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(data)}}/>;
}

export function TopicSeoJsonLd({locale,topic}:{locale:SeoLocale;topic:SeoTopic}){
 const c=SEO_LOCALES[locale],title=topicTitle(locale,topic),url=`${SITE}${localePath(locale,`/discover/${topic}`)}`;
 const data={"@context":"https://schema.org","@graph":[
  {"@type":"WebPage","@id":`${url}#page`,url,name:title,inLanguage:c.hreflang,isPartOf:{"@id":`${SITE}/#website`}},
  {"@type":"Service","@id":`${url}#service`,name:title,url,provider:{"@id":`${SITE}/#organization`},areaServed:"Worldwide",availableChannel:{"@type":"ServiceChannel","serviceUrl":url}}
 ]};
 return <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(data)}}/>;
}
