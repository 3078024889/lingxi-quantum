"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import ToolGlyph from "./ToolGlyph";
import { liveTools } from "@/lib/tools/registry";
import { useLingxiLang } from "@/lib/lingxi-i18n";

type GlyphKind = "image" | "document" | "video" | "audio" | "privacy" | "utility" | "ai" | "qr";
type Category = "all" | "image" | "pdf" | "media" | "privacy" | "utility" | "ai" | "qr";
type ToolItem = {
  href: string;
  titleZh: string;
  titleEn: string;
  descZh: string;
  descEn: string;
  kind: GlyphKind;
  category: Exclude<Category, "all">;
  localOnly: boolean;
};

const categoryLabels: Record<Exclude<Category, "all">, { zh: string; en: string }> = {
  image: { zh: "图片", en: "Images" },
  pdf: { zh: "PDF / 文档", en: "PDF / Docs" },
  media: { zh: "视频 / 音频", en: "Video / Audio" },
  privacy: { zh: "隐私 / 安全", en: "Privacy / Safety" },
  utility: { zh: "文件 / 通用", en: "Files / Utilities" },
  ai: { zh: "AI 能力", en: "AI" },
  qr: { zh: "二维码", en: "QR" },
};

const privacyInfrastructureTools: ToolItem[] = [
  { href:"/tools/temp-mail", titleZh:"10分钟临时邮箱", titleEn:"10-Minute Temporary Email", descZh:"临时接收验证码与确认邮件，到期自动销毁。", descEn:"Receive verification and confirmation emails temporarily, then auto-destroy.", kind:"privacy", category:"privacy", localOnly:false },
  { href:"/tools/burn-after-read", titleZh:"阅后即焚", titleEn:"Burn After Reading", descZh:"生成私密链接，自定义有效期、查看次数或极速销毁。", descEn:"Encrypt sensitive text into a one-time link that is destroyed after first reveal.", kind:"privacy", category:"privacy", localOnly:false },
];

const dedicated: ToolItem[] = [
  { href:"/tools/batch-image", titleZh:"批量图片处理", titleEn:"Batch Image Tools", descZh:"批量压缩、转换和处理多张图片。", descEn:"Process, convert and compress multiple images.", kind:"image", category:"image", localOnly:true },
  { href:"/tools/avif-to-jpg", titleZh:"AVIF 转 JPG", titleEn:"AVIF to JPG", descZh:"把 AVIF 转成更通用的 JPG。", descEn:"Convert AVIF into a widely supported JPG.", kind:"image", category:"image", localOnly:true },
  { href:"/tools/heic-local", titleZh:"HEIC 本地转换", titleEn:"Local HEIC Converter", descZh:"在浏览器中处理 HEIC，不必把照片交给第三方。", descEn:"Convert HEIC locally in your browser.", kind:"image", category:"image", localOnly:true },
  { href:"/tools/svg-to-png", titleZh:"SVG 转 PNG", titleEn:"SVG to PNG", descZh:"把矢量图导出为 PNG 图片。", descEn:"Export SVG artwork as PNG.", kind:"image", category:"image", localOnly:true },
  { href:"/tools/long-image", titleZh:"长图拼接", titleEn:"Long Image Stitcher", descZh:"把多张图片按顺序拼成长图。", descEn:"Stitch multiple images into one long image.", kind:"image", category:"image", localOnly:true },
  { href:"/tools/image-to-pdf-pro", titleZh:"图片转 PDF", titleEn:"Images to PDF", descZh:"把多张图片排版并导出为 PDF。", descEn:"Arrange images and export a PDF.", kind:"document", category:"pdf", localOnly:true },

  { href:"/tools/pdf-merge-split", titleZh:"PDF 合并 / 拆分", titleEn:"Merge / Split PDF", descZh:"合并多个 PDF，或按页拆分文件。", descEn:"Merge multiple PDFs or split pages.", kind:"document", category:"pdf", localOnly:true },
  { href:"/tools/pdf-compress", titleZh:"PDF 压缩", titleEn:"Compress PDF", descZh:"降低 PDF 文件体积，并保留可用质量。", descEn:"Reduce PDF size while preserving useful quality.", kind:"document", category:"pdf", localOnly:true },
  { href:"/tools/pdf-pages", titleZh:"PDF 页面整理", titleEn:"PDF Page Organizer", descZh:"调整、提取、删除或重新排列 PDF 页面。", descEn:"Reorder, extract or remove PDF pages.", kind:"document", category:"pdf", localOnly:true },
  { href:"/tools/pdf-editor", titleZh:"PDF 编辑", titleEn:"PDF Editor", descZh:"直接处理 PDF 页面与常用编辑操作。", descEn:"Edit PDF pages and common document elements.", kind:"document", category:"pdf", localOnly:true },
  { href:"/tools/e-sign-pdf", titleZh:"PDF 电子签名", titleEn:"E-sign PDF", descZh:"在 PDF 中加入签名并导出。", descEn:"Place a signature on a PDF and export it.", kind:"document", category:"pdf", localOnly:true },
  { href:"/tools/document-copy-layout", titleZh:"证件复印排版", titleEn:"Document Copy Layout", descZh:"把证件正反面排到 A4，并可叠加用途水印。", descEn:"Lay out document sides on A4 with purpose watermark.", kind:"document", category:"pdf", localOnly:true },
  { href:"/tools/pdf-to-jpg", titleZh:"PDF 转 JPG", titleEn:"PDF to JPG", descZh:"把 PDF 页面导出为图片。", descEn:"Export PDF pages as images.", kind:"document", category:"pdf", localOnly:true },

  { href:"/tools/video-toolkit", titleZh:"视频压缩 / 裁剪 / 提取音频", titleEn:"Video Toolkit", descZh:"常用媒体处理集中在一个工作台。", descEn:"Compress, trim and extract audio in one workspace.", kind:"video", category:"media", localOnly:true },
  { href:"/tools/subtitle-tools", titleZh:"字幕 SRT / VTT 工具", titleEn:"Subtitle SRT / VTT Tools", descZh:"字幕时间偏移与 SRT / VTT / TXT 转换。", descEn:"Shift subtitle timing and convert subtitle formats.", kind:"video", category:"media", localOnly:true },
  { href:"/tools/video-transcription", titleZh:"视频转文字", titleEn:"Video Transcription", descZh:"从视频中提取可编辑文字。", descEn:"Turn video speech into editable text.", kind:"video", category:"media", localOnly:false },
  { href:"/tools/audio-transcription", titleZh:"音频转文字", titleEn:"Audio Transcription", descZh:"把录音与音频内容转成文字。", descEn:"Transcribe recordings and audio into text.", kind:"audio", category:"media", localOnly:false },
  { href:"/tools/subtitle-translate", titleZh:"字幕翻译", titleEn:"Subtitle Translation", descZh:"翻译字幕内容并保留时间轴结构。", descEn:"Translate subtitles while preserving timing.", kind:"ai", category:"ai", localOnly:false },
  { href:"/tools/video-dubbing", titleZh:"视频配音", titleEn:"Video Dubbing", descZh:"为视频生成新的语音轨道。", descEn:"Generate a new voice track for video.", kind:"audio", category:"ai", localOnly:false },

  { href:"/tools/privacy-cleaner", titleZh:"文件隐私清理", titleEn:"Privacy Cleaner", descZh:"清理图片 EXIF / GPS 与 PDF 常见属性。", descEn:"Remove image metadata and common PDF properties.", kind:"privacy", category:"privacy", localOnly:true },
  { href:"/tools/screenshot-redact", titleZh:"截图打码 / 脱敏", titleEn:"Screenshot Redaction", descZh:"在本地遮盖截图中的敏感内容。", descEn:"Redact sensitive regions in screenshots locally.", kind:"privacy", category:"privacy", localOnly:true },
  { href:"/tools/pdf-redact", titleZh:"PDF 永久脱敏", titleEn:"PDF Redaction", descZh:"对 PDF 敏感内容做不可逆遮盖。", descEn:"Apply permanent redaction to sensitive PDF content.", kind:"privacy", category:"privacy", localOnly:true },
  { href:"/tools/qr-safe-reader", titleZh:"二维码安全识别", titleEn:"Safe QR Reader", descZh:"先查看二维码内容，再决定是否访问。", descEn:"Inspect QR contents before opening a destination.", kind:"qr", category:"qr", localOnly:true },

  { href:"/tools/image-watermark-remover", titleZh:"图片去水印", titleEn:"Image Watermark Cleanup", descZh:"处理图片中的水印或覆盖内容。", descEn:"Clean up watermark or overlay regions in images.", kind:"privacy", category:"ai", localOnly:false },
  { href:"/tools/batch-image-watermark-remover", titleZh:"批量图片去水印", titleEn:"Batch Watermark Cleanup", descZh:"一次处理多张图片的水印区域。", descEn:"Process watermark regions across multiple images.", kind:"privacy", category:"ai", localOnly:false },
  { href:"/tools/video-watermark-remover", titleZh:"视频去水印", titleEn:"Video Watermark Cleanup", descZh:"按视频时长处理固定区域水印。", descEn:"Clean a fixed watermark region across a video.", kind:"video", category:"ai", localOnly:false },
  { href:"/tools/id-photo-ai", titleZh:"AI 证件照", titleEn:"AI ID Photo", descZh:"生成适合证件用途的标准照片。", descEn:"Create a standardized ID-style photo.", kind:"ai", category:"ai", localOnly:false },
  { href:"/tools/food-calorie", titleZh:"食物卡路里分析", titleEn:"Food Calorie Analysis", descZh:"从食物图片估算内容与热量信息。", descEn:"Estimate food contents and calories from an image.", kind:"ai", category:"ai", localOnly:false },
  { href:"/tools/pdf-ocr", titleZh:"PDF OCR", titleEn:"PDF OCR", descZh:"识别扫描 PDF 中的文字。", descEn:"Extract text from scanned PDF documents.", kind:"ai", category:"ai", localOnly:false },
  { href:"/tools/ocr", titleZh:"图片 OCR", titleEn:"Image OCR", descZh:"从图片中提取可复制文字。", descEn:"Extract copyable text from images.", kind:"ai", category:"ai", localOnly:false },
];

function registryCategory(category: string): ToolItem["category"] {
  if (category === "image") return "image";
  if (category === "pdf") return "pdf";
  if (category === "qr") return "qr";
  return "utility";
}

function registryKind(category: string): GlyphKind {
  if (category === "image") return "image";
  if (category === "pdf") return "document";
  if (category === "qr") return "qr";
  return "utility";
}

function allTools(): ToolItem[] {
  const registryItems: ToolItem[] = liveTools().map((tool) => ({
    href: `/tools/${tool.slug}`,
    titleZh: tool.titleZh,
    titleEn: tool.titleEn,
    descZh: tool.oneLinerZh,
    descEn: tool.oneLinerEn,
    kind: registryKind(tool.category),
    category: registryCategory(tool.category),
    localOnly: Boolean(tool.localOnly),
  }));
  const map = new Map<string, ToolItem>();
  for (const item of registryItems) map.set(item.href, item);
  for (const item of dedicated) map.set(item.href, item);
  if(process.env.NEXT_PUBLIC_PRIVACY_TOOLS_ENABLED==="true"){
    for(const item of privacyInfrastructureTools) map.set(item.href,item);
  }
  return [...map.values()];
}

const categories: Category[] = ["all", "image", "pdf", "media", "privacy", "utility", "ai", "qr"];

export default function ToolsHubV11() {
  const { lang, t } = useLingxiLang();
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<Category>("all");
  const foreign = lang !== "zh";
  const tools = useMemo(() => allTools(), []);

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return tools.filter((item) => {
      const categoryMatch = category === "all" || item.category === category;
      if (!categoryMatch) return false;
      if (!needle) return true;
      return `${item.titleZh} ${item.titleEn} ${item.descZh} ${item.descEn}`.toLowerCase().includes(needle);
    });
  }, [tools, q, category]);

  const localCount = tools.filter((item) => item.localOnly).length;
  const onlineCount = tools.length - localCount;

  return (
    <main className="lx11-page lx11-tools-page lx-tools-v124">
      <div className="lx11-wrap">
        <section className="lx11-tools-hero">
          <div>
            <span>{t("tools")}</span>
            <h1>{t("toolsHero")}</h1>
            <p>{t("toolsLead")}</p>
          </div>
          <div className="lx-tools-v124-stats">
            <div><b>{tools.length}</b><span>{t("toolCount")}</span></div>
            <div><b>{localCount}</b><span>{t("local")}</span></div>
            <div><b>{onlineCount}</b><span>{t("online")}</span></div>
          </div>
        </section>

        <section className="lx11-tool-searchbar lx-tools-v124-search">
          <div className="lx11-tool-searchbox">
            <span>⌕</span>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("toolSearch")} />
          </div>
          <div className="lx-tools-v124-categories">
            {categories.map((id) => {
              const label = id === "all" ? t("all") : (foreign ? categoryLabels[id].en : categoryLabels[id].zh);
              return (
                <button
                  type="button"
                  key={id}
                  className={category === id ? "is-active" : ""}
                  onClick={() => setCategory(id)}
                  aria-pressed={category === id}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </section>

        <section className="lx11-tool-group">
          <div className="lx11-tool-grid lx-tools-v124-grid">
            {list.map((item) => (
              <Link href={item.href} key={item.href} className="lx11-tool-card lx-tools-v124-card">
                <div className="lx11-tool-cover"><ToolGlyph kind={item.kind} /></div>
                <div className="lx11-tool-copy">
                  <div className="lx11-tool-title-row"><h3>{foreign ? item.titleEn : item.titleZh}</h3></div>
                  <p className="lx-tools-v124-desc">{foreign ? item.descEn : item.descZh}</p>
                  <div className="lx11-tool-meta">
                    <span>
                      {item.href==="/tools/temp-mail"
                        ? (foreign ? "10-minute inbox · auto-destroy" : "10分钟收件 · 到期自动销毁")
                        : item.href==="/tools/burn-after-read"
                          ? (foreign ? "One-time link · auto-destroy" : "一次读取 · 自动销毁")
                          : item.localOnly
                            ? (foreign ? "Local · file stays in this browser" : "本地处理 · 文件不上传")
                            : (foreign ? "Online processing" : "在线处理")}
                    </span>
                    <b>{t("open")}</b>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {!list.length && (
          <div className="lx11-tool-empty">
            <b>{t("noTool")}</b>
            <p>{t("noToolLead")}</p>
          </div>
        )}
      </div>
    </main>
  );
}
