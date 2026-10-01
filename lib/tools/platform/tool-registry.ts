import {GLOBAL_TOOL_CATALOG} from "@/lib/seo/global-seo";
import recipes from "./tool-recipes.json";
import capabilities from "./capability-genome.json";

export type PublicToolMode="local"|"online";
export type PublicToolRegistryEntry={
 slug:string;
 zh:string;
 en:string;
 mode:PublicToolMode;
 capabilities:string[];
 contractVersion:number;
 requiresNineLanguage:boolean;
 requiresDesktop:boolean;
 requiresMobile:boolean;
 requiresRealFixture:boolean;
 privacyMode:string;
};

const recipeMap=new Map(recipes.map(recipe=>[recipe.slug,recipe] as const));
const capabilityIds=new Set(capabilities.map(capability=>capability.id));

export const LINGXIFIELD_PUBLIC_TOOL_REGISTRY:PublicToolRegistryEntry[]=GLOBAL_TOOL_CATALOG.map(tool=>{
 const recipe=recipeMap.get(tool.slug);
 if(!recipe)throw new Error(`PUBLIC_TOOL_RECIPE_MISSING:${tool.slug}`);
 for(const id of recipe.capabilities){
  if(!capabilityIds.has(id))throw new Error(`PUBLIC_TOOL_CAPABILITY_MISSING:${tool.slug}:${id}`);
 }
 return {
  slug:tool.slug,zh:tool.zh,en:tool.en,mode:tool.mode,
  capabilities:[...recipe.capabilities],
  contractVersion:recipe.contractVersion,
  requiresNineLanguage:recipe.requiresNineLanguage,
  requiresDesktop:recipe.requiresDesktop,
  requiresMobile:recipe.requiresMobile,
  requiresRealFixture:recipe.requiresRealFixture,
  privacyMode:recipe.privacyMode,
 };
});

if(LINGXIFIELD_PUBLIC_TOOL_REGISTRY.length!==recipes.length){
 const publicSlugs=new Set(GLOBAL_TOOL_CATALOG.map(tool=>tool.slug));
 const orphans=recipes.filter(recipe=>!publicSlugs.has(recipe.slug as never)).map(recipe=>recipe.slug);
 throw new Error(`TOOL_REGISTRY_CARDINALITY_MISMATCH:${orphans.join(",")}`);
}

export function publicToolBySlug(slug:string){
 return LINGXIFIELD_PUBLIC_TOOL_REGISTRY.find(tool=>tool.slug===slug);
}
