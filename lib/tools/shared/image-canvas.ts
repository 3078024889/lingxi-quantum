import { replaceExt } from "./download";

export async function loadImageBitmap(file: File): Promise<ImageBitmap> {
  return createImageBitmap(file);
}

export function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("toBlob failed"))),
      type,
      quality,
    );
  });
}

export async function drawFileToCanvas(
  file: File,
  opts?: { maxWidth?: number; maxHeight?: number; width?: number; height?: number },
): Promise<{ canvas: HTMLCanvasElement; width: number; height: number }> {
  const bmp = await loadImageBitmap(file);
  let w = opts?.width ?? bmp.width;
  let h = opts?.height ?? bmp.height;

  if (opts?.maxWidth || opts?.maxHeight) {
    const mw = opts.maxWidth ?? w;
    const mh = opts.maxHeight ?? h;
    const scale = Math.min(1, mw / w, mh / h);
    w = Math.max(1, Math.round(w * scale));
    h = Math.max(1, Math.round(h * scale));
  }

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2d context unavailable");
  // White background for JPEG (avoids black transparent areas)
  if (true) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
  }
  ctx.drawImage(bmp, 0, 0, w, h);
  bmp.close?.();
  return { canvas, width: w, height: h };
}

export async function convertImage(
  file: File,
  target: "image/jpeg" | "image/png" | "image/webp",
  quality = 0.92,
): Promise<{ blob: Blob; name: string; width: number; height: number }> {
  const { canvas, width, height } = await drawFileToCanvas(file);
  const blob = await canvasToBlob(canvas, target, target === "image/png" ? undefined : quality);
  const ext = target === "image/jpeg" ? "jpg" : target === "image/png" ? "png" : "webp";
  return { blob, name: replaceExt(file.name, ext), width, height };
}

export async function resizeImage(
  file: File,
  width: number,
  height: number,
  keepAspect: boolean,
  target: "image/jpeg" | "image/png" = "image/jpeg",
  quality = 0.92,
): Promise<{ blob: Blob; name: string; width: number; height: number }> {
  const bmp = await loadImageBitmap(file);
  let w = width;
  let h = height;
  if (keepAspect) {
    const scale = Math.min(width / bmp.width, height / bmp.height);
    w = Math.max(1, Math.round(bmp.width * scale));
    h = Math.max(1, Math.round(bmp.height * scale));
  }
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2d context unavailable");
  if (target === "image/jpeg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
  }
  ctx.drawImage(bmp, 0, 0, w, h);
  bmp.close?.();
  const blob = await canvasToBlob(canvas, target, target === "image/png" ? undefined : quality);
  const ext = target === "image/jpeg" ? "jpg" : "png";
  return { blob, name: replaceExt(file.name, ext), width: w, height: h };
}

/** Iteratively approach targetBytes without exceeding it. */
export async function compressImageToTarget(
  file: File,
  targetBytes: number,
  opts?: { minQuality?: number; maxDimension?: number },
): Promise<{ blob: Blob; name: string; width: number; height: number; quality: number; rounds: number }> {
  const minQ = opts?.minQuality ?? 0.35;
  const maxDim = opts?.maxDimension ?? 4096;
  let { canvas, width, height } = await drawFileToCanvas(file, { maxWidth: maxDim, maxHeight: maxDim });

  let lo = minQ;
  let hi = 0.95;
  let best: Blob | null = null;
  let bestQ = lo;
  let rounds = 0;

  // First try full quality at current dimensions
  for (let i = 0; i < 8; i++) {
    rounds++;
    const q = i === 0 ? 0.92 : (lo + hi) / 2;
    const blob = await canvasToBlob(canvas, "image/jpeg", q);
    if (blob.size <= targetBytes) {
      best = blob;
      bestQ = q;
      lo = q;
    } else {
      hi = q;
    }
  }

  // If still too large, shrink dimensions and retry
  let scale = 0.9;
  while ((!best || best.size > targetBytes) && Math.min(width, height) > 320 && rounds < 24) {
    width = Math.max(1, Math.round(width * scale));
    height = Math.max(1, Math.round(height * scale));
    const next = document.createElement("canvas");
    next.width = width;
    next.height = height;
    const ctx = next.getContext("2d");
    if (!ctx) break;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(canvas, 0, 0, width, height);
    canvas = next;
    lo = minQ;
    hi = 0.92;
    for (let i = 0; i < 6; i++) {
      rounds++;
      const q = (lo + hi) / 2;
      const blob = await canvasToBlob(canvas, "image/jpeg", q);
      if (blob.size <= targetBytes) {
        best = blob;
        bestQ = q;
        lo = q;
      } else {
        hi = q;
      }
    }
    scale = 0.85;
  }

  if (!best) {
    // Last resort: lowest quality at current size (may still exceed — caller should explain)
    best = await canvasToBlob(canvas, "image/jpeg", minQ);
    bestQ = minQ;
  }

  return {
    blob: best,
    name: replaceExt(file.name, "jpg"),
    width,
    height,
    quality: bestQ,
    rounds,
  };
}

/** Re-encode via canvas to strip EXIF/metadata. */
export async function stripImageMetadata(file: File): Promise<{ blob: Blob; name: string }> {
  const { canvas } = await drawFileToCanvas(file);
  const isPng = file.type === "image/png" || file.name.toLowerCase().endsWith(".png");
  const blob = await canvasToBlob(canvas, isPng ? "image/png" : "image/jpeg", isPng ? undefined : 0.95);
  return { blob, name: replaceExt(file.name, isPng ? "png" : "jpg") };
}
