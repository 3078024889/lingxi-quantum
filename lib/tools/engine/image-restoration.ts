export type RestorationInput={areaRatio:number;edgeDensity:number;motion:boolean;hasLocalModel:boolean};
export type RestorationPlan={tier:"deterministic"|"local-model"|"unsupported";claim:string};
export function planRestoration(x:RestorationInput):RestorationPlan{
 if(x.motion&&!x.hasLocalModel)return{tier:"unsupported",claim:"复杂移动遮挡暂时无法可靠修复"};
 if(x.areaRatio<=.035&&x.edgeDensity<.28)return{tier:"deterministic",claim:"适合局部纹理修复"};
 if(x.hasLocalModel)return{tier:"local-model",claim:"使用本地修复能力处理复杂区域"};
 return{tier:"unsupported",claim:"这个区域较复杂，当前本地能力无法保证自然效果"};
}
export function validateImageOutput(x:{width:number;height:number;bytes:number;changedPixels?:number}){
 if(x.width<=0||x.height<=0||x.bytes<=0)return{ok:false,code:"EMPTY_OR_INVALID"};
 if(x.changedPixels!==undefined&&x.changedPixels<=0)return{ok:false,code:"NO_EFFECT"};
 return{ok:true,code:"OK"};
}
