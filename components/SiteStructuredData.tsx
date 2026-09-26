const SITE="https://lingxifield.com";

export default function SiteStructuredData(){
 const graph={
  "@context":"https://schema.org",
  "@graph":[
   {
    "@type":"Organization",
    "@id":`${SITE}/#organization`,
    name:"灵犀场 LINGXIFIELD",
    url:SITE,
    logo:`${SITE}/images/lingxifield-logo.png`,
    email:"support@lingxifield.com",
    description:"面向创作、资料知识与日常文件处理的数字工作空间。"
   },
   {
    "@type":"WebSite",
    "@id":`${SITE}/#website`,
    url:SITE,
    name:"灵犀场 LINGXIFIELD",
    publisher:{"@id":`${SITE}/#organization`},
    inLanguage:["zh-CN","en","ja","ko","fr","de","es","pt","ar"],
    description:"SASI 创作、资料知识与免费实用工具。"
   },
   {
    "@type":"SoftwareApplication",
    "@id":`${SITE}/#app`,
    name:"灵犀场 LINGXIFIELD",
    url:SITE,
    applicationCategory:"ProductivityApplication",
    operatingSystem:"Web",
    offers:{"@type":"Offer","price":"0","priceCurrency":"CNY","description":"部分实用工具可免费使用，部分服务按页面所示价格提供。"},
    featureList:[
      "SASI 创作与构建",
      "资料知识与学习研究",
      "PDF、图片、视频、字幕和文件处理",
      "临时邮箱与阅后即焚"
    ],
    publisher:{"@id":`${SITE}/#organization`}
   }
  ]
 };
 return <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(graph)}}/>;
}
