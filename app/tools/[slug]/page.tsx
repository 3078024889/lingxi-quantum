import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ToolShell from "@/components/tools/ToolShell";
import ToolWorkbench from "@/components/tools/ToolWorkbench";
import { getTool, TOOLS } from "@/lib/tools/registry";
import {buildSearchOptimizedToolMetadata} from '@/lib/seo/search-tool-metadata';
import ToolGuide from '@/components/seo/ToolGuide';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return TOOLS.filter((t) => !t.dedicatedRoute).map((t) => ({ slug: t.slug }));
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const tool = getTool(params.slug);
  if (!tool) return { title: "Tool not found｜工具未找到" };
  return buildSearchOptimizedToolMetadata(tool.slug, "zh");
}

export default async function ToolSlugPage(props: Props) {
  const params = await props.params;
  const tool = getTool(params.slug);
  if (!tool) notFound();
  if (tool.dedicatedRoute) notFound();

  return (
    <>
      <div className="">
        <ToolShell tool={tool}>
          <ToolWorkbench tool={tool} />
        </ToolShell>
      </div>
      <ToolGuide slug={tool.slug}/>
    </>
  );
}
