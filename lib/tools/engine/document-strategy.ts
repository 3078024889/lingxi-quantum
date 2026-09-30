export type PdfCompressionStrategy="preserve-structure"|"raster-fallback";
export function choosePdfCompressionStrategy(input:{scanned:boolean;imageHeavy:boolean;preserveSelectableText:boolean}):PdfCompressionStrategy{
 if(input.preserveSelectableText)return"preserve-structure";
 return input.scanned||input.imageHeavy?"raster-fallback":"preserve-structure";
}
export const PDF_COMPRESSION_RULES={
 preserveStructure:"优先保留文字、矢量、链接和页面结构；只有确实适合扫描件/图片型 PDF 时才使用整页图像重建。",
 rasterFallback:"整页图像重建必须明确告知会失去可选择文字、矢量和部分交互元素。"
} as const;
