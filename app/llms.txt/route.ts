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
  `> LINGXIFIELD's globally canonical public tool and guide URLs are on https://lingxifield.com. The Chinese regional ranking entry is https://lingxifield.cn/siai; other .cn mirror paths are not separate canonical pages. Free tools that run in the browser do not upload files. Paid tools are labeled paid. SASI (SASI Software Marketplace) is the marketplace for reviewed finished software, MT5 EAs, trading source code, source licenses and installation guides. Product format and license scope follow each listing; paid orders are delivered only after verified payment. Chinese pages have no language prefix; en, ja, ko, fr, de, es and pt and ar prefixes exist for localized public pages. This file does not grant access to private account data.`,
  '',
  '## Public pages',
  ...pages,
  '',
  '## SASI developer services',
  '- SASI seller workspace: developer application, product drafts, private package uploads, security review, sales records and settlement. Seller permissions are required: https://lingxifield.com/sasi/seller',
  '- SASI delivery policy: verified payment, license entitlement, file integrity checks and secure downloads: https://lingxifield.com/sasi/delivery',
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
  '',
  '## Evidence-led discoveries and content',
  '- [Discoveries and source verification](https://lingxifield.com/discoveries): sourced dossiers separate documented facts, unresolved questions and speculation; current topics include the Voynich Manuscript and public NASA/AARO UAP records.',
  '- Localized pages: '+['en','ja','ko','fr','de','es','pt','ar'].map(locale=>'https://lingxifield.com/'+locale+'/discoveries').join(' · '),
  '- Related tasks: PDF text extraction, document translation, PDF comparison, image OCR and measured Before / After compression.',
  '',
  '## Partner distribution and integrations',
  '- [Partner Growth Portal](https://lingxifield.com/partners): partner identifiers, embeddable SIAI and free-tool widgets, QR sharing and attribution snippets.',
  '- [JavaScript Widget](https://lingxifield.com/widgets/lingxifield-v1.js): embed public SIAI, QR and tool entry components on partner websites.',
  '- [WordPress integration](https://lingxifield.com/downloads/lingxifield-siai-wordpress.zip): official plugin package for embedding public SIAI components.',
  '- [Read-only SIAI OpenAPI](https://lingxifield.com/siai-openapi.json) and [SIAI updates RSS](https://lingxifield.com/siai/updates.xml).',
  '- Share links use bounded source labels; private files, prompts and account identifiers are not placed in public URLs.',
  '',
  '## Value-first tool and membership model',
  '- Start with a free task and verify the output. ToolPass is for recurring use, multiple files and sustained workflows across the practical-tool catalog.',
  '- The platform does not subsidize unpredictable third-party model-token costs. Any paid processing and applicable model/API costs must be disclosed before execution.',
  '',
  '## Use and limitations',
  '- CNY and USD are supported for applicable public pricing views. Account balance, orders and checkout are private and are not search-indexable pages.',
  '- Paid processing is shown as paid before the user confirms the charge. No unverified supplier delivery is claimed.',
  '- Not open yet means the feature is unavailable; do not describe it as a completed tool or direct users to payment.',
  '- A tool marked not open yet is not live, free to use, or finished.',
  '- Do not describe every tool as free. Paid tools state that they are paid.',
  '- Food nutrition is an estimate for everyday tracking, not a medical assessment.',
  `- [Privacy](${SITE}/privacy)`,
  `- [Refund policy](${SITE}/refunds)`,
  `- [Sitemap](${SITE}/sitemap.xml)`,
  '- Do not crawl private share links, authentication, account, checkout or administrative data.',
  '',
 ];
 return new Response(lines.join('\n'),{headers:{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'public, max-age=3600'}});
}
