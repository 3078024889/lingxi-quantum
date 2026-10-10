export type EntitlementState="available"|"exhausted"|"unavailable";
export type EntitlementSnapshot={
 state:EntitlementState;
 limit:number|null;
 used:number|null;
 reserved:number|null;
 remaining:number|null;
 resetAt:string|null;
};

function safeInt(value:unknown){const n=Number(value);return Number.isFinite(n)?Math.max(0,Math.floor(n)):0}
export function entitlementSnapshot(input:{limit?:unknown;used?:unknown;reserved?:unknown;resetAt?:string|null;available?:boolean;unavailable?:boolean}):EntitlementSnapshot{
 if(input.unavailable)return{state:"unavailable",limit:null,used:null,reserved:null,remaining:null,resetAt:input.resetAt??null};
 const limit=safeInt(input.limit),used=safeInt(input.used),reserved=safeInt(input.reserved),remaining=Math.max(0,limit-used-reserved);
 const state:EntitlementState=input.available===false||remaining<=0?"exhausted":"available";
 return{state,limit,used,reserved,remaining,resetAt:input.resetAt??null};
}
export function nextUtcDay(now=new Date()){
 const next=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate()+1));
 return next.toISOString();
}
