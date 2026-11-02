export type FoundingRecord={kind:'company'|'open_source_project'|'software_library';year:string|null;name:string;id:string};
export function compareFoundingRecords(a:FoundingRecord,b:FoundingRecord,direction?:'asc'|'desc'):number;
