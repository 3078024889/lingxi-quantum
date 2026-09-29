export type FoodSourcePolicy={
 key:string;name:string;region:string;kind:"composition"|"vision";license:string;
 redistributable:boolean;commercial:boolean;ingest:"automatic"|"review-required"|"training-only";
 homepage:string;notes:string;
};
export const GLOBAL_FOOD_SOURCES:FoodSourcePolicy[]=[
 {key:"usda-fdc",name:"USDA FoodData Central",region:"US",kind:"composition",license:"CC0 / US public domain",redistributable:true,commercial:true,ingest:"automatic",homepage:"https://fdc.nal.usda.gov/",notes:"Primary reproducible bulk source. Foundation, FNDDS and Branded are versioned separately."},
 {key:"fao-infoods-directory",name:"FAO/INFOODS directory",region:"GLOBAL",kind:"composition",license:"Dataset-specific",redistributable:false,commercial:false,ingest:"review-required",homepage:"https://www.fao.org/food-composition/tables-and-databases/",notes:"Discovery and quality framework only. Each national/regional database must pass its own license review before import."},
 {key:"nutrition5k",name:"Nutrition5k",region:"US",kind:"vision",license:"CC BY 4.0",redistributable:true,commercial:true,ingest:"training-only",homepage:"https://github.com/google-research-datasets/Nutrition5k",notes:"Portion/nutrition research data; not treated as global cuisine coverage."},
 {key:"food101",name:"Food-101",region:"MIXED",kind:"vision",license:"Upstream terms must be retained",redistributable:false,commercial:false,ingest:"training-only",homepage:"https://data.vision.ee.ethz.ch/cvl/datasets_extra/food-101/",notes:"101-class recognition benchmark; never presented as global coverage."}
];
export function sourceByKey(key:string){return GLOBAL_FOOD_SOURCES.find(x=>x.key===key)||null}
