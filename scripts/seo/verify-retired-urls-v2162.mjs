const base=(process.env.SEO_VERIFY_BASE||"https://lingxifield.com").replace(/\/$/,"");
const routes=[
 "/learn","/glossary","/live-as","/subconscious","/practice","/field-tests",
 "/life-map","/relationship","/qian","/mirror","/tarot","/resilience","/romance",
 "/daily","/wealth","/archetype","/mini-report","/membership","/origin","/dream",
 "/declaration","/narrative","/gate","/gate/relation","/field","/manifestation",
 "/consciousness","/inner-sovereignty","/learn/inner-sovereignty"
];
let failed=0;
for(const route of routes){
  const res=await fetch(base+route,{redirect:"manual",headers:{"user-agent":"LINGXIFIELD-SEO-VERIFY/1.0"}});
  const ok=res.status===410;
  console.log(`${ok?"PASS":"FAIL"} ${res.status} ${route}`);
  if(!ok)failed++;
}
if(failed)throw new Error(`RETIRED_URL_HTTP_410_FAIL=${failed}`);
console.log(`RETIRED_URL_HTTP_410_PASS=${routes.length}`);
