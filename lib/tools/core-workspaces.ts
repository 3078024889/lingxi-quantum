import type {PublicToolSurfaceItem} from './public-surface';

/** Curated entry points, not a replacement for stable search / SEO URLs. */
export const CORE_TOOL_WORKSPACES=[
 {slug:'pdf-workspace',icon:'merge-pdf',category:'pdf',zh:'PDF 页面整理',en:'Organize PDF pages',leadZh:'合并、拆分、旋转和排序，拖动页面就能完成。',leadEn:'Merge, split, rotate and reorder pages in one place.'},
 {slug:'compress-pdf',icon:'compress-pdf',category:'pdf'},
 {slug:'pdf-editor',icon:'pdf-editor',category:'pdf'},
 {slug:'image-to-pdf',icon:'image-to-pdf',category:'pdf'},
 {slug:'pdf-to-jpg',icon:'pdf-to-jpg',category:'pdf'},
 {slug:'image-workspace',icon:'resize-image',category:'image',zh:'图片编辑工作区',en:'Image workspace',leadZh:'裁剪、缩放、签名和水印，不用重复上传。',leadEn:'Crop, resize, sign and watermark without uploading again.'},
 {slug:'compress-image',icon:'compress-image',category:'image'},
 {slug:'webp-to-jpg',icon:'webp-to-jpg',category:'image'},
 {slug:'ocr',icon:'ocr',category:'recognition'},
 {slug:'video-toolkit',icon:'video-toolkit',category:'media'},
 {slug:'audio-transcription',icon:'audio-transcription',category:'subtitle'},
 {slug:'subtitle-tools',icon:'subtitle-tools',category:'subtitle'},
 {slug:'qr-code-generator',icon:'qr-code-generator',category:'recognition'},
 {slug:'xlsx-to-csv',icon:'xlsx-to-csv',category:'table'},
 {slug:'text-counter',icon:'text-counter',category:'text'},
 {slug:'privacy-cleaner',icon:'privacy-cleaner',category:'privacy'},
] as const;

export function coreToolSurface(tools:PublicToolSurfaceItem[]):PublicToolSurfaceItem[]{
 return CORE_TOOL_WORKSPACES.flatMap(entry=>{
  const item=tools.find(tool=>tool.slug===entry.slug);
  if(!item)return [];
  return [{...item,...('zh' in entry?{titleZh:entry.zh,titleEn:entry.en,descZh:entry.leadZh,descEn:entry.leadEn}:{})}];
 });
}
export function coreToolIcon(slug:string){return CORE_TOOL_WORKSPACES.find(entry=>entry.slug===slug)?.icon||slug}

/** Old size-specific search links share the same daily tool, never extra free uses. */
export function quotaToolSlug(slug:string){
 return /^compress-image-to-(20|50|100|200|500)kb$/.test(slug)?'compress-image':slug;
}
