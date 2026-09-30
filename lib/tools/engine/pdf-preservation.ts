export type PdfProfile={scanned:boolean;imageRatio:number;selectableText:boolean;links:boolean;forms:boolean;signatures:boolean};
export type PdfPlan={mode:"structure"|"image-recompress"|"do-not-rasterize";reason:string};
export function planPdfCompression(x:PdfProfile):PdfPlan{
 if(x.forms||x.signatures)return{mode:"do-not-rasterize",reason:"文档包含表单或签名，不能使用整页图片重建"};
 if(x.selectableText||x.links)return{mode:"structure",reason:"优先保留可选择文字、链接和矢量内容"};
 if(x.scanned||x.imageRatio>.8)return{mode:"image-recompress",reason:"扫描件或图片型 PDF 可使用图像重压缩"};
 return{mode:"structure",reason:"默认保留原始文档结构"};
}
export function acceptCompression(before:number,after:number){
 if(before<=0||after<=0)return{ok:false,code:"INVALID_SIZE"};
 if(after>=before)return{ok:false,code:"KEEP_ORIGINAL"};
 return{ok:true,code:"USE_COMPRESSED",savedRatio:1-after/before};
}
