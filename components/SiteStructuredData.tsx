import {SITE} from "@/lib/seo/global-seo";
export default function SiteStructuredData(){
 const graph={"@context":"https://schema.org","@graph":[
  {"@type":"Organization","@id":`${SITE}/#organization`,name:"灵犀场 LINGXIFIELD",alternateName:"LINGXIFIELD",url:SITE,logo:`${SITE}/images/lingxifield-logo.png`,email:"support@lingxifield.com"},
  {"@type":"WebSite","@id":`${SITE}/#website`,url:SITE,name:"灵犀场 LINGXIFIELD",publisher:{"@id":`${SITE}/#organization`},inLanguage:["zh-CN","en","ja","ko","fr","de","es","pt","ar"]}
 ]};
 return <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(graph).replace(/</g,"\\u003c")}}/>;
}
