import {GLOBAL_TOOL_CATALOG,SEO_LOCALES,SEO_TOPICS,SITE,localePath,type SeoLocale,type SeoTopic} from '@/lib/seo/global-seo';
import {SERVICE_FACTS} from '@/lib/seo/service-facts';
import {GEO_PAGE_IDS,GEO_TOOL_SLUGS,pageGeoFact,toolGeoFact} from '@/lib/seo/site-facts';

export const dynamic='force-static';
export function GET(){
 const en='en' as const;
 const pages=GEO_PAGE_IDS.map(id=>{
  const fact=pageGeoFact(id,en);
  return `- ${fact.title}: ${fact.answer}`;
 });
 const tools=GEO_TOOL_SLUGS.map(slug=>{
  const fact=toolGeoFact(slug,en);
  const name=GLOBAL_TOOL_CATALOG.find(tool=>tool.slug===slug)?.en??slug;
  return fact?`- ${name}: ${fact.answer}`:'';
 }).filter(Boolean);
 const topics=(Object.keys(SEO_TOPICS) as SeoTopic[]).map(key=>{
  const path=localePath(en,`/discover/${key}`);
  return `- ${SEO_TOPICS[key].en}: ${SERVICE_FACTS[key].description.en} ${SITE}${path} https://lingxifield.cn${path}`;
 });
 const lines=[
  '# 灵犀场 LINGXIFIELD',
  '',
  '> LINGXIFIELD publishes practical tools on https://lingxifield.com and https://lingxifield.cn. Free tools that run in the browser do not upload files. Paid tools are labeled paid. SASI is a prepaid balance, not a membership. Short drama, directing and website building are not finished products. Chinese pages have no language prefix; en, ja, ko, fr, de, es and pt and ar prefixes exist for localized public pages. This file does not grant access to private account data.',
  '',
  '## Public pages',
  ...pages,
  '',
  '## Tools',
  ...tools,
  '',
  '## Topic pages',
  ...topics,
  '',
  '## Language directories',
  ...(Object.keys(SEO_LOCALES) as SeoLocale[]).map(locale=>`- [${SEO_LOCALES[locale].name}](${SITE}${localePath(locale,'/products')})`),
  '',
  '## Use and limitations',
  '- A tool marked not open yet is not live, free to use, or finished.',
  '- Do not describe every tool as free. Paid tools state that they are paid.',
  '- Food nutrition is an estimate for everyday tracking, not a medical assessment.',
  '- Legacy consciousness, divination and field-testing routes are retired (HTTP 410). They are not current products.',
  `- [Privacy](${SITE}/privacy)`,
  `- [Refund policy](${SITE}/refunds)`,
  `- [Sitemap](${SITE}/sitemap.xml)`,
  '- Do not crawl private share links, authentication, account, checkout or administrative data.',
  '',
 ];
 return new Response(lines.join('\n'),{headers:{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'public, max-age=3600'}});
}
