import type { Metadata } from "next";
import AdvancedToolPage from "@/components/tools/AdvancedToolPage";
import BatchPdfWorkbench from "@/components/tools/BatchPdfWorkbench";
import { languageAlternates } from "@/lib/seo/global-seo";

export const metadata: Metadata = {
  title: "批量 PDF 工作台｜灵犀场",
  description: "一次批量处理多个 PDF：清除元数据、旋转、水印、页码、表单扁平化，并可最终合并为一个 PDF。",
  alternates: {
    canonical: "/tools/batch-pdf",
    languages: languageAlternates("/tools/batch-pdf"),
  },
};

export default function Page() {
  return (
    <AdvancedToolPage
      title="批量 PDF 工作台"
      intro="一次上传多个 PDF，组合常用动作后统一处理；适合合同、讲义、报告和团队重复文档流程。"
      note="本工具在浏览器本地处理。OCR、PDF 转 Word、真脱敏和电子签名属于独立专业能力，不包含在批次价里。"
    >
      <BatchPdfWorkbench />
    </AdvancedToolPage>
  );
}
