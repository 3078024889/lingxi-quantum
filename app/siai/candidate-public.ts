/**
 * Read-only 30-product research preview for the main-site SIAI directory.
 * Research observation != individual account test, vendor approval or payment verification.
 * Do not export these rows into checkout, sponsored ranking, standalone public APIs or SEO product pages.
 * Historical first-party observations are pinned to a dated immutable snapshot.
 */
import {CANDIDATE_HISTORY} from "./candidate-company-evidence";
import {OFFICIAL_REGION_SUPPLEMENTS} from "./official-region-supplements";
import type {PaymentFacet} from "../../lib/siai-home-facets";
import type {SiaiHomeRow} from "../../components/SiaiRankingHome";
import {materializeCandidateCatalog} from "../../lingxifield-ai-market/lib/market-candidate-review-build.mjs";
import cohort1 from "../../lingxifield-ai-market/data/company-intake/batch-001.json";
import cohort2 from "../../lingxifield-ai-market/data/company-intake/batch-002.json";
import cohort3 from "../../lingxifield-ai-market/data/company-intake/batch-003.json";
import observed1 from "../../lingxifield-ai-market/data/siai-source-preview-20261103/batch-001-official-observations.json";
import observed2 from "../../lingxifield-ai-market/data/siai-source-preview-20261103/batch-002-official-observations.json";
import observed3 from "../../lingxifield-ai-market/data/siai-source-preview-20261103/batch-003-official-observations.json";

type SourceFact={status:"observed"|"missing"|"conflict";text:string|null;source:string|null;checkedAt:string|null};
type PreviewRecord={
 id:string;name:string;company:string;legalEntity:string|null;legalEntitySource:string|null;
 category:string;website:string;tasks:string[];keywords:string[];facts:Record<string,SourceFact>;
 recordedCount:number;missingCount:number;conflicts:number;
};
const NOT_DOCUMENTED="尚无可靠资料";
const ENTRY:Readonly<Record<string,string>>={
 cursor:"https://cursor.com/", "canva-magic-studio":"https://www.canva.com/canva-ai/",
 gamma:"https://gamma.app/",pika:"https://creation.pika.art/apps/create-video",
 ideogram:"https://ideogram.ai/",krea:"https://www.krea.ai/",leonardo:"https://leonardo.ai/",
 "notion-ai":"https://www.notion.com/product/ai","figma-make":"https://www.figma.com/make/",
 descript:"https://www.descript.com/","github-copilot":"https://github.com/features/copilot",
 "devin-desktop":"https://devin.ai/desktop",tabnine:"https://www.tabnine.com/platform/",
 "mistral-le-chat":"https://chat.mistral.ai/", "microsoft-copilot":"https://www.microsoft.com/en-sg/copilot",
 poe:"https://poe.com/","adobe-firefly":"https://firefly.adobe.com",
 recraft:"https://www.recraft.ai/","freepik-ai":"https://www.magnific.com/ai",
 synthesia:"https://www.synthesia.io/",heygen:"https://www.heygen.com/",
 elicit:"https://elicit.com/",consensus:"https://consensus.app/",scite:"https://scite.ai/",
 replicate:"https://replicate.com/", "fal-ai":"https://fal.ai/",
 "together-ai":"https://www.together.ai/", "fireworks-ai":"https://fireworks.ai/",
 groqcloud:"https://console.groq.com/",openrouter:"https://openrouter.ai/"
};
/** Only payment rails explicitly supported by a scoped first-party observation; no keyword guessing.
 * Unknown/unavailable and references to other products never create a positive filter hit.
 * PayPal is region-limited for several vendors; display the full source note alongside the filter.
 */
const PAYMENT_RAILS:Readonly<Record<string,readonly PaymentFacet[]>>={
 cursor:["card"],"canva-magic-studio":["card","paypal"],gamma:["card"],
 pika:["card","appstore"],ideogram:["card"],krea:["card"],leonardo:["card"],
 "notion-ai":["card"],"figma-make":["card"],descript:["card"],
 "github-copilot":["card","paypal"],"devin-desktop":["card"],
 tabnine:[],"mistral-le-chat":["appstore"],"microsoft-copilot":["card","paypal"],
 poe:["appstore"],"adobe-firefly":["card","paypal"],recraft:["card"],
 "freepik-ai":[],synthesia:["card"],heygen:["card","paypal"],elicit:["card"],
 consensus:["card"],scite:[],replicate:["card"],"fal-ai":[],
 "together-ai":["card"],"fireworks-ai":["card"],groqcloud:["card"],openrouter:["card","alipay"]
};
const trusted=(v:string)=>{try{const u=new URL(v);return u.protocol==="https:"&&!u.username&&!u.password&&!u.port&&!!u.hostname;}catch{return false}};
const text=(f:SourceFact|undefined)=>f?.status==="observed"&&f.text&&trusted(f.source||"")?f.text:NOT_DOCUMENTED;
const source=(f:SourceFact|undefined)=>f?.status==="observed"&&f.source&&trusted(f.source)?f.source:null;
export function getSiaiSourcePreviewRows():SiaiHomeRow[]{
 const snapshot=materializeCandidateCatalog([cohort1,cohort2,cohort3],[observed1,observed2,observed3]) as unknown as {
  candidateProducts:number;publisherGroups:number;totals:{observed:number;missing:number;conflict:number};products:PreviewRecord[];
 };
 // A changed evidence ledger cannot silently turn provisional product rows into verified ranking facts.
 if(snapshot.candidateProducts!==30||snapshot.publisherGroups!==28||
    snapshot.totals.observed!==205||snapshot.totals.missing!==5||snapshot.totals.conflict!==0){
  throw Error("SIAI_PREVIEW_SOURCE_SNAPSHOT_CHANGED");
 }
 return snapshot.products.map(p=>{
  const f=p.facts,company=f.company,region=f.regions,history=CANDIDATE_HISTORY[p.id],regionSupplement=OFFICIAL_REGION_SUPPLEMENTS[p.id];
  const latest=Object.values(f).map(v=>v.checkedAt).filter((v):v is string=>Boolean(v)).sort().at(-1)||null;
  const officialEntry=ENTRY[p.id]||p.website;
  if(!trusted(officialEntry)||!trusted(p.website))throw Error("UNSAFE_SIAI_OFFICIAL_LINK:"+p.id);
  return {
   id:p.id,
   name:p.id==="freepik-ai"?"Magnific（原 Freepik AI）":p.id==="canva-magic-studio"?"Canva AI（Magic Studio）":p.name,
   company:p.company,legal:p.legalEntity,
   brandSource:p.id==="freepik-ai"?"https://www.magnific.com/freepik":p.id==="canva-magic-studio"?"https://www.canva.com/canva-ai/":null,
   legalScope:p.legalEntity?"service_operator":null,
   creator:history?.creator?{...history.creator,role:"founder" as const}:null,kind:"company",
   listing:history?.listing||"unconfirmed",ipoFiling:false,year:history?.year||null,yearSource:history?.yearSource||null,
   companySource:source(company),legalSource:p.legalEntitySource,listingSource:history?.listingSource||null,
   checkedAt:latest,recordStatus:"source_preview" as const,
   verifiedPaymentRails:source(f.payment)?PAYMENT_RAILS[p.id]||[]:[],
   category:p.category,about:p.tasks.join("、"),strength:p.tasks.join(" · "),
   features:p.tasks,searchTerms:p.keywords,website:officialEntry,
   free:text(f.free),freeSource:source(f.free),
   price:text(f.price),priceSource:source(f.price),
   region:regionSupplement?.localized.zh||text(region),
   regionSource:regionSupplement?.source||source(region),
   payment:text(f.payment),paymentSource:source(f.payment),
   models:text(f.models),modelsSource:source(f.models),
   commercial:text(f.commercial),commercialSource:source(f.commercial)
  };
 });
}
