export type NutritionProvenance={
 providerId:string;sourceRecordId?:string;sourceUrl?:string;country?:string;region?:string;
 retrievedAt?:string;publishedAt?:string;licenseStatus:"cleared"|"verify"|"restricted";
 method:"laboratory"|"compiled"|"label"|"recipe"|"estimate";quality?:number;notes?:string;
};
export type NutritionAvailability={available:boolean;reason?:"NO_MATCH"|"NO_CLEARED_SOURCE"|"LOW_CONFIDENCE"|"MIXED_DISH_NEEDS_CONFIRMATION";provenance?:NutritionProvenance[]};
export const NO_RELIABLE_MEASUREMENT_ZH="暂无可靠测定。";
