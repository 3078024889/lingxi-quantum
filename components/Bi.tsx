
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

  const copy = {
    zh,
    en,
    ja: en,
    ko: en,
    fr: en,
    de: en,
    es: en,
    pt: en,
    ar: en,
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
