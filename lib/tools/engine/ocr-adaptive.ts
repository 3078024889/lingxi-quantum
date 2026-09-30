export type OcrInput={pages:number;pixels:number;languages:string[];tableHint?:boolean;layoutHint?:boolean;lowContrast?:boolean};
export type OcrPlan={engine:"browser-ocr"|"local-layout-model";preprocess:string[];layout:boolean;table:boolean;reason:string};
export function planOcr(x:OcrInput):OcrPlan{
 const preprocess=["orientation","grayscale","contrast"];
 if(x.lowContrast)preprocess.push("adaptive-threshold");
 const complex=!!x.tableHint||!!x.layoutHint||x.pages>12||x.pixels>40_000_000;
 return complex
  ?{engine:"local-layout-model",preprocess,layout:true,table:!!x.tableHint,reason:"复杂版面优先使用本地版面识别能力；不可用时再回退普通文字识别"}
  :{engine:"browser-ocr",preprocess,layout:false,table:false,reason:"普通文字图片优先在本地完成识别"};
}
export function validateOcrText(text:string){const t=text.trim();return{ok:t.length>0,chars:t.length};}
