"use client";

import JSZip from "jszip";

function decodeXml(value: string) {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function xmlText(xml: string) {
  return decodeXml(
    [...xml.matchAll(/<a:t>([\s\S]*?)<\/a:t>/g)]
      .map((hit) => hit[1])
      .join("\n"),
  )
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function pptxToText(file: File) {
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const slides = Object.keys(zip.files)
    .filter((name) => /^ppt\/slides\/slide\d+\.xml$/i.test(name))
    .sort((a, b) => {
      const na = Number(a.match(/slide(\d+)/i)?.[1] || 0);
      const nb = Number(b.match(/slide(\d+)/i)?.[1] || 0);
      return na - nb;
    });

  if (!slides.length) throw new Error("PPTX_SLIDES_MISSING");

  const blocks: string[] = [];
  for (let i = 0; i < slides.length; i++) {
    const xml = await zip.file(slides[i])?.async("string");
    if (!xml) continue;
    const text = xmlText(xml);
    blocks.push(`# Slide ${i + 1}\n${text}`);
  }

  const text = blocks.join("\n\n").trim();
  if (!text) throw new Error("PPTX_NO_TEXT");

  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  return {
    name: `${file.name.replace(/\.pptx$/i, "") || "presentation"}.txt`,
    blob,
    slides: slides.length,
    characters: text.length,
  };
}
