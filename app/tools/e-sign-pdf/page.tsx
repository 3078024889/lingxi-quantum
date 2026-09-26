import type { Metadata } from "next";
import AdvancedToolPage from "@/components/tools/AdvancedToolPage";
import PdfEditorWorkbench from "@/components/tools/PdfEditorWorkbench";
import { buildToolMetadata } from "@/lib/tools/seo";

export const metadata:Metadata=buildToolMetadata("e-sign-pdf");

const structured={
 "@context":"https://schema.org",
 "@graph":[
  {
   "@type":"WebApplication",
   name:"灵犀场 PDF电子签名与电子签章",
   url:"https://lingxifield.com/tools/e-sign-pdf",
   applicationCategory:"BusinessApplication",
   operatingSystem:"Web",
   description:"在线给 PDF 添加手写签名、电子签章、公章图片或骑缝章，并预览、调整和导出。",
   offers:{"@type":"Offer","price":"0","priceCurrency":"CNY","description":"编辑与预览可直接进行；最终导出以页面显示价格为准。"}
  },
  {
   "@type":"FAQPage",
   mainEntity:[
    {"@type":"Question","name":"可以给 PDF 添加电子签章或公章图片吗？","acceptedAnswer":{"@type":"Answer","text":"可以。上传你有权使用的签名或印章图片后，可放到指定页面并调整位置和大小。"}},
    {"@type":"Question","name":"可以做 PDF 骑缝章吗？","acceptedAnswer":{"@type":"Answer","text":"可以。选择导出页范围和边缘位置后，可把印章按页数切片连续放置。"}},
    {"@type":"Question","name":"这里的电子签名等同于数字证书签名吗？","acceptedAnswer":{"@type":"Answer","text":"不等同。这里提供页面视觉签署和图片签章；需要 CA 证书、身份认证或 PKI 数字签名的场景，请按相关机构要求办理。"}}
   ]
  }
 ]
};

export default function Page(){
 return <>
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(structured)}}/>
  <AdvancedToolPage
   title="PDF电子签名与电子签章"
   intro="给 PDF 添加手写签名、电子签章、公章图片或骑缝章。上传文件后可选择页面、调整位置与大小、先预览再导出，适合合同签字、PDF盖章等常见场景。"
   note="这里提供页面视觉签署和图片签章，不等同于带 CA 数字证书、身份认证或 PKI 验签能力的数字签名。"
  >
   <PdfEditorWorkbench signingOnly/>
  </AdvancedToolPage>
 </>;
}
