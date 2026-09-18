export type DetectedFileType = {
  ext: string;
  mime: string;
  label: string;
  confidence: "high" | "medium" | "low";
};

function match(buf: Uint8Array, sig: number[], offset = 0) {
  if (buf.length < offset + sig.length) return false;
  return sig.every((b, i) => buf[offset + i] === b);
}

export async function detectFileType(file: File): Promise<DetectedFileType> {
  const head = new Uint8Array(await file.slice(0, 64).arrayBuffer());
  const name = file.name.toLowerCase();
  const claimed = (file.type || "").toLowerCase();

  if (match(head, [0xff, 0xd8, 0xff])) {
    return { ext: "jpg", mime: "image/jpeg", label: "JPEG image", confidence: "high" };
  }
  if (match(head, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return { ext: "png", mime: "image/png", label: "PNG image", confidence: "high" };
  }
  if (match(head, [0x47, 0x49, 0x46, 0x38])) {
    return { ext: "gif", mime: "image/gif", label: "GIF image", confidence: "high" };
  }
  // WebP: RIFF....WEBP
  if (match(head, [0x52, 0x49, 0x46, 0x46]) && match(head, [0x57, 0x45, 0x42, 0x50], 8)) {
    return { ext: "webp", mime: "image/webp", label: "WebP image", confidence: "high" };
  }
  // PDF
  if (match(head, [0x25, 0x50, 0x44, 0x46])) {
    return { ext: "pdf", mime: "application/pdf", label: "PDF document", confidence: "high" };
  }
  // ZIP-based (docx/xlsx/pptx/apk…)
  if (match(head, [0x50, 0x4b, 0x03, 0x04]) || match(head, [0x50, 0x4b, 0x05, 0x06])) {
    if (name.endsWith(".docx")) return { ext: "docx", mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", label: "Word (DOCX / ZIP)", confidence: "medium" };
    if (name.endsWith(".xlsx")) return { ext: "xlsx", mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", label: "Excel (XLSX / ZIP)", confidence: "medium" };
    if (name.endsWith(".pptx")) return { ext: "pptx", mime: "application/vnd.openxmlformats-officedocument.presentationml.presentation", label: "PowerPoint (PPTX / ZIP)", confidence: "medium" };
    return { ext: "zip", mime: "application/zip", label: "ZIP archive (or Office Open XML)", confidence: "high" };
  }
  // HEIC/HEIF (ftyp....heic/heif/mif1)
  if (match(head, [0x66, 0x74, 0x79, 0x70], 4)) {
    const brand = String.fromCharCode(...head.slice(8, 12)).toLowerCase();
    if (["heic", "heif", "mif1", "msf1", "hevx", "hevc"].some((b) => brand.includes(b) || String.fromCharCode(...head.slice(8, 16)).toLowerCase().includes(b))) {
      return { ext: "heic", mime: "image/heic", label: "HEIC/HEIF image", confidence: "high" };
    }
  }
  // MP4/MOV ftyp
  if (match(head, [0x66, 0x74, 0x79, 0x70], 4)) {
    return { ext: "mp4", mime: "video/mp4", label: "MP4/MOV container (ftyp)", confidence: "medium" };
  }
  // PNG-like SVG text
  const asText = new TextDecoder().decode(head).trimStart();
  if (asText.startsWith("<?xml") || asText.startsWith("<svg")) {
    return { ext: "svg", mime: "image/svg+xml", label: "SVG", confidence: "medium" };
  }
  if (asText.startsWith("{") || asText.startsWith("[")) {
    return { ext: "json", mime: "application/json", label: "JSON text", confidence: "low" };
  }

  // Fallbacks from extension / claimed MIME
  if (claimed.startsWith("image/") || claimed.startsWith("video/") || claimed.startsWith("audio/") || claimed.startsWith("application/")) {
    return {
      ext: name.includes(".") ? name.split(".").pop() || "bin" : "bin",
      mime: claimed || "application/octet-stream",
      label: `Claimed type: ${claimed || "unknown"} (magic bytes inconclusive)`,
      confidence: "low",
    };
  }
  return {
    ext: name.includes(".") ? name.split(".").pop() || "bin" : "bin",
    mime: "application/octet-stream",
    label: "Unknown binary (no magic match)",
    confidence: "low",
  };
}

export function extensionMismatch(file: File, detected: DetectedFileType): boolean {
  const name = file.name.toLowerCase();
  if (!name.includes(".")) return false;
  const ext = name.split(".").pop() || "";
  if (!ext) return false;
  const aliases: Record<string, string[]> = {
    jpg: ["jpg", "jpeg"],
    jpeg: ["jpg", "jpeg"],
    heic: ["heic", "heif"],
    tif: ["tif", "tiff"],
  };
  const ok = aliases[detected.ext] || [detected.ext];
  return !ok.includes(ext);
}
