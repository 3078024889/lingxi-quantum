export type EvidenceFact={text:string;source:string};
export type CoverageProduct={id:string;facts?:Record<string,unknown>};
export type CoverageCompany={name:string;kind:'company'|'open_source_project'|'software_library';evidence?:{founded?:EvidenceFact;headquarters?:EvidenceFact;funding?:EvidenceFact;listing?:EvidenceFact}};
export const SOURCE_FIELDS:readonly (readonly [string,string])[];
export function auditSourceCoverage(rows:CoverageProduct[]):{
 total:number;fieldCoverage:Record<string,number>;fullySourcedProducts:number;missingByProduct:{id:string;missing:string[]}[]
};
export function auditCompanyCoverage(rows:CoverageCompany[]):{
 distinctPublishers:number;companies:number;projects:number;companyFoundedSourced:number;missingFounding:string[];
 missingLocation:string[];missingFunding:string[];confirmedListedParent:number;note:string
};
