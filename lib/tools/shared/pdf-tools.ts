import { PDFDocument } from "pdf-lib";

function toBlob(bytes: Uint8Array, type = "application/pdf"): Blob {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);

  return new Blob([copy.buffer], {
    type,
  });
}

export async function mergePdfs(files: File[]): Promise<Blob> {
  const output = await PDFDocument.create();

  for (const file of files) {
    const source = await PDFDocument.load(await file.arrayBuffer());
    const pages = await output.copyPages(
      source,
      source.getPageIndices(),
    );

    for (const page of pages) {
      output.addPage(page);
    }
  }

  const bytes = await output.save();
  return toBlob(bytes);
}

export async function splitPdf(
  file: File,
  pageNumbers: number[],
): Promise<Blob> {
  const source = await PDFDocument.load(await file.arrayBuffer());
  const output = await PDFDocument.create();

  const indexes = pageNumbers
    .filter(
      (pageNumber) =>
        Number.isInteger(pageNumber) &&
        pageNumber >= 1 &&
        pageNumber <= source.getPageCount(),
    )
    .map((pageNumber) => pageNumber - 1);

  if (indexes.length === 0) {
    throw new Error("没有有效的 PDF 页码。");
  }

  const pages = await output.copyPages(source, indexes);

  for (const page of pages) {
    output.addPage(page);
  }

  const bytes = await output.save();
  return toBlob(bytes);
}

export async function imagesToPdf(files: File[]): Promise<Blob> {
  const output = await PDFDocument.create();

  for (const file of files) {
    const bytes = await file.arrayBuffer();

    const isPng =
      file.type.toLowerCase() === "image/png" ||
      file.name.toLowerCase().endsWith(".png");

    const isJpeg =
      file.type.toLowerCase() === "image/jpeg" ||
      file.type.toLowerCase() === "image/jpg" ||
      /\.(jpe?g)$/i.test(file.name);

    if (!isPng && !isJpeg) {
      throw new Error(
        `暂不支持将 ${file.name} 直接写入 PDF，请先转换为 JPG 或 PNG。`,
      );
    }

    const image = isPng
      ? await output.embedPng(bytes)
      : await output.embedJpg(bytes);

    const page = output.addPage([
      image.width,
      image.height,
    ]);

    page.drawImage(image, {
      x: 0,
      y: 0,
      width: image.width,
      height: image.height,
    });
  }

  const bytes = await output.save();
  return toBlob(bytes);
}