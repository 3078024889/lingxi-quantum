import type {SeoLocale} from './site-facts';
import {toolGeoFact} from './site-facts';

/** The first four free browser-local tools. Facts for every tool live in site-facts.ts. */
export const LOCAL_FREE_TOOL_SLUGS = [
  'compress-image-to-100kb',
  'heic-to-jpg',
  'merge-pdf',
  'remove-exif',
] as const;

export function localFreeToolFact(slug: string, locale: SeoLocale){
  if(!(LOCAL_FREE_TOOL_SLUGS as readonly string[]).includes(slug)) return null;
  const fact = toolGeoFact(slug, locale);
  if(!fact || !fact.com || !fact.cn) return null;
  return {description: fact.description, question: fact.question, answer: fact.answer, com: fact.com, cn: fact.cn};
}
