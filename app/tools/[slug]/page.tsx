import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ToolShell from "@/components/tools/ToolShell";
import ToolWorkbench from "@/components/tools/ToolWorkbench";
import { getTool, TOOLS } from "@/lib/tools/registry";
import type { BilingualFaqItem } from "@/components/FaqSection";

type Props = { params: { slug: string } };

export function generateStaticParams() {
  // dedicatedRoute tools (e.g. number-energy) keep their own folder
  return TOOLS.filter((t) => !t.dedicatedRoute).map((t) => ({ slug: t.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const tool = getTool(params.slug);
  if (!tool) return { title: "Tool not found｜工具未找到" };
  return {
    title: `${tool.titleZh}｜${tool.titleEn}`,
    description: tool.oneLinerZh,
    alternates: { canonical: `/tools/${tool.slug}` },
    openGraph: {
      images: [{ url: "/og-lingxifield-20260925.jpg", width: 1672, height: 941, alt: "LINGXIFIELD SASI · 灵犀场" }],
      title: tool.titleZh,
      description: tool.oneLinerZh,
      url: `/tools/${tool.slug}`,
    },
  };
}

function faqFor(slug: string): BilingualFaqItem[] {
  const common: BilingualFaqItem[] = [
    {
      qZh: "处理失败怎么办？",
      qEn: "What if processing fails?",
      aZh: "页面会说明原因和可以尝试的解决办法，例如文件过大、格式不支持或浏览器版本过旧。",
      aEn: "The page explains the reason and what to try next, such as file size, unsupported format, or an outdated browser.",
    },
  ];
  if (slug.startsWith("compress-image")) {
    common.unshift({
      qZh: "为什么压不到目标大小？",
      qEn: "Why can’t it reach the target size?",
      aZh: "图片分辨率或细节很多时，继续缩小会明显影响清晰度。工具会尽量接近目标，并显示实际结果。",
      aEn: "Very large or detailed images may lose noticeable quality if reduced further. The tool gets as close as possible and shows the actual result.",
    });
  }
  return common;
}

export default function ToolSlugPage({ params }: Props) {
  const tool = getTool(params.slug);
  if (!tool) notFound();

  // Dedicated route already exists for number-energy
  if (tool.dedicatedRoute) {
    notFound();
  }

  return (
    <>
      <div className="">
        <ToolShell
          tool={tool}
          faq={faqFor(tool.slug)}
>
          <ToolWorkbench tool={tool} />
        </ToolShell>
      </div>
    </>
  );
}
