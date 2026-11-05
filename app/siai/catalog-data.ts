import type {SiaiHomeRow} from "@/components/SiaiRankingHome";
import {getSiaiSourcePreviewRows} from "./candidate-public";
import {MARKET_API_PRODUCTS} from "../../lingxifield-ai-market/lib/market-api-service-catalog";
import {findPlatform} from "../../lingxifield-ai-market/lib/platform-repository";
import {researchedFact,marketProductReviewedAt} from "../../lingxifield-ai-market/lib/market-researched-facts";
import {companyPresentationFor} from "../../lingxifield-ai-market/lib/market-company-evidence";
import {questionForProduct} from "../../lingxifield-ai-market/lib/market-user-task-queries.mjs";
import {capabilityProfile} from "../../lingxifield-ai-market/lib/capability-profiles";
import {productAnswerHeadline} from "../../lingxifield-ai-market/lib/market-result-headlines";

function getCuratedRows():SiaiHomeRow[]{
 return MARKET_API_PRODUCTS.flatMap(id=>{
  const platform=findPlatform(id);
  if(!platform)return [];
  const publisher=companyPresentationFor(id,platform.company);
  const fact=researchedFact(id);
  return [{
   id:platform.id,name:platform.name,company:publisher.name,legal:publisher.legalEntity,creator:publisher.creator,
   legalScope:publisher.legalEntityScope,kind:publisher.kind,listing:publisher.listingState,
   ipoFiling:Boolean(publisher.ipoFiling),year:publisher.year,checkedAt:fact?marketProductReviewedAt(id):null,
   companySource:publisher.companySource,legalSource:publisher.legalEntitySource,
   listingSource:publisher.ipoFilingSource||publisher.listingSource,yearSource:publisher.yearSource,
   category:platform.category,about:platform.about,
   strength:[productAnswerHeadline(id),capabilityProfile(id)?.differentiator].filter(Boolean).join(" ")||platform.guide?.strengths||platform.about,
   searchTerms:questionForProduct(id),
   features:platform.features,free:fact?.free||platform.free||"—",freeSource:fact?.freeSource||null,
   price:fact?.price||platform.price||"—",priceSource:fact?.priceSource||null,
   region:fact?.region||platform.location||"—",regionSource:fact?.regionSource||null,
   payment:fact?.payments?.join(" · ")||"—",
   paymentSource:fact?.paymentSource||null,
   models:fact?.models||platform.features.slice(0,3).join(" · "),modelsSource:fact?.modelsSource||null,
   commercial:fact?.commercial||"查看官网商用条件",commercialSource:fact?.commercialSource||null,
   website:platform.website
  }];
 });
}


/** Read-only SIAI directory data shared by 9 indexable language routes. */
export function getSiaiDirectoryRows():{curated:SiaiHomeRow[];rows:SiaiHomeRow[]} {
 const curated=getCuratedRows();
 const curatedIds=new Set(curated.map(r=>r.id));
 // When a reviewed preview is promoted, retain the approved row and drop its old preview duplicate.
 const preview=getSiaiSourcePreviewRows().filter(r=>!curatedIds.has(r.id));
 const rows=[...curated,...preview];
 // The approved catalogue may grow daily; ensure no missing IDs or duplicates.
 // Research-only previews must never silently become approved catalogue entries.
 if(!curated.length||curated.length!==MARKET_API_PRODUCTS.length||
    curatedIds.size!==curated.length||
    rows.length!==curated.length+preview.length||
    new Set(rows.map(r=>r.id)).size!==rows.length)
  throw Error("SIAI_DIRECTORY_MISSING_OR_DUPLICATE_ROWS");
 return {curated,rows};
}
