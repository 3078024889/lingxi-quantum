import AdvancedToolPage from '@/components/tools/AdvancedToolPage';import PdfEditorWorkbench from '@/components/tools/PdfEditorWorkbench';
export default function Page(){return <AdvancedToolPage title="PDF 签名、盖章与骑缝章" intro="上传你有权使用的签名或印章，指定页面盖章；骑缝章会按 PDF 页数自动切片连续放置。" note="这里提供的是视觉签署/图片签章，不等同于带数字证书与身份认证的 PKI 数字签名。"><PdfEditorWorkbench signingOnly/></AdvancedToolPage>}
