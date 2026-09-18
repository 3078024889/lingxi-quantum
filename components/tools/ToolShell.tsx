"use client";

import type { ReactNode } from "react";
import Bi from "@/components/Bi";
import FaqSection, { type BilingualFaqItem } from "@/components/FaqSection";
import type { ToolMeta } from "@/lib/tools/types";
import PrivacyBadge from "./PrivacyBadge";
import RelatedTools from "./RelatedTools";

export default function ToolShell({
  tool,
  children,
  faq,
  techNoteZh,
  techNoteEn,
}: {
  tool: ToolMeta;
  children: ReactNode;
  faq?: BilingualFaqItem[];
  techNoteZh?: string;
  techNoteEn?: string;
}) {
  return (
    <main className="pt-16 lg:pt-8">
      <section className="px-6 py-12 sm:py-16">
        <div className="mx-auto max-w-3xl">
          <p className="font-display text-sm uppercase tracking-widest2 text-lattice">
            <Bi zh="灵犀场 · 在线工具" en="Lingxi Field · Tools" />
          </p>
          <h1 className="mt-4 font-display text-3xl font-light text-bone sm:text-4xl">
            <Bi zh={tool.titleZh} en={tool.titleEn} />
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-bone-dim">
            <Bi zh={tool.oneLinerZh} en={tool.oneLinerEn} />
          </p>
          <div className="mt-5">
            <PrivacyBadge localOnly={tool.localOnly} />
          </div>

          <div className="mt-10">{children}</div>

          {faq && faq.length > 0 && <FaqSection items={faq} />}

          {(techNoteZh || techNoteEn) && (
            <section className="mt-10">
              <h2 className="font-display text-xl font-light text-bone">
                <Bi zh="简短技术说明" en="Technical note" />
              </h2>
              <p className="mt-3 text-sm leading-7 text-bone-dim">
                <Bi zh={techNoteZh || ""} en={techNoteEn || techNoteZh || ""} />
              </p>
            </section>
          )}

          <section className="mt-10">
            <h2 className="font-display text-xl font-light text-bone">
              <Bi zh="隐私说明" en="Privacy" />
            </h2>
            <p className="mt-3 text-sm leading-7 text-bone-dim">
              <Bi
                zh="本工具默认在您的浏览器本地完成计算与转换。文件不会上传到灵犀场服务器，也不会写入我们的对象存储。刷新或关闭页面后，内存中的文件即被释放。"
                en="This tool processes data in your browser by default. Files are not uploaded to Lingxi Field servers or object storage. Closing or refreshing the page releases them from memory."
              />
            </p>
          </section>

          <RelatedTools slugs={tool.related} />
        </div>
      </section>
    </main>
  );
}
