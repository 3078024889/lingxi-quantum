"use client";

import { useLingxiLang, type LingxiLang } from "@/lib/lingxi-i18n";

type Copy = Partial<Record<LingxiLang, React.ReactNode>> & {
  zh: React.ReactNode;
  en: React.ReactNode;
};

export default function LxText({
  block = false,
  ...copy
}: Copy & { block?: boolean }) {
  const { lang } = useLingxiLang();
  const value = copy[lang] ?? copy.en ?? copy.zh;
  if (block) return <span className="bi-block">{value}</span>;
  return <>{value}</>;
}
