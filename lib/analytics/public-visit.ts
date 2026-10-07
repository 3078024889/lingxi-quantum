/** Only fixed public routes and public tool slugs; never store IDs, searches or prompts. */
export function publicVisitPath(path:unknown):string|null {
 if(typeof path!=="string"||path.length>200||path.includes("?")||path.includes("#"))return null;
 const clean=path.replace(/\/$/,"")||"/";
 if(/^\/(?:en|ja|ko|fr|de|es|pt|ar|zh)$/.test(clean))return clean;
 if(["/","/sasi","/tools","/explore","/learn","/privacy","/terms","/products"].includes(clean))return clean;
 if(/^\/tools\/[a-z][a-z0-9-]{1,80}$/.test(clean)&&!/^\/tools\/(?:admin|analytics|pay|checkout|result|results|history)$/.test(clean))return clean;
 return null;
}
