export type IdPhotoPreset={id:string;label:string;widthMm:number;heightMm:number;dpi:number;note:string};
export const ID_PHOTO_PRESETS:IdPhotoPreset[]=[
 {id:"cn-1inch",label:"一寸 25×35 mm",widthMm:25,heightMm:35,dpi:300,note:"常用电子证件照尺寸；提交前以目标机构要求为准。"},
 {id:"cn-2inch",label:"二寸 35×49 mm",widthMm:35,heightMm:49,dpi:300,note:"常用电子证件照尺寸；提交前以目标机构要求为准。"},
 {id:"passport-35x45",label:"护照/签证 35×45 mm",widthMm:35,heightMm:45,dpi:300,note:"不同国家要求不同；此模板只负责尺寸与构图辅助。"},
 {id:"square-600",label:"方形头像 600×600",widthMm:50.8,heightMm:50.8,dpi:300,note:"适合简历/资料头像，不代表任何官方证件标准。"}
];
export const presetById=(id:string)=>ID_PHOTO_PRESETS.find(x=>x.id===id)||ID_PHOTO_PRESETS[0];
export const presetPixels=(p:IdPhotoPreset)=>({width:Math.round(p.widthMm/25.4*p.dpi),height:Math.round(p.heightMm/25.4*p.dpi)});
