import {GLOBAL_TOOL_CATALOG,SEO_LOCALES,SEO_TOPICS,SITE,localePath,type SeoLocale,type SeoTopic} from '@/lib/seo/global-seo';
import {SERVICE_FACTS} from '@/lib/seo/service-facts';
export const dynamic='force-static';
export function GET(){
 const lines=[
  '# 灵犀场 LINGXIFIELD | SASI Intelligent Ecosystem','',
  "> LINGXIFIELD is the SASI intelligent ecosystem and global intelligent tools platform for practical tools, creation, building, learning and research. This public index does not grant access to private account data.",
  '',`Canonical site: ${SITE}`,'Chinese access domain: https://lingxifield.cn','',
  '## Product areas',
  ...(Object.keys(SEO_TOPICS) as SeoTopic[]).map(key=>`- [${SEO_TOPICS[key].en}](${SITE}/discover/${key}): ${SERVICE_FACTS[key].description.en}`),
  '', '## Tools',
  ...GLOBAL_TOOL_CATALOG.map(tool=>`- [${tool.en}](${SITE}/en/tools/${tool.slug})`),
  '', '## Language directories',
  ...(Object.keys(SEO_LOCALES) as SeoLocale[]).map(locale=>`- [${SEO_LOCALES[locale].name}](${SITE}${localePath(locale,'/products')})`),
  '', '## Use and limitations',
  '- Check each product page for supported formats, processing limits, data handling and current charges. Do not infer that every service is free.',
  '- Food nutrition is an estimate based on confirmed foods and quantities, not a medical assessment or a guarantee of recognizing every food.',
  '- Online generation depends on connected services and actual availability; a product description is not proof that a user task has run.',
  `- [Privacy](${SITE}/privacy)`, `- [Refund policy](${SITE}/refunds)`, `- [Sitemap](${SITE}/sitemap.xml)`,
  '- Legacy consciousness, divination and field-testing routes are retired (HTTP 410). They are not current products.',
  '- Do not crawl private share links, authentication, account, checkout or administrative data.',
  '',
 ];
 return new Response(lines.join('\n'),{headers:{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'public, max-age=3600'}});
}
