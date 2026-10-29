/** Public data providers for the AI market terminal. Sources are discovery
 * endpoints only; their availability does not imply redistribution rights. */
export type SourceRegistryEntry={
 id:string;name:string;officialDocs:string;endpoint:string;
 kind:"benchmark"|"repository"|"model-catalog";
 auth:"public"|"optional";
 licenseReviewRequired:boolean;
 measures:readonly string[];
 restrictions:string;
};
export const marketSources:readonly SourceRegistryEntry[]=[
 {id:"huggingface-benchmarks",name:"Hugging Face official benchmark datasets",
  officialDocs:"https://huggingface.co/docs/hub/leaderboard-data-guide",
  endpoint:"https://huggingface.co/api/datasets?filter=benchmark:official",
  kind:"benchmark",auth:"public",licenseReviewRequired:true,
  measures:["benchmark discovery","model evaluation scores","verified flags"],
  restrictions:"Each benchmark dataset has separate license and methodology; do not combine scores across unrelated tests."},
 {id:"github-repositories",name:"GitHub public repository metadata",
  officialDocs:"https://docs.github.com/en/rest/repos/repos",
  endpoint:"https://api.github.com/repos/{owner}/{repo}",
  kind:"repository",auth:"optional",licenseReviewRequired:true,
  measures:["stars","forks","open issues","last update"],
  restrictions:"Repository stars are not users or market share; honor GitHub rate limits and API terms."},
 {id:"litellm-model-catalog",name:"LiteLLM public model catalog",
  officialDocs:"https://api.litellm.ai/docs",
  endpoint:"https://models.litellm.ai/model_catalog",
  kind:"model-catalog",auth:"public",licenseReviewRequired:true,
  measures:["model identifiers","provider identity","reported per-token pricing","context windows","capability flags"],
  restrictions:"Prices may be provider-specific or estimated; normalize units and record source timestamp. Review license and redistribution terms before publishing; never merge models solely by display name."},
 {id:"openrouter-models",name:"OpenRouter public model catalog",
  officialDocs:"https://openrouter.ai/docs/api/api-reference/models/list-models",
  endpoint:"https://openrouter.ai/api/v1/models",
  kind:"model-catalog",auth:"public",licenseReviewRequired:true,
  measures:["model identifiers","context length","published API pricing","modalities"],
  restrictions:"Provider-specific pricing and availability can differ; review API data reuse terms before publishing."}
];
export function sourceById(id:string){return marketSources.find(x=>x.id===id);}
