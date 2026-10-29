export declare function parseMetricScope(params:URLSearchParams):{metric:string;day:string;region:string;period:string;methodology:string;sample:string}|null;
export declare function verifiedMeasurements(rows:any[],evidence:any[]):any[];
export declare function rankVerifiedRows(rows:any[],evidence:any[],scope:any):any;
export declare function verifiedHistory(rows:any[],evidence:any[],scope:any,entityId:string,start:string,end:string):{day:string;value:number;sourceUrl:string}[]|null;
