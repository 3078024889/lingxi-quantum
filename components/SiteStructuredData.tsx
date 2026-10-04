import {SITE} from "@/lib/seo/global-seo";
export default function SiteStructuredData(){
 const aliases=["灵犀场SASI","LINGXIFIELD SASI","灵犀场 LINGXIFIELD"];
 const graph={"@context":"https://schema.org","@graph":[
  {"@type":"Organization","@id":`${SITE}/#organization`,name:"灵犀场 LINGXIFIELD",alternateName:aliases,url:SITE,logo:`${SITE}/images/lingxifield-logo.png`,email:"support@lingxifield.com",description:"灵犀场 LINGXIFIELD 是 SASI全球多模型智能创作平台，提供 AI 短剧、网站构建、书本 SASI、学习 SASI、科研 SASI，以及 PDF、图片、视频、OCR、临时邮箱、阅后即焚等实用工具。"},
  {"@type":"WebSite","@id":`${SITE}/#website`,url:SITE,name:"灵犀场 LINGXIFIELD",alternateName:aliases,publisher:{"@id":`${SITE}/#organization`},inLanguage:["zh-CN","en","ja","ko","fr","de","es","pt","ar"]}
 ]};
 return <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(graph).replace(/</g,"\\u003c")}}/>;
}
