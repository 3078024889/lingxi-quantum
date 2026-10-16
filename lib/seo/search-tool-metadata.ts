import type { Metadata } from "next";
import { getGlobalTool, SEO_LOCALES, localePath, toolDescription, toolTitle, type SeoLocale } from "./global-seo";
import { SHARE_IMAGES, SHARE_IMAGE_URL } from "@/lib/share-image";
import { toolSeo } from "@/lib/tools/seo";
import { PRIMARY_SITE } from "./site-domains";

const SITE = PRIMARY_SITE;

const TITLE_OVERRIDES: Record<string, Partial<Record<SeoLocale, string>>> = {
  "pdf-compress": {
    zh: "PDF压缩｜PDF文件太大怎么压缩变小",
    en: "Compress PDF｜Make a PDF File Smaller",
  },
  "compress-pdf": {
    zh: "PDF压缩｜扫描件与图片型PDF怎么压缩",
    en: "Compress PDF｜Reduce Scanned and Image PDFs",
  },
  "merge-pdf": {
    zh: "PDF合并｜多个PDF怎么合并成一个文件",
    en: "Merge PDF｜Combine Multiple PDF Files",
  },
  "e-sign-pdf": {
    zh: "PDF电子签名｜PDF怎么签字、盖章",
    en: "E-sign PDF｜Sign and Stamp a PDF",
  },
  "ocr": {
    zh: "图片转文字｜截图怎么提取文字",
    en: "Image to Text｜Extract Text from Images",
  },
  "compress-image-to-100kb": {
    zh: "图片压缩到100KB｜怎么把图片压到100KB以内",
    en: "Compress Image to 100KB｜Reduce Image Size",
  },
  "heic-to-jpg": {
    zh: "HEIC转JPG｜iPhone照片怎么转JPG",
    en: "HEIC to JPG｜Convert iPhone Photos",
  },
  "pdf-to-word": {
    zh: "PDF转Word｜PDF怎么转Word、格式怎么检查",
    en: "PDF to Word｜Convert PDF and Check Formatting",
  },
  "pdf-to-xlsx": {
    zh: "PDF转Excel｜PDF表格怎么转换成Excel",
    en: "PDF to Excel｜Convert PDF Tables to XLSX",
  },
  "pdf-to-jpg": {
    zh: "PDF转JPG｜PDF怎么转成图片",
    en: "PDF to JPG｜Convert PDF Pages to Images",
  },
  "video-transcription": {
    zh: "视频转文字｜视频怎么转成文字",
    en: "Video to Text｜Transcribe a Video",
  },
  "audio-transcription": {
    zh: "音频转文字｜录音怎么转成文字",
    en: "Audio to Text｜Transcribe a Recording",
  },
  "temp-mail": {
    zh: "临时邮箱｜接收验证码的一次性邮箱",
    en: "Temporary Email｜Disposable Inbox for Verification",
  },
  "remove-exif": {
    zh: "删除图片EXIF｜清除照片GPS与元数据",
    en: "Remove EXIF｜Clear Photo GPS and Metadata",
  },
  "file-type-detector": {
    zh: "文件真实格式检测｜怎么看文件真正是什么格式",
    en: "Real File Type Detector｜Check a File's Actual Format",
  },
  "ai-image-check": {
    zh: "AI图片检测｜怎么判断图片是不是AI生成的",
    en: "AI Image Analysis｜Check for Possible AI Generation",
  },
  "ai-video-audio-check": {
    zh: "AI视频与音频检测｜检查可能的AI生成特征",
    en: "AI Video & Audio Analysis｜Check Possible AI Signals",
  },
};

export function buildSearchOptimizedToolMetadata(slug: string, locale: SeoLocale): Metadata {
  const tool = getGlobalTool(slug);
  if (!tool) return { title: "Tool not found｜工具未找到" };
  const base = toolSeo(slug);
  const title = TITLE_OVERRIDES[slug]?.[locale] || (locale === "zh" ? base.title : toolTitle(locale, tool));
  const description = toolDescription(locale, tool);
  const canonical = localePath(locale, `/tools/${slug}`);
  return {
    title,
    description,
    alternates: { canonical, languages: { ...Object.fromEntries(Object.entries(SEO_LOCALES).map(([key]) => [SEO_LOCALES[key as SeoLocale].hreflang, localePath(key as SeoLocale, `/tools/${slug}`)])), "x-default": localePath("zh", `/tools/${slug}`) } },
    openGraph: {
      images: SHARE_IMAGES,
      type: "website",
      url: `${SITE}${canonical}`,
      title,
      description,
      siteName: "灵犀场 LINGXIFIELD",
    },
    twitter: { card: "summary_large_image", images: [SHARE_IMAGE_URL], title, description },
    robots: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large", "max-video-preview": -1 },
  };
}
