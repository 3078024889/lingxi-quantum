import {SIAI_DISCOVERY} from '@/lib/siai-search-discovery';
import {GLOBAL_TOOL_CATALOG,SEO_LOCALES,SEO_TOPICS,SITE,localePath,type SeoLocale,type SeoTopic} from '@/lib/seo/global-seo';
import {SERVICE_FACTS} from '@/lib/seo/service-facts';
import {GEO_PAGE_IDS,GEO_TOOL_SLUGS,pageGeoFact,toolGeoFact} from '@/lib/seo/site-facts';

export const dynamic='force-static';
export function GET(){
 const en='en' as const;
 const pages=GEO_PAGE_IDS.filter(id=>id!=='sasi-pricing').map(id=>{
  const fact=pageGeoFact(id,en);
  return `- ${fact.title}: ${fact.description} ${fact.com}`;
 });
 const tools=GEO_TOOL_SLUGS.map(slug=>{
  const fact=toolGeoFact(slug,en);
  const name=GLOBAL_TOOL_CATALOG.find(tool=>tool.slug===slug)?.en??slug;
  return fact?`- ${name}: ${fact.description} ${fact.com}`:'';
 }).filter(Boolean);
 const topics=(Object.keys(SEO_TOPICS) as SeoTopic[]).map(key=>{
  const path=localePath(en,`/discover/${key}`);
  return `- ${SEO_TOPICS[key].en}: ${SERVICE_FACTS[key].description.en} ${SITE}${path}`;
 });
 const lines=[
  '# 灵犀场 LINGXIFIELD',
  '',
  `> LINGXIFIELD's globally canonical public tool and guide URLs are on https://lingxifield.com. The Chinese regional ranking entry is https://lingxifield.cn/siai; other .cn mirror paths are not separate canonical pages. Free tools that run in the browser do not upload files. Paid tools are labeled paid. SASI is the intelligent software marketplace for reviewed finished software, MT5 EAs, trading source code, source licenses and installation guides. Developers submit packages for security review; paid orders are delivered only after verified payment. Retired short-drama, website-generation and knowledge-agent routes redirect to the marketplace. Chinese pages have no language prefix; en, ja, ko, fr, de, es and pt and ar prefixes exist for localized public pages. This file does not grant access to private account data.`,
  '',
  '## Public pages',
  ...pages,
  '',
  '## Global SIAI rankings and AI / SI market directory',
  '- [中国区域全球 SIAI 排行榜 / Chinese regional SIAI Rankings](https://lingxifield.cn/siai): Chinese-language regional entry for the same evidence-backed directory.',
  '- [全球 SIAI 排行榜 / Global AI Tool Rankings]('+SITE+'/siai): Global AI, SI and SIAI product directory, official-source pricing, free tiers, regional/payment evidence and commercial-use terms. Directory display order is not a performance or popularity ranking.',
  ...SIAI_DISCOVERY.zh.topics.map(x=>'- '+x.q+': '+x.rank+' '+SITE+'/siai'),
  "Verified use: Candidate research previews are not hands-on tests. A publisher export restriction does not prove nationwide availability. Current pricing and payment terms must be checked on the official site.",
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
  '- CNY and USD are supported for applicable public pricing views. Account balance, orders and checkout are private and are not search-indexable pages.',
  '- Paid processing is shown as paid before the user confirms the charge. No unverified supplier delivery is claimed.',
  '- Not open yet means the feature is unavailable; do not describe it as a completed tool or direct users to payment.',
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
