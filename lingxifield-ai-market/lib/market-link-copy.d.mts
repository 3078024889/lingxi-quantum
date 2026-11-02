export type PublisherLinkLanguage='zh'|'en'|'ja'|'ko'|'fr'|'de'|'es'|'pt'|'ar';
export type PublisherLinkKind='official'|'repository'|'documentation'|'source'|'desktop'|'ios'|'android'|'x'|'news'|'team'|'github'|'reviews'|'web';
export const LINK_LOCALES: readonly string[];
export function publisherLinkCopy(lang:string):Record<string,string>;
export function publisherLinkLabel(kind:string,lang:string):string;
