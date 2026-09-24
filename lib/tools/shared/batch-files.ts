"use client";

import JSZip from "jszip";

export async function filesToZip(
  files: Array<{ name: string; blob: Blob }>,
  zipName = "lingxifield-results.zip",
) {
  const zip = new JSZip();
  const used = new Map<string, number>();

  for (const file of files) {
    let name = file.name || "file";
    const count = used.get(name) || 0;
    used.set(name, count + 1);

    if (count > 0) {
      const dot = name.lastIndexOf(".");
      name =
        dot > 0
          ? `${name.slice(0, dot)}-${count + 1}${name.slice(dot)}`
          : `${name}-${count + 1}`;
    }

    zip.file(name, file.blob);
  }

  const blob = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });

  return { name: zipName, blob };
}

export function dedupeFiles(files: File[]) {
  const seen = new Set<string>();
  const out: File[] = [];
  for (const file of files) {
    const key = `${file.name}:${file.size}:${file.lastModified}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(file);
  }
  return out;
}
