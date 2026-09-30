export const LINGXIFIELD_LOCALES=["zh","en","ja","ko","fr","de","es","pt","ar"] as const;
export type LingxifieldLocale=typeof LINGXIFIELD_LOCALES[number];
export const RTL_LOCALES=new Set<LingxifieldLocale>(["ar"]);
export function isLocale(v:string):v is LingxifieldLocale{return (LINGXIFIELD_LOCALES as readonly string[]).includes(v)}
export function direction(locale:string){"use server";return locale==="ar"?"rtl":"ltr"}
