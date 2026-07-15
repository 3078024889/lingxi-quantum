import type { Metadata } from "next";
import "./globals.css";
import FieldVoices from "@/components/FieldVoices";
import AuroraVideoBand from "@/components/AuroraVideoBand";
import ClickRipple from "@/components/ClickRipple";

const SITE = "https://lingxifield.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "灵犀场 LINGXIFIELD ｜ 意识显化 · 生命图谱 · 探索梦境 · 修炼技术 · 重塑潜意识 · 多维叙事",
    template: "%s ｜ 灵犀场 LINGXIFIELD",
  },
  description:
    "灵犀（LINGXI）是一套意识显化与内在成长系统，融合意识显化（现实回路）、探索梦境、重塑潜意识、量子息法、上升心经、多维叙事等实践技术，帮助你探索内在觉察、创造力与身心成长。先在意识里活成真实，现实自会随之对齐。",
  keywords: [
    "显化", "意识显化", "显化方法", "显化技巧", "现实回路", "吸引力法则",
    "解梦", "梦境解析", "周公解梦", "梦的含义", "潜意识", "潜意识改写",
    "修炼", "冥想", "量子息法", "归零心诀", "直觉丹道", "上升心经", "重塑潜意识", "探索梦境", "多维叙事", "提升频率", "脉轮", "共时性", "觉醒", "更高的自己",
    "场域", "共振", "临在", "校准", "相干", "忆起", "主权", "完整",
    "manifestation", "how to manifest", "manifestation methods", "reality loop", "law of attraction",
    "dream interpretation", "dream meaning", "lucid dreaming", "subconscious mind",
    "consciousness", "meditation", "spiritual awakening", "higher self", "raise your vibration", "chakras", "synchronicity",
    "the Field", "resonance", "presence", "unconditional love",
  ],
  alternates: {
    canonical: "/",
    languages: { "zh-CN": "/", "en": "/", "x-default": "/" },
  },
  openGraph: {
    type: "website",
    siteName: "灵犀场 LingxiField",
    title: "灵犀 · 意识显化系统",
    description:
      "陪你显化目标、解读梦境、修炼意识的引导活场系统。先在意识里活成真实，现实自会随之对齐。",
    url: SITE,
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "灵犀场 LingxiField · 意识显化系统" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "灵犀 · 意识显化系统 | Lingxi",
    description: "显化 · 解梦 · 修炼。一个陪你回到自己的意识显化系统。",
    images: ["/og.jpg"],
  },
  robots: { index: true, follow: true },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  verification: {
    google: [
      "Q8hQ5NseO-vRkzeFaFHbjMWljGBYNZKlvclKWBghetk",
      "p6pCOqQydWyeU9ubwvBSUUROUKG8Hac8xXucbtjy1mg",
    ],
    other: {
      "baidu-site-verification": "codeva-Chj2V1jfTv",
      "msvalidate.01": "0E5B44454CD5DC0433DDBFAFA31CDB67",
    },
  },
};

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "灵犀场 LingxiField",
  alternateName: ["Lingxi", "LINGXI", "灵犀", "LingxiField", "灵犀场"],
  url: SITE,
  logo: `${SITE}/icon-512.png`,
  description:
    "灵犀是一个意识显化系统，提供显化、解梦与意识修炼的引导。Lingxi is a bilingual consciousness system for manifestation, dream interpretation, and inner practice.",
  knowsAbout: [
    "意识显化", "显化方法", "现实回路", "吸引力法则", "场域解梦", "梦境解析",
    "潜意识改写", "量子息法", "上升心经", "重塑潜意识", "探索梦境", "多维叙事", "提升频率", "共时性", "觉醒",
    "场域", "共振", "临在", "校准", "主权", "完整",
    "manifestation", "law of attraction", "dream interpretation", "lucid dreaming",
    "subconscious mind", "meditation", "consciousness", "spiritual awakening", "higher self", "chakras",
  ],
};

const siteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "灵犀场 LingxiField",
  alternateName: "LINGXI",
  url: SITE,
  inLanguage: ["zh-CN", "en"],
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: `${SITE}/learn?q={search_term_string}` },
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;500;600&family=Inter:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }} />
      </head>
      <body className="font-body antialiased">
        <div className="grain" aria-hidden="true" />
        <AuroraVideoBand />
        <FieldVoices />
        <ClickRipple />
        {children}
      </body>
    </html>
  );
}
