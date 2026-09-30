import {GLOBAL_TOOL_CATALOG,SEO_TOPICS,SITE} from "@/lib/seo/global-seo";
export default function SiteStructuredData(){
 const graph={"@context":"https://schema.org","@graph":[
  {"@type":"Organization","@id":`${SITE}/#organization`,name:"灵犀场 LINGXIFIELD",alternateName:"LINGXIFIELD",url:SITE,logo:`${SITE}/images/lingxifield-logo.png`,email:"support@lingxifield.com",description:"全球智能工具与 SASI 创作生态平台。"},
  {"@type":"WebSite","@id":`${SITE}/#website`,url:SITE,name:"灵犀场 LINGXIFIELD",publisher:{"@id":`${SITE}/#organization`},inLanguage:["zh-CN","en","ja","ko","fr","de","es","pt","ar"],description:"PDF、图片、视频、OCR 与文件工具，以及 SASI 短剧、书本、学习、科研和构建工作区。"},
  {"@type":"WebApplication","@id":`${SITE}/#app`,name:"灵犀场 LINGXIFIELD",url:SITE,applicationCategory:"ProductivityApplication",operatingSystem:"Web",featureList:["AI 短剧生成","书本与文档变成可追问的 SASI","学习 SASI","科研 SASI","网站与应用构建",...GLOBAL_TOOL_CATALOG.map(x=>x.zh)],publisher:{"@id":`${SITE}/#organization`}},
  {"@type":"ItemList","@id":`${SITE}/#tools`,name:"LINGXIFIELD online tools",numberOfItems:GLOBAL_TOOL_CATALOG.length,itemListElement:GLOBAL_TOOL_CATALOG.map((x,i)=>({"@type":"ListItem",position:i+1,name:x.en,url:`${SITE}/tools/${x.slug}`}))},
  {"@type":"ItemList","@id":`${SITE}/#sasi-capabilities`,name:"LINGXIFIELD SASI",numberOfItems:Object.keys(SEO_TOPICS).length,itemListElement:Object.entries(SEO_TOPICS).map(([slug,names],i)=>({"@type":"ListItem",position:i+1,name:names.en,url:`${SITE}/discover/${slug}`}))}
 ]};
 return <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(graph)}}/>;
}
