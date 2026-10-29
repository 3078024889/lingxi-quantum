export type ReviewedProfileField={value:string;sourceUrl:string;sourceName:string;checkedAt:string};
export type ReviewedProductProfile={id:string;name:string;officialUrl:string|null;sourceUrl:string|null;verifiedAt:string;fields:Record<string,ReviewedProfileField>;conflictingFields:string[];feedback:unknown[];metrics:unknown[];hasUnverifiedFields:boolean};
export declare function assembleProductResponse(entity:any,claims?:any[]):ReviewedProductProfile|null;
