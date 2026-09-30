import{NextResponse}from"next/server";export const dynamic="force-static";export function GET(){return new NextResponse(`# 灵犀场 LINGXIFIELD
> 全球智能工具与 SASI 创作生态平台
> 一键创造，一念即达。

LINGXIFIELD provides practical web tools for PDF, images, video, subtitles, OCR, privacy and files, plus SASI creation workflows for drama, books, learning, research and website building.

Canonical: https://lingxifield.com/
Tools: https://lingxifield.com/tools
SASI: https://lingxifield.com/sasi
Products: https://lingxifield.com/products
About: https://lingxifield.com/about
Privacy: https://lingxifield.com/privacy
Terms: https://lingxifield.com/terms

Public pages may be indexed. Account, checkout, payment and private user content are not public sources.
`,{headers:{"content-type":"text/plain; charset=utf-8","cache-control":"public, max-age=3600"}})}
