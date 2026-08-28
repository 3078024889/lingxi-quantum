import type { Metadata } from "next";
import "./globals.css";
import FieldVoices from "@/components/FieldVoices";
import AuroraVideoBand from "@/components/AuroraVideoBand";
import ClickRipple from "@/components/ClickRipple";
import MiniEmbedMode from "@/components/MiniEmbedMode";
import FieldStructure9D from "@/components/FieldStructure9D";

const SITE = "https://lingxifield.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "灵犀场 LINGXIFIELD ｜ 意识显化数字空间 · 场域精测 · 探索梦境 · 修炼技术 · 重塑潜意识 · 多维叙事",
    template: "%s ｜ 灵犀场 LINGXIFIELD · 意识显化数字空间",
  },
  description:
    "灵犀场（LINGXIFIELD）是一座原创的意识显化数字空间，融合场域精测、意识显化、梦境探索、修炼技术、潜意识重塑与多维叙事，帮助用户建立可观察、可反思、可持续更新的个人生命档案。",
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
    siteName: "灵犀场 LINGXIFIELD · 意识显化数字空间",
    title: "灵犀场 · 意识显化数字空间",
    description:
      "一座原创的意识显化数字空间，以结构读取、象征探索与现实验证陪伴持续的自我探索。",
    url: SITE,
    images: [{ url: "/og-v316.png", width: 1673, height: 941, alt: "灵犀场官网与小程序 · 双引擎生命场域" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "灵犀场 · 意识显化数字空间 | Lingxi Field",
    description: "显化 · 精测 · 梦境 · 修炼。一座原创的意识显化数字空间。",
    images: ["/og-v316.png"],
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
      "baidu-site-verification": "codeva-QeLvo6OqH7",
      "msvalidate.01": "0E5B44454CD5DC0433DDBFAFA31CDB67",
    },
  },
};

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "灵犀场 LINGXIFIELD · 意识显化数字空间",
  alternateName: ["Lingxi", "LINGXI", "灵犀", "LingxiField", "灵犀场", "意识显化数字空间"],
  url: SITE,
  logo: `${SITE}/icon-512.png`,
  description:
    "灵犀场是一座原创的意识显化数字空间，提供结构化自我探索、象征体系探索、创意叙事与数字报告。Lingxi Field is an original bilingual digital space for conscious manifestation, structured self-exploration, symbolic inquiry, creative narratives, and personal archives.",
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
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;500;600&family=Inter:wght@300;400;500&family=Noto+Sans+SC:wght@400;500;600&family=Noto+Serif+SC:wght@500;600&display=swap"
          rel="stylesheet"
        />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }} />
      </head>
      <body className="font-body antialiased">
        <MiniEmbedMode />
        <div className="grain" aria-hidden="true" />
        <AuroraVideoBand />
        <FieldVoices />
        <ClickRipple />
        {children}
        <FieldStructure9D />
      </body>
    </html>
  );
}
