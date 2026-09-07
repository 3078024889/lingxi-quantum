import type { Metadata } from "next";
import "./globals.css";
import FieldVoices from "@/components/FieldVoices";
import AuroraVideoBand from "@/components/AuroraVideoBand";
import ClickRipple from "@/components/ClickRipple";
import MiniEmbedMode from "@/components/MiniEmbedMode";
import FieldStructure9D from "@/components/FieldStructure9D";

const SITE = "https://lingxifield.cn";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "灵犀场 LINGXIFIELD｜AI短剧制作、视频生成、AI编程与意识显化平台",
    template: "%s ｜ 灵犀场 LINGXIFIELD · 意识显化数字空间",
  },
  description:
    "灵犀场（LINGXIFIELD）是融合 AI 短剧制作、视频生成、AI 编程、网站与应用构建部署、意识显化与场域精测的中英双语智能数字空间。",
  keywords: [
    "显化", "意识显化", "显化方法", "显化技巧", "现实回路", "吸引力法则",
    "AI短剧", "故事板", "人物身份板", "网站构建", "编程部署", "潜意识", "潜意识改写",
    "修炼", "冥想", "量子息法", "归零心诀", "直觉丹道", "上升心经", "重塑潜意识", "提升频率", "脉轮", "共时性", "觉醒", "更高的自己",
    "场域", "共振", "临在", "校准", "相干", "忆起", "主权", "完整",
    "manifestation", "how to manifest", "manifestation methods", "reality loop", "law of attraction",
    "AI drama", "AI video", "AI coding", "website builder", "subconscious mind",
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
      "意识显化、场域精测、AI短剧与编程构建汇入同一座双语数字空间。",
    url: SITE,
    images: [
      { url: "https://lingxifield.cn/og-v337.png?v=20260831", width: 1672, height: 941, alt: "灵犀场官网与小程序 · 双主理人数字生命场域" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "灵犀场 · 意识显化数字空间 | Lingxi Field",
    description: "显化 · 精测 · AI创作 · 编程构建。一座连接内在探索与真实交付的数字空间。",
    images: ["https://lingxifield.cn/og-v337.png?v=20260831"],
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
    "灵犀场是一座融合意识探索、个人数字报告、AI短剧与编程构建的双语数字空间。Lingxi Field is a bilingual digital space for conscious exploration, personal reports, AI drama and software creation.",
  knowsAbout: [
    "意识显化", "显化方法", "现实回路", "吸引力法则", "AI短剧", "网站构建", "编程部署",
    "潜意识改写", "量子息法", "上升心经", "重塑潜意识", "提升频率", "共时性", "觉醒",
    "场域", "共振", "临在", "校准", "主权", "完整",
    "manifestation", "law of attraction", "AI drama", "AI video", "AI coding",
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
