/** Only fixed public routes and public tool slugs; never store IDs, searches or prompts. */
export function publicVisitPath(path:unknown):string|null {
 if(typeof path!=="string"||path.length>200||path.includes("?")||path.includes("#"))return null;
 const clean=path.replace(/\/$/,"")||"/";
 if(/^\/(?:en|ja|ko|fr|de|es|pt|ar|zh)$/.test(clean))return clean;
 if(["/","/sasi","/siai","/siai/claim","/partners","/tools","/explore","/learn","/privacy","/terms","/products","/discoveries"].includes(clean))return clean;
 // Only the catalog routes have localized equivalents. Do not generalize this
 // to account, creation, payment or private project routes.
 const catalogPath=clean.replace(/^\/(?:en|ja|ko|fr|de|es|pt|ar|zh)(?=\/(?:siai|tools|products)(?:\/|$))/,"");
 if(["/siai","/tools","/products","/discoveries"].includes(catalogPath))return clean;
 if(/^\/tools\/[a-z][a-z0-9-]{1,80}$/.test(catalogPath)&&!/^\/tools\/(?:admin|analytics|pay|checkout|result|results|history)$/.test(catalogPath))return clean;
 return null;
}
