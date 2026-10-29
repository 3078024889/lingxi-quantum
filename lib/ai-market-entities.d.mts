export type MarketEntity={id:string;kind:'company'|'product'|'model'|'version';name:string;status:'candidate'|'verified'|'rejected'|'discontinued';website:string|null;sourceUrl:string|null};
export declare function validateEntity(input:any):MarketEntity|null;
export declare function validateRelationship(input:any, entities:Map<string,MarketEntity>):{from:string;to:string;type:string}|null;
export declare function auditGraph(input:any):{ok:boolean;entities:MarketEntity[];relationships:{from:string;to:string;type:string}[];errors:string[];publishable:boolean};
