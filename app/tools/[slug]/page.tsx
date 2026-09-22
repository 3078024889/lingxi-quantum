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
  if (!tool) return { title: "工具未找到" };
  return {
    title: `${tool.titleZh}｜${tool.titleEn}`,
    description: tool.oneLinerZh,
    alternates: { canonical: `/tools/${tool.slug}` },
    openGraph: {
      images: [{ url: "/og-sasi-20260920.png", width: 1672, height: 941, alt: "灵犀场 SASI · 一念即达" }],
      title: tool.titleZh,
      description: tool.oneLinerZh,
      url: `/tools/${tool.slug}`,
    },
  };
}

function faqFor(slug: string): BilingualFaqItem[] {
  const common: BilingualFaqItem[] = [
    {
      qZh: "文件会上传到服务器吗？",
      qEn: "Are files uploaded to the server?",
      aZh: "本批已上线工具默认全部在浏览器本地处理，文件不上传灵犀场服务器。",
      aEn: "Live tools in this batch process files in your browser by default; nothing is uploaded to Lingxi Field servers.",
    },
    {
      qZh: "处理失败怎么办？",
      qEn: "What if processing fails?",
      aZh: "页面会说明原因与可尝试的解决办法（例如文件过大、格式不支持、浏览器过旧）。不会只显示「处理失败」。",
      aEn: "The page explains why and what to try next (size limits, unsupported format, outdated browser). We never show only “failed”.",
    },
  ];
  if (slug.startsWith("compress-image")) {
    common.unshift({
      qZh: "为什么压不到目标大小？",
      qEn: "Why can’t it reach the target size?",
      aZh: "当图片分辨率与细节信息量过大时，即使降低质量也会超过目标。工具会尽量逼近且优先不超限；若仍超限，会如实说明。",
      aEn: "Very large or detailed images may still exceed the target even at low quality. We approach the limit honestly and prefer never exceeding it when possible.",
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
          techNoteZh={
            tool.localOnly
              ? "核心逻辑运行在您的浏览器（Canvas / Web Crypto / 纯 JS）。重型库将按页面动态加载，避免拖慢全站首页。"
              : undefined
          }
          techNoteEn={
            tool.localOnly
              ? "Core logic runs in your browser (Canvas / Web Crypto / pure JS). Heavy libraries load only on the pages that need them so the site home stays light."
              : undefined
          }
        >
          <ToolWorkbench tool={tool} />
        </ToolShell>
      </div>
    </>
  );
}
