"use client";

import {readPptx} from './pptx-reader';
import {decodeXmlEntities as decodeXml} from '@/lib/files/xml-entities';
import {readEpub} from './epub-reader';

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
  return readPptx(file);
}

export async function epubToText(
  file: File
): Promise<{ text: string; chapters: number }> {
  return readEpub(file);
}
