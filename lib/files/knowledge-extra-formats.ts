"use client";

import JSZip from "jszip";

const decodeXml = (value: string) =>
  value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");

function xmlText(xml: string) {
  return decodeXml(
    xml
      .replace(/<a:br\b[^>]*\/>/g, "\n")
      .replace(/<a:tab\b[^>]*\/>/g, "\t")
      .replace(/<\/a:p>/g, "\n")
      .replace(/<\/p>/g, "\n")
      .replace(/<\/div>/g, "\n")
      .replace(/<br\s*\/?\s*>/gi, "\n")
      .replace(/<[^>]+>/g, "")
  )
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function stripHtml(source: string) {
  return decodeXml(
    source
      .replace(/<script\b[\s\S]*?<\/script>/gi, "")
      .replace(/<style\b[\s\S]*?<\/style>/gi, "")
      .replace(/<br\s*\/?\s*>/gi, "\n")
      .replace(/<\/p>/gi, "\n")
      .replace(/<\/div>/gi, "\n")
      .replace(/<\/li>/gi, "\n")
      .replace(/<[^>]+>/g, "")
  )
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function structuredTextFile(file: File): Promise<string> {
  const raw = await file.text();
  const name = file.name.toLowerCase();

  if (name.endsWith(".html") || name.endsWith(".htm") || file.type === "text/html") {
    return stripHtml(raw);
  }

  if (name.endsWith(".json")) {
    try {
      return JSON.stringify(JSON.parse(raw), null, 2);
    } catch {
      return raw;
    }
  }

  if (name.endsWith(".jsonl")) {
    return raw
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        try {
          return JSON.stringify(JSON.parse(line), null, 2);
        } catch {
          return line;
        }
      })
      .join("\n\n");
  }

  return raw;
}

export async function pptxToKnowledgeText(
  file: File
): Promise<{ text: string; slides: number }> {
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const slideNames = Object.keys(zip.files)
    .filter((name) => /^ppt\/slides\/slide\d+\.xml$/i.test(name))
    .sort((a, b) => {
      const na = Number((a.match(/slide(\d+)\.xml/i) || [])[1] || 0);
      const nb = Number((b.match(/slide(\d+)\.xml/i) || [])[1] || 0);
      return na - nb;
    });

  if (!slideNames.length) throw new Error("PPTX_SLIDES_MISSING");

  const blocks: string[] = [];
  for (let i = 0; i < slideNames.length; i += 1) {
    const xml = await zip.file(slideNames[i])?.async("string");
    if (!xml) continue;
    const text = xmlText(xml);
    if (text) blocks.push(`# Slide ${i + 1}\n${text}`);
  }

  const text = blocks.join("\n\n").trim();
  if (!text) throw new Error("PPTX_NO_TEXT");

  return { text, slides: slideNames.length };
}

export async function epubToText(
  file: File
): Promise<{ text: string; chapters: number }> {
  const zip = await JSZip.loadAsync(await file.arrayBuffer());

  const htmlNames = Object.keys(zip.files)
    .filter((name) => /\.(xhtml|html|htm)$/i.test(name))
    .filter((name) => !/nav\.xhtml$/i.test(name))
    .sort();

  if (!htmlNames.length) throw new Error("EPUB_CONTENT_MISSING");

  const blocks: string[] = [];
  for (const name of htmlNames) {
    const html = await zip.file(name)?.async("string");
    if (!html) continue;
    const text = stripHtml(html);
    if (text) blocks.push(text);
  }

  const text = blocks.join("\n\n").trim();
  if (!text) throw new Error("EPUB_NO_TEXT");

  return { text, chapters: blocks.length };
}
