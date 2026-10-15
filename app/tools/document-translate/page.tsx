import type{Metadata}from'next';
import AdvancedToolPage from '@/components/tools/AdvancedToolPage';
import DocumentTranslateWorkbench from '@/components/tools/DocumentTranslateWorkbench';
import{languageAlternates}from'@/lib/seo/global-seo';
export const metadata:Metadata={title:'PDF / 文档翻译｜灵犀场',description:'翻译 PDF、Word、PowerPoint、Excel、EPUB 与文本文件，支持九种语言和 PDF 原文对照。',alternates:{canonical:'/tools/document-translate',languages:languageAlternates('/tools/document-translate')}};
export default function Page(){return <AdvancedToolPage title="PDF / 文档翻译" intro="翻译 PDF、Word、PowerPoint、Excel、EPUB 与文本文件，支持九种语言和 PDF 原文对照。"><DocumentTranslateWorkbench/></AdvancedToolPage>}
