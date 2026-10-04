import fs from "node:fs";

const read=p=>fs.readFileSync(p,"utf8");
const must=(c,m)=>{if(!c)throw new Error(m)};

const halve=read("components/tools/PdfHalvePagesWorkbench.tsx");
const search=read("components/tools/PdfSearchWorkbench.tsx");
const video=read("components/tools/VideoEffectsWorkbench.tsx");
const audio=read("components/tools/AudioCleanupWorkbench.tsx");
const cron=read("components/tools/CronParserWorkbench.tsx");
const seo=read("lib/seo/global-seo.ts");
const advanced=read("lib/tools/advanced-catalog.ts");
const recipes=JSON.parse(read("lib/tools/platform/tool-recipes.json"));

for(const token of ["copyPages","setMediaBox","setCropBox","left-right","top-bottom"])must(halve.includes(token),`V66_HALVE_MISSING:${token}`);
for(const token of ["getTextContent","regexMode","pdf-search-results.csv","50"])must(search.includes(token),`V66_SEARCH_MISSING:${token}`);
for(const token of ['"reverse"','"loop"','"stop-motion"',"areverse","-stream_loop","Boomerang"])must(video.includes(token),`V66_VIDEO_MISSING:${token}`);
for(const token of ["afftdn","loudnorm","dynaudnorm","AUDIO_CLEANUP"])must(audio.includes(token),`V66_AUDIO_MISSING:${token}`);
for(const token of ["STANDARD_CRON_REQUIRES_5_FIELDS","nextRuns","366 * 24 * 60","*/15 9-18"])must(cron.includes(token),`V66_CRON_MISSING:${token}`);

for(const slug of ["pdf-halve-pages","pdf-search","reverse-video","loop-video","stop-motion-video","audio-cleanup","cron-parser"]){
 must(seo.includes(`slug:"${slug}"`),`V66_SEO_MISSING:${slug}`);
 must(advanced.includes(`/tools/${slug}`),`V66_ADVANCED_MISSING:${slug}`);
 must(recipes.some(x=>x.slug===slug),`V66_RECIPE_MISSING:${slug}`);
}

console.log("V66_GLOBAL_LONGTAIL_TOOL_BATCH=PASS");
console.log("V66_PDF_LONGTAIL=2");
console.log("V66_VIDEO_LONGTAIL=3");
console.log("V66_AUDIO_CLEANUP=READY");
console.log("V66_CRON_PARSER=READY");
