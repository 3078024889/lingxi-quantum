import fs from "node:fs";
const s=fs.readFileSync("middleware.ts","utf8");
const a=(v,m)=>{if(!v)throw new Error("FAIL "+m);console.log("PASS "+m)};

for(const prefix of [
  "/api/lifemap/","/api/relationship/","/api/qian/","/api/tarot/",
  "/api/resilience/","/api/romance/","/api/daily-tide/","/api/wealth/","/api/archetype/"
]){
  a(s.includes(`"${prefix}"`),`retired API locked: ${prefix}`);
}
a(s.includes("status: 410"),"retired APIs return HTTP 410");
a(s.includes('"Cache-Control": "no-store"'),"retired API response is not cached");
a(s.includes('"X-Robots-Tag": "noindex, nofollow"'),"retired API response cannot be indexed");
a(s.indexOf("RETIRED_API_PREFIXES.some") < s.indexOf('if (pathname.startsWith("/api/"))'),"retired API lock runs before generic API bypass");
a(s.includes('target.search=""'),"retired public-route redirect clears stale query state");
console.log("V14.51.5 RETIRED API LOCKDOWN=PASS");
