"use client";

import Link from "next/link";
import Bi from "@/components/Bi";
import { getTool } from "@/lib/tools/registry";

export default function RelatedTools({ slugs }: { slugs?: string[] }) {
  if (!slugs?.length) return null;
  const tools = slugs.map((s) => getTool(s)).filter(Boolean);
  if (!tools.length) return null;
  return (
    <section className="mt-12">
      <h2 className="font-display text-2xl font-light text-bone">
        <Bi zh="相关工具" en="Related tools" />
      </h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {tools.map((t) =>
          t ? (
            <Link
              key={t.slug}
              href={`/tools/${t.slug}`}
              className="rounded-sm border border-white/10 bg-void-deep px-4 py-3 transition hover:border-lattice/40"
            >
              <p className="text-sm text-bone">
                <Bi zh={t.titleZh} en={t.titleEn} />
              </p>
              <p className="mt-1 text-xs leading-5 text-bone-dim">
                <Bi zh={t.oneLinerZh} en={t.oneLinerEn} />
              </p>
            </Link>
          ) : null,
        )}
      </div>
    </section>
  );
}
