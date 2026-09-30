import type{FoodRegionCode}from"./region-hierarchy";
export type FoodDataProvider={id:string;label:string;regions:FoodRegionCode[];kind:"composition"|"branded"|"directory";authority:string;commercialUse:"allowed"|"verify-license"|"restricted";runtime:"active"|"registry-only";priority:number;notes:string};
export const FOOD_DATA_PROVIDERS:FoodDataProvider[]=[
{id:"local-curated",label:"LINGXIFIELD Curated References",regions:["GLOBAL"],kind:"composition",authority:"LINGXIFIELD",commercialUse:"allowed",runtime:"active",priority:100,notes:"Only entries with recorded source provenance."},
{id:"usda-fdc",label:"USDA FoodData Central",regions:["NORAMFOODS","GLOBAL"],kind:"composition",authority:"USDA",commercialUse:"allowed",runtime:"active",priority:80,notes:"Foundation/FNDDS/Branded; not a global traditional-food superset."},
{id:"fao-infoods-directory",label:"FAO/INFOODS FCDB Directory",regions:["GLOBAL"],kind:"directory",authority:"FAO/INFOODS",commercialUse:"allowed",runtime:"registry-only",priority:70,notes:"Discovery/quality framework; underlying database rights remain source-specific."},
{id:"sg-foodid",label:"Singapore Food Insights Database",regions:["ASEANFOODS"],kind:"composition",authority:"Singapore Health Promotion Board",commercialUse:"verify-license",runtime:"registry-only",priority:78,notes:"Singapore foods; ingest only after reuse terms are cleared."},
{id:"myfcd",label:"Malaysian Food Composition Database",regions:["ASEANFOODS"],kind:"composition",authority:"Malaysia Ministry of Health",commercialUse:"verify-license",runtime:"registry-only",priority:78,notes:"Malaysia foods; ingest only after reuse terms are cleared."},
{id:"china-food-composition",label:"China Food Composition Table",regions:["NEASIAFOODS"],kind:"composition",authority:"China CDC/NINH",commercialUse:"restricted",runtime:"registry-only",priority:90,notes:"Never copy restricted values into commercial production without permission."},
{id:"open-food-facts",label:"Open Food Facts",regions:["GLOBAL"],kind:"branded",authority:"Open Food Facts",commercialUse:"verify-license",runtime:"registry-only",priority:65,notes:"Barcode/branded candidate; comply with database/content licences and attribution."}
];
export function providersForRegions(regions:FoodRegionCode[]){return FOOD_DATA_PROVIDERS.filter(p=>p.regions.includes("GLOBAL")||p.regions.some(r=>regions.includes(r))).sort((a,b)=>b.priority-a.priority)}
export function activeProvidersForRegions(regions:FoodRegionCode[]){return providersForRegions(regions).filter(p=>p.runtime==="active"&&p.commercialUse==="allowed")}
