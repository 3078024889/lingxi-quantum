export const ALL_TOOLS_PASS_CATALOG=Object.freeze([
 {sku:"tool_pass_7d",days:7,price:29},
 {sku:"tool_pass_30d",days:30,price:99},
 {sku:"tool_pass_90d",days:90,price:269},
 {sku:"tool_pass_365d",days:365,price:899},
] as const);
export type AllToolsPassSku=(typeof ALL_TOOLS_PASS_CATALOG)[number]["sku"];
export function allToolsPassOffer(sku:string){return ALL_TOOLS_PASS_CATALOG.find(p=>p.sku===sku)||null;}
export const DAILY_FREE_TOOL_UNITS=1;
export const TOOL_PASS_TIMEZONE="Asia/Shanghai";
export function toolUnitsFromUpload(files:ReadonlyArray<Pick<File,"size">>):number {
 return files.length; // one picture, video, document, or batch file = one started use per uploaded file
}
