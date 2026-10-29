export declare const OBSERVATION_KINDS:readonly string[];
export declare function validateVisibilityObservation(x:any):any|null;
export declare function groupVisibility(records:any[],scope:Record<string,any>):{scope:Record<string,any>;observations:any[];excludedConflicts:string[];measurementOnly:boolean};
export declare function citationVisibility(group:any):{samples:number;cited:number;rate:number|null;note:string};
export declare function searchSummary(group:any):{clicks:number;impressions:number;ctr:number|null;position:null;note:string};
