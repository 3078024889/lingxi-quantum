"use client";

import { jsPDF } from "jspdf";
import { openPdf, renderPdfPage } from "@/lib/tools/pdf-render-client";

export type PdfCompressionPreset = "balanced" | "small" | "high";

const PRESET = {
  balanced: { scale: 1.35, quality: 0.74 },
  small: { scale: 1.05, quality: 0.58 },
  high: { scale: 1.65, quality: 0.86 },
} as const;

export async function rebuildCompressedPdf(
  file: File,
  preset: PdfCompressionPreset,
) {
  const config = PRESET[preset];
  const pdf = await openPdf(file);
  let doc: jsPDF | null = null;

  try {
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      const rendered = await renderPdfPage(pdf, pageNumber, config.scale);
      const { width, height, canvas } = rendered;
      const orientation = width >= height ? "landscape" : "portrait";

      if (!doc) {
        doc = new jsPDF({
          orientation,
          unit: "px",
          format: [width, height],
          compress: true,
          hotfixes: ["px_scaling"],
        });
      } else {
        doc.addPage([width, height], orientation);
      }

      const data = canvas.toDataURL("image/jpeg", config.quality);
      doc.addImage(data, "JPEG", 0, 0, width, height, undefined, "FAST");
      canvas.width = 1;
      canvas.height = 1;
    }
  } finally {
    await pdf.destroy?.();
  }

  if (!doc) throw new Error("PDF_REBUILD_NO_PAGES");
  const blob = doc.output("blob");

  return {
    name: `${file.name.replace(/\.pdf$/i, "") || "document"}-compressed.pdf`,
    blob,
    pages: pdf.numPages,
    originalBytes: file.size,
    resultBytes: blob.size,
    preset,
  };
}
