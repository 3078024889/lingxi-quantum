"use client";

import { drawFileToCanvas } from "@/lib/tools/shared/image-canvas";
import { openPdf, renderPdfPage, canvasToBlob } from "@/lib/tools/pdf-render-client";

export type LocalOutput = {
  name: string;
  blob: Blob;
  mime: string;
  size: number;
};

function replaceExt(name: string, ext: string) {
  return `${name.replace(/\.[^.]+$/, "") || "file"}.${ext}`;
}

export async function heicToJpgFiles(files: File[]): Promise<LocalOutput[]> {
  const heic2any = (await import("heic2any")).default;
  const outputs: LocalOutput[] = [];

  for (const file of files) {
    const result = await heic2any({
      blob: file,
      toType: "image/jpeg",
      quality: 0.92,
    });
    const blobs = Array.isArray(result) ? result : [result];
    blobs.forEach((blob, index) => {
      const suffix = blobs.length > 1 ? `-${index + 1}` : "";
      const base = file.name.replace(/\.(heic|heif)$/i, "") || "image";
      outputs.push({
        name: `${base}${suffix}.jpg`,
        blob,
        mime: "image/jpeg",
        size: blob.size,
      });
    });
  }

  return outputs;
}

export async function readQrCode(file: File) {
  const jsQR = (await import("jsqr")).default;
  const { canvas, width, height } = await drawFileToCanvas(file, {
    maxWidth: 4096,
    maxHeight: 4096,
  });
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("QR_CANVAS_UNAVAILABLE");

  const image = ctx.getImageData(0, 0, width, height);
  const result = jsQR(image.data, width, height, {
    inversionAttempts: "attemptBoth",
  });
  if (!result?.data) throw new Error("QR_NOT_FOUND");

  return {
    text: result.data,
    width,
    height,
  };
}

export async function mergePdfFiles(files: File[]): Promise<LocalOutput> {
  const { PDFDocument } = await import("pdf-lib");
  const merged = await PDFDocument.create();

  for (const file of files) {
    const source = await PDFDocument.load(await file.arrayBuffer(), {
      ignoreEncryption: false,
    });
    const copied = await merged.copyPages(source, source.getPageIndices());
    copied.forEach((page) => merged.addPage(page));
  }

  const bytes = await merged.save({
    useObjectStreams: true,
    addDefaultPage: false,
  });
  const blob = new Blob([bytes], { type: "application/pdf" });

  return {
    name: "lingxifield-merged.pdf",
    blob,
    mime: "application/pdf",
    size: blob.size,
  };
}

export async function splitPdfFile(file: File): Promise<LocalOutput[]> {
  const { PDFDocument } = await import("pdf-lib");
  const source = await PDFDocument.load(await file.arrayBuffer(), {
    ignoreEncryption: false,
  });
  const outputs: LocalOutput[] = [];
  const base = file.name.replace(/\.pdf$/i, "") || "document";

  for (let i = 0; i < source.getPageCount(); i++) {
    const target = await PDFDocument.create();
    const [page] = await target.copyPages(source, [i]);
    target.addPage(page);
    const bytes = await target.save({ useObjectStreams: true });
    const blob = new Blob([bytes], { type: "application/pdf" });
    outputs.push({
      name: `${base}-page-${String(i + 1).padStart(3, "0")}.pdf`,
      blob,
      mime: "application/pdf",
      size: blob.size,
    });
  }

  return outputs;
}

export async function imagesToPdf(files: File[]): Promise<LocalOutput> {
  const { jsPDF } = await import("jspdf");
  let doc: InstanceType<typeof jsPDF> | null = null;

  for (let i = 0; i < files.length; i++) {
    const { canvas, width, height } = await drawFileToCanvas(files[i], {
      maxWidth: 5000,
      maxHeight: 5000,
    });
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

    doc.addImage(canvas.toDataURL("image/jpeg", 0.92), "JPEG", 0, 0, width, height, undefined, "FAST");
  }

  if (!doc) throw new Error("IMAGE_PDF_NO_INPUT");
  const blob = doc.output("blob");

  return {
    name: "lingxifield-images.pdf",
    blob,
    mime: "application/pdf",
    size: blob.size,
  };
}

export async function pdfToJpgFiles(file: File): Promise<LocalOutput[]> {
  const pdf = await openPdf(file);
  const outputs: LocalOutput[] = [];
  const base = file.name.replace(/\.pdf$/i, "") || "document";

  try {
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      const rendered = await renderPdfPage(pdf, pageNumber, 1.7);
      const blob = await canvasToBlob(rendered.canvas, "image/jpeg", 0.92);
      outputs.push({
        name: `${base}-page-${String(pageNumber).padStart(3, "0")}.jpg`,
        blob,
        mime: "image/jpeg",
        size: blob.size,
      });
      rendered.canvas.width = 1;
      rendered.canvas.height = 1;
    }
  } finally {
    await pdf.destroy?.();
  }

  return outputs;
}
