export type PhotoSpec={widthMm:number;heightMm:number;dpi:number;headMinRatio:number;headMaxRatio:number};
export type FaceBox={x:number;y:number;width:number;height:number;imageWidth:number;imageHeight:number};
export const PHOTO_SPECS={
 oneInch:{widthMm:25,heightMm:35,dpi:300,headMinRatio:.45,headMaxRatio:.70},
 twoInch:{widthMm:35,heightMm:49,dpi:300,headMinRatio:.45,headMaxRatio:.70}
} satisfies Record<string,PhotoSpec>;
export function targetPixels(s:PhotoSpec){return{width:Math.round(s.widthMm/25.4*s.dpi),height:Math.round(s.heightMm/25.4*s.dpi)}}
export function validateFaceGeometry(f:FaceBox,s:PhotoSpec){
 if(f.width<=0||f.height<=0||f.imageWidth<=0||f.imageHeight<=0)return{ok:false,code:"FACE_INVALID"};
 const ratio=f.height/f.imageHeight;
 if(ratio<s.headMinRatio)return{ok:false,code:"FACE_TOO_SMALL"};
 if(ratio>s.headMaxRatio)return{ok:false,code:"FACE_TOO_LARGE"};
 const cx=(f.x+f.width/2)/f.imageWidth;
 if(cx<.35||cx>.65)return{ok:false,code:"FACE_OFF_CENTER"};
 return{ok:true,code:"OK"};
}
export type MatteEvidence={foregroundRatio:number,edgeUncertainty:number,modelRan:boolean};
export function validatePortraitMatte(x:MatteEvidence){
 if(!x.modelRan)return{ok:false,code:"SEGMENTATION_NOT_RUN",claimPortraitMatting:false};
 if(x.foregroundRatio<.08||x.foregroundRatio>.85)return{ok:false,code:"MATTE_AREA_IMPLAUSIBLE",claimPortraitMatting:false};
 if(x.edgeUncertainty>.35)return{ok:false,code:"EDGE_UNCERTAIN",claimPortraitMatting:false};
 return{ok:true,code:"OK",claimPortraitMatting:true};
}
