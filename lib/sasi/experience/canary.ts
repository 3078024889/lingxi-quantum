import "server-only";
import {createHash}from"node:crypto";
export function stableBucket(key:string){
 const hex=createHash("sha256").update(key).digest("hex").slice(0,8);
 return parseInt(hex,16)%100;
}
export function canaryAllowed(key:string,percent:number){
 const p=Math.max(0,Math.min(100,Number(percent)||0));
 return p>=100||stableBucket(key)<p;
}
