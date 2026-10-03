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
   description:"在线给 PDF 添加签名图片、电子签章、公章图片或骑缝章，并预览、调整和导出。",
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
   title={<LxText zh="PDF电子签名与电子签章" en="PDF e-signatures and seals" ja="PDFの電子署名と印鑑" ko="PDF 전자 서명 및 도장" fr="Signatures et tampons PDF" de="PDF-Unterschriften und Stempel" es="Firmas y sellos PDF" pt="Assinaturas e carimbos PDF" ar="توقيعات وأختام PDF"/>}
   intro={<LxText zh="给 PDF 添加签名图片、电子签章、公章图片或骑缝章。上传文件后可选择页面、调整位置与大小、先预览再导出。" en="Add signature images, seals or stamps across PDF pages. Choose pages, adjust size and placement, preview, then export." ja="PDFに署名画像や印鑑を追加。ページ、位置、サイズを選び、プレビュー後に書き出せます。" ko="PDF에 서명 이미지나 도장을 추가하세요. 페이지와 위치, 크기를 선택하고 미리 본 후 내보내세요." fr="Ajoutez une signature ou un tampon au PDF. Choisissez les pages, ajustez la taille et la position, puis prévisualisez et exportez." de="Unterschriften oder Stempel im PDF platzieren. Seiten, Größe und Position wählen, Vorschau prüfen und exportieren." es="Añade firmas o sellos al PDF. Elige las páginas, ajusta el tamaño y la posición, revisa y exporta." pt="Adicione assinaturas ou carimbos ao PDF. Escolha as páginas, ajuste tamanho e posição, visualize e exporte." ar="أضف صور التوقيع أو الأختام إلى PDF. اختر الصفحات واضبط الحجم والموقع ثم عاين النتيجة وصدّرها."/>}
   note={<LxText zh="这里提供页面视觉签名和图片签章，不等同于带 CA 数字证书、身份认证或 PKI 验签能力的数字签名。" en="This tool places visual signatures and stamp images. It does not create certificate-based digital signatures or verify signer identity." ja="画像による署名・印鑑です。証明書付き電子署名や本人確認は行いません。" ko="이미지 형태의 서명과 도장입니다. 인증서 기반 디지털 서명이나 서명자 신원 확인을 제공하지 않습니다." fr="Cet outil ajoute des signatures visuelles et des tampons. Il ne crée pas de signature numérique certifiée et ne vérifie pas l’identité." de="Dieses Tool setzt sichtbare Unterschriften und Stempelbilder. Es erstellt keine zertifikatsbasierten digitalen Signaturen und prüft keine Identität." es="Esta herramienta coloca firmas visuales y sellos. No crea firmas digitales con certificado ni verifica la identidad." pt="Esta ferramenta aplica assinaturas visuais e carimbos. Não cria assinaturas digitais com certificado nem verifica a identidade." ar="تضيف هذه الأداة توقيعات مرئية وصور أختام. لا تنشئ توقيعات رقمية بشهادات ولا تتحقق من هوية الموقّع."/>}
  >
   <PdfEditorWorkbench signingOnly/>
  </AdvancedToolPage>
 </>;
}
