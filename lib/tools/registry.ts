import type { ToolMeta } from "./types";

/**
 * 在线工具元数据中心。
 * 每个工具一条记录；页面 UI 与 SEO 从这里读，禁止各页复制一套文案。
 * 状态 live = 本仓库已实现本地处理；planned = 仅目录占位，不假装可用。
 */
export const TOOLS: ToolMeta[] = [
  // —— 已有场域工具 ——
  {
    slug: "number-energy",
    category: "field",
    status: "live",
    localOnly: true,
    dedicatedRoute: true,
    titleZh: "手机号 / 车牌号数字能量",
    titleEn: "Phone & Plate Number Energy",
    oneLinerZh: "用 81 数灵动数体系拆解随身号码的组合含义（民俗参考）。",
    oneLinerEn: "Break down everyday numbers with the 81-number folk energy system (reference only).",
    related: ["timestamp-converter", "json-formatter"],
  },

  // —— 图片 · P0 ——
  {
    slug: "png-to-jpg",
    category: "image",
    status: "live",
    localOnly: true,
    titleZh: "PNG 转 JPG",
    titleEn: "PNG to JPG",
    oneLinerZh: "浏览器本地把 PNG 转成 JPG，文件不上传服务器。",
    oneLinerEn: "Convert PNG to JPG entirely in your browser — nothing is uploaded.",
    accept: "image/png,.png",
    related: ["jpg-to-png", "compress-image", "webp-to-jpg"],
  },
  {
    slug: "jpg-to-png",
    category: "image",
    status: "live",
    localOnly: true,
    titleZh: "JPG 转 PNG",
    titleEn: "JPG to PNG",
    oneLinerZh: "浏览器本地把 JPG/JPEG 转成 PNG。",
    oneLinerEn: "Convert JPG/JPEG to PNG entirely in your browser.",
    accept: "image/jpeg,.jpg,.jpeg",
    related: ["png-to-jpg", "compress-image"],
  },
  {
    slug: "webp-to-jpg",
    category: "image",
    status: "live",
    localOnly: true,
    titleZh: "WebP 转 JPG / PNG",
    titleEn: "WebP to JPG / PNG",
    oneLinerZh: "把 WebP 转成更通用的 JPG 或 PNG，本地完成。",
    oneLinerEn: "Convert WebP to widely-supported JPG or PNG — local only.",
    accept: "image/webp,.webp",
    related: ["png-to-jpg", "compress-image"],
  },
  {
    slug: "compress-image",
    category: "image",
    status: "live",
    localOnly: true,
    titleZh: "图片压缩",
    titleEn: "Compress Image",
    oneLinerZh: "降低图片体积，尽量保留观感。浏览器本地处理。",
    oneLinerEn: "Shrink image size while keeping visual quality. Local processing.",
    accept: "image/*,.jpg,.jpeg,.png,.webp",
    related: ["compress-image-to-100kb", "resize-image", "remove-exif"],
  },
  {
    slug: "compress-image-to-100kb",
    category: "image",
    status: "live",
    localOnly: true,
    titleZh: "图片精确压缩到 100KB",
    titleEn: "Compress Image to 100KB",
    oneLinerZh: "自动逼近目标大小，尽量不超过 100KB，并保留尽可能高的质量。",
    oneLinerEn: "Automatically approach 100KB without exceeding it, keeping the highest possible quality.",
    accept: "image/*,.jpg,.jpeg,.png,.webp",
    related: ["compress-image-to-50kb", "compress-image-to-200kb", "compress-image"],
  },
  {
    slug: "compress-image-to-20kb",
    category: "image",
    status: "live",
    localOnly: true,
    titleZh: "图片精确压缩到 20KB",
    titleEn: "Compress Image to 20KB",
    oneLinerZh: "报名照、头像等场景：自动压到约 20KB 以内。",
    oneLinerEn: "For avatars and form uploads: approach 20KB automatically.",
    accept: "image/*",
    related: ["compress-image-to-50kb", "compress-image-to-100kb"],
  },
  {
    slug: "compress-image-to-50kb",
    category: "image",
    status: "live",
    localOnly: true,
    titleZh: "图片精确压缩到 50KB",
    titleEn: "Compress Image to 50KB",
    oneLinerZh: "自动逼近 50KB，不超限，尽量保质量。",
    oneLinerEn: "Approach 50KB without exceeding the limit.",
    accept: "image/*",
    related: ["compress-image-to-20kb", "compress-image-to-100kb"],
  },
  {
    slug: "compress-image-to-200kb",
    category: "image",
    status: "live",
    localOnly: true,
    titleZh: "图片精确压缩到 200KB",
    titleEn: "Compress Image to 200KB",
    oneLinerZh: "自动逼近 200KB 上限。",
    oneLinerEn: "Approach a 200KB cap automatically.",
    accept: "image/*",
    related: ["compress-image-to-100kb", "compress-image-to-500kb"],
  },
  {
    slug: "compress-image-to-500kb",
    category: "image",
    status: "live",
    localOnly: true,
    titleZh: "图片精确压缩到 500KB",
    titleEn: "Compress Image to 500KB",
    oneLinerZh: "自动逼近 500KB 上限。",
    oneLinerEn: "Approach a 500KB cap automatically.",
    accept: "image/*",
    related: ["compress-image-to-200kb", "compress-image"],
  },
  {
    slug: "resize-image",
    category: "image",
    status: "live",
    localOnly: true,
    titleZh: "图片尺寸修改",
    titleEn: "Resize Image",
    oneLinerZh: "按像素改宽高，可保持比例。本地处理。",
    oneLinerEn: "Change width/height in pixels, optionally keep aspect ratio.",
    accept: "image/*",
    related: ["compress-image", "png-to-jpg"],
  },
  {
    slug: "remove-exif",
    category: "image",
    status: "live",
    localOnly: true,
    titleZh: "清除图片 EXIF / 元数据",
    titleEn: "Remove Image EXIF / Metadata",
    oneLinerZh: "通过本地重编码去掉 GPS、设备、拍摄信息，保护隐私。",
    oneLinerEn: "Strip GPS, device and capture metadata by re-encoding locally.",
    accept: "image/*",
    related: ["compress-image", "file-type-detector"],
  },

  // —— 文件 / 工具 ——
  {
    slug: "file-type-detector",
    category: "file",
    status: "live",
    localOnly: true,
    titleZh: "文件真实格式检测",
    titleEn: "Real File Type Detector",
    oneLinerZh: "用 Magic Bytes 判断真实类型，不轻信扩展名。",
    oneLinerEn: "Detect real type via magic bytes — never trust the extension alone.",
    accept: "*/*",
    related: ["file-compare", "md5-sha256"],
  },
  {
    slug: "md5-sha256",
    category: "file",
    status: "live",
    localOnly: true,
    titleZh: "MD5 / SHA256 校验",
    titleEn: "MD5 / SHA256 Hash",
    oneLinerZh: "在浏览器计算文件哈希，用于校验完整性。",
    oneLinerEn: "Compute file hashes in the browser to verify integrity.",
    accept: "*/*",
    related: ["file-compare", "file-type-detector"],
  },
  {
    slug: "file-compare",
    category: "file",
    status: "live",
    localOnly: true,
    titleZh: "两个文件是否完全一致",
    titleEn: "Compare Two Files",
    oneLinerZh: "逐字节 / 哈希对比，判断两个文件是否一模一样。",
    oneLinerEn: "Byte-level / hash compare to see if two files are identical.",
    accept: "*/*",
    multiple: true,
    maxFiles: 2,
    related: ["md5-sha256", "file-type-detector"],
  },
  {
    slug: "json-formatter",
    category: "utility",
    status: "live",
    localOnly: true,
    titleZh: "JSON 格式化 / 修复",
    titleEn: "JSON Format / Repair",
    oneLinerZh: "美化、压缩 JSON；常见语法错误给出可读说明。",
    oneLinerEn: "Pretty-print or minify JSON; explain common syntax errors.",
    related: ["timestamp-converter", "md5-sha256"],
  },
  {
    slug: "timestamp-converter",
    category: "utility",
    status: "live",
    localOnly: true,
    titleZh: "时间戳转换",
    titleEn: "Timestamp Converter",
    oneLinerZh: "Unix 秒/毫秒与可读时间互转，支持本地时区。",
    oneLinerEn: "Convert Unix seconds/ms ↔ human time in your local timezone.",
    related: ["json-formatter"],
  },
  {
    slug: "qr-code-generator",
    category: "qr",
    status: "live",
    localOnly: true,
    titleZh: "二维码生成",
    titleEn: "QR Code Generator",
    oneLinerZh: "输入链接或文本，本地生成二维码图片。",
    oneLinerEn: "Generate a QR image from text or a URL — locally.",
    related: ["qr-code-reader"],
  },

  // —— 规划中（诚实标注，不伪实现） ——
  {
    slug: "heic-to-jpg",
    category: "image",
    status: "planned",
    localOnly: true,
    titleZh: "HEIC 转 JPG",
    titleEn: "HEIC to JPG",
    oneLinerZh: "计划引入 heic2any WASM，仅在本页动态加载。",
    oneLinerEn: "Planned: heic2any WASM, dynamically loaded on this page only.",
  },
  {
    slug: "qr-code-reader",
    category: "qr",
    status: "planned",
    localOnly: true,
    titleZh: "二维码读取",
    titleEn: "QR Code Reader",
    oneLinerZh: "计划接入 jsQR，上传图片解析内容。",
    oneLinerEn: "Planned: decode QR from an image with jsQR.",
  },
  {
    slug: "merge-pdf",
    category: "pdf",
    status: "planned",
    localOnly: true,
    titleZh: "PDF 合并",
    titleEn: "Merge PDF",
    oneLinerZh: "计划用 pdf-lib 本地合并，不上传。",
    oneLinerEn: "Planned: merge PDFs with pdf-lib entirely in-browser.",
  },
  {
    slug: "split-pdf",
    category: "pdf",
    status: "planned",
    localOnly: true,
    titleZh: "PDF 拆分",
    titleEn: "Split PDF",
    oneLinerZh: "计划用 pdf-lib 按页拆分。",
    oneLinerEn: "Planned: split PDFs by page with pdf-lib.",
  },
  {
    slug: "compress-pdf",
    category: "pdf",
    status: "planned",
    localOnly: true,
    titleZh: "PDF 压缩",
    titleEn: "Compress PDF",
    oneLinerZh: "计划本地压缩（复杂 PDF 能力有上限，将诚实标注）。",
    oneLinerEn: "Planned local compression (honest limits for complex PDFs).",
  },
  {
    slug: "image-to-pdf",
    category: "pdf",
    status: "planned",
    localOnly: true,
    titleZh: "图片转 PDF",
    titleEn: "Image to PDF",
    oneLinerZh: "计划用已有 jspdf 依赖本地生成。",
    oneLinerEn: "Planned: build PDF from images with existing jspdf.",
  },
  {
    slug: "pdf-to-jpg",
    category: "pdf",
    status: "planned",
    localOnly: true,
    titleZh: "PDF 转 JPG",
    titleEn: "PDF to JPG",
    oneLinerZh: "计划用 pdfjs 渲染页面后导出。",
    oneLinerEn: "Planned: render pages with pdfjs then export.",
  },
];

export function getTool(slug: string): ToolMeta | undefined {
  return TOOLS.find((t) => t.slug === slug);
}

export function liveTools() {
  return TOOLS.filter((t) => t.status === "live");
}

export function toolsByCategory() {
  const map = new Map<ToolMeta["category"], ToolMeta[]>();
  for (const t of TOOLS) {
    const list = map.get(t.category) || [];
    list.push(t);
    map.set(t.category, list);
  }
  return map;
}

export const CATEGORY_LABEL: Record<ToolMeta["category"], { zh: string; en: string }> = {
  image: { zh: "图片处理", en: "Images" },
  pdf: { zh: "PDF / 文档", en: "PDF" },
  file: { zh: "文件诊断", en: "Files" },
  utility: { zh: "开发者 / 通用", en: "Utilities" },
  qr: { zh: "二维码", en: "QR" },
  field: { zh: "场域小工具", en: "Field tools" },
};

/** Target size for precise compress routes */
export function targetBytesForSlug(slug: string): number | null {
  const m = slug.match(/compress-image-to-(\d+)kb/);
  if (!m) return null;
  return parseInt(m[1], 10) * 1024;
}
