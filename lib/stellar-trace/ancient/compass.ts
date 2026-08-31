export const normalizeBearing=(v:number)=>((v%360)+360)%360;
export const angularDistance=(a:number,b:number)=>{const d=Math.abs(normalizeBearing(a)-normalizeBearing(b));return Math.min(d,360-d)};
export const directionLabel=(b:number)=>["北","东北","东","东南","南","西南","西","西北"][Math.round(normalizeBearing(b)/45)%8];
export const PALACE_BEARING:Record<string,number|null>={坎:0,艮:45,震:90,巽:135,离:180,坤:225,兑:270,乾:315,中:null};
// Modern normalization only; the source texts did not use modern degrees.
export const BRANCH_BEARING:Record<string,number>={子:0,丑:30,寅:60,卯:90,辰:120,巳:150,午:180,未:210,申:240,酉:270,戌:300,亥:330};
export const sector=(c:number,h:number):[number,number]=>[normalizeBearing(c-h),normalizeBearing(c+h)];


