import {BRAND,SITE} from "@/lib/seo/platform-completion";
export const dynamic="force-static";
export function GET(){
 const body=`# ${BRAND.name}
> ${BRAND.categoryZh}
${BRAND.descriptionZh}

## Canonical
${SITE}

## Core public areas
- ${SITE}/tools — practical tools
- ${SITE}/sasi — SASI creation
- ${SITE}/products — products and capabilities
- ${SITE}/release — current release facts
- ${SITE}/templates — approved public creator templates only

## Languages
zh, en, ja, ko, fr, de, es, pt, ar

## Privacy boundary
Account pages, private creations, checkout, private SASI sessions and unapproved creator submissions are not public knowledge sources.
`;
 return new Response(body,{headers:{"content-type":"text/plain; charset=utf-8","cache-control":"public, max-age=3600"}});
}
