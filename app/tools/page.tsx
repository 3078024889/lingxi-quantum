import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Bi from "@/components/Bi";
import { CATEGORY_LABEL, TOOLS } from "@/lib/tools/registry";
import type { ToolMeta } from "@/lib/tools/types";

export const metadata: Metadata = {
  title: "在线工具｜图片压缩、PDF、哈希、二维码 · 浏览器本地处理",
  description:
    "灵犀场在线工具：图片转换与精确压缩、文件真实格式检测、MD5/SHA256、JSON、时间戳、二维码等。优先浏览器本地处理，不上传服务器。",
  alternates: { canonical: "/tools" },
  openGraph: {
      images: [{ url: "/og-sasi-20260920.png", width: 1672, height: 941, alt: "灵犀场 SASI · 一念即达" }],
    title: "灵犀场在线工具 · 本地处理，即开即用",
    description: "遇到数字问题，丢进来就知道怎么回事，并直接解决。",
    url: "/tools",
  },
};

const ORDER: ToolMeta["category"][] = ["image", "file", "utility", "qr", "pdf", "field"];

export default function ToolsHubPage() {
  return (
    <>
      <Nav />
      <main className="pt-16 lg:pt-8">
        <section className="px-6 py-14 sm:py-20">
          <div className="mx-auto max-w-5xl">
            <p className="font-display text-sm uppercase tracking-widest2 text-lattice">
              <Bi zh="灵犀场 · TOOLS" en="LINGXI FIELD · TOOLS" />
            </p>
            <h1 className="mt-4 font-display text-4xl font-light text-bone sm:text-5xl">
              <Bi zh="在线工具" en="Online tools" />
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-bone-dim">
              <Bi
                zh="遇到数字问题，丢进来就知道怎么回事，并尽量直接解决。第一批工具优先在浏览器本地完成，文件不上传服务器。"
                en="Drop a digital problem in — understand it, and fix it when possible. The first batch runs in your browser; files stay on your device."
              />
            </p>

            {ORDER.map((cat) => {
              const list = TOOLS.filter((t) => t.category === cat);
              if (!list.length) return null;
              const label = CATEGORY_LABEL[cat];
              return (
                <section key={cat} className="mt-12">
                  <h2 className="font-display text-2xl font-light text-bone">
                    <Bi zh={label.zh} en={label.en} />
                  </h2>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {list.map((t) => (
                      <Link
                        key={t.slug}
                        href={`/tools/${t.slug}`}
                        className="rounded-sm border border-white/10 bg-void-deep p-4 transition hover:border-lattice/40"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-bone">
                            <Bi zh={t.titleZh} en={t.titleEn} />
                          </p>
                          <span
                            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider ${
                              t.status === "live"
                                ? "bg-lattice/15 text-lattice"
                                : "bg-white/10 text-bone-mute"
                            }`}
                          >
                            {t.status === "live" ? "LIVE" : "SOON"}
                          </span>
                        </div>
                        <p className="mt-2 text-xs leading-5 text-bone-dim">
                          <Bi zh={t.oneLinerZh} en={t.oneLinerEn} />
                        </p>
                      </Link>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </section>
      </main>
      <div className="lg:ml-[260px]">
        <Footer />
      </div>
    </>
  );
}
