export type ImageRatioPreset={id:string;labelZh:string;labelEn:string;ratio:number|null};
export type ImageSizePreset={id:string;groupZh:string;groupEn:string;label:string;width:number;height:number};

export const IMAGE_RATIO_PRESETS:ImageRatioPreset[]=[
 {id:"free",labelZh:"自由",labelEn:"Free",ratio:null},
 {id:"1:1",labelZh:"1:1 方形",labelEn:"1:1 Square",ratio:1},
 {id:"4:3",labelZh:"4:3 横向",labelEn:"4:3 Landscape",ratio:4/3},
 {id:"3:4",labelZh:"3:4 竖向",labelEn:"3:4 Portrait",ratio:3/4},
 {id:"16:9",labelZh:"16:9 横屏",labelEn:"16:9 Widescreen",ratio:16/9},
 {id:"9:16",labelZh:"9:16 竖屏",labelEn:"9:16 Vertical",ratio:9/16},
 {id:"3:2",labelZh:"3:2 相片",labelEn:"3:2 Photo",ratio:3/2},
 {id:"2:3",labelZh:"2:3 竖相片",labelEn:"2:3 Portrait photo",ratio:2/3},
 {id:"4:5",labelZh:"4:5 竖图",labelEn:"4:5 Portrait",ratio:4/5},
 {id:"5:4",labelZh:"5:4 横图",labelEn:"5:4 Landscape",ratio:5/4},
 {id:"21:9",labelZh:"21:9 超宽",labelEn:"21:9 Cinema",ratio:21/9},
];

export const IMAGE_SIZE_PRESETS:ImageSizePreset[]=[
 {id:"square-1080",groupZh:"常用",groupEn:"Common",label:"1080×1080",width:1080,height:1080},
 {id:"four-three-1200",groupZh:"常用",groupEn:"Common",label:"1200×900",width:1200,height:900},
 {id:"three-four-1080",groupZh:"常用",groupEn:"Common",label:"1080×1440",width:1080,height:1440},
 {id:"wide-1920",groupZh:"常用",groupEn:"Common",label:"1920×1080",width:1920,height:1080},
 {id:"vertical-1080",groupZh:"常用",groupEn:"Common",label:"1080×1920",width:1080,height:1920},
 {id:"four-five-1080",groupZh:"常用",groupEn:"Common",label:"1080×1350",width:1080,height:1350},
 {id:"og-1200",groupZh:"网页/分享",groupEn:"Web / share",label:"1200×630",width:1200,height:630},
 {id:"hd-1280",groupZh:"横图",groupEn:"Landscape",label:"1280×720",width:1280,height:720},
 {id:"wide-1600",groupZh:"横图",groupEn:"Landscape",label:"1600×900",width:1600,height:900},
 {id:"portrait-1080-1440",groupZh:"竖图",groupEn:"Portrait",label:"1080×1440",width:1080,height:1440},
 {id:"portrait-1080-1350",groupZh:"竖图",groupEn:"Portrait",label:"1080×1350",width:1080,height:1350},
 {id:"avatar-512",groupZh:"头像",groupEn:"Avatar",label:"512×512",width:512,height:512},
 {id:"avatar-800",groupZh:"头像",groupEn:"Avatar",label:"800×800",width:800,height:800},
];

export function ratioForSize(width:number,height:number){
 const r=width/height;
 return IMAGE_RATIO_PRESETS.find(x=>x.ratio&&Math.abs(x.ratio-r)<.0001)?.id??"free";
}
