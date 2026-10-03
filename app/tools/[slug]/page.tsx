import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ToolShell from "@/components/tools/ToolShell";
import ToolWorkbench from "@/components/tools/ToolWorkbench";
import { getTool, TOOLS } from "@/lib/tools/registry";
import {buildToolMetadata} from '@/lib/tools/seo';
import ToolGuide from '@/components/seo/ToolGuide';
import {localFreeToolFact} from '@/lib/seo/local-free-tools';
import type { BilingualFaqItem } from "@/components/FaqSection";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  // dedicatedRoute tools (e.g. number-energy) keep their own folder
  return TOOLS.filter((t) => !t.dedicatedRoute).map((t) => ({ slug: t.slug }));
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const tool = getTool(params.slug);
  if (!tool) return { title: "Tool not found｜工具未找到" };
  return buildToolMetadata(tool.slug);
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
  const zh=localFreeToolFact(slug,"zh");
  const en=localFreeToolFact(slug,"en");
  if(zh&&en){
    common.unshift({
      qZh: zh.question,
      qEn: en.question,
      aZh: zh.answer,
      aEn: en.answer,
    });
  }
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

export default async function ToolSlugPage(props: Props) {
  const params = await props.params;
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
      <ToolGuide slug={tool.slug}/>
    </>
  );
}
