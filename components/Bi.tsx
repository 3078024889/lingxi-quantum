import { resolveBiNative } from "@/lib/bi-native";

// Multi-language text primitive that stays server-component compatible.
// Existing callers can keep passing only zh/en. For phrases present in the
// native dictionary, JA/KO/FR/DE/ES/PT/AR are rendered natively; otherwise
// those languages fall back to the existing English copy.
export default function Bi({
  zh,
  en,
  block = false,
}: {
  zh: React.ReactNode;
  en: React.ReactNode;
  block?: boolean;
}) {
  const zhText = typeof zh === "string" ? zh : null;
  const enText = typeof en === "string" ? en : null;

  const copy = {
    zh,
    en,
    ja: resolveBiNative(zhText, enText, "ja") ?? en,
    ko: resolveBiNative(zhText, enText, "ko") ?? en,
    fr: resolveBiNative(zhText, enText, "fr") ?? en,
    de: resolveBiNative(zhText, enText, "de") ?? en,
    es: resolveBiNative(zhText, enText, "es") ?? en,
    pt: resolveBiNative(zhText, enText, "pt") ?? en,
    ar: resolveBiNative(zhText, enText, "ar") ?? en,
  } as const;

  return (
    <>
      {(Object.keys(copy) as Array<keyof typeof copy>).map((lang) => (
        <span
          key={lang}
          data-lang={lang}
          className={`lx-bi-part${block ? " bi-block" : ""}`}
        >
          {copy[lang]}
        </span>
      ))}
    </>
  );
}
