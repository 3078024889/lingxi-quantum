export type DataSensitivity="public"|"personal"|"confidential";
export interface PrivacyRoute{routeId:string;mode:"local"|"byok"|"managed";storesData:boolean}
export function privacyRoutes(routes:PrivacyRoute[],sensitivity:DataSensitivity){if(sensitivity==="confidential")return routes.filter(x=>x.mode==="local"||x.mode==="byok"&&!x.storesData);if(sensitivity==="personal")return routes.filter(x=>!x.storesData||x.mode==="local");return routes}
