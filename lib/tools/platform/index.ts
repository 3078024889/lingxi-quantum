import capabilities from "./capability-genome.json";
import recipes from "./tool-recipes.json";
import licenses from "./license-firewall.json";
import radar from "./global-product-radar.json";
import ioContract from "./io-contract.json";
import workflowPresets from "./workflow-presets.json";

export type Capability = (typeof capabilities)[number];
export type ToolRecipe = (typeof recipes)[number];

export const LINGXIFIELD_CAPABILITY_GENOME = capabilities;
export const LINGXIFIELD_TOOL_RECIPES = recipes;
export const LINGXIFIELD_LICENSE_FIREWALL = licenses;
export const LINGXIFIELD_GLOBAL_PRODUCT_RADAR = radar;
export const LINGXIFIELD_IO_CONTRACT = ioContract;
export const LINGXIFIELD_WORKFLOW_PRESETS = workflowPresets;

export function capabilityById(id:string){
  return LINGXIFIELD_CAPABILITY_GENOME.find(x=>x.id===id);
}
export function recipeBySlug(slug:string){
  return LINGXIFIELD_TOOL_RECIPES.find(x=>x.slug===slug);
}
export function assertRecipe(slug:string){
  const recipe=recipeBySlug(slug);
  if(!recipe)throw new Error(`TOOL_RECIPE_MISSING:${slug}`);
  for(const id of recipe.capabilities){
    if(!capabilityById(id))throw new Error(`CAPABILITY_MISSING:${slug}:${id}`);
  }
  return recipe;
}
