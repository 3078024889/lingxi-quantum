import {TOOL_INTROS} from "@/lib/tools/product-copy";
import LxText from "@/components/LxText";
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
   description:"在线给 PDF 添加签名图片、电子签章、公章图片或骑缝章，并预览、调整和导出。"
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
   title={<LxText zh="PDF电子签名与电子签章" en="PDF e-signatures and seals" ja="PDFの電子署名と印鑑" ko="PDF 전자 서명 및 도장" fr="Signatures et tampons PDF" de="PDF-Unterschriften und Stempel" es="Firmas y sellos PDF" pt="Assinaturas e carimbos PDF" ar="توقيعات وأختام PDF"/>}
   intro={<LxText {...TOOL_INTROS["e-sign-pdf"]}/>}
   note={<LxText zh="添加的是签名和印章图片。如需验证签署人身份，请使用专门的签署服务。" en="This adds signature and stamp images. For signer identity verification, use a dedicated signing service." ja="署名や印鑑の画像を追加します。本人確認が必要な場合は専用の署名サービスをご利用ください。" ko="서명과 도장 이미지를 추가합니다. 서명자 확인이 필요하면 전문 서명 서비스를 이용하세요." fr="Cet outil ajoute des images de signature et de tampon. Pour vérifier l’identité du signataire, utilisez un service de signature dédié." de="Fügt Unterschrifts- und Stempelbilder hinzu. Zur Identitätsprüfung nutzen Sie einen dafür vorgesehenen Signaturdienst." es="Añade imágenes de firmas y sellos. Para verificar la identidad del firmante, usa un servicio de firma especializado." pt="Adiciona imagens de assinaturas e carimbos. Para verificar a identidade de quem assina, use um serviço de assinatura especializado." ar="تُضاف صور التوقيع والختم. للتحقق من هوية الموقّع، استخدم خدمة توقيع متخصصة."/>}
  >
   <PdfEditorWorkbench signingOnly/>
  </AdvancedToolPage>
 </>;
}
