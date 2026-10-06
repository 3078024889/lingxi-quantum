import {SITE} from "@/lib/seo/global-seo";
import {PUBLIC_FEATURE_COPY} from '@/lib/public-feature-copy';
export default function SiteStructuredData(){
 const aliases=["灵犀场SASI","LINGXIFIELD SASI","灵犀场 LINGXIFIELD"];
 const graph={"@context":"https://schema.org","@graph":[
  {"@type":"Organization","@id":`${SITE}/#organization`,name:"灵犀场 LINGXIFIELD",alternateName:aliases,url:SITE,logo:`${SITE}/images/lingxifield-logo.png`,email:"support@lingxifield.com",description:PUBLIC_FEATURE_COPY.zh.description},
  {"@type":"WebSite","@id":`${SITE}/#website`,url:SITE,name:"灵犀场 LINGXIFIELD",alternateName:aliases,publisher:{"@id":`${SITE}/#organization`},inLanguage:["zh-CN","en","ja","ko","fr","de","es","pt","ar"]}
 ]};
 return <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(graph).replace(/</g,"\\u003c")}}/>;
}
